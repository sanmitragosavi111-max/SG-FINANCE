import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOTSTRAP_ADMIN_EMAIL = 'sanmitragosavi111@gmail.com';
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

interface FirebaseAppletConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

function loadFirebaseAppletConfig(): FirebaseAppletConfig {
  const candidates = [
    path.resolve(__dirname, '../../firebase-applet-config.json'),
    path.resolve(process.cwd(), 'firebase-applet-config.json'),
  ];
  for (const configPath of candidates) {
    if (fs.existsSync(configPath)) {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8')) as FirebaseAppletConfig;
      return {
        projectId: raw.projectId,
        firestoreDatabaseId: raw.firestoreDatabaseId || '(default)',
      };
    }
  }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  };
}

const FIREBASE_CONFIG = loadFirebaseAppletConfig();

interface CachedCerts {
  certs: Record<string, string>;
  expiresAt: number;
}

let cachedCerts: CachedCerts | null = null;

async function getGooglePublicCerts(fetchImpl: typeof fetch = fetch): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && cachedCerts.expiresAt > now) {
    return cachedCerts.certs;
  }

  const response = await fetchImpl(GOOGLE_CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Firebase signing certificates (${response.status})`);
  }

  const certs = (await response.json()) as Record<string, string>;
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlSeconds = maxAgeMatch ? Math.min(Number(maxAgeMatch[1]), 21600) : 3600;

  cachedCerts = {
    certs,
    expiresAt: now + ttlSeconds * 1000,
  };
  return certs;
}

function base64UrlDecode(segment: string): Buffer {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

export interface VerifiedAdminCaller {
  uid: string;
  email: string;
  isPrimaryAdmin: boolean;
}

/**
 * Cryptographically verifies a Firebase Auth ID token (RS256 against Google X.509 certs)
 * and confirms the caller is either the Bootstrap Admin or listed in Firestore /admins/{uid}.
 */
export async function verifyAuthorizedAdminToken(
  authHeader: string | undefined,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true; admin: VerifiedAdminCaller } | { ok: false; status: number; message: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Missing administrator authorization token.' };
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  const segments = idToken.split('.');
  if (segments.length !== 3) {
    return { ok: false, status: 401, message: 'Malformed authorization token.' };
  }

  const [headerB64, payloadB64, signatureB64] = segments;

  let header: { alg?: string; kid?: string };
  let payload: {
    iss?: string;
    aud?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
  };

  try {
    header = JSON.parse(base64UrlDecode(headerB64).toString('utf8')) as typeof header;
    payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as typeof payload;
  } catch {
    return { ok: false, status: 401, message: 'Invalid token encoding.' };
  }

  if (header.alg !== 'RS256' || !header.kid) {
    return { ok: false, status: 401, message: 'Unsupported token signing algorithm.' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${FIREBASE_CONFIG.projectId}`;

  if (
    payload.aud !== FIREBASE_CONFIG.projectId ||
    payload.iss !== expectedIssuer ||
    !payload.sub ||
    typeof payload.exp !== 'number' ||
    payload.exp <= nowSec ||
    typeof payload.iat !== 'number' ||
    payload.iat > nowSec + 300
  ) {
    return { ok: false, status: 401, message: 'Authorization token is expired or invalid.' };
  }

  if (payload.email_verified !== true || !payload.email) {
    return { ok: false, status: 403, message: 'Verified Google email is required.' };
  }

  try {
    const certs = await getGooglePublicCerts(fetchImpl);
    const certPem = certs[header.kid];
    if (!certPem) {
      return { ok: false, status: 401, message: 'Unrecognized token signing key.' };
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();

    const signature = base64UrlDecode(signatureB64);
    const isSignatureValid = verifier.verify(certPem, signature);
    if (!isSignatureValid) {
      return { ok: false, status: 401, message: 'Invalid token signature.' };
    }
  } catch {
    return { ok: false, status: 503, message: 'Unable to verify administrator credentials right now.' };
  }

  const normalizedEmail = payload.email.toLowerCase();
  if (normalizedEmail === BOOTSTRAP_ADMIN_EMAIL) {
    return {
      ok: true,
      admin: {
        uid: payload.sub,
        email: normalizedEmail,
        isPrimaryAdmin: true,
      },
    };
  }

  // Verify authorized staff admin entry in Firestore /admins/{uid} using the caller's own verified ID token
  const databaseId = encodeURIComponent(FIREBASE_CONFIG.firestoreDatabaseId || '(default)');
  const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    FIREBASE_CONFIG.projectId
  )}/databases/${databaseId}/documents/admins/${encodeURIComponent(payload.sub)}`;

  try {
    const checkRes = await fetchImpl(adminDocUrl, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!checkRes.ok) {
      return { ok: false, status: 403, message: 'Account does not have SG FINANCE administrator access.' };
    }
    const docData = (await checkRes.json()) as {
      fields?: { role?: { stringValue?: string } };
    };
    if (docData.fields?.role?.stringValue !== 'admin') {
      return { ok: false, status: 403, message: 'Account does not have SG FINANCE administrator access.' };
    }

    return {
      ok: true,
      admin: {
        uid: payload.sub,
        email: normalizedEmail,
        isPrimaryAdmin: false,
      },
    };
  } catch {
    return { ok: false, status: 403, message: 'Unable to confirm administrator authorization.' };
  }
}
