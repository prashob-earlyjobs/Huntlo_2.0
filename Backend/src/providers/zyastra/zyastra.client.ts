import {
  buildZyastraWebhookUrl,
  getZyastraApiKey,
  getZyastraApiSecret,
  getZyastraWebhookSecret,
  isZyastraConfigured,
  ZYASTRA_TRIGGER_URL,
} from './zyastra.config.js';

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

function zyastraHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': getZyastraApiKey(),
    'x-api-secret': getZyastraApiSecret(),
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

/**
 * Trigger one AI voice call via Zyastra (non-bulk).
 * Used for non-Indian E.164 numbers.
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

  const res = await fetch(ZYASTRA_TRIGGER_URL, {
    method: 'POST',
    headers: zyastraHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      asString(asRecord(body).message) ||
      asString(asRecord(body).error) ||
      `Zyastra voice API failed (${res.status})`;
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
    const err = new Error('Zyastra voice API did not return a call id.');
    (err as Error & { code?: string; statusCode?: number }).code = 'ZYASTRA_CALL_ID_MISSING';
    (err as Error & { statusCode?: number }).statusCode = 502;
    throw err;
  }

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
  isZyastraConfigured,
};
