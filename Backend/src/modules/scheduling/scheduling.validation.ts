import { z } from 'zod';

import {
  BOOKING_STATUSES,
  INTERVIEW_STATUSES,
  SCHEDULING_METHODS,
} from './interview.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const listInterviewsQuerySchema = z.object({
  status: z.enum(INTERVIEW_STATUSES).optional(),
  jobId: objectId.optional(),
  candidateId: objectId.optional(),
  campaignId: objectId.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const interviewIdParamSchema = z.object({ id: objectId });

export const createInterviewSchema = z.object({
  candidateId: objectId.nullable().optional(),
  jobId: objectId.nullable().optional(),
  interviewType: z.string().trim().min(1).max(120).optional(),
  round: z.string().trim().max(80).nullable().optional(),
  interviewerIds: z.array(z.string().min(1).max(80)).max(20).optional(),
  schedulingMethod: z.enum(SCHEDULING_METHODS).optional(),
  provider: z.string().max(40).nullable().optional(),
  providerEventTypeId: z.string().max(500).nullable().optional(),
  schedulingUrl: z.string().url().nullable().optional(),
  startAt: z.string().datetime().nullable().optional(),
  endAt: z.string().datetime().nullable().optional(),
  timezone: z.string().max(80).optional(),
  location: z.string().max(500).nullable().optional(),
  meetingUrl: z.string().max(1000).nullable().optional(),
  instructions: z.string().max(10000).nullable().optional(),
  sourceModule: z.string().max(40).optional(),
  campaignId: objectId.nullable().optional(),
  screeningId: objectId.nullable().optional(),
  workflowId: objectId.nullable().optional(),
  inviteChannel: z.enum(['email', 'whatsapp']).nullable().optional(),
  linkExpiryHours: z.number().int().min(1).max(720).optional(),
  inviteeEmail: z.string().email().nullable().optional(),
  inviteeName: z.string().max(200).nullable().optional(),
  sendLink: z.boolean().optional(),
});

export const updateInterviewSchema = createInterviewSchema.partial().extend({
  status: z.enum(INTERVIEW_STATUSES).optional(),
  bookingStatus: z.enum(BOOKING_STATUSES).optional(),
});

export const sendLinkBodySchema = z.object({
  channel: z.enum(['email', 'whatsapp']).optional(),
  message: z.string().max(5000).nullable().optional(),
});

export const rescheduleBodySchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  timezone: z.string().max(80).optional(),
  location: z.string().max(500).nullable().optional(),
  meetingUrl: z.string().max(1000).nullable().optional(),
  reason: z.string().max(1000).nullable().optional(),
});

export const calendarQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  interviewerId: z.string().optional(),
});

export const putAvailabilitySchema = z.object({
  timezone: z.string().max(80).optional(),
  weeklyHours: z
    .array(
      z.object({
        day: z.string(),
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
      })
    )
    .optional(),
  dateOverrides: z
    .array(
      z.object({
        date: z.string(),
        enabled: z.boolean(),
        start: z.string().nullable().optional(),
        end: z.string().nullable().optional(),
        label: z.string().nullable().optional(),
      })
    )
    .optional(),
  unavailableDates: z.array(z.string()).optional(),
  bufferBefore: z.number().int().min(0).max(240).optional(),
  bufferAfter: z.number().int().min(0).max(240).optional(),
  minimumNotice: z.number().int().min(0).max(720).optional(),
  maximumBookingWindow: z.number().int().min(1).max(365).optional(),
  dailyLimit: z.number().int().min(1).max(50).optional(),
});

export const syncBodySchema = z.object({
  eventTypeUri: z.string().max(500).optional(),
  minStartTime: z.string().datetime().optional(),
});
