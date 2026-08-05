import { createHmac, timingSafeEqual } from 'node:crypto';

import { getZyastraWebhookSecret } from './zyastra.config.js';

export type ZyastraWebhookEvent = 'call.completed' | 'call.failed';

export type ParsedZyastraWebhook = {
  event: ZyastraWebhookEvent | string;
  eventId: string;
  timestamp: string;
  callId: string;
  callReferenceId: string;
  status: string;
  durationSeconds: number | null;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  transcript: string | null;
  recordingUrl: string;
  summary: string;
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
  raw: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Verify X-Zyastra-Signature: t=<timestamp>,v1=<hmac_sha256_hex>
 * Signed payload: `${timestamp}.${rawBody}` with webhook secret.
 */
export function verifyZyastraWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!rawBody || !signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',').map((p) => p.trim());
  const tPart = parts.find((p) => p.startsWith('t='));
  const v1Part = parts.find((p) => p.startsWith('v1='));
  if (!tPart || !v1Part) return false;
  const timestamp = tPart.slice(2);
  const signature = v1Part.slice(3);
  if (!timestamp || !signature) return false;

  // Reject stale timestamps (>5 minutes) when parseable as unix seconds.
  const tsNum = Number(timestamp);
  if (Number.isFinite(tsNum) && tsNum > 1_000_000_000) {
    const skewSec = Math.abs(Date.now() / 1000 - tsNum);
    if (skewSec > 300) return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  try {
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyZyastraWebhookAuthenticity(input: {
  rawBody: string;
  signatureHeader: string | undefined;
  appEnv?: string;
}): { ok: boolean; reason?: string } {
  const secret = getZyastraWebhookSecret();
  const env = String(input.appEnv || process.env.APP_ENV || 'development').toLowerCase();
  const isProdLike = env === 'production' || env === 'staging';

  if (!secret) {
    if (isProdLike) {
      return { ok: false, reason: 'ZYASTRA_WEBHOOK_SECRET is not configured' };
    }
    return { ok: true, reason: 'skipped_local_no_secret' };
  }

  const header = String(input.signatureHeader || '').trim();
  if (!header) {
    return { ok: false, reason: 'Missing X-Zyastra-Signature header' };
  }

  if (!verifyZyastraWebhook(input.rawBody, header, secret)) {
    return { ok: false, reason: 'Invalid Zyastra webhook signature' };
  }
  return { ok: true };
}

export function parseZyastraWebhookPayload(body: unknown): ParsedZyastraWebhook {
  const raw = asRecord(body);
  const data = asRecord(raw.data);
  const candidate = asRecord(data.candidate);
  const variables = asRecord(data.variables);
  const metadata = asRecord(data.metadata);

  return {
    event: asString(raw.event) || 'call.completed',
    eventId: asString(raw.eventId),
    timestamp: asString(raw.timestamp),
    callId: asString(data.callId),
    callReferenceId: asString(data.callReferenceId),
    status: asString(data.status),
    durationSeconds: asNumber(data.durationSeconds),
    phoneNumber: asString(candidate.phoneNumber),
    firstName: asString(candidate.firstName),
    lastName: asString(candidate.lastName),
    transcript:
      typeof data.transcript === 'string' && data.transcript.trim()
        ? data.transcript.trim()
        : null,
    recordingUrl: asString(data.recordingUrl),
    summary: asString(data.summary),
    variables,
    metadata,
    raw,
  };
}
