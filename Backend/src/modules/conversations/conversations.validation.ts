import { z } from 'zod';

import {
  INTEREST_LABELS,
  INTENT_LABELS,
} from './reply-classification.model.js';
import {
  CONVERSATION_CHANNELS,
  QUALIFICATION_STATUSES,
  THREAD_STATUSES,
} from './conversation-thread.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const listConversationsQuerySchema = z.object({
  channel: z.enum(CONVERSATION_CHANNELS).optional(),
  status: z.enum(THREAD_STATUSES).optional(),
  qualificationStatus: z.enum(QUALIFICATION_STATUSES).optional(),
  campaignId: objectId.optional(),
  candidateId: objectId.optional(),
  jobId: objectId.optional(),
  assignedUserId: objectId.optional(),
  unreadOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const conversationIdParamSchema = z.object({
  id: objectId,
});

export const replyBodySchema = z.object({
  text: z.string().trim().min(1).max(20000),
  html: z.string().max(100000).optional(),
  subject: z.string().trim().max(500).optional(),
  channel: z.enum(['email', 'whatsapp', 'ai_voice']).optional(),
});

export const noteBodySchema = z.object({
  text: z.string().trim().min(1).max(10000),
});

export const assignBodySchema = z.object({
  assignedUserId: objectId.nullable(),
});

export const aiDraftBodySchema = z.object({
  tone: z.enum(['Friendly', 'Professional', 'Direct', 'friendly', 'professional', 'direct']).optional(),
  channel: z.enum(['email', 'whatsapp']).optional(),
  instructions: z.string().trim().max(2000).optional(),
});

export const classifyBodySchema = z.object({
  messageId: objectId.optional(),
  override: z
    .object({
      interest: z.enum(INTEREST_LABELS).optional(),
      intent: z.enum(INTENT_LABELS).optional(),
      qualificationStatus: z.enum(QUALIFICATION_STATUSES).optional(),
      note: z.string().trim().max(2000).optional(),
    })
    .optional(),
});

export const qualificationAnswerBodySchema = z.object({
  questionId: z.string().min(1).max(64),
  answer: z.union([z.string(), z.number(), z.boolean()]),
  source: z.enum(['recruiter', 'candidate', 'ai']).default('recruiter'),
});

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});
