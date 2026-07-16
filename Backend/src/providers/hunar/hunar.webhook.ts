import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

import { getHunarWebhookSecret } from './hunar.config.js';

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

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Authenticity per Huntlo Hunar integration:
 * - Callback URLs embed screeningId (validated flow from EJHunterLanding).
 * - When HUNAR_WEBHOOK_SECRET is set, require a matching shared secret
 *   (ARCHITECTURE "Webhook secret") via Authorization Bearer or x-webhook-secret.
 *   HMAC of the raw body is also accepted on x-hunar-signature / x-webhook-signature.
 */
export function verifyHunarWebhookAuthenticity(input: {
  headers: Record<string, string | string[] | undefined>;
  rawBody?: Buffer | string | null;
  screeningId: string | null;
}): { ok: boolean; reason?: string } {
  if (!input.screeningId?.trim()) {
    return { ok: false, reason: 'screeningId query parameter is required' };
  }

  const secret = getHunarWebhookSecret();
  if (!secret) {
    // Platform secret optional in local/dev; screeningId binding still required.
    return { ok: true };
  }

  const header = (name: string) => {
    const value = input.headers[name] ?? input.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const bearer = asString(header('authorization')).replace(/^Bearer\s+/i, '');
  const shared = asString(header('x-webhook-secret') || header('x-hunar-webhook-secret'));
  if (bearer && safeEqual(bearer, secret)) return { ok: true };
  if (shared && safeEqual(shared, secret)) return { ok: true };

  const signature = asString(
    header('x-hunar-signature') || header('x-webhook-signature')
  );
  if (signature && input.rawBody) {
    const raw =
      typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString('utf8');
    const expected = createHmac('sha256', secret).update(raw).digest('hex');
    if (safeEqual(signature.replace(/^sha256=/i, ''), expected)) return { ok: true };
  }

  return { ok: false, reason: 'Invalid Hunar webhook secret or signature' };
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
