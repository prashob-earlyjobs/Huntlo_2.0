import { z } from 'zod';

import { TEMPLATE_STATUSES } from './assessment-template.model.js';
import { CAMPAIGN_STATUSES } from './assessment-campaign.model.js';
import { RECRUITER_DECISIONS } from './assessment-candidate.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const sectionSchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  questionCount: z.number().int().min(0).max(200).optional(),
  durationMinutes: z.number().int().min(1).max(480).nullable().optional(),
});

export const listTemplatesQuerySchema = z.object({
  status: z.enum(TEMPLATE_STATUSES).optional(),
  jobId: objectId.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const templateIdParamSchema = z.object({ id: objectId });

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  jobId: objectId.nullable().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  durationMinutes: z.number().int().min(1).max(480).optional(),
  sections: z.array(sectionSchema).max(30).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  instructions: z.string().max(20000).nullable().optional(),
  status: z.enum(TEMPLATE_STATUSES).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const listCampaignsQuerySchema = z.object({
  status: z.enum(CAMPAIGN_STATUSES).optional(),
  templateId: objectId.optional(),
  jobId: objectId.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const campaignIdParamSchema = z.object({ id: objectId });

export const createCampaignSchema = z.object({
  templateId: objectId,
  name: z.string().trim().min(1).max(200).optional(),
  jobId: objectId.nullable().optional(),
  workflowId: objectId.nullable().optional(),
  sourceModule: z.string().max(40).optional(),
  candidateIds: z.array(objectId).max(500).optional(),
  invitationConfig: z
    .object({
      channel: z.enum(['email', 'whatsapp']).optional(),
      subject: z.string().max(200).nullable().optional(),
      message: z.string().max(5000).nullable().optional(),
      sendImmediately: z.boolean().optional(),
    })
    .optional(),
  reminderConfig: z
    .object({
      enabled: z.boolean().optional(),
      intervalsHours: z.array(z.number().int().min(1).max(720)).max(5).optional(),
      maxReminders: z.number().int().min(0).max(10).optional(),
      channel: z.enum(['email', 'whatsapp']).nullable().optional(),
    })
    .optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  /** Hours from launch until expiry when expiresAt not set. */
  expiryHours: z.number().int().min(1).max(720).optional(),
});

export const listResultsQuerySchema = z.object({
  campaignId: objectId.optional(),
  jobId: objectId.optional(),
  templateId: objectId.optional(),
  candidateId: objectId.optional(),
  decision: z.enum(RECRUITER_DECISIONS).optional(),
  invitationStatus: z.string().optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const resultIdParamSchema = z.object({ id: objectId });
