/**
 * Shared Hunar voice agent + bulk dial helpers for outreach / screening.
 */

import { randomUUID } from 'node:crypto';

import { getLogger } from '../../config/logger.js';
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
import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { loadOutreachJobContext } from '../outreach/job-context.js';
import {
  pendingVoiceCallId,
  VoiceCallModel,
  type VoiceCallSource,
} from './voice-call.model.js';

const log = () => getLogger().child({ component: 'voice-dialer' });

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

  const replaceKey = (key: string, match: string): string => {
    if (key === 'callee_name') return '{callee_name}';
    const value = tokens[key];
    return value != null && String(value).length ? String(value) : match;
  };

  // Double-brace first so {{job_title}} does not become {MERN Stack Developer}.
  out = out.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) =>
    replaceKey(String(key), match)
  );
  out = out.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) =>
    replaceKey(String(key), match)
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

  return out;
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

  const introduction = resolveIntroduction(input.tone, input.introduction);
  const payload = {
    name: input.name,
    agentPrompt: input.agentPrompt,
    objective: input.objective,
    introduction,
    resultPrompt: String(input.resultPrompt || '').trim() || defaultResultPrompt(),
    resultSchema:
      input.resultSchema && Object.keys(input.resultSchema).length
        ? input.resultSchema
        : defaultResultSchema(),
    voicePersona: input.voicePersona || getHunarVoicePersona(),
    language: String(input.language || getHunarVoiceLanguage()).toUpperCase(),
    personaName: input.personaName || null,
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
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, '');
    return digits.length >= 10 ? digits : null;
  } catch {
    return null;
  }
}

export async function seedPendingVoiceCalls(input: {
  organizationId: string;
  source: VoiceCallSource;
  campaignId?: string | null;
  screeningId?: string | null;
  requestId: string;
  agentId: string;
  contacts: Array<VoiceDialContact & { mobileDigits: string }>;
  maxRetries: number;
  quotaReservationKeys?: Map<string, string>;
}) {
  const docs = input.contacts.map((c) => ({
    organizationId: input.organizationId,
    source: input.source,
    campaignId: input.campaignId || null,
    screeningId: input.screeningId || null,
    enrollmentId: c.enrollmentId || null,
    candidateId: c.candidateId || null,
    callId: pendingVoiceCallId(input.requestId, c.mobileDigits),
    requestId: input.requestId,
    agentId: input.agentId,
    contactName: c.name || null,
    toNumber: c.mobileDigits,
    toNumberDigits: c.mobileDigits,
    status: 'pending' as const,
    maxRetries: input.maxRetries,
    retriesLeft: input.maxRetries,
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
 * Reserve 1 ai_voice_minute per dialable contact, sync agent if needed,
 * place bulk calls, and seed pending VoiceCall rows.
 */
export async function launchBulkVoiceCalls(input: {
  organizationId: string;
  userId: string;
  source: VoiceCallSource;
  campaignId?: string | null;
  screeningId?: string | null;
  agentId: string;
  contacts: VoiceDialContact[];
  retryConfig?: HunarRetryConfig | null;
  requestId?: string | null;
}): Promise<{
  requestId: string;
  dialedCount: number;
  agentId: string;
  skippedInvalid: number;
}> {
  if (!isHunarConfigured()) {
    throw new AppError(
      503,
      'HUNAR_API_KEY_MISSING',
      'Hunar voice API key is not configured. Set HUNAR_VOICE_API_KEY.'
    );
  }
  if (!getPublicBaseOrThrow()) {
    // getPublicBaseOrThrow always throws or returns true — kept for clarity
  }

  const callees: HunarCalleeRow[] = [];
  const seeded: Array<VoiceDialContact & { mobileDigits: string }> = [];
  let skippedInvalid = 0;

  const seen = new Set<string>();
  for (const contact of input.contacts) {
    const mobile = toHunarMobile(contact.phone);
    if (!mobile) {
      skippedInvalid += 1;
      continue;
    }
    if (seen.has(mobile)) {
      skippedInvalid += 1;
      continue;
    }
    seen.add(mobile);
    callees.push({
      callee_name: contact.name || 'Candidate',
      mobile_number: mobile,
      custom_data: contact.customData || {},
    });
    seeded.push({ ...contact, mobileDigits: mobile });
  }

  if (!callees.length) {
    throw new AppError(
      400,
      'VOICE_NO_VALID_PHONES',
      'No candidates have a valid phone number for AI voice calls.'
    );
  }

  const requestId =
    String(input.requestId || '').trim() ||
    `${input.campaignId || input.screeningId || 'voice'}-${randomUUID()}`;
  const retry = input.retryConfig || { maxRetryCount: 0, retryIntervalHours: 0 };

  const reservationKeys = new Map<string, string>();
  for (const row of seeded) {
    const key = `voice:${requestId}:${row.mobileDigits}`;
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
      // Roll back prior reservations on failure.
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

  try {
    const bulk = await createHunarBulkCalls({
      agentId: input.agentId,
      campaignId: input.campaignId || undefined,
      screeningId: input.screeningId || undefined,
      callees,
      requestId,
      retryConfig: retry,
    });

    await seedPendingVoiceCalls({
      organizationId: input.organizationId,
      source: input.source,
      campaignId: input.campaignId,
      screeningId: input.screeningId,
      requestId: bulk.requestId,
      agentId: input.agentId,
      contacts: seeded,
      maxRetries: retry.maxRetryCount || 0,
      quotaReservationKeys: reservationKeys,
    });

    log().info(
      {
        requestId: bulk.requestId,
        dialedCount: bulk.dialedCount,
        source: input.source,
        campaignId: input.campaignId,
        screeningId: input.screeningId,
      },
      'Hunar bulk voice launch accepted'
    );

    return {
      requestId: bulk.requestId,
      dialedCount: bulk.dialedCount,
      agentId: input.agentId,
      skippedInvalid,
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
      'HUNAR_CALLBACK_URL_MISSING',
      'PUBLIC_API_BASE_URL is not configured. Set it so Hunar can deliver voice call callbacks.'
    );
  }
  return true;
}
