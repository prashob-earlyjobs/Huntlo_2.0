import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { getHunarApiKey, getHunarWebhookSecret } from './hunar.config.js';

/**
 * Payload field names taken from EJHunterLanding campaignVoiceCommsService.js
 * and Hunar Sheets docs (event_type, call_id, status, to_number, duration_minutes,
 * result, recording_url, answered_by, from_number).
 */
export type HunarWebhookKind =
  | 'call-status'
  | 'call-recording'
  | 'call-result'
  | 'call-summary';

export type ParsedHunarWebhook = {
  kind: HunarWebhookKind;
  callId: string;
  requestId: string;
  agentId: string;
  toNumber: string;
  fromPhoneNumber: string;
  status: string;
  lifecycleStatus: string;
  answeredBy: string;
  durationSeconds: number | null;
  durationMinutes: number | null;
  eventType: string;
  timezone: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  recordingUrl: string;
  summaryText: string;
  transcript: string | null;
  result: Record<string, unknown> | null;
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

export function extractRecordingUrl(body: Record<string, unknown>): string {
  return asString(body.recording_url || body.call_recording_url || body.url);
}

export function extractSummaryText(body: Record<string, unknown>): string {
  const result = asRecord(body.result);
  if (typeof result.summary === 'string' && result.summary.trim()) {
    return result.summary.trim();
  }
  if (typeof body.summary === 'string' && body.summary.trim()) return body.summary.trim();
  if (typeof body.call_summary === 'string' && body.call_summary.trim()) {
    return body.call_summary.trim();
  }
  if (typeof body.text === 'string' && body.text.trim()) return body.text.trim();
  return '';
}

/** Only store transcript when the provider payload includes it — do not invent. */
export function extractTranscript(body: Record<string, unknown>): string | null {
  if (typeof body.transcript === 'string' && body.transcript.trim()) {
    return body.transcript.trim();
  }
  if (typeof body.call_transcript === 'string' && body.call_transcript.trim()) {
    return body.call_transcript.trim();
  }
  const result = asRecord(body.result);
  if (typeof result.transcript === 'string' && result.transcript.trim()) {
    return result.transcript.trim();
  }
  if (typeof result.call_transcript === 'string' && result.call_transcript.trim()) {
    return result.call_transcript.trim();
  }
  const nested = asRecord(body.call_summary || body.summary_payload || body.data);
  if (typeof nested.transcript === 'string' && nested.transcript.trim()) {
    return nested.transcript.trim();
  }
  return null;
}

export function parseHunarWebhookPayload(
  kind: HunarWebhookKind,
  body: unknown
): ParsedHunarWebhook {
  const raw = asRecord(body);
  const resultObj = asRecord(raw.result);
  const hasResult = Object.keys(resultObj).length > 0;

  return {
    kind,
    callId: asString(raw.call_id),
    requestId: asString(raw.request_id),
    agentId: asString(raw.agent_id),
    toNumber: asString(raw.to_number),
    fromPhoneNumber: asString(raw.from_phone_number || raw.from_number),
    status: asString(raw.status),
    lifecycleStatus: asString(raw.lifecycle_status),
    answeredBy: asString(raw.answered_by),
    durationSeconds: asNumber(raw.duration_seconds),
    durationMinutes: asNumber(raw.duration_minutes),
    eventType: asString(
      raw.event_type ||
        (kind === 'call-status'
          ? 'call_status_updated'
          : kind === 'call-recording'
            ? 'call_recording'
            : kind === 'call-summary'
              ? 'call_summary'
              : 'call_result')
    ),
    timezone: asString(raw.timezone),
    retryCount: asNumber(raw.retry_count) ?? 0,
    maxRetries: asNumber(raw.max_retries) ?? 0,
    createdAt: asString(raw.created_at) || null,
    startedAt: asString(raw.started_at) || null,
    endedAt: asString(raw.ended_at) || null,
    recordingUrl: extractRecordingUrl(raw),
    summaryText: extractSummaryText(raw),
    transcript: extractTranscript(raw),
    result: hasResult ? resultObj : null,
    raw,
  };
}

export function hashWebhookPayload(rawBody: string | Buffer): string {
  return createHash('sha256').update(rawBody).digest('hex');
}

const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300;

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string {
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim();
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Trusted keys used to verify X-Hunar-Signature (official Hunar docs). */
export function getHunarWebhookTrustedApiKeys(): string[] {
  const keys = new Set<string>();
  const primary = getHunarApiKey();
  if (primary) keys.add(primary);
  // Optional extra keys (rotation / multi-key orgs), comma-separated.
  for (const part of String(process.env.HUNAR_WEBHOOK_API_KEYS || '').split(',')) {
    const key = part.trim();
    if (key) keys.add(key);
  }
  // Legacy env — treat as an additional HMAC key if set.
  const legacy = getHunarWebhookSecret();
  if (legacy) keys.add(legacy);
  return [...keys];
}

/**
 * Official Hunar webhook signature:
 * message = `{X-Hunar-Timestamp}.` + rawBodyBytes
 * digest  = base64(HMAC-SHA256(api_key, message))
 * @see https://api.voice.hunar.ai/docs/external/#webhook_signature_validation
 */
export function computeHunarWebhookSignature(input: {
  apiKey: string;
  requestBody: Buffer;
  timestamp: string;
}): string {
  const message = Buffer.concat([
    Buffer.from(`${String(input.timestamp || '').trim()}.`, 'utf8'),
    input.requestBody,
  ]);
  return createHmac('sha256', input.apiKey).update(message).digest('base64');
}

export function verifyHunarWebhookSignature(input: {
  signatureHeader: string | null | undefined;
  timestampHeader: string | null | undefined;
  requestBody: Buffer;
  trustedApiKeys: string[];
  nowSeconds?: number;
  toleranceSeconds?: number;
}): { ok: boolean; reason?: string } {
  const signatureHeader = String(input.signatureHeader || '').trim();
  if (!signatureHeader) {
    return { ok: false, reason: 'Missing X-Hunar-Signature header' };
  }

  const timestamp = String(input.timestampHeader || '').trim();
  if (!timestamp || !/^\d+$/.test(timestamp)) {
    return { ok: false, reason: 'Missing or invalid X-Hunar-Timestamp header' };
  }

  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const skew = Math.abs(now - Number(timestamp));
  const tolerance = input.toleranceSeconds ?? WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS;
  if (skew > tolerance) {
    return { ok: false, reason: 'X-Hunar-Timestamp outside allowed window' };
  }

  const keys = input.trustedApiKeys.map((k) => String(k || '').trim()).filter(Boolean);
  if (!keys.length) {
    return { ok: false, reason: 'No trusted Hunar API keys configured' };
  }

  const signatures = signatureHeader
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const apiKey of keys) {
    const expected = computeHunarWebhookSignature({
      apiKey,
      requestBody: input.requestBody,
      timestamp,
    });
    for (const signature of signatures) {
      if (safeEqual(signature, expected)) return { ok: true };
    }
  }

  return { ok: false, reason: 'Invalid Hunar webhook signature' };
}

/**
 * Authenticity per Hunar Voice Agents docs:
 * - Callback URLs embed screeningId or campaignId.
 * - Verify X-Hunar-Signature (base64 HMAC-SHA256 of `{timestamp}.{rawBody}`)
 *   using HUNAR_VOICE_API_KEY (and optional HUNAR_WEBHOOK_API_KEYS).
 */
export function verifyHunarWebhookAuthenticity(input: {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer | string | null;
  screeningId?: string | null;
  /** Alias for screeningId or campaignId — either entity id satisfies the check. */
  entityId?: string | null;
  campaignId?: string | null;
}): { ok: boolean; reason?: string } {
  const entity =
    String(input.entityId || input.screeningId || input.campaignId || '').trim() || null;
  if (!entity) {
    return {
      ok: false,
      reason: 'screeningId or campaignId query parameter is required',
    };
  }

  const trustedKeys = getHunarWebhookTrustedApiKeys();
  const env = String(process.env.APP_ENV || process.env.NODE_ENV || '').toLowerCase();
  const failClosed = env === 'production' || env === 'staging';

  if (!trustedKeys.length) {
    if (failClosed) {
      return { ok: false, reason: 'HUNAR_VOICE_API_KEY not configured' };
    }
    // Local/test without a key — allow so unit fixtures still work.
    return { ok: true, reason: 'hunar_signature_optional_no_api_key' };
  }

  const rawBody = input.rawBody;
  if (rawBody == null) {
    return { ok: false, reason: 'Missing raw webhook body for signature verification' };
  }
  const bodyBuf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody), 'utf8');

  return verifyHunarWebhookSignature({
    signatureHeader: headerValue(input.headers, 'x-hunar-signature'),
    timestampHeader: headerValue(input.headers, 'x-hunar-timestamp'),
    requestBody: bodyBuf,
    trustedApiKeys: trustedKeys,
  });
}

/** Map provider status strings used by EJHunterLanding normalizeCallStatus. */
export function mapHunarCallStatus(status: string, answeredBy?: string): string {
  const normalized = String(status || '').trim().toUpperCase();
  const answered = String(answeredBy || '').trim().toLowerCase();
  if (answered.includes('machine') || answered.includes('voicemail')) return 'voicemail';
  switch (normalized) {
    case 'PENDING':
    case 'QUEUED':
    case 'SCHEDULED':
      return 'queued';
    case 'RINGING':
    case 'DIALING':
    case 'INITIATED':
      return 'ringing';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'COMPLETED':
      return 'completed';
    case 'NO_ANSWER':
    case 'UNANSWERED':
    case 'NOT_REACHABLE':
      return 'no_answer';
    case 'BUSY':
      return 'busy';
    case 'CANCELLED':
    case 'CANCELED':
      return 'cancelled';
    case 'FAILED':
      return 'failed';
    default:
      return normalized ? normalized.toLowerCase() : 'queued';
  }
}

export function providerEventId(kind: HunarWebhookKind, parsed: ParsedHunarWebhook): string {
  const parts = [
    kind,
    parsed.callId || 'unknown',
    parsed.eventType || 'event',
    parsed.status || '',
    parsed.endedAt || parsed.startedAt || '',
    parsed.recordingUrl ? 'rec' : '',
    parsed.summaryText ? 'sum' : '',
  ];
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 40);
}
