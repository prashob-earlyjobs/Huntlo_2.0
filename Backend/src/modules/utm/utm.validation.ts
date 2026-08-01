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

const ymdSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

function inclusiveDaySpan(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00.000Z`).getTime();
  const end = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.round((end - start) / 86_400_000) + 1;
}

export const utmDateRangeQuerySchema = z
  .object({
    from: ymdSchema.optional(),
    to: ymdSchema.optional(),
    days: z.coerce.number().int().min(1).max(365).optional(),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.from) !== Boolean(value.to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'from and to must be provided together',
        path: value.from ? ['to'] : ['from'],
      });
      return;
    }
    if (value.from && value.to) {
      if (value.from > value.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'from must be on or before to',
          path: ['from'],
        });
        return;
      }
      const span = inclusiveDaySpan(value.from, value.to);
      if (span > 365) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date range cannot exceed 365 days',
          path: ['to'],
        });
      }
    }
  })
  .transform((value) => {
    if (value.from && value.to) {
      return { from: value.from, to: value.to } as const;
    }
    return { days: value.days ?? 30 } as const;
  });

export const attributedVisitsQuerySchema = utmDateRangeQuerySchema;

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

export const listUtmCampaignsQuerySchema = z
  .object({
    from: ymdSchema.optional(),
    to: ymdSchema.optional(),
    days: z.coerce.number().int().min(1).max(365).optional(),
    status: z.enum(['active', 'archived', 'all']).default('active'),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.from) !== Boolean(value.to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'from and to must be provided together',
        path: value.from ? ['to'] : ['from'],
      });
      return;
    }
    if (value.from && value.to) {
      if (value.from > value.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'from must be on or before to',
          path: ['from'],
        });
        return;
      }
      const span = inclusiveDaySpan(value.from, value.to);
      if (span > 365) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date range cannot exceed 365 days',
          path: ['to'],
        });
      }
    }
  })
  .transform((value) => {
    if (value.from && value.to) {
      return {
        from: value.from,
        to: value.to,
        status: value.status,
      } as const;
    }
    return {
      days: value.days ?? 30,
      status: value.status,
    } as const;
  });

export type UtmAttributionFields = z.infer<typeof utmAttributionFieldsSchema>;
export type UtmDateRangeQuery = z.infer<typeof utmDateRangeQuerySchema>;
export type CreateUtmCampaignInput = z.infer<typeof createUtmCampaignSchema>;
export type UpdateUtmCampaignInput = z.infer<typeof updateUtmCampaignSchema>;
