import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  validateEnquiryInput,
  generateReferenceCode,
  normalizeIndianMobile,
  REFERENCE_CODE_REGEX,
} from './src/utils/validation.ts';
import { injectRouteSeoHtml } from './src/utils/seoMeta.ts';
import { sendEnquiryNotificationEmail } from './src/server/emailService.ts';
import { sendWhatsAppCloudTemplateNotification } from './src/server/whatsappCloudService.ts';
import { signNotifyToken, verifyNotifyToken } from './src/server/notifyToken.ts';
import { verifyAuthorizedAdminToken } from './src/server/firebaseAuthVerify.ts';
import type { EnquiryNotificationPayload } from './src/utils/enquiryNotifications.ts';
import { sanitizeChatHistory } from './src/server/chatbotKnowledge.ts';
import { generateSgFinanceChatReply } from './src/server/chatService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

function resolveServerPort(): number {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if ((arg === '--port' || arg === '-p') && args[i + 1]) {
      const parsed = Number(args[i + 1]);
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
    } else if (arg.startsWith('--port=')) {
      const parsed = Number(arg.slice('--port='.length));
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
    }
  }
  const envPort = Number(process.env.PORT);
  if (isProduction && Number.isInteger(envPort) && envPort > 0) {
    return envPort;
  }
  // In dev mode, ignore outer proxy PORT=8080 if inherited from container env
  if (Number.isInteger(envPort) && envPort > 0 && envPort !== 8080) {
    return envPort;
  }
  return 3000;
}

const PORT = resolveServerPort();

// In-memory spam & duplicate submission protection (per-IP & per-mobile cooldown)
interface RateBucket {
  count: number;
  resetAt: number;
}

interface ServerNotificationRecord {
  enquiryId: string;
  referenceCode: string;
  emailNotificationStatus: 'sent' | 'failed';
  emailNotificationError: string;
  emailNotificationAttempts: number;
  emailNotificationRetryStatus: 'none' | 'retried_sent' | 'retried_failed';
  emailNotifiedAt: string;
  whatsappCloudStatus: 'disabled' | 'sent' | 'failed';
  updatedAtMs: number;
}

const ipRateBuckets = new Map<string, RateBucket>();
const notifyIpRateBuckets = new Map<string, RateBucket>();
const chatIpRateBuckets = new Map<string, RateBucket>();
const mobileCooldowns = new Map<string, number>();
const serverNotificationLog = new Map<string, ServerNotificationRecord>();
const inFlightNotifications = new Set<string>();

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ENQUIRIES_PER_IP = 8;
const MAX_NOTIFY_PER_IP = 12;
const MAX_CHAT_PER_IP = 40;
const MOBILE_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes duplicate guard
const MAX_BUCKET_ENTRIES = 5000;
const VALID_DOC_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function trimMapCapacity<K, V>(map: Map<K, V>, maxSize: number): void {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) break;
    map.delete(oldestKey);
  }
}

function cleanupBuckets(now: number): void {
  for (const [key, bucket] of ipRateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      ipRateBuckets.delete(key);
    }
  }
  for (const [key, bucket] of notifyIpRateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      notifyIpRateBuckets.delete(key);
    }
  }
  for (const [key, bucket] of chatIpRateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      chatIpRateBuckets.delete(key);
    }
  }
  for (const [mobile, expiresAt] of mobileCooldowns.entries()) {
    if (expiresAt <= now) {
      mobileCooldowns.delete(mobile);
    }
  }
  trimMapCapacity(ipRateBuckets, MAX_BUCKET_ENTRIES);
  trimMapCapacity(notifyIpRateBuckets, MAX_BUCKET_ENTRIES);
  trimMapCapacity(chatIpRateBuckets, MAX_BUCKET_ENTRIES);
  trimMapCapacity(mobileCooldowns, MAX_BUCKET_ENTRIES);
  trimMapCapacity(serverNotificationLog, MAX_BUCKET_ENTRIES);
}

function getBaseUrl(req: Request): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && envUrl !== 'MY_APP_URL' && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/+$/, '');
  }
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = typeof protoHeader === 'string' ? protoHeader.split(',')[0].trim() : req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  const cleanHost = Array.isArray(host) ? host[0] : host;
  return `${proto}://${cleanHost}`.replace(/\/+$/, '');
}

const PUBLIC_SITEMAP_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.9', changefreq: 'monthly' },
  { path: '/faq', priority: '0.8', changefreq: 'monthly' },
  { path: '/enquire', priority: '0.9', changefreq: 'weekly' },
  { path: '/campaign', priority: '0.8', changefreq: 'weekly' },
  { path: '/privacy-policy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms-and-conditions', priority: '0.4', changefreq: 'yearly' },
  { path: '/disclaimer', priority: '0.4', changefreq: 'yearly' },
  { path: '/loan-terms', priority: '0.4', changefreq: 'yearly' },
];

async function startServer(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1);

  // Baseline security headers (preserve iframe embed compatibility)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(express.json({ limit: '32kb' }));

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'sg-finance-web' });
  });

  // Server-side anti-spam, duplicate-prevention, and validation gate for enquiries
  app.post('/api/enquiries/validate', (req: Request, res: Response) => {
    const now = Date.now();
    cleanupBuckets(now);

    const body = req.body && typeof req.body === 'object' ? req.body : {};

    // Honeypot field check: reject silent bots cleanly
    if (typeof body.companyWebsite === 'string' && body.companyWebsite.trim().length > 0) {
      res.status(400).json({
        ok: false,
        code: 'SPAM_DETECTED',
        message: 'Unable to process this submission. Please contact our team directly.',
      });
      return;
    }

    // Per-IP sliding rate limit
    const ip = req.ip || 'unknown';
    const currentBucket = ipRateBuckets.get(ip);
    if (currentBucket && currentBucket.resetAt > now) {
      if (currentBucket.count >= MAX_ENQUIRIES_PER_IP) {
        res.status(429).json({
          ok: false,
          code: 'RATE_LIMITED',
          message: 'Too many enquiries submitted from this network. Please wait a few minutes or contact us via WhatsApp.',
        });
        return;
      }
    }

    const validation = validateEnquiryInput({
      fullName: typeof body.fullName === 'string' ? body.fullName : '',
      mobileNumber: typeof body.mobileNumber === 'string' ? body.mobileNumber : '',
      email: typeof body.email === 'string' ? body.email : '',
      city: typeof body.city === 'string' ? body.city : '',
      requiredAmount: typeof body.requiredAmount === 'string' ? body.requiredAmount : '',
      requirementType: typeof body.requirementType === 'string' ? body.requirementType : '',
      preferredContact: typeof body.preferredContact === 'string' ? body.preferredContact : '',
      message: typeof body.message === 'string' ? body.message : '',
      consentAccepted: body.consentAccepted === true,
    });

    if (!validation.valid) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        errors: validation.errors,
        message: 'Please review the highlighted fields and try again.',
      });
      return;
    }

    const normalizedMobile = normalizeIndianMobile(body.mobileNumber);
    const existingCooldown = mobileCooldowns.get(normalizedMobile);
    if (existingCooldown && existingCooldown > now) {
      const secondsRemaining = Math.ceil((existingCooldown - now) / 1000);
      res.status(429).json({
        ok: false,
        code: 'DUPLICATE_SUBMISSION',
        message: `An enquiry for this mobile number was recently received. Please wait ${secondsRemaining} seconds before submitting another request.`,
      });
      return;
    }

    // Record rate-limit and duplicate cooldown with bounded map sizes
    if (currentBucket && currentBucket.resetAt > now) {
      currentBucket.count += 1;
    } else {
      ipRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
      trimMapCapacity(ipRateBuckets, MAX_BUCKET_ENTRIES);
    }
    mobileCooldowns.set(normalizedMobile, now + MOBILE_COOLDOWN_MS);
    trimMapCapacity(mobileCooldowns, MAX_BUCKET_ENTRIES);

    const referenceCode = generateReferenceCode();
    const notifyToken = signNotifyToken(referenceCode, normalizedMobile, now);
    res.json({
      ok: true,
      referenceCode,
      normalizedMobile,
      notifyToken,
    });
  });

  // Server-side transactional email notification triggered ONLY after confirmed Firestore save
  app.post('/api/enquiries/notify', async (req: Request, res: Response) => {
    const now = Date.now();
    cleanupBuckets(now);

    const ip = req.ip || 'unknown';
    const currentBucket = notifyIpRateBuckets.get(ip);
    if (currentBucket && currentBucket.resetAt > now && currentBucket.count >= MAX_NOTIFY_PER_IP) {
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        emailNotificationStatus: 'failed',
        emailNotificationError: 'Notification rate limit exceeded.',
      });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const referenceCode = typeof body.referenceCode === 'string' ? body.referenceCode.trim() : '';
    const enquiryId = typeof body.enquiryId === 'string' ? body.enquiryId.trim() : '';
    const notifyToken = typeof body.notifyToken === 'string' ? body.notifyToken.trim() : '';

    if (!REFERENCE_CODE_REGEX.test(referenceCode) || !VALID_DOC_ID_REGEX.test(enquiryId)) {
      res.status(400).json({
        ok: false,
        code: 'INVALID_IDENTIFIER',
        message: 'Invalid enquiry identifier.',
      });
      return;
    }

    const validation = validateEnquiryInput({
      fullName: typeof body.fullName === 'string' ? body.fullName : '',
      mobileNumber: typeof body.mobileNumber === 'string' ? body.mobileNumber : '',
      email: typeof body.email === 'string' ? body.email : '',
      city: typeof body.city === 'string' ? body.city : '',
      requiredAmount: typeof body.requiredAmount === 'string' ? body.requiredAmount : '',
      requirementType: typeof body.requirementType === 'string' ? body.requirementType : '',
      preferredContact: typeof body.preferredContact === 'string' ? body.preferredContact : '',
      message: typeof body.message === 'string' ? body.message : '',
      consentAccepted: body.consentAccepted === true,
    });

    if (!validation.valid) {
      res.status(400).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid enquiry notification payload.',
      });
      return;
    }

    const tokenCheck = verifyNotifyToken(
      notifyToken,
      referenceCode,
      validation.sanitized.mobileNumber,
      now
    );
    if (!tokenCheck.valid) {
      res.status(403).json({
        ok: false,
        code: 'UNAUTHORIZED_NOTIFICATION',
        message: tokenCheck.reason || 'Notification request is not authorized.',
      });
      return;
    }

    // Idempotency guard: prevent duplicate email delivery for the same enquiry reference
    const existingRecord = serverNotificationLog.get(referenceCode);
    if (existingRecord) {
      res.json({
        ok: existingRecord.emailNotificationStatus === 'sent',
        duplicate: true,
        ...existingRecord,
      });
      return;
    }

    if (inFlightNotifications.has(referenceCode)) {
      res.json({
        ok: true,
        duplicate: true,
        enquiryId,
        referenceCode,
        emailNotificationStatus: 'pending',
        emailNotificationError: '',
        emailNotificationAttempts: 1,
        emailNotificationRetryStatus: 'none',
        emailNotifiedAt: '',
        whatsappCloudStatus: 'disabled',
      });
      return;
    }

    if (currentBucket && currentBucket.resetAt > now) {
      currentBucket.count += 1;
    } else {
      notifyIpRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
      trimMapCapacity(notifyIpRateBuckets, MAX_BUCKET_ENTRIES);
    }

    const payload: EnquiryNotificationPayload = {
      enquiryId,
      referenceCode,
      fullName: validation.sanitized.fullName,
      mobileNumber: validation.sanitized.mobileNumber,
      email: validation.sanitized.email,
      requirementType: validation.sanitized.requirementType,
      requiredAmount: validation.sanitized.requiredAmount,
      city: validation.sanitized.city,
      preferredContact: validation.sanitized.preferredContact,
      message: validation.sanitized.message,
      source: typeof body.source === 'string' ? body.source.trim().slice(0, 60) : 'website',
      submittedAtIso:
        typeof body.submittedAtIso === 'string' && body.submittedAtIso.trim().length <= 40
          ? body.submittedAtIso.trim()
          : new Date().toISOString(),
    };

    inFlightNotifications.add(referenceCode);
    try {
      const emailResult = await sendEnquiryNotificationEmail(payload, undefined, fetch, 1);
      const waCloudResult = await sendWhatsAppCloudTemplateNotification(payload);

      const record: ServerNotificationRecord = {
        enquiryId,
        referenceCode,
        emailNotificationStatus: emailResult.status,
        emailNotificationError: emailResult.error || '',
        emailNotificationAttempts: 1,
        emailNotificationRetryStatus: 'none',
        emailNotifiedAt: emailResult.notifiedAt || '',
        whatsappCloudStatus: waCloudResult.status,
        updatedAtMs: Date.now(),
      };

      serverNotificationLog.set(referenceCode, record);
      trimMapCapacity(serverNotificationLog, MAX_BUCKET_ENTRIES);

      if (!emailResult.ok) {
        console.warn(
          `[SG FINANCE Notification] Email failed for ${referenceCode}: ${emailResult.error}`
        );
      }

      res.json({
        ok: emailResult.ok,
        duplicate: false,
        ...record,
      });
    } finally {
      inFlightNotifications.delete(referenceCode);
    }
  });

  // Authorized Admin-only endpoint: retrieve recent server-side notification delivery outcomes
  app.get('/api/enquiries/notifications', async (req: Request, res: Response) => {
    const auth = await verifyAuthorizedAdminToken(req.headers.authorization);
    if (!auth.ok) {
      res.status(auth.status).json({ ok: false, message: auth.message });
      return;
    }

    res.json({
      ok: true,
      records: Object.fromEntries(serverNotificationLog.entries()),
    });
  });

  // Authorized Admin-only endpoint: retry failed/pending email notification for a saved enquiry
  app.post('/api/enquiries/notify/retry', async (req: Request, res: Response) => {
    const auth = await verifyAuthorizedAdminToken(req.headers.authorization);
    if (!auth.ok) {
      res.status(auth.status).json({ ok: false, message: auth.message });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const referenceCode = typeof body.referenceCode === 'string' ? body.referenceCode.trim() : '';
    const enquiryId = typeof body.enquiryId === 'string' ? body.enquiryId.trim() : '';

    if (!REFERENCE_CODE_REGEX.test(referenceCode) || !VALID_DOC_ID_REGEX.test(enquiryId)) {
      res.status(400).json({ ok: false, message: 'Invalid enquiry reference or ID.' });
      return;
    }

    const validation = validateEnquiryInput({
      fullName: typeof body.fullName === 'string' ? body.fullName : '',
      mobileNumber: typeof body.mobileNumber === 'string' ? body.mobileNumber : '',
      email: typeof body.email === 'string' ? body.email : '',
      city: typeof body.city === 'string' ? body.city : '',
      requiredAmount: typeof body.requiredAmount === 'string' ? body.requiredAmount : '',
      requirementType: typeof body.requirementType === 'string' ? body.requirementType : '',
      preferredContact: typeof body.preferredContact === 'string' ? body.preferredContact : 'Phone Call',
      message: typeof body.message === 'string' ? body.message : '',
      consentAccepted: true,
    });

    if (!validation.valid) {
      res.status(400).json({ ok: false, message: 'Enquiry data is incomplete for retry.' });
      return;
    }

    const previousFromClient =
      typeof body.previousAttempts === 'number' && Number.isFinite(body.previousAttempts)
        ? Math.max(0, Math.min(49, Math.floor(body.previousAttempts)))
        : 0;
    const previousFromServer = serverNotificationLog.get(referenceCode)?.emailNotificationAttempts ?? 0;
    const nextAttempt = Math.min(50, Math.max(previousFromClient, previousFromServer) + 1);

    const payload: EnquiryNotificationPayload = {
      enquiryId,
      referenceCode,
      fullName: validation.sanitized.fullName,
      mobileNumber: validation.sanitized.mobileNumber,
      email: validation.sanitized.email,
      requirementType: validation.sanitized.requirementType,
      requiredAmount: validation.sanitized.requiredAmount,
      city: validation.sanitized.city,
      preferredContact: validation.sanitized.preferredContact,
      message: validation.sanitized.message,
      source: typeof body.source === 'string' ? body.source.trim().slice(0, 60) : 'website',
      submittedAtIso:
        typeof body.submittedAtIso === 'string' && body.submittedAtIso.trim().length <= 40
          ? body.submittedAtIso.trim()
          : new Date().toISOString(),
    };

    const emailResult = await sendEnquiryNotificationEmail(payload, undefined, fetch, nextAttempt);

    const record: ServerNotificationRecord = {
      enquiryId,
      referenceCode,
      emailNotificationStatus: emailResult.status,
      emailNotificationError: emailResult.error || '',
      emailNotificationAttempts: nextAttempt,
      emailNotificationRetryStatus: emailResult.ok ? 'retried_sent' : 'retried_failed',
      emailNotifiedAt: emailResult.notifiedAt || '',
      whatsappCloudStatus: serverNotificationLog.get(referenceCode)?.whatsappCloudStatus || 'disabled',
      updatedAtMs: Date.now(),
    };

    serverNotificationLog.set(referenceCode, record);
    trimMapCapacity(serverNotificationLog, MAX_BUCKET_ENTRIES);

    res.json({
      ok: emailResult.ok,
      ...record,
    });
  });

  // Server-side AI customer assistant endpoint (Gemini via @google/genai, server-only API key)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const now = Date.now();
    cleanupBuckets(now);

    const ip = req.ip || 'unknown';
    const currentBucket = chatIpRateBuckets.get(ip);
    if (currentBucket && currentBucket.resetAt > now && currentBucket.count >= MAX_CHAT_PER_IP) {
      res.status(429).json({
        ok: false,
        code: 'RATE_LIMITED',
        message:
          'You have sent several messages in a short time. Please wait a few minutes, submit an enquiry, or chat with us directly on WhatsApp (+91 7038391002).',
      });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const messages = sanitizeChatHistory(body.messages);
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      res.status(400).json({
        ok: false,
        code: 'INVALID_CHAT_REQUEST',
        message: 'Please enter a valid message to continue the conversation.',
      });
      return;
    }

    if (currentBucket && currentBucket.resetAt > now) {
      currentBucket.count += 1;
    } else {
      chatIpRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
      trimMapCapacity(chatIpRateBuckets, MAX_BUCKET_ENTRIES);
    }

    const pagePath =
      typeof body.pagePath === 'string' && body.pagePath.startsWith('/')
        ? body.pagePath.slice(0, 80)
        : '/';

    const result = await generateSgFinanceChatReply(messages, pagePath);
    if (!result.ok) {
      res.status(result.status).json({
        ok: false,
        code: result.code,
        message: result.message,
      });
      return;
    }

    res.json({
      ok: true,
      reply: result.data.reply,
      suggestEnquiry: result.data.suggestEnquiry,
      suggestedRequirement: result.data.suggestedRequirement,
      extractedAmount: result.data.extractedAmount,
      extractedCity: result.data.extractedCity,
    });
  });

  // SEO: robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const robots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
      '',
    ].join('\n');
    res.type('text/plain').send(robots);
  });

  // SEO: dynamic XML sitemap
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const lastmod = new Date().toISOString().split('T')[0];
    const urlEntries = PUBLIC_SITEMAP_ROUTES.map(
      (route) =>
        `  <url>\n    <loc>${baseUrl}${route.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
    res.type('application/xml').send(xml);
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ...(disableHmr ? { hmr: false, ws: false } : {}),
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') {
        next();
        return;
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        const template = fs.readFileSync(indexPath, 'utf8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, template);
        const seoHtml = injectRouteSeoHtml(transformed, req.originalUrl, getBaseUrl(req));
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(seoHtml);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const indexFile = path.join(distPath, 'index.html');
    const cachedTemplate = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : null;

    app.use(express.static(distPath, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      if (cachedTemplate) {
        const seoHtml = injectRouteSeoHtml(cachedTemplate, req.originalUrl, getBaseUrl(req));
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(seoHtml);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SG FINANCE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SG FINANCE server:', err);
  process.exit(1);
});
