import { z } from 'zod';

import { OUTREACH_PLAN_STATUSES, START_SCHEDULE_MODES, WAIT_UNITS } from './outreach-plan.model.js';
import { WHATSAPP_WAIT_UNITS } from './whatsapp-plan.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'sendTime must be in HH:mm 24-hour format');

/* ------------------------------------------------------------------ */
/* Email outreach plans                                                 */
/* ------------------------------------------------------------------ */

const emailTouchpointSchema = z.object({
  id: z.string().min(1).max(64),
  order: z.number().int().min(0),
  label: z.string().trim().min(1).max(160),
  subject: z.string().trim().max(300).nullable().optional(),
  body: z.string().trim().min(1).max(20000),
  waitDays: z.number().min(0).max(365).default(0),
  waitHours: z.number().min(0).max(23).default(0),
  waitMinutes: z.number().min(0).max(59).default(0),
  waitUnit: z.enum(WAIT_UNITS).default('days'),
  sendTime: timeOfDaySchema.nullable().optional(),
  timezone: z.string().trim().max(64).nullable().optional(),
  stopOnReply: z.boolean().optional(),
  active: z.boolean().optional(),
});

const startScheduleSchema = z.object({
  mode: z.enum(START_SCHEDULE_MODES).default('immediate'),
  scheduledAt: z.coerce.date().nullable().optional(),
  sendTime: timeOfDaySchema.nullable().optional(),
  timezone: z.string().trim().max(64).nullable().optional(),
});

const calendlyAutomationSchema = z.object({
  enabled: z.boolean().default(false),
  schedulingUrl: z.string().trim().max(500).nullable().optional(),
  meetingUri: z.string().trim().max(500).nullable().optional(),
  sendAfterQualification: z.boolean().optional(),
  messageTemplate: z.string().trim().max(20000).nullable().optional(),
});

export const listOutreachPlansQuerySchema = z.object({
  status: z.enum(OUTREACH_PLAN_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const createOutreachPlanSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  touchpoints: z.array(emailTouchpointSchema).min(1).max(40),
  startSchedule: startScheduleSchema.optional(),
  calendlyAutomation: calendlyAutomationSchema.optional(),
  status: z.enum(OUTREACH_PLAN_STATUSES).optional(),
});

export const updateOutreachPlanSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  touchpoints: z.array(emailTouchpointSchema).min(1).max(40).optional(),
  startSchedule: startScheduleSchema.optional(),
  calendlyAutomation: calendlyAutomationSchema.optional(),
  status: z.enum(OUTREACH_PLAN_STATUSES).optional(),
});

/* ------------------------------------------------------------------ */
/* WhatsApp outreach plans                                              */
/* ------------------------------------------------------------------ */

const whatsappTouchpointSchema = z.object({
  id: z.string().min(1).max(64),
  order: z.number().int().min(0),
  label: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(4096),
  waitHours: z.number().min(0).max(23).default(0),
  waitMinutes: z.number().min(0).max(59).default(0),
  waitUnit: z.enum(WHATSAPP_WAIT_UNITS).default('hours'),
  templateId: z.string().trim().min(1).max(120),
  templateVariables: z.record(z.string(), z.string()).default({}),
  isNoReplyFallback: z.boolean().optional(),
  isReplyFollowUp: z.boolean().optional(),
  required: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const listWhatsAppPlansQuerySchema = listOutreachPlansQuerySchema;

export const createWhatsAppPlanSchema = z.object({
  name: z.string().trim().min(1).max(160),
  jobDescription: z.string().trim().max(10000).nullable().optional(),
  touchpoints: z.array(whatsappTouchpointSchema).min(1).max(40),
  calendlyAutomation: calendlyAutomationSchema.optional(),
  status: z.enum(OUTREACH_PLAN_STATUSES).optional(),
});

export const updateWhatsAppPlanSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  jobDescription: z.string().trim().max(10000).nullable().optional(),
  touchpoints: z.array(whatsappTouchpointSchema).min(1).max(40).optional(),
  calendlyAutomation: calendlyAutomationSchema.optional(),
  status: z.enum(OUTREACH_PLAN_STATUSES).optional(),
});

export const planIdParamSchema = z.object({
  id: objectId,
});
