import crypto from 'crypto';

const DEFAULT_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface NotifyTokenPayload {
  referenceCode: string;
  normalizedMobile: string;
  exp: number;
}

function getSigningSecret(explicitSecret?: string): string {
  if (explicitSecret && explicitSecret.trim().length > 0) {
    return explicitSecret.trim();
  }
  const envSecret = process.env.NOTIFY_SIGNING_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  return runtimeFallbackSecret;
}

const runtimeFallbackSecret = crypto.randomBytes(32).toString('hex');

/**
 * Generates a short-lived HMAC-SHA256 token tying /api/enquiries/notify
 * to a referenceCode and mobile number that passed /api/enquiries/validate.
 */
export function signNotifyToken(
  referenceCode: string,
  normalizedMobile: string,
  nowMs: number = Date.now(),
  ttlMs: number = DEFAULT_TOKEN_TTL_MS,
  secret?: string
): string {
  const payload: NotifyTokenPayload = {
    referenceCode,
    normalizedMobile,
    exp: nowMs + ttlMs,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret(secret))
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyNotifyToken(
  token: string,
  expectedReferenceCode: string,
  expectedNormalizedMobile: string,
  nowMs: number = Date.now(),
  secret?: string
): { valid: boolean; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing notification authorization token.' };
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Malformed notification token.' };
  }

  const [encoded, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret(secret))
    .update(encoded)
    .digest('base64url');

  const providedBuf = Buffer.from(providedSig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return { valid: false, reason: 'Invalid notification token signature.' };
  }

  let parsed: NotifyTokenPayload;
  try {
    parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as NotifyTokenPayload;
  } catch {
    return { valid: false, reason: 'Corrupted notification token payload.' };
  }

  if (typeof parsed.exp !== 'number' || parsed.exp < nowMs) {
    return { valid: false, reason: 'Notification token has expired.' };
  }

  if (
    parsed.referenceCode !== expectedReferenceCode ||
    parsed.normalizedMobile !== expectedNormalizedMobile
  ) {
    return { valid: false, reason: 'Notification token does not match this enquiry.' };
  }

  return { valid: true };
}
