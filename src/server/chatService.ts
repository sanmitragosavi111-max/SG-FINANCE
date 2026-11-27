import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  buildSgFinanceSystemInstruction,
  parseAssistantStructuredResponse,
} from './chatbotKnowledge.ts';
import type { AssistantStructuredReply, ChatTurn } from './chatbotKnowledge.ts';

const CHAT_MODEL = 'gemini-4-hydrogen';
const MAX_TRANSIENT_RETRIES = 2;

export interface ChatServiceResult {
  ok: true;
  data: AssistantStructuredReply;
}

export interface ChatServiceError {
  ok: false;
  status: number;
  code: string;
  message: string;
}

let cachedClient: { key: string; ai: GoogleGenAI } | null = null;

function getServerGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!cachedClient || cachedClient.key !== apiKey) {
    cachedClient = {
      key: apiKey,
      ai: new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      }),
    };
  }
  return cachedClient.ai;
}

function getHttpStatusFromError(err: unknown): number {
  if (!err || typeof err !== 'object') return 500;
  const candidate = err as { status?: unknown; statusCode?: unknown; code?: unknown };
  for (const val of [candidate.status, candidate.statusCode, candidate.code]) {
    if (typeof val === 'number' && val >= 400 && val < 600) {
      return val;
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) return 429;
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) return 403;
  if (msg.includes('400') || msg.includes('API_KEY_INVALID')) return 400;
  if (msg.includes('404') || msg.includes('NOT_FOUND')) return 404;
  return 502;
}

function isRetryableStatus(status: number): boolean {
  return status === 500 || status === 502 || status === 503 || status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a contextual, multilingual reply from SG Finance Assistant via the
 * server-side @google/genai SDK (never exposing API keys to the browser).
 */
export async function generateSgFinanceChatReply(
  messages: ChatTurn[],
  pagePath = '/'
): Promise<ChatServiceResult | ChatServiceError> {
  const ai = getServerGeminiClient();
  if (!ai) {
    return {
      ok: false,
      status: 503,
      code: 'AI_UNAVAILABLE',
      message:
        'Our AI assistant is temporarily unavailable. You can still submit an enquiry below, call us at +91 7038391002, or chat directly on WhatsApp.',
    };
  }

  const contents = messages.map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.content }],
  }));

  const systemInstruction = buildSgFinanceSystemInstruction(pagePath);

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description:
                  'Natural, concise, polite customer-executive response in the visitor’s language (English, Hindi, Marathi, or Hinglish).',
              },
              suggestEnquiry: {
                type: Type.BOOLEAN,
                description:
                  'True when the visitor is interested in applying, requesting a callback, discussing a specific requirement/amount, or ready to enquire.',
              },
              suggestedRequirement: {
                type: Type.STRING,
                description:
                  'Exact approved SG FINANCE requirement category if clearly identified, otherwise empty string.',
              },
              extractedAmount: {
                type: Type.STRING,
                description: 'Indicative loan amount mentioned by the visitor, otherwise empty string.',
              },
              extractedCity: {
                type: Type.STRING,
                description: 'City or location mentioned by the visitor, otherwise empty string.',
              },
            },
            required: [
              'reply',
              'suggestEnquiry',
              'suggestedRequirement',
              'extractedAmount',
              'extractedCity',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      const parsed = parseAssistantStructuredResponse(rawText);

      if (!parsed.reply) {
        return {
          ok: false,
          status: 502,
          code: 'EMPTY_AI_RESPONSE',
          message:
            'Unable to generate a response right now. Please try again or reach our team on WhatsApp (+91 7038391002).',
        };
      }

      return { ok: true, data: parsed };
    } catch (err) {
      lastErr = err;
      const status = getHttpStatusFromError(err);
      if (isRetryableStatus(status) && attempt < MAX_TRANSIENT_RETRIES) {
        await sleep(350 * (attempt + 1));
        continue;
      }

      if (status === 429) {
        return {
          ok: false,
          status: 429,
          code: 'AI_QUOTA_EXCEEDED',
          message:
            'The assistant is receiving high demand right now. Please try again in a moment, or connect directly via WhatsApp or the enquiry form.',
        };
      }

      if (status === 400 || status === 403) {
        return {
          ok: false,
          status: 503,
          code: 'AI_CONFIGURATION_ERROR',
          message:
            'Our AI assistant is temporarily unavailable. Please submit an enquiry or contact us directly at +91 7038391002.',
        };
      }

      return {
        ok: false,
        status: 502,
        code: 'AI_UPSTREAM_ERROR',
        message:
          'We encountered a temporary connection issue. Please try sending your message again or connect with us on WhatsApp.',
      };
    }
  }

  console.error('[SG FINANCE Chatbot] Unexpected Gemini error:', lastErr);
  return {
    ok: false,
    status: 502,
    code: 'AI_UPSTREAM_ERROR',
    message:
      'We encountered a temporary issue. Please try again or connect with our team on WhatsApp.',
  };
}
