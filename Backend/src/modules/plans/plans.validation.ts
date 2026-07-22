import { z } from 'zod';

import { USAGE_METRICS } from '../../shared/usage/metrics.js';
import { BILLING_CYCLES } from './pricing-plan.model.js';

export const listUsageHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  metric: z.enum(USAGE_METRICS).optional(),
});

export const createPlanSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_-]+$/i, 'code must be alphanumeric'),
  description: z.string().trim().max(2000).nullable().optional(),
  billingCycles: z.array(z.enum(BILLING_CYCLES)).min(1).optional(),
  prices: z
    .object({
      monthly: z.number().min(0).nullable().optional(),
      yearly: z.number().min(0).nullable().optional(),
    })
    .optional(),
  usdPrices: z
    .object({
      monthly: z.number().min(0).nullable().optional(),
      yearly: z.number().min(0).nullable().optional(),
    })
    .optional(),
  currency: z.enum(['INR', 'USD']).optional(),
  featureAccess: z.record(z.boolean()).optional(),
  limits: z.record(z.union([z.number(), z.boolean()])).optional(),
  public: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
  isDefaultSignup: z.boolean().optional(),
  isTrialPlan: z.boolean().optional(),
  trialDays: z.number().int().min(1).max(365).optional(),
});

export const updatePlanSchema = createPlanSchema.partial().omit({ code: true });

export const updatePlanStatusSchema = z.object({
  active: z.boolean(),
});

export const setDefaultSignupPlanSchema = z.object({
  planId: z.string().trim().min(1).optional(),
});
