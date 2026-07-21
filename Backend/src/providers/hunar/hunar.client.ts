import { randomUUID } from 'node:crypto';

import {
  getHunarApiKey,
  getHunarVoiceLanguage,
  getHunarVoicePersona,
  getPublicApiBaseUrl,
  HUNAR_AGENTS_URL,
  HUNAR_BULK_CALLS_URL,
} from './hunar.config.js';

export type HunarAgentWritePayload = {
  name: string;
  voice_persona: string;
  objective: string;
  result_prompt: string;
  result_schema: Record<string, unknown>;
  language: string;
  persona_name: string | null;
  agent_prompt: string;
  introduction: string;
};

export type HunarCalleeRow = {
  callee_name: string;
  mobile_number: string;
  custom_data: Record<string, string>;
};

export type HunarBulkCallsPayload = {
  agent_id: string;
  data: HunarCalleeRow[];
  request_id: string;
  retry_config: { max_retry_count: number; retry_interval_hours: number };
  timezone: null;
  callback_config: {
    call_status_callback_url: string;
    call_recording_callback_url: string;
    call_result_callback_url: string;
    call_summary_callback_url: string;
  };
  remove_invalid_rows: true;
  remove_duplicate_phone_numbers: true;
  from_phone_number: null;
};

export type HunarRetryConfig = {
  maxRetryCount: number;
  retryIntervalHours: number;
};

function hunarHeaders(apiKey: string): Record<string, string> {
  // Validated write auth from EJHunterLanding hunarVoiceCallService.js
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-API-Key': apiKey,
  };
}

export function extractHunarAgentId(body: unknown): string {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
  const b = body as Record<string, unknown>;
  const data = b.data && typeof b.data === 'object' ? (b.data as Record<string, unknown>) : null;
  const agent = b.agent && typeof b.agent === 'object' ? (b.agent as Record<string, unknown>) : null;
  const result =
    b.result && typeof b.result === 'object' ? (b.result as Record<string, unknown>) : null;
  const candidates = [
    b.id,
    b.agent_id,
    b.agentId,
    b.uuid,
    data?.id,
    data?.agent_id,
    data?.uuid,
    agent?.id,
    result?.id,
    result?.agent_id,
  ];
  for (const value of candidates) {
    const id = String(value || '').trim();
    if (id) return id;
  }
  return '';
}

export function buildHunarAgentWritePayload(input: {
  name: string;
  agentPrompt: string;
  objective: string;
  introduction: string;
  resultPrompt: string;
  resultSchema: Record<string, unknown>;
  voicePersona?: string | null;
  language?: string | null;
  personaName?: string | null;
}): HunarAgentWritePayload {
  const stripEmptyVars = (value: string) => String(value || '').replace(/\{\}/g, '').trim();
  return {
    name: String(input.name || '').trim() || 'Screening Voice Agent',
    voice_persona: String(input.voicePersona || getHunarVoicePersona()).trim(),
    objective: stripEmptyVars(String(input.objective || '')),
    result_prompt: stripEmptyVars(String(input.resultPrompt || '')),
    result_schema:
      input.resultSchema && typeof input.resultSchema === 'object' ? input.resultSchema : {},
    language: String(input.language || getHunarVoiceLanguage()).trim(),
    persona_name:
      input.personaName == null ? null : String(input.personaName).trim() || null,
    agent_prompt: stripEmptyVars(String(input.agentPrompt || '')),
    introduction: stripEmptyVars(String(input.introduction || '')),
  };
}

export function buildHunarRetryConfig(raw?: HunarRetryConfig | null) {
  const maxRetryCount = Number(raw?.maxRetryCount ?? 0);
  const retryIntervalHours = Number(raw?.retryIntervalHours ?? 0);
  if (!Number.isFinite(maxRetryCount) || maxRetryCount <= 0) {
    return { max_retry_count: 0, retry_interval_hours: 0 };
  }
  return {
    max_retry_count: Math.min(10, Math.max(2, Math.floor(maxRetryCount))),
    retry_interval_hours: [3, 6, 9, 12, 24].includes(Math.floor(retryIntervalHours))
      ? Math.floor(retryIntervalHours)
      : 6,
  };
}

export function buildHunarCallbackUrls(
  entityId: string,
  entityParam: 'screeningId' | 'campaignId' = 'screeningId'
) {
  const base = getPublicApiBaseUrl();
  if (!base) {
    const err = new Error(
      'PUBLIC_API_BASE_URL is not configured. Set it so Hunar can deliver voice call callbacks.'
    );
    (err as Error & { code?: string }).code = 'HUNAR_CALLBACK_URL_MISSING';
    throw err;
  }
  const q = encodeURIComponent(String(entityId || '').trim());
  // Spec path + legacy alias both served by the same router.
  const path = (suffix: string) =>
    `${base}/api/integrations/voice/hunar/${suffix}?${entityParam}=${q}`;
  return {
    call_status_callback_url: path('call-status'),
    call_recording_callback_url: path('call-recording'),
    call_result_callback_url: path('call-result'),
    call_summary_callback_url: path('call-summary'),
  };
}

async function requestHunarJson(
  method: string,
  url: string,
  payload?: unknown
): Promise<unknown> {
  const apiKey = getHunarApiKey();
  if (!apiKey) {
    const err = new Error('Hunar voice API key is not configured on the server.');
    (err as Error & { code?: string; statusCode?: number }).code = 'HUNAR_API_KEY_MISSING';
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }

  const res = await fetch(url, {
    method,
    headers: hunarHeaders(apiKey),
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (typeof (body as { message?: string })?.message === 'string' &&
        (body as { message: string }).message) ||
      (typeof (body as { error?: string })?.error === 'string' &&
        (body as { error: string }).error) ||
      `Hunar voice API failed (${res.status})`;
    const err = new Error(message);
    (err as Error & { code?: string; statusCode?: number; details?: unknown }).code =
      'HUNAR_API_ERROR';
    (err as Error & { statusCode?: number }).statusCode =
      res.status >= 400 && res.status < 600 ? res.status : 502;
    (err as Error & { details?: unknown }).details = body;
    throw err;
  }
  return body;
}

export async function createHunarVoiceAgent(input: {
  name: string;
  agentPrompt: string;
  objective: string;
  introduction: string;
  resultPrompt: string;
  resultSchema: Record<string, unknown>;
  voicePersona?: string | null;
  language?: string | null;
  personaName?: string | null;
}) {
  const payload = buildHunarAgentWritePayload(input);
  const body = await requestHunarJson('POST', HUNAR_AGENTS_URL, payload);
  const agentId = extractHunarAgentId(body);
  if (!agentId) {
    const err = new Error('Hunar voice agent API did not return an agent id.');
    (err as Error & { code?: string; statusCode?: number }).code = 'HUNAR_AGENT_ID_MISSING';
    (err as Error & { statusCode?: number }).statusCode = 502;
    throw err;
  }
  return { agentId, response: body };
}

export async function updateHunarVoiceAgent(
  agentId: string,
  input: Parameters<typeof createHunarVoiceAgent>[0]
) {
  const id = String(agentId || '').trim();
  if (!id) {
    const err = new Error('Hunar voice agent id is required to update the agent.');
    (err as Error & { code?: string; statusCode?: number }).code = 'HUNAR_AGENT_ID_REQUIRED';
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }
  const payload = buildHunarAgentWritePayload(input);
  const url = `${HUNAR_AGENTS_URL}${encodeURIComponent(id)}/`;
  const body = await requestHunarJson('PUT', url, payload);
  return { agentId: extractHunarAgentId(body) || id, response: body };
}

export async function createHunarBulkCalls(input: {
  agentId: string;
  screeningId?: string;
  campaignId?: string;
  callees: HunarCalleeRow[];
  requestId?: string;
  retryConfig?: HunarRetryConfig | null;
}) {
  const agentId = String(input.agentId || '').trim();
  if (!agentId) {
    const err = new Error('Hunar voice agent id is required before launching calls.');
    (err as Error & { code?: string; statusCode?: number }).code = 'HUNAR_AGENT_ID_REQUIRED';
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }
  if (!input.callees.length) {
    const err = new Error('No candidates have a valid phone number for AI voice calls.');
    (err as Error & { code?: string; statusCode?: number }).code = 'VOICE_NO_VALID_PHONES';
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }

  const entityId = String(input.screeningId || input.campaignId || '').trim();
  if (!entityId) {
    const err = new Error('screeningId or campaignId is required for Hunar callbacks.');
    (err as Error & { code?: string; statusCode?: number }).code = 'HUNAR_ENTITY_ID_REQUIRED';
    (err as Error & { statusCode?: number }).statusCode = 400;
    throw err;
  }

  const requestId = input.requestId || `${entityId}-${randomUUID()}`;
  const callbackParam = input.campaignId && !input.screeningId ? 'campaignId' : 'screeningId';
  const payload: HunarBulkCallsPayload = {
    agent_id: agentId,
    data: input.callees,
    request_id: requestId,
    retry_config: buildHunarRetryConfig(input.retryConfig),
    timezone: null,
    callback_config: buildHunarCallbackUrls(entityId, callbackParam),
    remove_invalid_rows: true,
    remove_duplicate_phone_numbers: true,
    from_phone_number: null,
  };

  const body = await requestHunarJson('POST', HUNAR_BULK_CALLS_URL, payload);
  return {
    requestId,
    dialedCount: input.callees.length,
    response: body,
  };
}

/** Injectable fetch for tests */
export const hunarClient = {
  createHunarVoiceAgent,
  updateHunarVoiceAgent,
  createHunarBulkCalls,
  buildHunarCallbackUrls,
  buildHunarAgentWritePayload,
  extractHunarAgentId,
};
