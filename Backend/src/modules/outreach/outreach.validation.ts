import { z } from 'zod';

import {
  OUTREACH_CHANNELS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_SCOPES,
  TEMPLATE_STATUSES,
} from './outreach-template.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const listTemplatesQuerySchema = z.object({
  channel: z.enum(OUTREACH_CHANNELS).optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  status: z.enum(TEMPLATE_STATUSES).optional(),
  scope: z.enum(TEMPLATE_SCOPES).optional(),
  q: z.string().trim().max(120).optional(),
  archived: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (typeof v === 'boolean') return v;
      return v === 'true';
    }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  channel: z.enum(OUTREACH_CHANNELS),
  category: z.enum(TEMPLATE_CATEGORIES),
  subject: z.string().trim().max(300).nullable().optional(),
  body: z.string().trim().min(1).max(20000),
  language: z.string().trim().max(16).optional(),
  scope: z.enum(TEMPLATE_SCOPES).optional(),
  status: z.enum(['draft', 'active']).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  status: z.enum(TEMPLATE_STATUSES).optional(),
});

export const previewTemplateSchema = z.object({
  sampleValues: z.record(z.string(), z.string()).optional(),
  subject: z.string().max(300).optional(),
  body: z.string().max(20000).optional(),
});

export const listSequenceTemplatesQuerySchema = z.object({
  status: z.enum(TEMPLATE_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const sequenceStepSchema = z.object({
  id: z.string().min(1).max(64),
  order: z.number().int().min(0),
  type: z.string().min(1).max(80),
  channel: z
    .enum([...OUTREACH_CHANNELS, 'wait', 'branch', 'task'] as const)
    .nullable()
    .optional(),
  delayDays: z.number().min(0).default(0),
  delayUnit: z.enum(['days', 'hours', 'minutes']).default('days'),
  templateId: z.string().nullable().optional(),
  subject: z.string().max(300).nullable().optional(),
  body: z.string().max(20000).nullable().optional(),
  stopOnReply: z.boolean().optional(),
  note: z.string().max(2000).nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const createSequenceTemplateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  channels: z.array(z.enum(OUTREACH_CHANNELS)).default([]),
  steps: z.array(sequenceStepSchema).min(1).max(40),
  qualificationConfig: z
    .object({
      enabled: z.boolean(),
      questions: z.array(
        z.object({
          id: z.string(),
          title: z.string().max(120).nullable().optional(),
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
  status: z.enum(['draft', 'active']).optional(),
});

export const updateSequenceTemplateSchema = createSequenceTemplateSchema.partial().extend({
  status: z.enum(TEMPLATE_STATUSES).optional(),
});

export const generateOutreachSchema = z.object({
  mode: z.enum(['sequence', 'qualification_questions']).default('sequence'),
  jobId: objectId.optional(),
  jobTitle: z.string().trim().max(120).optional(),
  jobDescription: z.string().trim().max(10000).optional(),
  objective: z.string().trim().max(500).optional(),
  companyName: z.string().trim().max(120).optional(),
  channels: z.array(z.enum(OUTREACH_CHANNELS)).optional(),
  instructions: z.string().trim().max(500).optional(),
  /** If true, persist as draft templates/sequence. Default false — return draft only. */
  saveAsDraft: z.boolean().optional(),
});

export const rewriteOutreachSchema = z.object({
  action: z.enum(['rewrite', 'change_tone', 'shorten', 'personalize']).default('rewrite'),
  body: z.string().trim().min(1).max(20000),
  subject: z.string().trim().max(300).nullable().optional(),
  tone: z.string().trim().max(40).optional(),
  channel: z.enum(OUTREACH_CHANNELS).optional(),
  category: z.enum(TEMPLATE_CATEGORIES).optional(),
  instructions: z.string().trim().max(500).optional(),
  saveAsDraft: z.boolean().optional(),
});

export const validateVariablesSchema = z.object({
  subject: z.string().max(300).nullable().optional(),
  body: z.string().max(20000).optional(),
  sampleValues: z.record(z.string(), z.string()).optional(),
  recommended: z.array(z.string()).optional(),
});

export const idParamSchema = z.object({
  id: objectId,
});
