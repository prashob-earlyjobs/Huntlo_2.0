import { z } from 'zod';

import {
  CAMPAIGN_SOURCE_MODULES,
  CAMPAIGN_STATUSES,
  CAMPAIGN_TYPES,
  SEQUENCE_STEP_TYPES,
} from './campaign.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const listCampaignsQuerySchema = z.object({
  status: z.enum(CAMPAIGN_STATUSES).optional(),
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
  body: z.string().max(20000).nullable().optional(),
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
        })
      ),
      aiReplyEnabled: z.boolean().optional(),
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
