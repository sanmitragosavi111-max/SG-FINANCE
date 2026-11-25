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
} from './src/utils/validation.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// In-memory spam & duplicate submission protection (per-IP & per-mobile cooldown)
interface RateBucket {
  count: number;
  resetAt: number;
}
const ipRateBuckets = new Map<string, RateBucket>();
const mobileCooldowns = new Map<string, number>();

const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ENQUIRIES_PER_IP = 8;
const MOBILE_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes duplicate guard

function cleanupBuckets(now: number): void {
  for (const [key, bucket] of ipRateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      ipRateBuckets.delete(key);
    }
  }
  for (const [mobile, expiresAt] of mobileCooldowns.entries()) {
    if (expiresAt <= now) {
      mobileCooldowns.delete(mobile);
    }
  }
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

  app.use(express.json({ limit: '16kb' }));

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

    // Record rate-limit and duplicate cooldown
    if (currentBucket && currentBucket.resetAt > now) {
      currentBucket.count += 1;
    } else {
      ipRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    }
    mobileCooldowns.set(normalizedMobile, now + MOBILE_COOLDOWN_MS);

    const referenceCode = generateReferenceCode();
    res.json({
      ok: true,
      referenceCode,
      normalizedMobile,
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
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
