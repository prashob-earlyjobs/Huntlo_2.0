import { z } from 'zod';

import {
  DENSITY_PREFERENCES,
  NOTIFICATION_EVENT_IDS,
  THEME_PREFERENCES,
} from './user-preference.model.js';

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  timezone: z.string().trim().max(80).optional(),
  locale: z.string().trim().max(20).optional(),
  profileImage: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

const channelSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
  whatsapp: z.boolean(),
});

export const updatePreferencesSchema = z
  .object({
    theme: z.enum(THEME_PREFERENCES).optional(),
    density: z.enum(DENSITY_PREFERENCES).optional(),
    timezone: z.string().trim().max(80).optional(),
    locale: z.string().trim().max(20).optional(),
    dateFormat: z.string().trim().max(40).optional(),
    notificationPreferences: z
      .record(z.enum(NOTIFICATION_EVENT_IDS), channelSchema)
      .optional(),
    appearance: z
      .object({
        theme: z.enum(THEME_PREFERENCES).optional(),
        density: z.enum(DENSITY_PREFERENCES).optional(),
      })
      .optional(),
  })
  .strict();

export const revokeSessionsSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  exceptCurrent: z.boolean().optional().default(true),
});

const recruitingSchema = z
  .object({
    defaultCandidateStatus: z.string().trim().max(80).optional(),
    defaultRecruiter: z.string().trim().max(120).optional(),
    defaultTalentList: z.string().trim().max(160).optional(),
    defaultJobLocation: z.string().trim().max(160).optional(),
  })
  .strict();

const outreachSchema = z
  .object({
    defaultSender: z.string().trim().max(200).optional(),
    sendWindowStart: z.string().trim().max(8).optional(),
    sendWindowEnd: z.string().trim().max(8).optional(),
    timezoneHandling: z.string().trim().max(80).optional(),
    replyStopBehaviour: z.string().trim().max(120).optional(),
    optOutFooter: z.string().trim().max(500).optional(),
  })
  .strict();

const screeningSchema = z
  .object({
    language: z.string().trim().max(80).optional(),
    voiceTone: z.string().trim().max(80).optional(),
    attempts: z.string().trim().max(8).optional(),
    attemptInterval: z.string().trim().max(40).optional(),
    minimumShortlistScore: z.string().trim().max(8).optional(),
  })
  .strict();

const schedulingSchema = z
  .object({
    defaultCalendlyEvent: z.string().trim().max(160).optional(),
    reminderTimings: z.string().trim().max(80).optional(),
    interviewDuration: z.string().trim().max(40).optional(),
    bufferTime: z.string().trim().max(40).optional(),
  })
  .strict();

const consentSchema = z
  .object({
    email: z.boolean().optional(),
    whatsapp: z.boolean().optional(),
    voice: z.boolean().optional(),
    dataSharing: z.boolean().optional(),
  })
  .strict();

const workspaceIdentitySchema = z
  .object({
    organisationName: z.string().trim().min(1).max(120).optional(),
    industry: z.string().trim().max(120).nullable().optional(),
    website: z.string().trim().max(300).nullable().optional(),
    companySize: z.string().trim().max(80).nullable().optional(),
    defaultTimezone: z.string().trim().max(80).optional(),
    dateFormat: z.string().trim().max(40).optional(),
    defaultCurrency: z.string().trim().max(40).optional(),
  })
  .strict();

export const updateSettingsSchema = z
  .object({
    workspace: workspaceIdentitySchema.optional(),
    recruitingDefaults: recruitingSchema.optional(),
    outreachDefaults: outreachSchema.optional(),
    screeningDefaults: screeningSchema.optional(),
    schedulingDefaults: schedulingSchema.optional(),
    candidateRetentionDays: z.number().int().min(0).max(3650).nullable().optional(),
    /** Human-readable retention label from the UI; mapped to days when provided. */
    candidateRetention: z.string().trim().max(80).optional(),
    consentSettings: consentSchema.optional(),
    /** FE privacy section shape */
    privacy: z
      .object({
        candidateRetention: z.string().trim().max(80).optional(),
        consentEmail: z.boolean().optional(),
        consentWhatsapp: z.boolean().optional(),
        consentVoice: z.boolean().optional(),
        consentDataSharing: z.boolean().optional(),
      })
      .strict()
      .optional(),
    featureFlags: z.record(z.string(), z.unknown()).optional(),
    /** Required when changing consent or retention. */
    currentPassword: z.string().min(1).max(128).optional(),
  })
  .strict();

export const auditLogsQuerySchema = z.object({
  module: z.string().trim().max(80).optional(),
  action: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
