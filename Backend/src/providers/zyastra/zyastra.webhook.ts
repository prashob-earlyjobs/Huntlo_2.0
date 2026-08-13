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

/** Prefer first non-empty string among candidate keys (camelCase + snake_case). */
function pickString(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = asString(source[key]);
    if (value) return value;
  }
  return '';
}

function pickNumber(source: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const n = asNumber(source[key]);
    if (n != null) return n;
    const asStr = asString(source[key]);
    if (asStr) {
      const parsed = Number(asStr);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

/**
 * Zyastra may send recording as camelCase, snake_case, or a nested `{ url }` object.
 * Also accept common aliases seen in post-call webhooks.
 */
export function extractZyastraRecordingUrl(
  data: Record<string, unknown>,
  root: Record<string, unknown> = {}
): string {
  const nestedRecording = asRecord(data.recording || data.callRecording || root.recording);
  return (
    pickString(
      data,
      'recordingUrl',
      'recording_url',
      'callRecordingUrl',
      'call_recording_url',
      'recordingLink',
      'recording_link',
      'audioUrl',
      'audio_url'
    ) ||
    pickString(nestedRecording, 'url', 'recordingUrl', 'recording_url', 'href') ||
    pickString(
      root,
      'recordingUrl',
      'recording_url',
      'callRecordingUrl',
      'call_recording_url'
    )
  );
}

/** Flatten analysis/variable bags; unwrap `{ value }` objects when present. */
export function extractZyastraVariables(
  data: Record<string, unknown>,
  root: Record<string, unknown> = {}
): Record<string, unknown> {
  const bags = [
    asRecord(data.variables),
    asRecord(data.analysisVariables),
    asRecord(data.extractedVariables),
    asRecord(data.analysis),
    asRecord(data.postCallAnalysis),
    asRecord(data.post_call_analysis),
    asRecord(root.variables),
    asRecord(root.analysisVariables),
  ];

  const out: Record<string, unknown> = {};
  for (const bag of bags) {
    for (const [key, value] of Object.entries(bag)) {
      if (value == null) continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = asRecord(value);
        if ('value' in nested) {
          out[key] = nested.value;
          continue;
        }
      }
      // Prefer first non-empty assignment; later bags can fill gaps.
      if (!(key in out) || out[key] === '' || out[key] == null) {
        out[key] = value;
      }
    }
  }
  return out;
}

export function parseZyastraWebhookPayload(body: unknown): ParsedZyastraWebhook {
  const raw = asRecord(body);
  // Some deliveries nest under `data`; others flatten onto the root.
  const data = Object.keys(asRecord(raw.data)).length > 0 ? asRecord(raw.data) : raw;
  const candidate = asRecord(data.candidate || raw.candidate);
  const variables = extractZyastraVariables(data, raw);
  const metadata = {
    ...asRecord(raw.metadata),
    ...asRecord(data.metadata),
  };

  const transcript =
    pickString(data, 'transcript', 'call_transcript', 'callTranscript') ||
    pickString(raw, 'transcript', 'call_transcript', 'callTranscript') ||
    null;

  return {
    event: asString(raw.event) || asString(data.event) || 'call.completed',
    eventId: pickString(raw, 'eventId', 'event_id') || pickString(data, 'eventId', 'event_id'),
    timestamp: pickString(raw, 'timestamp') || pickString(data, 'timestamp'),
    callId: pickString(data, 'callId', 'call_id') || pickString(raw, 'callId', 'call_id'),
    callReferenceId:
      pickString(data, 'callReferenceId', 'call_reference_id', 'requestId', 'request_id') ||
      pickString(raw, 'callReferenceId', 'call_reference_id', 'requestId', 'request_id'),
    status: pickString(data, 'status') || pickString(raw, 'status'),
    durationSeconds:
      pickNumber(data, 'durationSeconds', 'duration_seconds', 'durationSec', 'duration_sec') ??
      pickNumber(raw, 'durationSeconds', 'duration_seconds', 'durationSec', 'duration_sec'),
    phoneNumber:
      pickString(candidate, 'phoneNumber', 'phone_number', 'phone') ||
      pickString(data, 'phoneNumber', 'phone_number', 'to_number', 'toNumber'),
    firstName: pickString(candidate, 'firstName', 'first_name'),
    lastName: pickString(candidate, 'lastName', 'last_name'),
    transcript: transcript || null,
    recordingUrl: extractZyastraRecordingUrl(data, raw),
    summary: pickString(data, 'summary', 'call_summary', 'callSummary') ||
      pickString(raw, 'summary', 'call_summary', 'callSummary'),
    variables,
    metadata,
    raw,
  };
}
