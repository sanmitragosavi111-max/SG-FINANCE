import {
  buildEnquiryEmailHtml,
  buildEnquiryEmailText,
  NOTIFICATION_EMAIL_SUBJECT,
} from '../utils/enquiryNotifications.ts';
import type { EnquiryNotificationPayload } from '../utils/enquiryNotifications.ts';

export interface EmailServiceConfig {
  resendApiKey: string;
  notificationEmail: string;
  fromEmail: string;
}

export interface EmailDeliveryResult {
  ok: boolean;
  status: 'sent' | 'failed';
  providerMessageId?: string;
  error?: string;
  notifiedAt?: string;
}

type FetchFn = typeof fetch;

const DEFAULT_NOTIFICATION_EMAIL = 'in.sg.infra@gmail.com';
const RESEND_API_ENDPOINT = 'https://api.resend.com/emails';
const EMAIL_REQUEST_TIMEOUT_MS = 10_000;

export function getEmailServiceConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env
): EmailServiceConfig {
  return {
    resendApiKey: (env.RESEND_API_KEY ?? '').trim(),
    notificationEmail:
      (env.NOTIFICATION_EMAIL ?? '').trim() || DEFAULT_NOTIFICATION_EMAIL,
    fromEmail: (env.FROM_EMAIL ?? '').trim(),
  };
}

function sanitizeErrorMessage(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 280);
}

/**
 * Sends the SG FINANCE internal customer enquiry notification email via Resend.
 * Never throws unhandled exceptions; always returns a structured delivery result
 * so that an email outage never compromises saved Firestore enquiries.
 */
export async function sendEnquiryNotificationEmail(
  payload: EnquiryNotificationPayload,
  config: EmailServiceConfig = getEmailServiceConfigFromEnv(),
  fetchImpl: FetchFn = fetch,
  attemptNumber = 1
): Promise<EmailDeliveryResult> {
  if (!config.resendApiKey) {
    return {
      ok: false,
      status: 'failed',
      error:
        'Email provider is not configured (missing RESEND_API_KEY in server environment).',
    };
  }

  if (!config.fromEmail) {
    return {
      ok: false,
      status: 'failed',
      error:
        'Verified sender address is not configured (missing FROM_EMAIL in server environment).',
    };
  }

  const recipient = config.notificationEmail || DEFAULT_NOTIFICATION_EMAIL;
  const html = buildEnquiryEmailHtml(payload);
  const text = buildEnquiryEmailText(payload);

  const requestBody: Record<string, unknown> = {
    from: config.fromEmail,
    to: [recipient],
    subject: NOTIFICATION_EMAIL_SUBJECT,
    html,
    text,
  };

  if (payload.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    requestBody.reply_to = payload.email.trim();
  }

  const safeAttempt = Math.max(1, Math.min(50, Math.floor(attemptNumber)));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMAIL_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(RESEND_API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `sgf-enquiry-${payload.referenceCode}-a${safeAttempt}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const rawText = await response.text();
    let parsed: { id?: string; message?: string; name?: string } = {};
    try {
      parsed = rawText ? (JSON.parse(rawText) as typeof parsed) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok) {
      const providerMessage =
        parsed.message || rawText || `HTTP ${response.status}`;
      return {
        ok: false,
        status: 'failed',
        error: sanitizeErrorMessage(
          `Resend delivery failed (${response.status}): ${providerMessage}`
        ),
      };
    }

    return {
      ok: true,
      status: 'sent',
      providerMessageId: parsed.id,
      notifiedAt: new Date().toISOString(),
    };
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Email provider request timed out.'
          : err.message
        : String(err);
    return {
      ok: false,
      status: 'failed',
      error: sanitizeErrorMessage(`Email delivery error: ${msg}`),
    };
  } finally {
    clearTimeout(timer);
  }
}
