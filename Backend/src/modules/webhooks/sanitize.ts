import { maskEmail } from '../../shared/validation/email.js';
import { maskPhone } from '../../shared/validation/phone.js';
import { maskSensitiveValue, maskToken } from '../../shared/encryption/mask.js';
import type { WebhookProvider } from './webhook-event.model.js';

/**
 * Secrets are redacted in stored payloads. Operational contact fields (from, phone,
 * email, etc.) are kept so retries can re-run business logic. PII is masked in logs
 * and admin display helpers — not in the processing payload.
 */
const SECRET_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'password',
  'secret',
  'api_key',
  'card',
  'cvv',
]);

const PII_LOG_KEYS = new Set([
  'email',
  'invitee_email',
  'customer_email',
  'phone',
  'mobile',
  'wa_id',
  'from',
  'to',
  'name',
  'full_name',
  'first_name',
  'last_name',
  'contact',
  'address',
  'pan',
  'gstin',
  'to_number',
  'from_number',
  'from_phone_number',
]);

function redactSecrets(value: unknown, depth = 0): unknown {
  // Meta / Calendly / Hunar payloads nest deeper than a shallow dashboard object.
  if (depth > 24) return '[truncated]';
  if (value == null) return value;
  if (typeof value === 'string') {
    if (value.length > 8_000) return `${value.slice(0, 8_000)}…[truncated]`;
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => redactSecrets(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      if (
        SECRET_KEYS.has(lower) ||
        lower.includes('password') ||
        (lower.includes('token') && lower !== 'webhook_id') ||
        lower.includes('secret')
      ) {
        out[key] = typeof child === 'string' ? maskToken(child) : '[redacted]';
        continue;
      }
      out[key] = redactSecrets(child, depth + 1);
    }
    return out;
  }
  return String(value);
}

/** Store necessary webhook data; redact secrets only (keep fields needed to process). */
export function sanitizeWebhookPayload(
  _provider: WebhookProvider,
  body: Record<string, unknown>
): Record<string, unknown> {
  return redactSecrets(body) as Record<string, unknown>;
}

function maskPiiValue(key: string, value: string): string {
  const lower = key.toLowerCase();
  if (lower.includes('email')) return maskEmail(value);
  if (
    lower.includes('phone') ||
    lower.includes('mobile') ||
    lower === 'wa_id' ||
    lower === 'from' ||
    lower === 'to' ||
    lower.includes('number')
  ) {
    return maskPhone(value);
  }
  return maskSensitiveValue(value, { visibleStart: 1, visibleEnd: 1 });
}

/** Mask PII for admin/UI display of a stored payload. */
export function maskPayloadForDisplay(value: unknown, depth = 0): unknown {
  if (depth > 24) return '[truncated]';
  if (value == null) return value;
  if (typeof value === 'string') {
    if (value.length > 2_000) return `${value.slice(0, 2_000)}…[truncated]`;
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => maskPayloadForDisplay(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      if (SECRET_KEYS.has(lower) || lower.includes('password') || lower.includes('secret')) {
        out[key] = typeof child === 'string' ? maskToken(child) : '[redacted]';
        continue;
      }
      if (
        typeof child === 'string' &&
        (PII_LOG_KEYS.has(lower) || lower.includes('email') || lower.includes('phone'))
      ) {
        out[key] = maskPiiValue(key, child);
        continue;
      }
      out[key] = maskPayloadForDisplay(child, depth + 1);
    }
    return out;
  }
  return String(value);
}

/** Safe object for structured logs (never log raw PII). */
export function webhookLogContext(input: {
  provider: WebhookProvider;
  providerEventId: string;
  eventType: string;
  signatureValid: boolean;
  status?: string;
  error?: string | null;
}) {
  return {
    provider: input.provider,
    providerEventId: maskSensitiveValue(input.providerEventId, {
      visibleStart: 4,
      visibleEnd: 4,
    }),
    eventType: input.eventType,
    signatureValid: input.signatureValid,
    status: input.status,
    error: input.error
      ? maskSensitiveValue(input.error, { visibleStart: 0, visibleEnd: 0 })
      : null,
  };
}

const ALLOWED_HEADERS = [
  'content-type',
  'user-agent',
  'x-request-id',
  'x-razorpay-signature',
  'x-hub-signature-256',
  'x-gupshup-signature',
  'x-webhook-signature',
  'x-hunar-signature',
  'x-hunar-webhook-secret',
  'x-webhook-secret',
  'calendly-webhook-signature',
  'webhook-id',
  'webhook-signature',
  'webhook-timestamp',
];

export function sanitizeHeaders(
  headers: Record<string, string | string[] | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of ALLOWED_HEADERS) {
    const value = headers[key] ?? headers[key.toLowerCase()];
    if (!value) continue;
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) continue;
    if (key.includes('signature') || key.includes('secret')) {
      out[key] = maskToken(raw);
    } else {
      out[key] = raw.slice(0, 200);
    }
  }
  return out;
}
