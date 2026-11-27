import { formatIndianDisplayMobile } from '../utils/enquiryNotifications.ts';
import type { EnquiryNotificationPayload } from '../utils/enquiryNotifications.ts';

/**
 * Future-Ready Official Meta WhatsApp Business Cloud API Integration Module.
 *
 * IMPORTANT:
 * - Strictly dormant until WHATSAPP_CLOUD_ENABLED=true AND official Meta Cloud API
 *   credentials are explicitly configured in server-side environment variables.
 * - Does NOT simulate automatic WhatsApp delivery with wa.me links.
 * - Does NOT integrate unofficial or third-party WhatsApp automation services.
 */
export interface WhatsAppCloudConfig {
  enabled: boolean;
  accessToken: string;
  phoneNumberId: string;
  recipientNumber: string;
  templateName: string;
  templateLanguage: string;
  graphApiVersion: string;
}

export interface WhatsAppCloudResult {
  attempted: boolean;
  ok: boolean;
  status: 'disabled' | 'sent' | 'failed';
  providerMessageId?: string;
  error?: string;
}

type FetchFn = typeof fetch;

export function getWhatsAppCloudConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env
): WhatsAppCloudConfig {
  return {
    enabled: (env.WHATSAPP_CLOUD_ENABLED ?? '').trim().toLowerCase() === 'true',
    accessToken: (env.WHATSAPP_CLOUD_ACCESS_TOKEN ?? '').trim(),
    phoneNumberId: (env.WHATSAPP_CLOUD_PHONE_NUMBER_ID ?? '').trim(),
    recipientNumber: (env.WHATSAPP_CLOUD_RECIPIENT_NUMBER ?? '')
      .replace(/\D/g, '')
      .trim(),
    templateName: (env.WHATSAPP_CLOUD_TEMPLATE_NAME ?? '').trim(),
    templateLanguage: (env.WHATSAPP_CLOUD_TEMPLATE_LANG ?? '').trim() || 'en',
    graphApiVersion: (env.WHATSAPP_CLOUD_API_VERSION ?? '').trim() || 'v21.0',
  };
}

export function isWhatsAppCloudConfigured(config: WhatsAppCloudConfig): boolean {
  return Boolean(
    config.enabled &&
      config.accessToken &&
      config.phoneNumberId &&
      config.recipientNumber &&
      config.templateName
  );
}

/**
 * Sends a Meta WhatsApp Business Cloud API template message ONLY when explicitly
 * enabled and fully configured. Otherwise returns `{ attempted: false, status: 'disabled' }`.
 */
export async function sendWhatsAppCloudTemplateNotification(
  payload: EnquiryNotificationPayload,
  config: WhatsAppCloudConfig = getWhatsAppCloudConfigFromEnv(),
  fetchImpl: FetchFn = fetch
): Promise<WhatsAppCloudResult> {
  if (!isWhatsAppCloudConfigured(config)) {
    return {
      attempted: false,
      ok: false,
      status: 'disabled',
    };
  }

  const endpoint = `https://graph.facebook.com/${encodeURIComponent(
    config.graphApiVersion
  )}/${encodeURIComponent(config.phoneNumberId)}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    to: config.recipientNumber,
    type: 'template',
    template: {
      name: config.templateName,
      language: { code: config.templateLanguage },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: payload.referenceCode },
            { type: 'text', text: payload.fullName },
            { type: 'text', text: formatIndianDisplayMobile(payload.mobileNumber) },
            { type: 'text', text: payload.requirementType },
            { type: 'text', text: payload.requiredAmount || 'Not specified' },
            { type: 'text', text: payload.city },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let parsed: { messages?: Array<{ id?: string }>; error?: { message?: string } } = {};
    try {
      parsed = text ? (JSON.parse(text) as typeof parsed) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok) {
      return {
        attempted: true,
        ok: false,
        status: 'failed',
        error: (parsed.error?.message || `HTTP ${response.status}`).slice(0, 240),
      };
    }

    return {
      attempted: true,
      ok: true,
      status: 'sent',
      providerMessageId: parsed.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      status: 'failed',
      error: (err instanceof Error ? err.message : String(err)).slice(0, 240),
    };
  }
}
