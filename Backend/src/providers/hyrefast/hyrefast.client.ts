import { getLogger } from '../../config/logger.js';
import { getHyrefastApiKey, hyrefastUrl, isHyrefastConfigured } from './hyrefast.config.js';

const log = () => getLogger().child({ component: 'hyrefast-client' });

export type HyrefastJobType = 'full_time' | 'part_time' | 'contract' | 'internship';

export type HyrefastCreateJobInput = {
  title: string;
  description?: string;
  skills?: string[];
  experience_range?: { min_years?: number; max_years?: number };
  location?: string;
  job_type?: HyrefastJobType;
  interview_config?: {
    conversational?: boolean;
    duration_minutes?: number;
    follow_up_questions?: boolean;
    proctoring_enabled?: boolean;
    gaze_tracking?: boolean;
  };
};

export type HyrefastCreateApplicationInput = {
  jobId: string;
  candidateEmail: string;
  candidateName?: string;
  candidatePhone?: string;
  resume?: string;
  sendInterviewLink?: boolean;
};

export type HyrefastJob = {
  id: string;
  title?: string;
  status?: string;
  created_at?: string;
};

export type HyrefastApplication = {
  id: string | null;
  jobId?: string;
  status?: string;
  created_at?: string;
};

export type HyrefastApplicationResult = {
  application: HyrefastApplication;
  trace: HyrefastRequestTrace;
};

export type HyrefastSendInterviewResult = {
  trace: HyrefastRequestTrace;
  data: unknown;
};

export type HyrefastInterviewLinkResult = {
  trace: HyrefastRequestTrace;
  data: unknown;
  link: string;
};

export type HyrefastRequestTrace = {
  method: string;
  url: string;
  requestBody: Record<string, unknown>;
  httpStatus: number;
  responseBody: unknown;
};

export type HyrefastJobResult = {
  job: HyrefastJob;
  trace: HyrefastRequestTrace;
};

type Envelope = {
  status?: string;
  message?: string;
  data?: unknown;
};

function headers(apiKey: string): Record<string, string> {
  return {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function redactHyrefastPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  const row = { ...(payload as Record<string, unknown>) };
  if ('candidateEmail' in row && typeof row.candidateEmail === 'string') {
    row.candidateEmail = '[REDACTED]';
  }
  if ('candidatePhone' in row && typeof row.candidatePhone === 'string') {
    row.candidatePhone = '[REDACTED]';
  }
  if ('resume' in row && row.resume) {
    row.resume = '[REDACTED]';
  }
  return row;
}

function extractId(data: unknown, keys: string[], depth = 0): string {
  if (depth > 6 || data == null) return '';
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = extractId(item, keys, depth + 1);
      if (found) return found;
    }
    return '';
  }
  if (typeof data !== 'object') return '';
  const row = data as Record<string, unknown>;
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(row)) {
    if (!wanted.has(key.toLowerCase())) continue;
    if (value && typeof value === 'object') continue;
    const text = String(value ?? '').trim();
    if (text && text !== '[object Object]') return text;
  }
  for (const value of Object.values(row)) {
    const found = extractId(value, keys, depth + 1);
    if (found) return found;
  }
  return '';
}

function extractString(data: unknown, keys: string[], depth = 0): string {
  if (depth > 6 || data == null) return '';
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = extractString(item, keys, depth + 1);
      if (found) return found;
    }
    return '';
  }
  if (typeof data !== 'object') return '';
  const row = data as Record<string, unknown>;
  const wanted = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(row)) {
    if (wanted.has(key.toLowerCase()) && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  for (const value of Object.values(row)) {
    if (!value || typeof value !== 'object') continue;
    const found = extractString(value, keys, depth + 1);
    if (found) return found;
  }
  return '';
}

export function toHyrefastJobPayload(input: HyrefastCreateJobInput): Record<string, unknown> {
  const minYears = Number(input.experience_range?.min_years);
  const maxYears = Number(input.experience_range?.max_years);
  return {
    title: String(input.title || '').trim(),
    description: String(input.description || '').trim(),
    skills: (input.skills || []).map((skill) => String(skill).trim()).filter(Boolean),
    experience_range: {
      min_years: Number.isFinite(minYears) ? minYears : 0,
      max_years: Number.isFinite(maxYears)
        ? maxYears
        : Number.isFinite(minYears)
          ? minYears
          : 0,
    },
    location: String(input.location || '').trim(),
    job_type: input.job_type || 'full_time',
    interview_config: {
      conversational: input.interview_config?.conversational ?? true,
      duration_minutes: input.interview_config?.duration_minutes ?? 30,
    },
  };
}

async function requestHyrefastJson(
  method: string,
  path: string,
  payload?: unknown
): Promise<{ data: unknown; trace: HyrefastRequestTrace }> {
  const apiKey = getHyrefastApiKey();
  if (!apiKey) {
    const err = new Error('Hyrefast API key is not configured. Set HYREFAST_API_KEY.');
    (err as Error & { code?: string; statusCode?: number }).code = 'HYREFAST_API_KEY_MISSING';
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }

  const url = hyrefastUrl(path);
  const requestBody =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  let lastError: Error | null = null;

  log().info(
    {
      method,
      url,
      payload: redactHyrefastPayload(payload),
    },
    'Hyrefast request'
  );

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(url, {
      method,
      headers: headers(apiKey),
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as Envelope;
    const trace: HyrefastRequestTrace = {
      method,
      url,
      requestBody,
      httpStatus: res.status,
      responseBody: body,
    };

    log().info(
      {
        method,
        url,
        httpStatus: res.status,
        hyrefastStatus: body.status,
        message: body.message,
        data: body.data ?? null,
      },
      'Hyrefast response'
    );

    if (res.status === 429) {
      const reset = Number(res.headers.get('RateLimit-Reset') || '2');
      const waitSeconds = Math.min(Math.max(Number.isFinite(reset) ? reset : 2, 1), 60);
      const wait = Math.min(waitSeconds, 2 ** attempt);
      log().warn({ attempt: attempt + 1, wait }, 'Hyrefast rate limited — retrying');
      await sleep(wait * 1000);
      lastError = new Error(body.message || 'Hyrefast rate limit exceeded');
      (lastError as Error & { trace?: HyrefastRequestTrace }).trace = trace;
      continue;
    }

    const status = String(body.status || '').toUpperCase();
    if (res.ok && (status === 'SUCCESS' || status === '')) {
      return { data: 'data' in body ? body.data : body, trace };
    }

    const message =
      (typeof body.message === 'string' && body.message.trim()) ||
      `Hyrefast API failed (${res.status})`;
    const err = new Error(message) as Error & {
      code?: string;
      statusCode?: number;
      details?: unknown;
      trace?: HyrefastRequestTrace;
    };
    err.code =
      status === 'UNAUTHORIZED'
        ? 'HYREFAST_UNAUTHORIZED'
        : status === 'RECORD_NOT_FOUND'
          ? 'HYREFAST_NOT_FOUND'
          : status === 'VALIDATION_ERROR'
            ? 'HYREFAST_VALIDATION_ERROR'
            : 'HYREFAST_API_ERROR';
    err.statusCode = status === 'UNAUTHORIZED' ? 401 : res.status === 422 ? 422 : 502;
    err.details = body;
    err.trace = trace;
    throw err;
  }

  const err = lastError || new Error('Hyrefast rate limit exceeded');
  (err as Error & { code?: string; statusCode?: number }).code = 'HYREFAST_RATE_LIMITED';
  (err as Error & { statusCode?: number }).statusCode = 429;
  throw err;
}

export async function createHyrefastJob(input: HyrefastCreateJobInput): Promise<HyrefastJobResult> {
  const payload = toHyrefastJobPayload(input);
  const { data, trace } = await requestHyrefastJson('POST', '/jobs', payload);
  const id = extractId(data, ['id', 'jobId', 'job_id', '_id']);
  if (!id) {
    const err = new Error('Hyrefast did not return a job id.') as Error & {
      code?: string;
      statusCode?: number;
      trace?: HyrefastRequestTrace;
    };
    err.code = 'HYREFAST_JOB_ID_MISSING';
    err.statusCode = 502;
    err.trace = trace;
    throw err;
  }
  const row = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  return {
    job: {
      id,
      title: row.title ? String(row.title) : input.title,
      status: row.status ? String(row.status) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    },
    trace,
  };
}

export async function createHyrefastApplication(
  input: HyrefastCreateApplicationInput
): Promise<HyrefastApplicationResult> {
  const { data, trace } = await requestHyrefastJson('POST', '/applications', input);
  const envelope =
    trace.responseBody && typeof trace.responseBody === 'object'
      ? (trace.responseBody as Envelope)
      : {};
  const id =
    extractId(data, ['id', 'applicationId', 'application_id', '_id']) ||
    extractId(trace.responseBody, ['id', 'applicationId', 'application_id', '_id']);
  const envelopeStatus = String(envelope.status || '').toUpperCase();
  const inviteSucceededWithoutId =
    !id &&
    trace.httpStatus >= 200 &&
    trace.httpStatus < 300 &&
    envelopeStatus === 'SUCCESS';

  // Staging sometimes returns SUCCESS with data:null after emailing the link.
  if (!id && !inviteSucceededWithoutId) {
    const err = new Error('Hyrefast did not return an application id.') as Error & {
      code?: string;
      statusCode?: number;
      trace?: HyrefastRequestTrace;
    };
    err.code = 'HYREFAST_APPLICATION_ID_MISSING';
    err.statusCode = 502;
    err.trace = trace;
    throw err;
  }

  const row = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const sent =
    input.sendInterviewLink !== false &&
    /interview link sent|invitation sent/i.test(String(envelope.message || ''));
  return {
    application: {
      id: id || null,
      jobId: row.jobId ? String(row.jobId) : input.jobId,
      status: row.status ? String(row.status) : sent ? 'sent' : 'created',
      created_at: row.created_at ? String(row.created_at) : undefined,
    },
    trace,
  };
}

export async function sendHyrefastInterview(
  applicationId: string
): Promise<HyrefastSendInterviewResult> {
  const { data, trace } = await requestHyrefastJson(
    'POST',
    `/applications/${encodeURIComponent(applicationId)}/send-interview`
  );
  return { data, trace };
}

export async function getHyrefastInterviewLink(
  applicationId: string
): Promise<HyrefastInterviewLinkResult> {
  const { data, trace } = await requestHyrefastJson(
    'POST',
    `/applications/${encodeURIComponent(applicationId)}/interview-link`
  );
  const link = extractString(data, [
    'link',
    'url',
    'interviewLink',
    'interview_link',
    'candidateLink',
    'candidate_link',
  ]);
  if (!link) {
    const err = new Error('Hyrefast did not return an interview link.') as Error & {
      code?: string;
      statusCode?: number;
      trace?: HyrefastRequestTrace;
    };
    err.code = 'HYREFAST_INTERVIEW_LINK_MISSING';
    err.statusCode = 502;
    err.trace = trace;
    throw err;
  }
  return { data, trace, link };
}

export { isHyrefastConfigured };
