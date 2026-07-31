import { z } from 'zod';

import { UTM_EVENT_TYPES } from './utm-event.model.js';

const optionalUtm = z
  .string()
  .trim()
  .max(160)
  .nullish()
  .transform((value) => value || null);

export const utmAttributionFieldsSchema = z.object({
  sessionId: z.string().trim().max(120).nullish().transform((v) => v || null),
  visitorId: z.string().trim().max(120).nullish().transform((v) => v || null),
  utmSource: optionalUtm,
  utmMedium: optionalUtm,
  utmCampaign: optionalUtm,
  utmContent: optionalUtm,
  utmTerm: optionalUtm,
  landingPage: z.string().trim().max(500).nullish().transform((v) => v || null),
  referrer: z.string().trim().max(1000).nullish().transform((v) => v || null),
});

export const recordUtmVisitSchema = utmAttributionFieldsSchema.extend({
  sessionId: z.string().trim().min(8).max(120),
});

export const recordUtmEventSchema = utmAttributionFieldsSchema.extend({
  eventType: z.enum(UTM_EVENT_TYPES),
  meta: z.record(z.string(), z.unknown()).nullish().transform((v) => v || null),
});

export const attributedVisitsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

const requiredUtmSource = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .transform((value) => value.trim());

const requiredUtmMedium = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .transform((value) => value.trim());

const requiredUtmCampaign = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .transform((value) => value.trim());

const landingPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .transform((value) => {
    const path = value.trim() || '/';
    return path.startsWith('/') ? path : `/${path}`;
  })
  .refine((value) => !value.includes('://') && !value.includes('?'), {
    message: 'landingPath must be a path only (no host or query string)',
  });

export const createUtmCampaignSchema = z.object({
  name: z.string().trim().min(1).max(160),
  utmSource: requiredUtmSource,
  utmMedium: requiredUtmMedium,
  utmCampaign: requiredUtmCampaign,
  utmContent: optionalUtm,
  utmTerm: optionalUtm,
  landingPath: landingPathSchema.default('/'),
  notes: z
    .string()
    .trim()
    .max(2000)
    .nullish()
    .transform((value) => value || null),
});

export const updateUtmCampaignSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    utmSource: requiredUtmSource.optional(),
    utmMedium: requiredUtmMedium.optional(),
    utmCampaign: requiredUtmCampaign.optional(),
    utmContent: z
      .string()
      .trim()
      .max(160)
      .nullish()
      .transform((value) => value || null)
      .optional(),
    utmTerm: z
      .string()
      .trim()
      .max(160)
      .nullish()
      .transform((value) => value || null)
      .optional(),
    landingPath: landingPathSchema.optional(),
    notes: z
      .string()
      .trim()
      .max(2000)
      .nullish()
      .transform((value) => value || null)
      .optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const listUtmCampaignsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
  status: z.enum(['active', 'archived', 'all']).default('active'),
});

export type UtmAttributionFields = z.infer<typeof utmAttributionFieldsSchema>;
export type CreateUtmCampaignInput = z.infer<typeof createUtmCampaignSchema>;
export type UpdateUtmCampaignInput = z.infer<typeof updateUtmCampaignSchema>;
