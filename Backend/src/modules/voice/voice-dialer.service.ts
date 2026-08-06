/**
 * Shared Hunar voice agent + bulk dial helpers for outreach / screening.
 */

import { randomUUID } from 'node:crypto';

import { Redis } from 'ioredis';

import { getLogger } from '../../config/logger.js';
import { getRedisUrl } from '../../bull-outreach/redis.js';
import {
  createHunarBulkCalls,
  createHunarVoiceAgent,
  updateHunarVoiceAgent,
  type HunarCalleeRow,
  type HunarRetryConfig,
} from '../../providers/hunar/hunar.client.js';
import {
  getHunarVoiceLanguage,
  getHunarVoicePersona,
  isHunarConfigured,
} from '../../providers/hunar/hunar.config.js';
import {
  isZyastraConfigured,
  triggerZyastraVoiceCall,
} from '../../providers/zyastra/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { loadOutreachJobContext } from '../outreach/job-context.js';
import {
  pendingVoiceCallId,
  VoiceCallModel,
  type VoiceCallProvider,
  type VoiceCallSource,
} from './voice-call.model.js';

const log = () => getLogger().child({ component: 'voice-dialer' });

/** In-process fallback when Redis is down — serializes sync within one worker. */
const localVoiceAgentLocks = new Map<string, Promise<void>>();

let lockRedis: Redis | null = null;
let lockRedisFailed = false;

function getLockRedis(): Redis | null {
  if (lockRedisFailed) return null;
  if (lockRedis) return lockRedis;
  try {
    lockRedis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    lockRedis.on('error', (err) => {
      log().warn({ err }, 'Voice agent lock Redis error');
    });
    return lockRedis;
  } catch {
    lockRedisFailed = true;
    return null;
  }
}

/**
 * Serialize Hunar agent create/update per campaign so parallel enrollment jobs
 * do not race-create agents (Hunar 500) or overwrite each other's saves.
 */
export async function withCampaignVoiceAgentLock<T>(
  campaignId: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = `huntlo:voice-agent-lock:${String(campaignId)}`;
  const token = randomUUID();
  const redis = getLockRedis();
  const lockTtlMs = 45_000;

  if (redis) {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const ok = await redis.set(key, token, 'PX', lockTtlMs, 'NX').catch(() => null);
      if (ok === 'OK') {
        try {
          return await fn();
        } finally {
          const current = await redis.get(key).catch(() => null);
          if (current === token) await redis.del(key).catch(() => undefined);
        }
      }
      await new Promise((r) => setTimeout(r, 75 + Math.floor(Math.random() * 75)));
    }
    log().warn({ campaignId }, 'Voice agent Redis lock wait timed out; using local lock');
  }

  const prev = localVoiceAgentLocks.get(key) || Promise.resolve();
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = prev.then(() => held).catch(() => held);
  localVoiceAgentLocks.set(key, tail);
  await prev.catch(() => undefined);
  try {
    return await fn();
  } finally {
    release();
    if (localVoiceAgentLocks.get(key) === tail) localVoiceAgentLocks.delete(key);
  }
}

export const VOICE_INTRO_BY_TONE = {
  professional: 'Hello, am I speaking with {callee_name}?',
  friendly: 'Hi there! Am I speaking with {callee_name}?',
  direct: 'Hello, is this {callee_name}?',
} as const;

export type VoiceTone = keyof typeof VOICE_INTRO_BY_TONE;

export type VoiceAgentConfigInput = {
  name: string;
  objective: string;
  introduction?: string | null;
  agentPrompt: string;
  resultPrompt?: string | null;
  resultSchema?: Record<string, unknown> | null;
  tone?: VoiceTone | string | null;
  language?: string | null;
  voicePersona?: string | null;
  personaName?: string | null;
  existingAgentId?: string | null;
};

export type VoiceDialContact = {
  candidateId?: string | null;
  enrollmentId?: string | null;
  name: string;
  phone: string;
  customData?: Record<string, string>;
};

export function normalizeVoiceRetryConfig(input?: {
  callAttempts?: number | null;
  maxRetryCount?: number | null;
  retryIntervalHours?: number | null;
  enabled?: boolean;
} | null): HunarRetryConfig {
  const enabled = input?.enabled !== false;
  if (!enabled) return { maxRetryCount: 0, retryIntervalHours: 0 };

  let maxRetryCount = Number(input?.maxRetryCount ?? 0);
  if ((!Number.isFinite(maxRetryCount) || maxRetryCount <= 0) && input?.callAttempts) {
    // UI callAttempts → max_retry_count = callAttempts - 1
    maxRetryCount = Math.max(0, Math.floor(Number(input.callAttempts)) - 1);
  }
  if (!Number.isFinite(maxRetryCount) || maxRetryCount <= 0) {
    maxRetryCount = 2;
  }
  let retryIntervalHours = Number(input?.retryIntervalHours ?? 6);
  if (![3, 6, 9, 12, 24].includes(retryIntervalHours)) retryIntervalHours = 6;
  return {
    maxRetryCount: Math.min(10, Math.max(2, Math.floor(maxRetryCount))),
    retryIntervalHours,
  };
}

export function resolveIntroduction(tone?: string | null, explicit?: string | null): string {
  const trimmed = String(explicit || '').trim();
  if (trimmed) return trimmed;
  const key = String(tone || 'professional').toLowerCase() as VoiceTone;
  return VOICE_INTRO_BY_TONE[key] || VOICE_INTRO_BY_TONE.professional;
}

export function defaultResultSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      interest_level: { type: 'string' },
      candidate_status: { type: 'string' },
      final_outcome: { type: 'string' },
      callback_requested: { type: 'boolean' },
      callback_time: { type: 'string' },
      candidate_questions: { type: 'array', items: { type: 'string' } },
      objections_or_concerns: { type: 'array', items: { type: 'string' } },
      ctc: { type: 'string' },
      notice_period: { type: 'string' },
      skills: { type: 'string' },
      education: { type: 'string' },
      location: { type: 'string' },
    },
  };
}

export function defaultResultPrompt(fields?: string[]): string {
  const list =
    fields && fields.length
      ? fields.join(', ')
      : 'summary, interest_level, candidate_status, final_outcome, callback_requested, callback_time, candidate_questions, objections_or_concerns, ctc, notice_period, skills, education, location';
  return `Extract structured screening results for these fields: ${list}. Be concise and factual.`;
}

/** Resolve {token} / {{token}} placeholders; leave {callee_name} for Hunar. */
export function resolveVoiceTokens(
  template: string,
  tokens: Record<string, string>
): string {
  let out = String(template || '');

  const replaceKey = (key: string, match: string, dropIfMissing: boolean): string => {
    const normalized =
      key === 'first_name' || key === 'candidate_name' || key === 'name'
        ? 'callee_name'
        : key;
    if (normalized === 'callee_name') return '{callee_name}';
    const value = tokens[normalized] ?? tokens[key];
    if (value != null && String(value).length) return String(value);
    // Missing/empty {{token}} must not survive as {{token}} — the cleanup pass
    // would strip the inner {token} and leave invalid empty `{}` for Hunar.
    return dropIfMissing ? '' : match;
  };

  // Double-brace first so {{job_title}} does not become {MERN Stack Developer}.
  out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) =>
    replaceKey(String(key), match, true)
  );
  out = out.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) =>
    replaceKey(String(key), match, false)
  );

  // Hunar only allows snake_case vars. Strip leftover invalid {…} (spaces, etc.).
  out = out.replace(/\{([^{}]+)\}/g, (match, inner) => {
    const key = String(inner).trim();
    if (key === 'callee_name') return '{callee_name}';
    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
      // Unresolved optional token (e.g. empty company clause) → drop.
      return '';
    }
    return key;
  });

  // Final guard: unresolved {{x}} cleanup must never leave empty braces.
  return out.replace(/\{\}/g, '');
}

/** Strip empty `{}` left by unresolved placeholders — Hunar rejects them. */
export function sanitizeHunarPromptText(template: string): string {
  return String(template || '').replace(/\{\}/g, '');
}

export async function buildJdVoiceTokens(jobId: string | null | undefined) {
  const job = await loadOutreachJobContext(jobId || null);
  return {
    job_title: job.title || '',
    job_description: job.description || '',
    company_name: '',
    jd_role: job.title || '',
    jd_requirements: (job.requirements || []).join('; '),
    jd_skills: (job.requiredSkills || []).join(', '),
    jd_locations: (job.locations || []).join(', '),
    jd_salary: job.salaryRange || '',
  };
}

export async function syncVoiceAgent(input: VoiceAgentConfigInput): Promise<{ agentId: string }> {
  if (!isHunarConfigured()) {
    throw new AppError(
      503,
      'HUNAR_API_KEY_MISSING',
      'Hunar voice API key is not configured. Set HUNAR_VOICE_API_KEY.'
    );
  }

  const introduction = sanitizeHunarPromptText(
    resolveIntroduction(input.tone, input.introduction)
  );
  const payload = {
    name: input.name,
    agentPrompt: sanitizeHunarPromptText(input.agentPrompt),
    objective: sanitizeHunarPromptText(input.objective),
    introduction,
    resultPrompt: sanitizeHunarPromptText(
      String(input.resultPrompt || '').trim() || defaultResultPrompt()
    ),
    resultSchema:
      input.resultSchema && Object.keys(input.resultSchema).length
        ? input.resultSchema
        : defaultResultSchema(),
    voicePersona: input.voicePersona || getHunarVoicePersona(),
    language: String(input.language || getHunarVoiceLanguage()).toUpperCase(),
    personaName: input.personaName || 'Roshni',
  };

  const existing = String(input.existingAgentId || '').trim();
  if (existing) {
    const updated = await updateHunarVoiceAgent(existing, payload);
    log().info({ agentId: updated.agentId }, 'Hunar voice agent updated');
    return { agentId: updated.agentId };
  }
  const created = await createHunarVoiceAgent(payload);
  log().info({ agentId: created.agentId }, 'Hunar voice agent created');
  return { agentId: created.agentId };
}

export function toHunarMobile(phone: string): string | null {
  try {
    // Providers require E.164 with leading '+' (e.g. +919876543210).
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, '');
    return digits.length >= 10 && normalized.startsWith('+') ? normalized : null;
  } catch {
    return null;
  }
}

/** True when E.164 number is Indian (+91…). Used to route Hunar vs Zyastra. */
export function isIndianE164(phone: string): boolean {
  const mobile = toHunarMobile(phone);
  if (!mobile) return false;
  return mobile.startsWith('+91');
}

export type NormalizedVoiceContact = VoiceDialContact & {
  mobile: string;
  mobileDigits: string;
  indian: boolean;
};

export function partitionVoiceContacts(contacts: VoiceDialContact[]): {
  indian: NormalizedVoiceContact[];
  international: NormalizedVoiceContact[];
  skippedInvalid: number;
} {
  const indian: NormalizedVoiceContact[] = [];
  const international: NormalizedVoiceContact[] = [];
  let skippedInvalid = 0;
  const seen = new Set<string>();

  for (const contact of contacts) {
    const mobile = toHunarMobile(contact.phone);
    if (!mobile) {
      skippedInvalid += 1;
      continue;
    }
    const mobileDigits = mobile.replace(/\D/g, '');
    if (seen.has(mobileDigits)) {
      skippedInvalid += 1;
      continue;
    }
    seen.add(mobileDigits);
    const row: NormalizedVoiceContact = {
      ...contact,
      mobile,
      mobileDigits,
      indian: mobile.startsWith('+91'),
    };
    if (row.indian) indian.push(row);
    else international.push(row);
  }

  return { indian, international, skippedInvalid };
}

function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: 'Candidate' };
  if (parts.length === 1) return { firstName: parts[0]! };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function seedPendingVoiceCalls(input: {
  organizationId: string;
  source: VoiceCallSource;
  campaignId?: string | null;
  screeningId?: string | null;
  requestId: string;
  agentId: string | null;
  provider?: VoiceCallProvider;
  contacts: Array<VoiceDialContact & { mobileDigits: string; callId?: string }>;
  maxRetries: number;
  quotaReservationKeys?: Map<string, string>;
  status?: 'pending' | 'queued';
}) {
  const provider = input.provider || 'hunar';
  const docs = input.contacts.map((c) => ({
    organizationId: input.organizationId,
    source: input.source,
    campaignId: input.campaignId || null,
    screeningId: input.screeningId || null,
    enrollmentId: c.enrollmentId || null,
    candidateId: c.candidateId || null,
    callId: c.callId || pendingVoiceCallId(input.requestId, c.mobileDigits),
    requestId: input.requestId,
    provider,
    agentId: input.agentId,
    contactName: c.name || null,
    toNumber: c.mobileDigits,
    toNumberDigits: c.mobileDigits,
    status: input.status || ('pending' as const),
    maxRetries: input.maxRetries,
    // Only Hunar webhooks should set retriesLeft; seeding maxRetries here blocked
    // quota commit forever when the provider omitted retries_left.
    retriesLeft: null,
    quotaReservationKey:
      input.quotaReservationKeys?.get(c.mobileDigits) ||
      `voice:${input.requestId}:${c.mobileDigits}`,
  }));

  if (!docs.length) return [];
  try {
    await VoiceCallModel.insertMany(docs, { ordered: false });
  } catch (error) {
    // Ignore duplicate pending stubs on retry.
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  return docs;
}

/**
 * Reserve 1 ai_voice_minute per dialable contact, place calls via Hunar (+91)
 * and/or Zyastra (non-IN), and seed pending VoiceCall rows.
 */
export async function launchBulkVoiceCalls(input: {
  organizationId: string;
  userId: string;
  source: VoiceCallSource;
  campaignId?: string | null;
  screeningId?: string | null;
  /** Required when any contact is Indian (+91). */
  agentId?: string | null;
  contacts: VoiceDialContact[];
  retryConfig?: HunarRetryConfig | null;
  requestId?: string | null;
  /** Agent prompt / intro for Zyastra non-IN dials. */
  agentPrompt?: string | null;
  firstMessage?: string | null;
  preferredLanguage?: string | null;
  analysisVariables?: string[];
}): Promise<{
  requestId: string;
  dialedCount: number;
  agentId: string | null;
  skippedInvalid: number;
  hunarDialed: number;
  zyastraDialed: number;
}> {
  const { indian, international, skippedInvalid } = partitionVoiceContacts(input.contacts);

  if (!indian.length && !international.length) {
    throw new AppError(
      400,
      'VOICE_NO_VALID_PHONES',
      'No candidates have a valid phone number for AI voice calls.'
    );
  }

  if (indian.length > 0) {
    if (!isHunarConfigured()) {
      throw new AppError(
        503,
        'HUNAR_API_KEY_MISSING',
        'Hunar voice API key is not configured. Set HUNAR_VOICE_API_KEY.'
      );
    }
    if (!String(input.agentId || '').trim()) {
      throw new AppError(
        400,
        'HUNAR_AGENT_ID_REQUIRED',
        'Hunar voice agent id is required before launching Indian (+91) calls.'
      );
    }
  }

  if (international.length > 0 && !isZyastraConfigured()) {
    throw new AppError(
      503,
      'ZYASTRA_API_KEY_MISSING',
      'Non-Indian numbers require Zyastra. Set ZYASTRA_API_KEY and ZYASTRA_API_SECRET.'
    );
  }

  getPublicBaseOrThrow();

  const batchRequestId = (
    String(input.requestId || '').trim() ||
    `${input.campaignId || input.screeningId || 'voice'}-${randomUUID()}`
  )
    .replace(/[^a-zA-Z0-9_.-]/g, '-')
    .slice(0, 64);
  const retry = input.retryConfig || { maxRetryCount: 0, retryIntervalHours: 0 };
  const allSeeded = [...indian, ...international];

  const reservationKeys = new Map<string, string>();
  for (const row of allSeeded) {
    const key = `voice:${batchRequestId}:${row.mobileDigits}`;
    reservationKeys.set(row.mobileDigits, key);
    try {
      await quotaService.reserveUsage({
        organizationId: input.organizationId,
        metric: 'ai_voice_minutes',
        quantity: 1,
        idempotencyKey: key,
        relatedEntityType: input.source === 'screening' ? 'screening' : 'campaign',
        relatedEntityId: String(input.campaignId || input.screeningId || ''),
      });
    } catch (error) {
      for (const prior of reservationKeys.values()) {
        await quotaService
          .releaseUsage({
            organizationId: input.organizationId,
            metric: 'ai_voice_minutes',
            idempotencyKey: prior,
          })
          .catch(() => undefined);
      }
      if ((error as { code?: string }).code === 'QUOTA_EXCEEDED') {
        throw new AppError(
          403,
          'VOICE_CALL_CREDITS_EXCEEDED',
          'Not enough AI voice credits to launch these calls.'
        );
      }
      throw error;
    }
  }

  let hunarDialed = 0;
  let zyastraDialed = 0;
  let primaryRequestId = batchRequestId;
  const agentId = String(input.agentId || '').trim() || null;

  try {
    if (indian.length > 0) {
      const callees: HunarCalleeRow[] = indian.map((c) => ({
        callee_name: c.name || 'Candidate',
        mobile_number: c.mobile,
        custom_data: c.customData || {},
      }));

      const bulk = await createHunarBulkCalls({
        agentId: agentId!,
        campaignId: input.campaignId || undefined,
        screeningId: input.screeningId || undefined,
        callees,
        requestId: batchRequestId,
        retryConfig: retry,
      });
      primaryRequestId = bulk.requestId || batchRequestId;
      hunarDialed = bulk.dialedCount || callees.length;

      await seedPendingVoiceCalls({
        organizationId: input.organizationId,
        source: input.source,
        campaignId: input.campaignId,
        screeningId: input.screeningId,
        requestId: primaryRequestId,
        agentId,
        provider: 'hunar',
        contacts: indian,
        maxRetries: retry.maxRetryCount || 0,
        quotaReservationKeys: reservationKeys,
      });

      log().info(
        {
          requestId: primaryRequestId,
          dialedCount: hunarDialed,
          phones: callees.map((c) => c.mobile_number),
          source: input.source,
          provider: 'hunar',
        },
        'Hunar bulk voice launch accepted'
      );
    }

    if (international.length > 0) {
      const prompt =
        String(input.agentPrompt || '').trim() ||
        'You are a professional recruiter. Screen the candidate for the open role and collect notice period, CTC expectations, and interest.';
      const firstMessage =
        String(input.firstMessage || '').trim() ||
        'Hello, am I speaking with {callee_name}?'.replace(
          '{callee_name}',
          international[0]?.name || 'there'
        );

      const results = await mapPool(international, 4, async (contact) => {
        const { firstName, lastName } = splitName(contact.name);
        const personalFirstMessage = firstMessage.includes('{callee_name}')
          ? firstMessage.replace(/\{callee_name\}/g, contact.name || firstName)
          : firstMessage;
        const triggered = await triggerZyastraVoiceCall({
          candidate: {
            phoneNumber: contact.mobile,
            firstName,
            ...(lastName ? { lastName } : {}),
          },
          agent: {
            prompt,
            firstMessage: personalFirstMessage,
            preferredLanguage: input.preferredLanguage || 'en-US',
          },
          voiceConfiguration: { engine: 'global-std', speed: 1.0 },
          analysisVariables: input.analysisVariables,
          metadata: {
            source: input.source,
            organizationId: input.organizationId,
            ...(input.campaignId ? { campaignId: String(input.campaignId) } : {}),
            ...(input.screeningId ? { screeningId: String(input.screeningId) } : {}),
            ...(contact.enrollmentId ? { enrollmentId: String(contact.enrollmentId) } : {}),
            ...(contact.candidateId ? { candidateId: String(contact.candidateId) } : {}),
            batchRequestId,
          },
        });
        return { contact, triggered };
      });

      zyastraDialed = results.length;
      for (const { contact, triggered } of results) {
        await seedPendingVoiceCalls({
          organizationId: input.organizationId,
          source: input.source,
          campaignId: input.campaignId,
          screeningId: input.screeningId,
          requestId: triggered.requestId || batchRequestId,
          agentId: null,
          provider: 'zyastra',
          contacts: [
            {
              ...contact,
              callId: triggered.callId,
            },
          ],
          maxRetries: 0,
          quotaReservationKeys: reservationKeys,
          status: 'queued',
        });
      }

      if (!indian.length && results[0]?.triggered.requestId) {
        primaryRequestId = results[0].triggered.requestId;
      }

      log().info(
        {
          batchRequestId,
          dialedCount: zyastraDialed,
          phones: international.map((c) => c.mobile),
          source: input.source,
          provider: 'zyastra',
        },
        'Zyastra voice launches accepted'
      );
    }

    const dialedCount = hunarDialed + zyastraDialed;
    if (dialedCount > 0) {
      void import('../admin/email-templates.service.js')
        .then(({ emailTemplatesService }) =>
          emailTemplatesService.onAiVoiceUsed({ userId: input.userId })
        )
        .catch(() => undefined);
    }

    return {
      requestId: primaryRequestId,
      dialedCount,
      agentId,
      skippedInvalid,
      hunarDialed,
      zyastraDialed,
    };
  } catch (error) {
    for (const key of reservationKeys.values()) {
      await quotaService
        .releaseUsage({
          organizationId: input.organizationId,
          metric: 'ai_voice_minutes',
          idempotencyKey: key,
        })
        .catch(() => undefined);
    }
    throw error;
  }
}

function getPublicBaseOrThrow(): true {
  const base = String(
    process.env.PUBLIC_API_BASE_URL || process.env.API_PUBLIC_BASE_URL || ''
  ).trim();
  if (!base) {
    throw new AppError(
      503,
      'VOICE_CALLBACK_URL_MISSING',
      'PUBLIC_API_BASE_URL is not configured. Set it so voice providers can deliver call callbacks.'
    );
  }
  return true;
}
