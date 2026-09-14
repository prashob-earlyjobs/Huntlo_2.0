import { z } from 'zod';

import { BILLING_CYCLES } from '../plans/pricing-plan.model.js';
import { PAYMENT_PROVIDERS } from './payment-order.model.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const checkoutBodySchema = z.object({
  planId: z.union([objectId, z.string().trim().min(1).max(40)]),
  billingCycle: z.enum(BILLING_CYCLES).default('monthly'),
  currency: z.enum(['INR', 'USD', 'inr', 'usd']).optional(),
  provider: z.enum(PAYMENT_PROVIDERS).optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  couponCode: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid coupon code')
    .optional(),
});

export const validateCouponBodySchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid coupon code'),
  planId: z.union([objectId, z.string().trim().min(1).max(40)]),
  billingCycle: z.enum(BILLING_CYCLES).default('monthly'),
  currency: z.enum(['INR', 'USD', 'inr', 'usd']).optional(),
});

export const createCouponBodySchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/i, 'Invalid coupon code'),
  description: z.string().trim().max(240).nullable().optional(),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().positive().max(1_000_000),
  currency: z.enum(['INR', 'USD']).nullable().optional(),
  planCodes: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  maxPerOrganization: z.number().int().min(1).max(100).optional(),
  startsAt: z.string().trim().min(1).nullable().optional(),
  expiresAt: z.string().trim().min(1).nullable().optional(),
  active: z.boolean().optional(),
});

export const updateCouponBodySchema = z.object({
  description: z.string().trim().max(240).nullable().optional(),
  active: z.boolean().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  maxPerOrganization: z.number().int().min(1).max(100).optional(),
  planCodes: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  startsAt: z.string().trim().min(1).nullable().optional(),
  expiresAt: z.string().trim().min(1).nullable().optional(),
});

export const orderIdParamSchema = z.object({ id: objectId });

export const razorpayVerifyBodySchema = z.object({
  razorpay_order_id: z.string().trim().min(1).optional(),
  razorpay_payment_id: z.string().trim().min(1).optional(),
  razorpay_signature: z.string().trim().min(1).optional(),
  razorpayOrderId: z.string().trim().min(1).optional(),
  razorpayPaymentId: z.string().trim().min(1).optional(),
  razorpaySignature: z.string().trim().min(1).optional(),
  orderId: objectId.optional(),
});

export const listHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
