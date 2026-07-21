import { z } from 'zod';

import {
  CAMPAIGN_MODES,
  CAMPAIGN_SOURCE_MODULES,
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  normalizeCampaignStatusAlias,
  SEQUENCE_STEP_TYPES,
} from './campaign.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

/** Accepts 'active' as an alias for 'running' — DB/enum values never change. */
const statusWithAlias = z.preprocess(
  (value) => (typeof value === 'string' ? normalizeCampaignStatusAlias(value) : value),
  z.enum(CAMPAIGN_STATUSES)
);

export const listCampaignsQuerySchema = z.object({
  status: statusWithAlias.optional(),
  sourceModule: z.enum(CAMPAIGN_SOURCE_MODULES).optional(),
  jobId: objectId.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const sequenceStepSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  order: z.number().int().min(0).optional(),
  type: z.enum(SEQUENCE_STEP_TYPES),
  delayDays: z.number().min(0).default(0),
  delayUnit: z.enum(['days', 'hours', 'minutes']).default('days'),
  templateId: z.string().nullable().optional(),
  subject: z.string().max(300).nullable().optional(),
  body: z.string().max(60000).nullable().optional(),
  stopOnReply: z.boolean().optional(),
  note: z.string().max(2000).nullable().optional(),
  sendWindow: z
    .object({
      startHour: z.number().int().min(0).max(23),
      endHour: z.number().int().min(0).max(23),
      daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
      timezone: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const channelConfigSchema = z.object({
  email: z
    .object({
      enabled: z.boolean(),
      integrationId: z.string().nullable().optional(),
      senderEmail: z.string().nullable().optional(),
    })
    .optional(),
  whatsapp: z
    .object({
      enabled: z.boolean(),
      integrationId: z.string().nullable().optional(),
    })
    .optional(),
  ai_voice: z
    .object({
      enabled: z.boolean(),
      integrationId: z.string().nullable().optional(),
    })
    .optional(),
  timezone: z.string().min(1).max(64).optional(),
  sendWindow: z
    .object({
      startHour: z.number().int().min(0).max(23),
      endHour: z.number().int().min(0).max(23),
      daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    })
    .optional(),
});

const candidateSourceSchema = z.object({
  type: z.enum(['candidate_pool', 'saved_list', 'manual', 'job', 'import']).optional(),
  listId: z.string().nullable().optional(),
  jobId: z.string().nullable().optional(),
  candidateIds: z.array(objectId).optional(),
  label: z.string().nullable().optional(),
});

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).nullable().optional(),
  objective: z.string().trim().max(500).nullable().optional(),
  ownerUserId: objectId.nullable().optional(),
  jobId: objectId.nullable().optional(),
  sourceModule: z.enum(CAMPAIGN_SOURCE_MODULES).optional(),
  campaignType: z.enum(CAMPAIGN_TYPES).optional(),
  candidateSource: candidateSourceSchema.optional(),
  channelConfig: channelConfigSchema.optional(),
  sequenceSteps: z.array(sequenceStepSchema).max(40).optional(),
  qualificationConfig: z
    .object({
      enabled: z.boolean(),
      questions: z.array(
        z.object({
          id: z.string(),
          prompt: z.string().min(1).max(1000),
          answerType: z.string().min(1).max(40),
          knockout: z.boolean().optional(),
          knockoutCondition: z.string().max(500).nullable().optional(),
        })
      ).max(10),
      aiReplyEnabled: z.boolean().optional(),
      takeoverCondition: z.string().max(200).nullable().optional(),
      autoScreening: z.boolean().optional(),
    })
    .optional(),
  schedulingConfig: z
    .object({
      enabled: z.boolean(),
      provider: z.string().nullable().optional(),
      eventTypeUri: z.string().nullable().optional(),
      messageTemplateId: z.string().nullable().optional(),
    })
    .optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const audienceBodySchema = z.object({
  candidateIds: z.array(objectId).min(1).max(5000),
  listId: objectId.optional(),
  replace: z.boolean().optional(),
});

export const removeAudienceBodySchema = z.object({
  candidateIds: z.array(objectId).min(1).max(5000),
});

export const scheduleCampaignSchema = z.object({
  scheduledAt: z.string().datetime({ offset: true }).or(z.coerce.date()),
});

export const campaignIdParamSchema = z.object({
  id: objectId,
});

export const listEnrollmentsQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/* ------------------------------------------------------------------ */
/* Builder — step payloads, draft creation                              */
/* ------------------------------------------------------------------ */

/**
 * Builder step schemas are intentionally permissive (`.passthrough()`).
 * The builder autosaves partial UI state; strict validation happens later
 * in compileBuilderToCampaign() before launch. This just guards types on
 * the handful of fields other services key off of.
 */
export const builderDetailsStepSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    objective: z.string().trim().max(500).nullable().optional(),
    jobId: objectId.nullable().optional(),
    mode: z.enum(CAMPAIGN_MODES).optional(),
    campaignType: z.enum(CAMPAIGN_TYPES).optional(),
  })
  .passthrough();

export const builderChannelStepSchema = z
  .object({
    channel: z.enum(['email', 'whatsapp', 'ai_voice']).optional(),
    selectedChannel: z.enum(['email', 'whatsapp', 'ai_voice']).optional(),
    integrationId: z.string().nullable().optional(),
    senderEmail: z.string().nullable().optional(),
  })
  .passthrough();

export const builderMessageStepSchema = z
  .object({
    subject: z.string().max(300).nullable().optional(),
    body: z.string().max(60000).nullable().optional(),
    templateId: z.string().nullable().optional(),
    touchpoints: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough();

export const builderSequenceStepSchema = z
  .object({
    sequence: z.array(z.record(z.string(), z.unknown())).optional(),
    steps: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough();

export const builderPersonalizeStepSchema = z.record(z.string(), z.unknown());

export const builderCandidatesStepSchema = z
  .object({
    candidateSource: candidateSourceSchema.optional(),
    candidateIds: z.array(objectId).optional(),
  })
  .passthrough();

export const builderQualificationStepSchema = z
  .object({
    enabled: z.boolean().optional(),
    questions: z.array(z.record(z.string(), z.unknown())).optional(),
    aiReplyEnabled: z.boolean().optional(),
  })
  .passthrough();

export const builderReviewStepSchema = z.record(z.string(), z.unknown());

export const BUILDER_STEP_SCHEMAS: Record<string, z.ZodTypeAny> = {
  details: builderDetailsStepSchema,
  channel: builderChannelStepSchema,
  message: builderMessageStepSchema,
  sequence: builderSequenceStepSchema,
  personalize: builderPersonalizeStepSchema,
  candidates: builderCandidatesStepSchema,
  qualification: builderQualificationStepSchema,
  review: builderReviewStepSchema,
};

export const builderStepParamSchema = z.object({
  id: objectId,
  stepKey: z.string().trim().min(1).max(40),
});

export const draftCampaignSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  mode: z.enum(CAMPAIGN_MODES).optional(),
  campaignType: z.enum(CAMPAIGN_TYPES).optional(),
  jobId: objectId.nullable().optional(),
  sourceModule: z.enum(CAMPAIGN_SOURCE_MODULES).optional(),
});

/* ------------------------------------------------------------------ */
/* Candidate tracking — interactions, conversation, actions             */
/* ------------------------------------------------------------------ */

export const candidateIdParamSchema = z.object({
  id: objectId,
  candidateId: objectId,
});

export const CANDIDATE_ACTION_TYPES = [
  'add_note',
  'mark_interested',
  'mark_not_interested',
  'qualify',
  'disqualify',
  'shortlist',
  'reject',
  'stop_automation',
  'resume_automation',
  'start_screening',
  'send_scheduling_link',
] as const;
export type CandidateActionType = (typeof CANDIDATE_ACTION_TYPES)[number];

export const candidateActionSchema = z.object({
  action: z.enum(CANDIDATE_ACTION_TYPES),
  note: z.string().trim().max(10000).optional(),
  reason: z.string().trim().max(2000).optional(),
  channel: z.enum(['email', 'whatsapp']).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const sendSchedulingLinkSchema = z.object({
  channel: z.enum(['email', 'whatsapp']).optional(),
  eventTypeUri: z.string().nullable().optional(),
  message: z.string().trim().max(5000).nullable().optional(),
});
