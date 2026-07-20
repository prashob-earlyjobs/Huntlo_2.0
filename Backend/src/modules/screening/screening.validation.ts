import { z } from 'zod';

import { SCREENING_STATUSES } from './screening.model.js';
import { RECRUITER_DECISIONS } from './screening-candidate.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const listScreeningsQuerySchema = z.object({
  status: z.enum(SCREENING_STATUSES).optional(),
  jobId: objectId.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const screeningIdParamSchema = z.object({ id: objectId });

export const createScreeningSchema = z.object({
  name: z.string().trim().min(1).max(200),
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
    })
    .optional(),
  candidateIds: z.array(objectId).max(500).optional(),
});

export const updateScreeningSchema = createScreeningSchema.partial().extend({
  name: z.string().trim().min(1).max(200).optional(),
});

export const listCandidatesQuerySchema = z.object({
  callStatus: z.string().optional(),
  decision: z.enum(RECRUITER_DECISIONS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const listResultsQuerySchema = z.object({
  screeningId: objectId.optional(),
  jobId: objectId.optional(),
  decision: z.enum(RECRUITER_DECISIONS).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const resultIdParamSchema = z.object({ id: objectId });

export const noteBodySchema = z.object({
  text: z.string().trim().min(1).max(5000),
});
