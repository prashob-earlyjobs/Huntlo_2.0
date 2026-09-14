import { describe, expect, it } from 'vitest';

import { AppError } from '../src/shared/errors/app-error.js';
import { computeCouponDiscount } from '../src/modules/billing/coupon.service.js';

describe('computeCouponDiscount', () => {
  it('applies percent discount and rounds to minor units', () => {
    const result = computeCouponDiscount({
      coupon: { discountType: 'percent', discountValue: 10, currency: null },
      amountMinor: 2_499_900,
      currency: 'INR',
    });
    expect(result.discountAmount).toBe(249_990);
    expect(result.finalAmount).toBe(2_249_910);
  });

  it('caps percent at 100% (free checkout)', () => {
    const result = computeCouponDiscount({
      coupon: { discountType: 'percent', discountValue: 100, currency: null },
      amountMinor: 999_00,
      currency: 'INR',
    });
    expect(result.discountAmount).toBe(999_00);
    expect(result.finalAmount).toBe(0);
  });

  it('applies fixed discount in major currency units', () => {
    const result = computeCouponDiscount({
      coupon: { discountType: 'fixed', discountValue: 5000, currency: 'INR' },
      amountMinor: 24_999_00,
      currency: 'INR',
    });
    expect(result.discountAmount).toBe(5000_00);
    expect(result.finalAmount).toBe(19_999_00);
  });

  it('never discounts below zero for fixed coupons', () => {
    const result = computeCouponDiscount({
      coupon: { discountType: 'fixed', discountValue: 50_000, currency: 'INR' },
      amountMinor: 10_000_00,
      currency: 'INR',
    });
    expect(result.discountAmount).toBe(10_000_00);
    expect(result.finalAmount).toBe(0);
  });

  it('rejects fixed coupon currency mismatch', () => {
    expect(() =>
      computeCouponDiscount({
        coupon: { discountType: 'fixed', discountValue: 10, currency: 'USD' },
        amountMinor: 100_00,
        currency: 'INR',
      })
    ).toThrow(AppError);
  });

  it('returns zeros for non-positive amounts', () => {
    expect(
      computeCouponDiscount({
        coupon: { discountType: 'percent', discountValue: 50, currency: null },
        amountMinor: 0,
        currency: 'INR',
      })
    ).toEqual({ discountAmount: 0, finalAmount: 0 });
  });
});
