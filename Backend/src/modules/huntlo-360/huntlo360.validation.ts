import { z } from 'zod';

import { WORKFLOW_STATUSES } from './workflow.model.js';
import { EXCEPTION_CODES, WORKFLOW_STAGES } from './candidate-state.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const listWorkflowsQuerySchema = z.object({
  status: z.enum(WORKFLOW_STATUSES).optional(),
  jobId: objectId.optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const workflowIdParamSchema = z.object({
  id: objectId,
});

export const createWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(200),
  jobId: objectId.nullable().optional(),
  candidateSource: z
    .object({
      type: z.string().optional(),
      listId: z.string().nullable().optional(),
      candidateIds: z.array(objectId).optional(),
      label: z.string().nullable().optional(),
    })
    .optional(),
  outreachConfig: z
    .object({
      emailEnabled: z.boolean().optional(),
      whatsappEnabled: z.boolean().optional(),
      channelOrder: z.enum(['email_first', 'whatsapp_first']).optional(),
      openingMessage: z.string().max(20000).nullable().optional(),
      followUps: z.array(z.string().max(20000)).max(10).optional(),
      stopOnReply: z.boolean().optional(),
      stopOnOptOut: z.boolean().optional(),
    })
    .optional(),
  qualificationConfig: z
    .object({
      enabled: z.boolean().optional(),
      interestClassification: z.boolean().optional(),
      questions: z
        .array(
          z.object({
            id: z.string(),
            prompt: z.string().min(1).max(1000),
            answerType: z.string().min(1).max(40),
            knockout: z.boolean().optional(),
          })
        )
        .optional(),
      aiReplyEnabled: z.boolean().optional(),
      handoffCondition: z.string().nullable().optional(),
      autoShortlist: z.string().nullable().optional(),
    })
    .optional(),
  screeningConfig: z
    .object({
      enabled: z.boolean().optional(),
      language: z.string().nullable().optional(),
      voiceTone: z.string().nullable().optional(),
      questions: z.array(z.string()).optional(),
      evaluationFields: z.array(z.string()).optional(),
      attempts: z.number().int().min(1).max(10).optional(),
      attemptIntervalHours: z.number().int().min(1).max(168).optional(),
      minScore: z.number().min(0).max(100).optional(),
      autoReject: z.boolean().optional(),
      onPass: z.enum(['recruiter_review', 'scheduling']).optional(),
      onFail: z.enum(['stop', 'recruiter_review']).optional(),
    })
    .optional(),
  assessmentConfig: z
    .object({
      enabled: z.boolean().optional(),
      templateId: objectId.nullable().optional(),
      channel: z.enum(['email', 'whatsapp']).optional(),
      expiryHours: z.number().int().min(1).max(720).optional(),
      onPass: z.enum(['recruiter_review', 'scheduling']).optional(),
      onFail: z.enum(['stop', 'recruiter_review']).optional(),
    })
    .optional(),
  schedulingConfig: z
    .object({
      enabled: z.boolean().optional(),
      provider: z.string().nullable().optional(),
      eventTypeUri: z.string().nullable().optional(),
      channel: z.enum(['email', 'whatsapp']).optional(),
      messageTemplateId: z.string().nullable().optional(),
      reminders: z.string().nullable().optional(),
      autoSendAfterQualification: z.boolean().optional(),
      autoSendAfterScreening: z.boolean().optional(),
      bookingExpiryHours: z.number().int().min(1).max(720).optional(),
    })
    .optional(),
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

export const transitionBodySchema = z.object({
  candidateId: objectId,
  event: z.enum([
    'positive_reply',
    'opt_out',
    'qualification_pass',
    'qualification_fail',
    'qualification_incomplete',
    'screening_pass',
    'screening_fail',
    'screening_unanswered',
    'assessment_pass',
    'assessment_fail',
    'recruiter_approve',
    'recruiter_reject',
    'recruiter_override_stage',
    'scheduling_booked',
    'scheduling_expired',
    'outreach_failed',
    'quota_exhausted',
    'missing_contact',
    'provider_disconnected',
  ]),
  idempotencyKey: z.string().trim().min(8).max(120),
  toStage: z.enum(WORKFLOW_STAGES).optional(),
  interestStatus: z.string().optional(),
  qualificationStatus: z.string().optional(),
  screeningScore: z.number().optional(),
  exceptionCode: z.enum(EXCEPTION_CODES).optional(),
  exceptionDetail: z.string().max(1000).optional(),
  recruiterDecision: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const listCandidatesQuerySchema = z.object({
  stage: z.enum(WORKFLOW_STAGES).optional(),
  exceptionOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
