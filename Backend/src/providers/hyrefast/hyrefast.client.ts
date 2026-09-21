import { getHyrefastApiKey, getHyrefastBaseUrl } from './hyrefast.config.js';

export type HyrefastEnvelope<T> = {
  status: string;
  message?: string;
  data: T | null;
};

export type HyrefastSkillItem = {
  skill_name: string;
  proficiency?: string;
};

export type HyrefastTopicItem = {
  name: string;
  reason?: string;
  discussionMinutes?: number;
  sampleQuestions?: string[];
};

function hyrefastHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-API-Key': apiKey,
  };
}

function requireApiKey(): string {
  const apiKey = getHyrefastApiKey();
  if (!apiKey) {
    throw new Error('HYREFAST_API_KEY is not configured.');
  }
  return apiKey;
}

async function hyrefastRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const apiKey = requireApiKey();
  const url = `${getHyrefastBaseUrl()}${path}`;
  const res = await fetch(url, {
    method,
    headers: hyrefastHeaders(apiKey),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let envelope: HyrefastEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as HyrefastEnvelope<T>;
  } catch {
    envelope = null;
  }

  const status = String(envelope?.status || '').toUpperCase();
  if (!res.ok || (status && status !== 'SUCCESS')) {
    const message = formatHyrefastError(
      envelope?.message,
      envelope?.data,
      method,
      url,
      res.status,
      status
    );
    throw new Error(message);
  }

  return (envelope?.data ?? null) as T;
}

function formatHyrefastError(
  message: string | undefined,
  data: unknown,
  method: string,
  url: string,
  httpStatus: number,
  status: string
): string {
  if (httpStatus === 429) {
    return 'Rate limit reached (too many requests). Wait a minute and try launching again.';
  }

  const base =
    message ||
    `Hyrefast ${method} ${url} failed (${httpStatus}${status ? ` / ${status}` : ''}).`;

  if (!data || typeof data !== 'object' || Array.isArray(data)) return base;
  const row = data as Record<string, unknown>;
  const violations = Array.isArray(row.violations) ? row.violations : [];
  const reasons = violations
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return '';
      return String((item as { reason?: string }).reason || '').trim();
    })
    .filter(Boolean);

  if (reasons.length === 0) return base;
  // Prefer actionable violation reasons (e.g. parallel consideration) over the
  // generic "requires acknowledgement" wrapper.
  if (/acknowledgement/i.test(base) || /policy warning/i.test(base)) {
    return reasons.join(' ');
  }
  return `${base} ${reasons.join(' ')}`;
}

function extractId(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return '';
  const row = data as Record<string, unknown>;
  return String(
    row._id || row.id || row.applicationId || row.jobId || ''
  ).trim();
}

export async function createHyrefastJob(input: {
  title: string;
  location?: string;
}): Promise<{ id: string; raw: unknown }> {
  const data = await hyrefastRequest<Record<string, unknown>>(
    'POST',
    '/external/api/v1/jobs/create',
    {
      title: input.title,
      ...(input.location ? { location: input.location } : {}),
    }
  );
  const id = extractId(data);
  if (!id) throw new Error('Hyrefast create job did not return an id.');
  return { id, raw: data };
}

export async function setHyrefastJobSkills(
  jobId: string,
  input: {
    mustHave: HyrefastSkillItem[];
    goodToHave?: HyrefastSkillItem[];
    bonus?: HyrefastSkillItem[];
  }
): Promise<void> {
  await hyrefastRequest('PUT', `/external/api/v1/jobs/${jobId}/skills`, {
    must_have_skills: input.mustHave,
    good_to_have_skills: input.goodToHave || [],
    bonus_skills: input.bonus || [],
  });
}

export type HyrefastQuestionItem = {
  title: string;
  topic_name?: string;
  question_proficiency?: string;
  question_type?: string;
  order?: number;
  key_aspects_to_be_covered?: string[];
  skills_covered?: string[];
};

export async function setHyrefastJobQuestions(
  jobId: string,
  questions: HyrefastQuestionItem[]
): Promise<void> {
  await hyrefastRequest('PUT', `/external/api/v1/jobs/${jobId}/questions`, {
    questions,
  });
}

export async function setHyrefastJobTopics(
  jobId: string,
  input: {
    topicsToFocus: HyrefastTopicItem[];
    topicsToAvoid?: string[];
  }
): Promise<void> {
  await hyrefastRequest('PUT', `/external/api/v1/jobs/${jobId}/topics`, {
    topicsToFocus: input.topicsToFocus,
    topicsToAvoid: input.topicsToAvoid || [],
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function clipTopicName(value: string): string {
  return value.trim().slice(0, 120);
}

function asTopicItem(value: unknown): HyrefastTopicItem | null {
  if (typeof value === 'string') {
    const name = clipTopicName(value);
    return name ? { name } : null;
  }
  const row = asRecord(value);
  if (!row) return null;
  const name = clipTopicName(String(row.name || row.title || row.topic || ''));
  if (!name) return null;
  const minutes = Number(row.discussionMinutes ?? row.discussion_minutes);
  const sampleQuestions = Array.isArray(row.sampleQuestions)
    ? row.sampleQuestions.map((item) => String(item).trim()).filter(Boolean)
    : Array.isArray(row.sample_questions)
      ? row.sample_questions.map((item) => String(item).trim()).filter(Boolean)
      : undefined;
  const reason = String(row.reason || '').trim();
  return {
    name,
    ...(Number.isFinite(minutes) && minutes > 0
      ? { discussionMinutes: Math.min(60, Math.max(1, Math.round(minutes))) }
      : {}),
    ...(reason ? { reason } : {}),
    ...(sampleQuestions?.length ? { sampleQuestions } : {}),
  };
}

/** Pull topicsToFocus / topicsToAvoid from generate-status payloads. */
export function extractGeneratedTopics(data: unknown): {
  topicsToFocus: HyrefastTopicItem[];
  topicsToAvoid: string[];
} {
  const root = asRecord(data);
  const nested = asRecord(root?.topics);
  // Hyrefast succeeded payload nests topics under `result`.
  const result = asRecord(root?.result);
  const resultTopics = asRecord(result?.topics);

  const focusRaw =
    (Array.isArray(result?.topicsToFocus) && result.topicsToFocus) ||
    (Array.isArray(result?.topics_to_focus) && result.topics_to_focus) ||
    (Array.isArray(resultTopics?.topicsToFocus) && resultTopics.topicsToFocus) ||
    (Array.isArray(root?.topicsToFocus) && root.topicsToFocus) ||
    (Array.isArray(root?.topics_to_focus) && root.topics_to_focus) ||
    (Array.isArray(nested?.topicsToFocus) && nested.topicsToFocus) ||
    (Array.isArray(nested?.topics_to_focus) && nested.topics_to_focus) ||
    (Array.isArray(root?.topics) && root.topics) ||
    [];
  const avoidRaw =
    (Array.isArray(result?.topicsToAvoid) && result.topicsToAvoid) ||
    (Array.isArray(result?.topics_to_avoid) && result.topics_to_avoid) ||
    (Array.isArray(resultTopics?.topicsToAvoid) && resultTopics.topicsToAvoid) ||
    (Array.isArray(root?.topicsToAvoid) && root.topicsToAvoid) ||
    (Array.isArray(root?.topics_to_avoid) && root.topics_to_avoid) ||
    (Array.isArray(nested?.topicsToAvoid) && nested.topicsToAvoid) ||
    (Array.isArray(nested?.topics_to_avoid) && nested.topics_to_avoid) ||
    [];

  return {
    topicsToFocus: focusRaw
      .map(asTopicItem)
      .filter((topic): topic is HyrefastTopicItem => Boolean(topic)),
    topicsToAvoid: avoidRaw
      .map((item) => String(item || '').trim())
      .filter(Boolean),
  };
}

/**
 * POST /jobs/{jobId}/topics/generate then poll status until topics are ready.
 * Does not persist — caller should PUT /jobs/{jobId}/topics to keep them.
 */
export async function generateHyrefastJobTopics(
  jobId: string,
  options?: { maxWaitMs?: number }
): Promise<{
  topicsToFocus: HyrefastTopicItem[];
  topicsToAvoid: string[];
  raw: unknown;
}> {
  const started = await hyrefastRequest<Record<string, unknown>>(
    'POST',
    `/external/api/v1/jobs/${encodeURIComponent(jobId)}/topics/generate`
  );
  const startedRow = asRecord(started) || {};
  // Generate response `jobId` is often the async run id used for status polling.
  const statusId =
    String(startedRow.jobId || startedRow.id || jobId).trim() || jobId;

  let waitMs = Number(startedRow.pollAfterMs ?? startedRow.poll_after_ms);
  if (!Number.isFinite(waitMs) || waitMs <= 0) waitMs = 2000;
  waitMs = Math.min(waitMs, 5000);

  const maxWaitMs = options?.maxWaitMs ?? 90_000;
  const deadline = Date.now() + maxWaitMs;
  let lastRaw: unknown = started;
  let lastExtracted = extractGeneratedTopics(started);

  while (Date.now() < deadline) {
    await sleep(waitMs);
    const statusData = await hyrefastRequest<Record<string, unknown>>(
      'GET',
      `/external/api/v1/jobs/topics/generate/status/${encodeURIComponent(statusId)}`
    );
    lastRaw = statusData;
    const row = asRecord(statusData) || {};
    const status = String(row.status || '').toLowerCase();
    lastExtracted = extractGeneratedTopics(statusData);

    if (
      status === 'failed' ||
      status === 'error' ||
      status === 'cancelled' ||
      status === 'canceled'
    ) {
      throw new Error(
        String(row.message || row.error || 'Hyrefast topic generation failed.')
      );
    }

    // Only settle on a terminal success status. Returning as soon as the first
    // topic appears (while still queued/processing) truncates the full set.
    const inProgress =
      !status ||
      status === 'queued' ||
      status === 'pending' ||
      status === 'processing' ||
      status === 'running' ||
      status === 'in_progress' ||
      status === 'started';
    const terminalSuccess =
      status === 'succeeded' ||
      status === 'success' ||
      status === 'completed' ||
      status === 'done' ||
      status === 'ready';

    if (
      terminalSuccess ||
      (!inProgress && lastExtracted.topicsToFocus.length > 0)
    ) {
      if (lastExtracted.topicsToFocus.length === 0) {
        throw new Error('Hyrefast topic generation finished with no topics.');
      }
      return {
        topicsToFocus: lastExtracted.topicsToFocus,
        topicsToAvoid: lastExtracted.topicsToAvoid,
        raw: lastRaw,
      };
    }

    const nextWait = Number(row.pollAfterMs ?? row.poll_after_ms);
    if (Number.isFinite(nextWait) && nextWait > 0) {
      waitMs = Math.min(nextWait, 5000);
    }
  }

  if (lastExtracted.topicsToFocus.length > 0) {
    // Timed out but we already have some topics — return what we have.
    return {
      topicsToFocus: lastExtracted.topicsToFocus,
      topicsToAvoid: lastExtracted.topicsToAvoid,
      raw: lastRaw,
    };
  }

  throw new Error('Hyrefast topic generation timed out.');
}

export async function publishHyrefastJob(jobId: string): Promise<void> {
  await hyrefastRequest('POST', `/external/api/v1/jobs/${jobId}/publish`);
}

export async function enableHyrefastConversationMode(jobId: string): Promise<void> {
  await hyrefastRequest(
    'POST',
    `/external/api/v1/jobs/${jobId}/conversation-mode/enable`
  );
}

export async function disableHyrefastConversationMode(jobId: string): Promise<void> {
  await hyrefastRequest(
    'POST',
    `/external/api/v1/jobs/${jobId}/conversation-mode/disable`
  );
}

function interviewHostFromApiBase(): string {
  const base = getHyrefastBaseUrl().toLowerCase();
  if (base.includes('staging')) return 'https://staging.hyrefast.ai';
  return 'https://hyrefast.ai';
}

function extractInterviewLink(data: Record<string, unknown>): string | undefined {
  const direct = String(
    data.privateInterviewUrl ||
      data.interviewLink ||
      data.interview_link ||
      data.url ||
      ''
  ).trim();
  if (direct) return direct;

  const privateLink =
    data.privateInterviewLink &&
    typeof data.privateInterviewLink === 'object' &&
    !Array.isArray(data.privateInterviewLink)
      ? (data.privateInterviewLink as Record<string, unknown>)
      : null;
  const token = String(privateLink?.token || '').trim();
  if (!token) return undefined;
  return `${interviewHostFromApiBase()}/private-interview/${token}`;
}

export async function createHyrefastApplication(input: {
  jobId: string;
  email: string;
  name: string;
  number: string;
}): Promise<{ id: string; raw: unknown; interviewLink?: string }> {
  const data = await hyrefastRequest<Record<string, unknown>>(
    'POST',
    '/external/api/v1/applications/create',
    {
      job: input.jobId,
      email: input.email,
      name: input.name,
      number: input.number,
    }
  );
  const id = extractId(data);
  if (!id) throw new Error('Hyrefast create application did not return an id.');
  return { id, raw: data, interviewLink: extractInterviewLink(data) };
}

export async function getHyrefastInterviewLink(
  applicationId: string
): Promise<{ interviewLink: string; raw: unknown }> {
  const data = await hyrefastRequest<Record<string, unknown>>(
    'POST',
    `/external/api/v1/applications/${applicationId}/interview-link`,
    {}
  );
  const interviewLink = extractInterviewLink(data);
  if (!interviewLink) {
    throw new Error('Hyrefast interview-link did not return a link.');
  }
  return { interviewLink, raw: data };
}

/** Emails the interview invite from Hyrefast (interview-link only returns the URL). */
export async function sendHyrefastInterview(
  applicationId: string
): Promise<{ interviewId?: string; status?: string; raw: unknown }> {
  const data = await hyrefastRequest<Record<string, unknown> | null>(
    'POST',
    `/external/api/v1/applications/${applicationId}/send-interview`,
    {}
  );
  const row =
    data && typeof data === 'object' && !Array.isArray(data)
      ? data
      : ({} as Record<string, unknown>);
  return {
    interviewId: String(row.interviewId || '').trim() || undefined,
    status: String(row.status || 'interview_invite_sent').trim() || undefined,
    raw: data,
  };
}

export type HyrefastResponseItem = {
  id: string;
  questionNumber: number;
  questionText: string;
  responseText: string;
  transcriptionStatus: string;
  transcriptionText: string;
  responseDuration: number | null;
  audioUrl: string | null;
  videoUrl: string | null;
  isSkipped: boolean;
};

/**
 * List interview responses for an application.
 * RECORD_NOT_FOUND (no responses yet) returns an empty list.
 */
export async function listHyrefastResponses(
  applicationId: string,
  options?: { page?: number; limit?: number }
): Promise<{ items: HyrefastResponseItem[]; raw: unknown }> {
  const apiKey = requireApiKey();
  const url = `${getHyrefastBaseUrl()}/external/api/v1/applications/${applicationId}/responses/list`;
  const res = await fetch(url, {
    method: 'POST',
    headers: hyrefastHeaders(apiKey),
    body: JSON.stringify({
      options: {
        page: options?.page ?? 1,
        limit: options?.limit ?? 50,
      },
    }),
  });

  let envelope: HyrefastEnvelope<Record<string, unknown> | null> | null = null;
  try {
    envelope = (await res.json()) as HyrefastEnvelope<Record<string, unknown> | null>;
  } catch {
    envelope = null;
  }

  const status = String(envelope?.status || '').toUpperCase();
  if (status === 'RECORD_NOT_FOUND') {
    return { items: [], raw: envelope };
  }
  if (!res.ok || (status && status !== 'SUCCESS')) {
    const message =
      envelope?.message ||
      `Hyrefast responses/list failed (${res.status}${status ? ` / ${status}` : ''}).`;
    throw new Error(message);
  }

  const data = envelope?.data;
  const rows =
    data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.data)
      ? (data.data as unknown[])
      : Array.isArray(data)
        ? data
        : [];

  const items: HyrefastResponseItem[] = rows
    .map((row) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
      const item = row as Record<string, unknown>;
      const id = String(item.id || item._id || '').trim();
      if (!id) return null;
      return {
        id,
        questionNumber: Number(item.questionNumber ?? item.question_number ?? 0) || 0,
        questionText: String(item.questionText || item.question_text || '').trim(),
        responseText: String(item.responseText || item.response_text || '').trim(),
        transcriptionStatus: String(
          item.transcriptionStatus || item.transcription_status || ''
        ).trim(),
        transcriptionText: String(
          item.transcriptionText || item.transcription_text || ''
        ).trim(),
        responseDuration:
          typeof item.responseDuration === 'number'
            ? item.responseDuration
            : typeof item.response_duration === 'number'
              ? item.response_duration
              : null,
        audioUrl: String(item.audioUrl || item.audio_url || '').trim() || null,
        videoUrl: String(item.videoUrl || item.video_url || '').trim() || null,
        isSkipped: Boolean(item.isSkipped ?? item.is_skipped),
      };
    })
    .filter((item): item is HyrefastResponseItem => Boolean(item))
    .sort((a, b) => a.questionNumber - b.questionNumber);

  return { items, raw: envelope?.data ?? null };
}
