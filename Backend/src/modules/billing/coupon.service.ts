import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import {
  BillingCouponModel,
  type BillingCouponDocument,
  type CouponDiscountType,
} from './coupon.model.js';
import { CouponRedemptionModel } from './coupon-redemption.model.js';
import type { PaymentOrderDocument } from './payment-order.model.js';

export type AppliedCoupon = {
  couponId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: 'INR' | 'USD';
  description: string | null;
};

function normalizeCode(code: string): string {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function computeCouponDiscount(input: {
  coupon: Pick<BillingCouponDocument, 'discountType' | 'discountValue' | 'currency'>;
  amountMinor: number;
  currency: 'INR' | 'USD';
}): { discountAmount: number; finalAmount: number } {
  const amount = Math.max(0, Math.round(input.amountMinor));
  if (amount <= 0) return { discountAmount: 0, finalAmount: 0 };

  if (input.coupon.discountType === 'percent') {
    const pct = Math.min(100, Math.max(0, Number(input.coupon.discountValue) || 0));
    const discountAmount = Math.min(amount, Math.round((amount * pct) / 100));
    return { discountAmount, finalAmount: Math.max(0, amount - discountAmount) };
  }

  const couponCurrency = input.coupon.currency;
  if (couponCurrency && couponCurrency !== input.currency) {
    throw AppError.badRequest(
      `Coupon is only valid for ${couponCurrency} checkout.`
    );
  }
  const fixedMajor = Math.max(0, Number(input.coupon.discountValue) || 0);
  const discountAmount = Math.min(amount, Math.round(fixedMajor * 100));
  return { discountAmount, finalAmount: Math.max(0, amount - discountAmount) };
}

export function toPublicCoupon(coupon: BillingCouponDocument) {
  return {
    id: coupon._id.toHexString(),
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    currency: coupon.currency,
    planCodes: coupon.planCodes || [],
    maxRedemptions: coupon.maxRedemptions,
    maxPerOrganization: coupon.maxPerOrganization,
    appliedCount: coupon.appliedCount || 0,
    redemptionCount: coupon.redemptionCount || 0,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    active: coupon.active,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  };
}

async function countOrgRedemptions(couponId: mongoose.Types.ObjectId, organizationId: string) {
  return CouponRedemptionModel.countDocuments({
    couponId,
    organizationId,
    status: { $in: ['pending', 'redeemed'] },
  });
}

export async function validateCouponForCheckout(input: {
  code: string;
  organizationId: string;
  planCode: string;
  amountMinor: number;
  currency: 'INR' | 'USD';
}): Promise<AppliedCoupon> {
  const code = normalizeCode(input.code);
  if (!code) throw AppError.badRequest('Enter a coupon code');

  const coupon = await BillingCouponModel.findOne({ code });
  if (!coupon || !coupon.active) {
    throw AppError.badRequest('Invalid or inactive coupon code');
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw AppError.badRequest('This coupon is not active yet');
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw AppError.badRequest('This coupon has expired');
  }

  const planCodes = (coupon.planCodes || []).map((c) => c.toLowerCase());
  if (planCodes.length > 0 && !planCodes.includes(input.planCode.toLowerCase())) {
    throw AppError.badRequest('This coupon does not apply to the selected plan');
  }

  if (
    coupon.maxRedemptions != null &&
    (coupon.redemptionCount || 0) >= coupon.maxRedemptions
  ) {
    throw AppError.badRequest('This coupon has reached its usage limit');
  }

  const orgUsed = await countOrgRedemptions(coupon._id, input.organizationId);
  if (orgUsed >= (coupon.maxPerOrganization || 1)) {
    throw AppError.badRequest('Your workspace has already used this coupon');
  }

  if (input.currency === 'USD') {
    // Dodo checkout uses fixed product prices; discounted amounts are Razorpay-only.
    throw AppError.badRequest(
      'Coupon codes are only supported for INR (Razorpay) checkout.'
    );
  }

  const { discountAmount, finalAmount } = computeCouponDiscount({
    coupon,
    amountMinor: input.amountMinor,
    currency: input.currency,
  });
  if (discountAmount <= 0) {
    throw AppError.badRequest('Coupon does not change the checkout amount');
  }

  return {
    couponId: coupon._id.toHexString(),
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    originalAmount: input.amountMinor,
    discountAmount,
    finalAmount,
    currency: input.currency,
    description: coupon.description,
  };
}

/** Bump appliedCount when a user successfully Applies a coupon in the upgrade UI. */
export async function recordCouponApplied(couponId: string) {
  if (!mongoose.isValidObjectId(couponId)) return;
  await BillingCouponModel.updateOne(
    { _id: couponId },
    { $inc: { appliedCount: 1 } }
  );
}

export async function reserveCouponRedemption(input: {
  applied: AppliedCoupon;
  organizationId: string;
  userId: string;
  orderId: mongoose.Types.ObjectId;
}) {
  await CouponRedemptionModel.create({
    couponId: new mongoose.Types.ObjectId(input.applied.couponId),
    code: input.applied.code,
    organizationId: input.organizationId,
    userId: input.userId,
    orderId: input.orderId,
    currency: input.applied.currency,
    originalAmount: input.applied.originalAmount,
    discountAmount: input.applied.discountAmount,
    finalAmount: input.applied.finalAmount,
    status: 'pending',
  });
}

/** Mark redemption redeemed and bump coupon usage — called inside fulfill transaction when possible. */
export async function finalizeCouponRedemptionForOrder(
  order: PaymentOrderDocument,
  session?: mongoose.ClientSession
) {
  const meta = (order.metadata || {}) as Record<string, unknown>;
  const couponId = typeof meta.couponId === 'string' ? meta.couponId : '';
  if (!couponId || !mongoose.isValidObjectId(couponId)) return;

  const redemption = session
    ? await CouponRedemptionModel.findOne({ orderId: order._id }).session(session)
    : await CouponRedemptionModel.findOne({ orderId: order._id });
  if (!redemption) return;
  if (redemption.status === 'redeemed') return;

  redemption.status = 'redeemed';
  redemption.redeemedAt = new Date();
  redemption.releasedAt = null;
  await redemption.save(session ? { session } : undefined);

  await BillingCouponModel.updateOne(
    { _id: couponId },
    { $inc: { redemptionCount: 1 } },
    session ? { session } : undefined
  );
}

export async function releaseCouponRedemptionForOrder(orderId: mongoose.Types.ObjectId) {
  const redemption = await CouponRedemptionModel.findOne({ orderId, status: 'pending' });
  if (!redemption) return;
  redemption.status = 'released';
  redemption.releasedAt = new Date();
  await redemption.save();
}

export class CouponAdminService {
  async list() {
    const rows = await BillingCouponModel.find({}).sort({ createdAt: -1 }).limit(200);
    return rows.map(toPublicCoupon);
  }

  async listRedemptions(couponId: string) {
    if (!mongoose.isValidObjectId(couponId)) {
      throw AppError.badRequest('Invalid coupon id');
    }
    const rows = await CouponRedemptionModel.find({ couponId })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return rows.map((row) => ({
      id: String(row._id),
      couponId: String(row.couponId),
      code: row.code,
      organizationId: String(row.organizationId),
      userId: String(row.userId),
      orderId: String(row.orderId),
      currency: row.currency,
      originalAmount: row.originalAmount,
      discountAmount: row.discountAmount,
      finalAmount: row.finalAmount,
      status: row.status,
      redeemedAt: row.redeemedAt?.toISOString?.() ?? null,
      createdAt: row.createdAt?.toISOString?.() ?? null,
    }));
  }

  async create(input: {
    code: string;
    description?: string | null;
    discountType: CouponDiscountType;
    discountValue: number;
    currency?: 'INR' | 'USD' | null;
    planCodes?: string[];
    maxRedemptions?: number | null;
    maxPerOrganization?: number;
    startsAt?: string | null;
    expiresAt?: string | null;
    active?: boolean;
    createdByUserId?: string | null;
  }) {
    const code = normalizeCode(input.code);
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      throw AppError.badRequest(
        'Coupon code must be 3–40 characters (letters, numbers, _ or -)'
      );
    }
    if (input.discountType === 'percent') {
      if (!(input.discountValue > 0 && input.discountValue <= 100)) {
        throw AppError.badRequest('Percent discount must be between 1 and 100');
      }
    } else if (!(input.discountValue > 0)) {
      throw AppError.badRequest('Fixed discount must be greater than 0');
    }
    if (input.discountType === 'fixed' && !input.currency) {
      throw AppError.badRequest('Fixed coupons require a currency (INR or USD)');
    }

    try {
      const created = await BillingCouponModel.create({
        code,
        description: input.description?.trim() || null,
        discountType: input.discountType,
        discountValue: input.discountValue,
        currency: input.discountType === 'fixed' ? input.currency || 'INR' : input.currency || null,
        planCodes: (input.planCodes || []).map((c) => c.trim().toLowerCase()).filter(Boolean),
        maxRedemptions: input.maxRedemptions ?? null,
        maxPerOrganization: input.maxPerOrganization ?? 1,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        active: input.active !== false,
        createdByUserId: input.createdByUserId || null,
      });
      return toPublicCoupon(created);
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        throw AppError.conflict('A coupon with this code already exists');
      }
      throw error;
    }
  }

  async update(
    id: string,
    input: Partial<{
      description: string | null;
      active: boolean;
      maxRedemptions: number | null;
      maxPerOrganization: number;
      planCodes: string[];
      startsAt: string | null;
      expiresAt: string | null;
    }>
  ) {
    if (!mongoose.isValidObjectId(id)) throw AppError.badRequest('Invalid coupon id');
    const coupon = await BillingCouponModel.findById(id);
    if (!coupon) throw AppError.notFound('Coupon not found');

    if (input.description !== undefined) {
      coupon.description = input.description?.trim() || null;
    }
    if (input.active !== undefined) coupon.active = input.active;
    if (input.maxRedemptions !== undefined) coupon.maxRedemptions = input.maxRedemptions;
    if (input.maxPerOrganization !== undefined) {
      coupon.maxPerOrganization = input.maxPerOrganization;
    }
    if (input.planCodes !== undefined) {
      coupon.planCodes = input.planCodes.map((c) => c.trim().toLowerCase()).filter(Boolean);
    }
    if (input.startsAt !== undefined) {
      coupon.startsAt = input.startsAt ? new Date(input.startsAt) : null;
    }
    if (input.expiresAt !== undefined) {
      coupon.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    }
    await coupon.save();
    return toPublicCoupon(coupon);
  }
}

export const couponAdminService = new CouponAdminService();
