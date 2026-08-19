import { z } from 'zod';

import { SCREENING_MODES, SCREENING_STATUSES } from './screening.model.js';
import { RECRUITER_DECISIONS } from './screening-candidate.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const screeningStatusValue = z.enum(SCREENING_STATUSES);

export const listScreeningsQuerySchema = z.object({
  status: z
    .preprocess((value) => {
      if (Array.isArray(value)) {
        return value
          .flatMap((item) => String(item).split(','))
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean);
      }
      if (typeof value === 'string') {
        const parts = value
          .split(',')
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean);
        return parts.length <= 1 ? parts[0] : parts;
      }
      return value;
    }, z.union([screeningStatusValue, z.array(screeningStatusValue)]).optional()),
  jobId: objectId.optional(),
  ownerUserId: z
    .preprocess((value) => {
      if (Array.isArray(value)) {
        return value
          .flatMap((item) => String(item).split(','))
          .map((item) => item.trim())
          .filter(Boolean);
      }
      if (typeof value === 'string') {
        const parts = value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        return parts.length <= 1 ? parts[0] : parts;
      }
      return value;
    }, z.union([objectId, z.array(objectId)]).optional()),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const screeningIdParamSchema = z.object({ id: objectId });

export const createScreeningSchema = z.object({
  name: z.string().trim().min(1).max(200),
  mode: z.enum(SCREENING_MODES).optional(),
  ownerUserId: objectId.optional(),
  jobId: objectId.nullable().optional(),
  campaignId: objectId.nullable().optional(),
  workflowId: objectId.nullable().optional(),
  sourceModule: z.string().max(40).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  objective: z.string().max(5000).nullable().optional(),
  language: z.string().max(40).nullable().optional(),
  voice: z.string().max(80).nullable().optional(),
  tone: z.string().max(80).nullable().optional(),
  introductionScript: z.string().max(20000).nullable().optional(),
  agentPrompt: z.string().max(60000).nullable().optional(),
  closingScript: z.string().max(20000).nullable().optional(),
  consentText: z.string().max(5000).nullable().optional(),
  questions: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        prompt: z.string().min(1).max(2000),
        type: z.string().trim().max(80).nullable().optional(),
        required: z.boolean().optional(),
        followUp: z.string().trim().max(1000).nullable().optional(),
        expectedVariable: z.string().trim().max(80).nullable().optional(),
        evaluationEnabled: z.boolean().optional(),
        knockout: z.boolean().optional(),
        knockoutCondition: z.string().trim().max(500).nullable().optional(),
      })
    )
    .max(50)
    .optional(),
  evaluationCriteria: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        label: z.string().min(1).max(120),
        weight: z.number().min(0).max(100).default(1),
        description: z.string().max(500).nullable().optional(),
      })
    )
    .max(30)
    .optional(),
  minShortlistScore: z.number().min(0).max(100).optional(),
  knockouts: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
  callSettings: z
    .object({
      maxAttempts: z.number().int().min(1).max(10).optional(),
      attemptIntervalHours: z.number().int().min(1).max(168).optional(),
      maxRetryCount: z.number().int().min(0).max(10).optional(),
      retryIntervalHours: z.number().int().min(0).max(168).optional(),
      consentRequired: z.boolean().optional(),
      callWindow: z.string().trim().min(1).max(80).optional(),
      timezone: z.string().trim().min(1).max(80).optional(),
      voicemailBehaviour: z.string().trim().min(1).max(120).optional(),
    })
    .optional(),
  candidateIds: z.array(objectId).max(500).optional(),
});

export const updateScreeningSchema = createScreeningSchema.partial().extend({
  name: z.string().trim().min(1).max(200).optional(),
});

function commaSeparated(normalize: (value: string) => string) {
  return (value: unknown) => {
    const parts = Array.isArray(value)
      ? value.flatMap((item) => String(item).split(','))
      : typeof value === 'string'
        ? value.split(',')
        : [];
    const normalized = parts.map((item) => normalize(item.trim())).filter(Boolean);
    if (normalized.length === 0) return undefined;
    return normalized.length === 1 ? normalized[0] : normalized;
  };
}

const recruiterDecisionValue = z.enum(RECRUITER_DECISIONS);
const recommendationValue = z.enum(['shortlist', 'reject', 'needs_review']);

function normalizeDecisionFilter(value: string): string {
  const raw = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (raw.includes('shortlist')) return 'shortlisted';
  if (raw.includes('reject')) return 'rejected';
  if (raw.includes('interview') || raw.includes('schedule') || raw === 'call_again') {
    return 'call_again';
  }
  if (raw === 'pending') return 'pending';
  return raw;
}

function normalizeRecommendationFilter(value: string): string {
  const raw = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (raw.includes('shortlist')) return 'shortlist';
  if (raw.includes('reject')) return 'reject';
  if (raw.includes('review')) return 'needs_review';
  return raw;
}

export const listCandidatesQuerySchema = z.object({
  callStatus: z.string().optional(),
  decision: z.enum(RECRUITER_DECISIONS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const listResultsQuerySchema = z.object({
  screeningId: objectId.optional(),
  jobId: objectId.optional(),
  decision: z.preprocess(
    commaSeparated(normalizeDecisionFilter),
    z.union([recruiterDecisionValue, z.array(recruiterDecisionValue)]).optional()
  ),
  recommendation: z.preprocess(
    commaSeparated(normalizeRecommendationFilter),
    z.union([recommendationValue, z.array(recommendationValue)]).optional()
  ),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const resultIdParamSchema = z.object({ id: objectId });

export const noteBodySchema = z.object({
  text: z.string().trim().min(1).max(5000),
});
