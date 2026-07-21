import { createHmac, timingSafeEqual } from 'node:crypto';

import { getEnv } from '../../config/env.js';
import { verifyCalendlySignature, getCalendlyWebhookSigningKey } from '../../providers/calendly/calendly.client.js';
import { verifyAndParseDodoWebhook } from '../../providers/dodo/dodo.webhook.js';
import { verifyHunarWebhookAuthenticity } from '../../providers/hunar/hunar.webhook.js';
import { verifyRazorpayWebhookSignature } from '../../providers/razorpay/razorpay.client.js';
import type { WebhookProvider } from './webhook-event.model.js';

export type SignatureResult = {
  valid: boolean;
  reason?: string;
  /** Provider may parse/normalize the body during verify (e.g. Dodo). */
  parsedBody?: Record<string, unknown>;
};

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0];
  return direct;
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function verifyMetaSignature(
  rawBody: Buffer,
  headers: Record<string, string | string[] | undefined>
): SignatureResult {
  const appSecret = String(process.env.META_APP_SECRET || '').trim();
  const signature = headerValue(headers, 'x-hub-signature-256');
  if (!signature?.startsWith('sha256=')) {
    // Non-production fixtures may omit the header; reject only when a bad header is sent.
    if (!signature && getEnv().APP_ENV !== 'production') {
      return { valid: true, reason: 'meta_signature_optional' };
    }
    if (!appSecret) {
      return { valid: getEnv().APP_ENV !== 'production', reason: 'meta_secret_optional' };
    }
    return { valid: false, reason: 'Missing X-Hub-Signature-256' };
  }
  if (!appSecret) {
    return { valid: false, reason: 'META_APP_SECRET not configured' };
  }
  const expected =
    'sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex');
  return {
    valid: safeEqualHex(signature, expected),
    reason: safeEqualHex(signature, expected) ? undefined : 'Invalid Meta signature',
  };
}

function verifyGupshupSignature(
  rawBody: Buffer,
  headers: Record<string, string | string[] | undefined>
): SignatureResult {
  const secret = String(
    process.env.GUPSHUP_WEBHOOK_SECRET || process.env.GUPSHUP_API_KEY || ''
  ).trim();
  const signature =
    headerValue(headers, 'x-gupshup-signature') ||
    headerValue(headers, 'x-webhook-signature');
  if (!signature) {
    if (getEnv().APP_ENV !== 'production') {
      return { valid: true, reason: 'gupshup_signature_optional' };
    }
    if (!secret) {
      return { valid: false, reason: 'gupshup_secret_optional' };
    }
    return { valid: false, reason: 'Missing Gupshup signature' };
  }
  if (!secret) {
    return {
      valid: getEnv().APP_ENV !== 'production',
      reason: 'gupshup_secret_optional',
    };
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signature.replace(/^sha256=/i, '');
  return {
    valid: safeEqualHex(provided, expected),
    reason: safeEqualHex(provided, expected) ? undefined : 'Invalid Gupshup signature',
  };
}

export function verifyProviderSignature(input: {
  provider: WebhookProvider;
  rawBody: Buffer;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
}): SignatureResult {
  switch (input.provider) {
    case 'meta':
      return verifyMetaSignature(input.rawBody, input.headers);
    case 'gupshup':
      return verifyGupshupSignature(input.rawBody, input.headers);
    case 'hunar': {
      const screeningId = String(input.query?.screeningId || '').trim() || null;
      const auth = verifyHunarWebhookAuthenticity({
        headers: input.headers,
        rawBody: input.rawBody,
        screeningId,
      });
      return { valid: auth.ok, reason: auth.reason };
    }
    case 'calendly': {
      const key = getCalendlyWebhookSigningKey();
      if (!key) {
        return {
          valid: getEnv().APP_ENV !== 'production',
          reason: 'calendly_secret_optional',
        };
      }
      const ok = verifyCalendlySignature(
        input.rawBody,
        input.headers['calendly-webhook-signature'],
        key
      );
      return { valid: ok, reason: ok ? undefined : 'Invalid Calendly signature' };
    }
    case 'razorpay': {
      const signature = headerValue(input.headers, 'x-razorpay-signature');
      const ok = verifyRazorpayWebhookSignature(input.rawBody, signature);
      return { valid: ok, reason: ok ? undefined : 'Invalid Razorpay signature' };
    }
    case 'dodo': {
      try {
        const parsed = verifyAndParseDodoWebhook(input.rawBody, input.headers);
        return { valid: true, parsedBody: parsed };
      } catch (error) {
        return {
          valid: false,
          reason: error instanceof Error ? error.message : 'Invalid Dodo signature',
        };
      }
    }
    case 'gmail': {
      // Pub/Sub push subscription URL should include ?token=<GMAIL_PUBSUB_VERIFICATION_TOKEN>
      const expected = String(process.env.GMAIL_PUBSUB_VERIFICATION_TOKEN || '').trim();
      const provided = String(input.query?.token || '').trim();
      if (!expected) {
        return {
          valid: getEnv().APP_ENV !== 'production',
          reason: 'gmail_token_optional',
        };
      }
      if (!provided) return { valid: false, reason: 'Missing Gmail Pub/Sub token' };
      return {
        valid: safeEqualHex(provided, expected) || provided === expected,
        reason: provided === expected ? undefined : 'Invalid Gmail Pub/Sub token',
      };
    }
    default:
      return { valid: false, reason: 'Unknown provider' };
  }
}
