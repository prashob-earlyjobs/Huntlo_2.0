import { getLogger } from '../../config/logger.js';
import {
  buildZyastraRecordingApiUrl,
  buildZyastraRecordingProxyUrl,
  buildZyastraWebhookUrl,
  getZyastraApiKey,
  getZyastraApiSecret,
  getZyastraWebhookSecret,
  isZyastraConfigured,
  ZYASTRA_API_BASE_URL,
  ZYASTRA_TRIGGER_URL,
} from './zyastra.config.js';

const log = () => getLogger().child({ component: 'zyastra-client' });

export type ZyastraTriggerCandidate = {
  phoneNumber: string;
  firstName: string;
  lastName?: string;
  email?: string;
};

export type ZyastraTriggerInput = {
  candidate: ZyastraTriggerCandidate;
  agent: {
    prompt: string;
    firstMessage?: string;
    preferredLanguage?: string;
    customAgentId?: string;
  };
  voiceConfiguration?: {
    engine?: 'regional-std' | 'global-std';
    speed?: number;
  };
  analysisVariables?: string[];
  metadata?: Record<string, string>;
  dynamicParams?: {
    maxDurationSeconds?: number;
    silenceTimeoutSeconds?: number;
  };
};

export type ZyastraTriggerResult = {
  requestId: string;
  callId: string;
  callReferenceId: string;
  status: string;
  response: unknown;
};

export type ZyastraRecordingFetchResult =
  | {
      ok: true;
      kind: 'redirect';
      url: string;
      statusCode: number;
    }
  | {
      ok: true;
      kind: 'json-url';
      url: string;
      statusCode: number;
    }
  | {
      ok: true;
      kind: 'binary';
      contentType: string;
      body: Buffer;
      statusCode: number;
    }
  | {
      ok: false;
      statusCode: number;
      message: string;
      details?: unknown;
    };

function zyastraAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Accept: 'application/json, audio/*, */*',
    'x-api-key': getZyastraApiKey(),
    'x-api-secret': getZyastraApiSecret(),
    ...extra,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

/** Redact secrets before logging the trigger payload. */
function sanitizePayloadForLog(payload: Record<string, unknown>): Record<string, unknown> {
  const webhook = asRecord(payload.webhook);
  const agent = asRecord(payload.agent);
  const prompt = asString(agent.prompt);
  return {
    ...payload,
    agent: {
      ...agent,
      prompt:
        prompt.length > 400
          ? `${prompt.slice(0, 400)}…[truncated ${prompt.length} chars]`
          : prompt,
    },
    webhook: {
      ...webhook,
      ...(webhook.secret ? { secret: '[redacted]' } : {}),
    },
  };
}

function extractUrlFromRecordingJson(body: unknown): string {
  const root = asRecord(body);
  const data = asRecord(root.data);
  return (
    asString(data.url) ||
    asString(data.recordingUrl) ||
    asString(data.recording_url) ||
    asString(root.url) ||
    asString(root.recordingUrl) ||
    asString(root.recording_url)
  );
}

function normalizeUrlPath(url: string): string {
  return asString(url).split('?')[0]?.replace(/\/$/, '') || '';
}

function isZyastraAuthRecordingUrl(url: string, callId: string): boolean {
  const candidate = normalizeUrlPath(url);
  if (!candidate || !callId) return false;
  return candidate === normalizeUrlPath(buildZyastraRecordingApiUrl(callId));
}

/**
 * Authenticated recording retrieval:
 * GET /api/v1/external/voice/recording/{callId}
 * with x-api-key + x-api-secret.
 */
export async function fetchZyastraRecording(
  callId: string
): Promise<ZyastraRecordingFetchResult> {
  const id = String(callId || '').trim();
  if (!id) {
    return { ok: false, statusCode: 400, message: 'callId is required' };
  }
  if (!isZyastraConfigured()) {
    return {
      ok: false,
      statusCode: 503,
      message: 'Zyastra voice API is not configured.',
    };
  }

  const url = buildZyastraRecordingApiUrl(id);
  log().info({ callId: id, url }, 'Zyastra recording API request');

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: zyastraAuthHeaders(),
      redirect: 'manual',
    });

    if (res.status >= 300 && res.status < 400) {
      const location = asString(res.headers.get('location'));
      if (location) {
        const absolute = location.startsWith('http')
          ? location
          : new URL(location, ZYASTRA_TRIGGER_URL).toString();
        return { ok: true, kind: 'redirect', url: absolute, statusCode: res.status };
      }
    }

    const contentType = asString(res.headers.get('content-type')).toLowerCase();
    if (!res.ok) {
      const details = contentType.includes('json')
        ? await res.json().catch(() => ({}))
        : await res.text().catch(() => '');
      const message =
        asString(asRecord(details).message) ||
        asString(asRecord(details).error) ||
        `Zyastra recording API failed (${res.status})`;
      log().warn(
        { callId: id, statusCode: res.status, details },
        'Zyastra recording API failed'
      );
      return { ok: false, statusCode: res.status, message, details };
    }

    if (contentType.includes('application/json')) {
      const json = await res.json().catch(() => ({}));
      const found = extractUrlFromRecordingJson(json);
      if (found) {
        return { ok: true, kind: 'json-url', url: found, statusCode: res.status };
      }
      return {
        ok: false,
        statusCode: res.status,
        message: 'Zyastra recording JSON response did not include a URL',
        details: json,
      };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      ok: true,
      kind: 'binary',
      contentType: contentType || 'audio/mpeg',
      body: buffer,
      statusCode: res.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Zyastra recording fetch failed';
    log().error({ callId: id, err: error }, 'Zyastra recording API error');
    return { ok: false, statusCode: 502, message };
  }
}

/**
 * Prefer a playable URL for storage:
 * 1) redirect / JSON signed URL from authenticated GET
 * 2) Huntlo proxy URL when a recording exists (binary or auth-gated API path)
 * 3) webhook-provided public recordingUrl fallback
 *
 * Returns empty string when Zyastra has no recording — do not invent a proxy URL
 * or the conversation player will show a broken control.
 */
export async function resolveZyastraRecordingUrl(input: {
  callId: string;
  webhookRecordingUrl?: string | null;
}): Promise<string> {
  const callId = String(input.callId || '').trim();
  const fallback = String(input.webhookRecordingUrl || '').trim();
  const proxyUrl = callId ? buildZyastraRecordingProxyUrl(callId) : '';
  const authGatedFallback = Boolean(fallback && isZyastraAuthRecordingUrl(fallback, callId));

  if (!callId) return fallback;

  if (!isZyastraConfigured()) {
    if (authGatedFallback) return proxyUrl || '';
    return fallback || '';
  }

  const fetched = await fetchZyastraRecording(callId);
  if (fetched.ok && (fetched.kind === 'redirect' || fetched.kind === 'json-url')) {
    if (isZyastraAuthRecordingUrl(fetched.url, callId)) {
      return proxyUrl || '';
    }
    return fetched.url;
  }

  // Binary body means a recording exists; browsers must use our credentialed proxy.
  if (fetched.ok && fetched.kind === 'binary') {
    return proxyUrl || '';
  }

  // Auth-gated webhook URL and a known callId → proxy (recording may still exist).
  if (authGatedFallback && proxyUrl) {
    return proxyUrl;
  }

  // Public webhook URL (not our API path).
  if (fallback && !authGatedFallback) {
    return fallback;
  }

  return '';
}

/**
 * Direct Zyastra trigger (unused by Huntlo launch). Outreach and screening
 * dials go through `sendZyastraCallViaGateway` (`vendor: zyvkay`).
 * Kept for recording/call-detail helpers that still talk to Zyastra APIs.
 */
export async function triggerZyastraVoiceCall(
  input: ZyastraTriggerInput
): Promise<ZyastraTriggerResult> {
  if (!isZyastraConfigured()) {
    const err = new Error(
      'Zyastra voice API is not configured. Set ZYASTRA_API_KEY and ZYASTRA_API_SECRET.'
    );
    (err as Error & { code?: string; statusCode?: number }).code = 'ZYASTRA_API_KEY_MISSING';
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }

  const webhookSecret = getZyastraWebhookSecret();
  const payload: Record<string, unknown> = {
    candidate: {
      phoneNumber: input.candidate.phoneNumber,
      firstName: input.candidate.firstName,
      ...(input.candidate.lastName ? { lastName: input.candidate.lastName } : {}),
      ...(input.candidate.email ? { email: input.candidate.email } : {}),
    },
    agent: {
      prompt: input.agent.prompt,
      ...(input.agent.firstMessage ? { firstMessage: input.agent.firstMessage } : {}),
      preferredLanguage: input.agent.preferredLanguage || 'en-US',
      ...(input.agent.customAgentId ? { customAgentId: input.agent.customAgentId } : {}),
    },
    voiceConfiguration: {
      engine: input.voiceConfiguration?.engine || 'global-std',
      speed: input.voiceConfiguration?.speed ?? 1.0,
    },
    webhook: {
      url: buildZyastraWebhookUrl(),
      ...(webhookSecret ? { secret: webhookSecret } : {}),
    },
    ...(input.analysisVariables?.length
      ? { analysisVariables: input.analysisVariables }
      : {}),
    ...(input.metadata && Object.keys(input.metadata).length
      ? { metadata: input.metadata }
      : {}),
    ...(input.dynamicParams
      ? {
          dynamicParams: {
            maxDurationSeconds: input.dynamicParams.maxDurationSeconds ?? 600,
            silenceTimeoutSeconds: input.dynamicParams.silenceTimeoutSeconds ?? 15,
          },
        }
      : {}),
  };

  log().info(
    {
      url: ZYASTRA_TRIGGER_URL,
      phoneNumber: input.candidate.phoneNumber,
      metadata: input.metadata || {},
      payload: sanitizePayloadForLog(payload),
    },
    'Zyastra trigger API request'
  );

  const res = await fetch(ZYASTRA_TRIGGER_URL, {
    method: 'POST',
    headers: {
      ...zyastraAuthHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      asString(asRecord(body).message) ||
      asString(asRecord(body).error) ||
      `Zyastra voice API failed (${res.status})`;
    log().error(
      {
        statusCode: res.status,
        phoneNumber: input.candidate.phoneNumber,
        response: body,
        message,
      },
      'Zyastra trigger API failed'
    );
    const err = new Error(message);
    (err as Error & { code?: string; statusCode?: number; details?: unknown }).code =
      'ZYASTRA_API_ERROR';
    (err as Error & { statusCode?: number }).statusCode = res.status >= 400 ? res.status : 502;
    (err as Error & { details?: unknown }).details = body;
    throw err;
  }

  const root = asRecord(body);
  const data = asRecord(root.data);
  const requestId = asString(data.requestId) || asString(root.requestId);
  const callId = asString(data.callId) || asString(root.callId);
  const callReferenceId = asString(data.callReferenceId);
  const status = asString(data.status) || 'queued';

  if (!callId && !requestId) {
    log().error({ response: body }, 'Zyastra trigger API missing call id');
    const err = new Error('Zyastra voice API did not return a call id.');
    (err as Error & { code?: string; statusCode?: number }).code = 'ZYASTRA_CALL_ID_MISSING';
    (err as Error & { statusCode?: number }).statusCode = 502;
    throw err;
  }

  log().info(
    {
      phoneNumber: input.candidate.phoneNumber,
      requestId: requestId || callId,
      callId: callId || requestId,
      callReferenceId,
      status,
      response: body,
    },
    'Zyastra trigger API response'
  );

  return {
    requestId: requestId || callId,
    callId: callId || requestId,
    callReferenceId,
    status,
    response: body,
  };
}

export const zyastraClient = {
  triggerZyastraVoiceCall,
  fetchZyastraCall,
  fetchZyastraRecordingUrl,
  fetchZyastraRecording,
  resolveZyastraRecordingUrl,
  isZyastraConfigured,
};

export type ZyastraCallDetails = {
  callId: string;
  callReferenceId: string;
  status: string;
  durationSeconds: number | null;
  transcript: string | null;
  recordingUrl: string;
  summary: string;
  variables: Record<string, unknown>;
  raw: unknown;
};

/** GET /voice/call/:callId — post-call details (recording may arrive later than webhook). */
export async function fetchZyastraCall(callId: string): Promise<ZyastraCallDetails | null> {
  const id = String(callId || '').trim();
  if (!id || !isZyastraConfigured()) return null;

  const res = await fetch(`${ZYASTRA_API_BASE_URL}/voice/call/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: zyastraAuthHeaders(),
  });
  if (!res.ok) {
    log().warn(
      { callId: id, statusCode: res.status },
      'Zyastra call details fetch failed'
    );
    return null;
  }
  const body = await res.json().catch(() => ({}));
  const root = asRecord(body);
  const data = asRecord(root.data);
  const recording =
    asString(data.recordingUrl) ||
    asString(data.recording_url) ||
    asString(asRecord(data.recording).url);
  return {
    callId: asString(data.callId) || id,
    callReferenceId: asString(data.callReferenceId),
    status: asString(data.status),
    durationSeconds: asNumber(data.durationSeconds) ?? asNumber(data.duration_seconds),
    transcript:
      typeof data.transcript === 'string' && data.transcript.trim()
        ? data.transcript.trim()
        : null,
    recordingUrl: recording,
    summary: asString(data.summary),
    variables: {
      ...asRecord(data.variables),
      ...asRecord(data.analysisVariables),
      ...asRecord(data.extractedVariables),
    },
    raw: body,
  };
}

/** GET /voice/recording/:callId — returns null when provider has no recording yet. */
export async function fetchZyastraRecordingUrl(callId: string): Promise<string | null> {
  const id = String(callId || '').trim();
  if (!id || !isZyastraConfigured()) return null;

  const res = await fetch(`${ZYASTRA_API_BASE_URL}/voice/recording/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: zyastraAuthHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    log().warn(
      { callId: id, statusCode: res.status },
      'Zyastra recording fetch failed'
    );
    return null;
  }
  const body = await res.json().catch(() => ({}));
  const root = asRecord(body);
  const data = asRecord(root.data);
  return (
    asString(data.recordingUrl) ||
    asString(data.recording_url) ||
    asString(data.url) ||
    asString(root.recordingUrl) ||
    asString(root.url) ||
    null
  );
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
