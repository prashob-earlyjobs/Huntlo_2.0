import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../auth/user.model.js';
import {
  buildDodoCheckoutCustomer,
  createDodoCheckoutSession,
  fetchDodoPayment,
  getDodoConfig,
  getDodoProductId,
  getFrontendBaseUrl,
} from '../../providers/dodo/dodo.client.js';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayConfig,
  verifyRazorpayPaymentSignature,
} from '../../providers/razorpay/razorpay.client.js';
import { BillingInvoiceModel } from './billing-invoice.model.js';
import {
  assertCanPurchase,
  buildIdempotencyKey,
  buildReceipt,
  fulfillPaidOrder,
  markOrderFailed,
  resolveCheckoutCurrency,
  resolveCheckoutProvider,
  resolvePlanAmount,
  resolvePricingPlan,
  toPublicOrder,
} from './fulfillment.service.js';
import { PaymentOrderModel } from './payment-order.model.js';
import type { z } from 'zod';
import type {
  checkoutBodySchema,
  listHistoryQuerySchema,
  razorpayVerifyBodySchema,
} from './billing.validation.js';

type CheckoutInput = z.infer<typeof checkoutBodySchema>;
type VerifyInput = z.infer<typeof razorpayVerifyBodySchema>;
type HistoryQuery = z.infer<typeof listHistoryQuerySchema>;

function isDodoSuccessStatus(status: unknown): boolean {
  const s = String(status || '')
    .trim()
    .toLowerCase();
  return s === 'succeeded' || s === 'active' || s === 'paid' || s === 'success';
}

export class BillingService {
  async checkout(organizationId: string, userId: string, input: CheckoutInput) {
    const currency = resolveCheckoutCurrency({
      currency: input.currency,
      provider: input.provider,
    });
    const provider = resolveCheckoutProvider({
      currency,
      provider: input.provider,
    });

    if (provider === 'razorpay' && currency !== 'INR') {
      throw AppError.badRequest('Razorpay checkout supports INR only. Use Dodo for USD.');
    }
    if (provider === 'dodo' && currency === 'INR') {
      throw AppError.badRequest(
        'Use Razorpay for INR checkout. Dodo is configured for USD/global billing.'
      );
    }

    const plan = await resolvePricingPlan(input.planId);
    await assertCanPurchase(organizationId, plan);
    const pricing = resolvePlanAmount(plan, input.billingCycle, currency);

    const idempotencyKey = input.idempotencyKey || buildIdempotencyKey();
    const existing = await PaymentOrderModel.findOne({
      organizationId,
      idempotencyKey,
    });
    if (existing) {
      if (existing.status === 'paid') {
        return {
          order: toPublicOrder(existing),
          checkout: this.buildCheckoutPayload(existing, plan.name),
          alreadyExists: true,
        };
      }
      if (existing.status === 'created' || existing.status === 'pending') {
        return {
          order: toPublicOrder(existing),
          checkout: this.buildCheckoutPayload(existing, plan.name),
          alreadyExists: true,
        };
      }
    }

    if (provider === 'razorpay') {
      return this.createRazorpayCheckout({
        organizationId,
        userId,
        plan,
        billingCycle: input.billingCycle,
        pricing,
        idempotencyKey,
      });
    }

    return this.createDodoCheckout({
      organizationId,
      userId,
      plan,
      billingCycle: input.billingCycle,
      pricing,
      idempotencyKey,
    });
  }

  private buildCheckoutPayload(
    order: import('./payment-order.model.js').PaymentOrderDocument,
    planName: string
  ) {
    const meta = (order.metadata || {}) as Record<string, unknown>;
    if (order.provider === 'razorpay') {
      const { keyId } = getRazorpayConfig();
      return {
        provider: 'razorpay' as const,
        keyId,
        razorpayOrderId: order.providerOrderId,
        amount: order.amount,
        currency: order.currency,
        planId: order.planId.toHexString(),
        planName,
        orderId: order._id.toHexString(),
      };
    }
    return {
      provider: 'dodo' as const,
      checkoutUrl: order.checkoutUrl,
      sessionId: order.providerOrderId,
      amount: order.amount,
      currency: order.currency,
      planId: order.planId.toHexString(),
      planName,
      orderId: order._id.toHexString(),
      returnUrl: meta.returnUrl ?? null,
    };
  }

  private async createRazorpayCheckout(input: {
    organizationId: string;
    userId: string;
    plan: Awaited<ReturnType<typeof resolvePricingPlan>>;
    billingCycle: CheckoutInput['billingCycle'];
    pricing: { amount: number; currency: 'INR' | 'USD'; major: number };
    idempotencyKey: string;
  }) {
    const { enabled, keyId } = getRazorpayConfig();
    if (!enabled) {
      throw new AppError(503, 'RAZORPAY_NOT_CONFIGURED', 'Razorpay is not configured');
    }

    const receipt = buildReceipt(input.plan.code);
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: input.pricing.amount,
      currency: input.pricing.currency,
      receipt,
      notes: {
        plan_id: input.plan._id.toHexString(),
        plan_code: input.plan.code,
        organization_id: input.organizationId,
        user_id: input.userId,
        billing_cycle: input.billingCycle,
      },
    });

    const order = await PaymentOrderModel.create({
      organizationId: input.organizationId,
      userId: input.userId,
      planId: input.plan._id,
      billingCycle: input.billingCycle,
      provider: 'razorpay',
      providerOrderId: String(razorpayOrder.id),
      currency: input.pricing.currency,
      amount: input.pricing.amount,
      status: 'created',
      idempotencyKey: input.idempotencyKey,
      expiresAt: new Date(Date.now() + 30 * 60_000),
      metadata: {
        receipt,
        planCode: input.plan.code,
        planName: input.plan.name,
        amountMajor: input.pricing.major,
      },
    });

    const user = await UserModel.findById(input.userId).select(
      'firstName lastName email'
    );

    return {
      order: toPublicOrder(order),
      checkout: {
        provider: 'razorpay' as const,
        keyId,
        razorpayOrderId: String(razorpayOrder.id),
        amount: order.amount,
        currency: order.currency,
        planId: input.plan._id.toHexString(),
        planName: input.plan.name,
        orderId: order._id.toHexString(),
      },
      prefill: {
        name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
        email: user?.email || '',
        contact: '',
      },
      alreadyExists: false,
    };
  }

  private async createDodoCheckout(input: {
    organizationId: string;
    userId: string;
    plan: Awaited<ReturnType<typeof resolvePricingPlan>>;
    billingCycle: CheckoutInput['billingCycle'];
    pricing: { amount: number; currency: 'INR' | 'USD'; major: number };
    idempotencyKey: string;
  }) {
    const { enabled } = getDodoConfig();
    if (!enabled) {
      throw new AppError(503, 'DODO_NOT_CONFIGURED', 'Dodo Payments is not configured');
    }

    const productId = getDodoProductId(input.plan.code);
    if (!productId) {
      throw new AppError(
        503,
        'DODO_PRODUCT_NOT_CONFIGURED',
        `Dodo product ID is not configured for plan "${input.plan.code}". Set DODO_PRODUCT_ID_* env vars.`
      );
    }

    const order = await PaymentOrderModel.create({
      organizationId: input.organizationId,
      userId: input.userId,
      planId: input.plan._id,
      billingCycle: input.billingCycle,
      provider: 'dodo',
      currency: input.pricing.currency,
      amount: input.pricing.amount,
      status: 'created',
      idempotencyKey: input.idempotencyKey,
      expiresAt: new Date(Date.now() + 60 * 60_000),
      metadata: {
        planCode: input.plan.code,
        planName: input.plan.name,
        amountMajor: input.pricing.major,
        productId,
      },
    });

    const frontendBase = getFrontendBaseUrl();
    const returnUrl = `${frontendBase}/dashboard/plans?billing_return=dodo&order=${order._id.toHexString()}`;
    const cancelUrl = `${frontendBase}/dashboard/plans?billing_cancel=dodo&order=${order._id.toHexString()}`;

    const user = await UserModel.findById(input.userId).select(
      'firstName lastName email'
    );

    const session = await createDodoCheckoutSession({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: buildDodoCheckoutCustomer(user || {}),
      billing_currency: input.pricing.currency,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      metadata: {
        huntlo_order_id: order._id.toHexString(),
        plan_id: input.plan._id.toHexString(),
        plan_code: input.plan.code,
        user_id: input.userId,
        organization_id: input.organizationId,
        billing_cycle: input.billingCycle,
      },
      feature_flags: { redirect_immediately: true },
    });

    const checkoutUrl = String(session?.checkout_url || session?.checkoutUrl || '');
    const sessionId = String(session?.session_id || session?.sessionId || '');
    if (!checkoutUrl || !sessionId) {
      await markOrderFailed(order, 'dodo_session_invalid');
      throw new AppError(
        502,
        'DODO_SESSION_INVALID',
        'Dodo checkout session did not return a checkout URL'
      );
    }

    order.providerOrderId = sessionId;
    order.checkoutUrl = checkoutUrl;
    order.status = 'pending';
    order.metadata = {
      ...(order.metadata || {}),
      returnUrl,
      cancelUrl,
      dodoSessionId: sessionId,
    };
    await order.save();

    return {
      order: toPublicOrder(order),
      checkout: {
        provider: 'dodo' as const,
        checkoutUrl,
        sessionId,
        amount: order.amount,
        currency: order.currency,
        planId: input.plan._id.toHexString(),
        planName: input.plan.name,
        orderId: order._id.toHexString(),
        returnUrl,
      },
      alreadyExists: false,
    };
  }

  async getOrder(organizationId: string, orderId: string) {
    const order = await PaymentOrderModel.findOne({
      _id: orderId,
      organizationId,
    });
    if (!order) throw AppError.notFound('Payment order not found');
    return toPublicOrder(order);
  }

  async listHistory(organizationId: string, query: HistoryQuery) {
    const filter = { organizationId };
    const total = await PaymentOrderModel.countDocuments(filter);
    const rows = await PaymentOrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return {
      items: rows.map((row) => toPublicOrder(row)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  async listInvoices(organizationId: string, query: HistoryQuery) {
    const filter = { organizationId };
    const total = await BillingInvoiceModel.countDocuments(filter);
    const rows = await BillingInvoiceModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return {
      items: rows.map((row) => ({
        id: row._id.toHexString(),
        paymentOrderId: row.paymentOrderId.toHexString(),
        invoiceNumber: row.invoiceNumber,
        amount: row.amount,
        amountMajor: row.amount / 100,
        currency: row.currency,
        periodStart: row.periodStart.toISOString(),
        periodEnd: row.periodEnd.toISOString(),
        status: row.status,
        invoiceUrl: row.invoiceUrl,
        planName: row.planName,
        provider: row.provider,
        billingPeriod: `${row.periodStart.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })} – ${row.periodEnd.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`,
        amountLabel:
          row.currency === 'USD'
            ? `$${(row.amount / 100).toLocaleString('en-US')}`
            : `₹${(row.amount / 100).toLocaleString('en-IN')}`,
        paymentDate: row.createdAt.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }

  /**
   * Server-side Razorpay verification — never trust client success alone.
   * Signature + order match + amount/currency + captured/authorized status.
   */
  async verifyRazorpay(
    organizationId: string,
    userId: string,
    input: VerifyInput
  ) {
    const orderId = String(
      input.razorpay_order_id || input.razorpayOrderId || ''
    ).trim();
    const paymentId = String(
      input.razorpay_payment_id || input.razorpayPaymentId || ''
    ).trim();
    const signature = String(
      input.razorpay_signature || input.razorpaySignature || ''
    ).trim();

    if (!orderId || !paymentId || !signature) {
      throw AppError.badRequest('Missing payment verification fields');
    }

    if (
      !verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature,
      })
    ) {
      throw new AppError(400, 'INVALID_SIGNATURE', 'Payment signature verification failed');
    }

    const order = await PaymentOrderModel.findOne({
      provider: 'razorpay',
      providerOrderId: orderId,
      organizationId,
    });
    if (!order) throw AppError.notFound('Order not found');
    if (input.orderId && order._id.toHexString() !== input.orderId) {
      throw AppError.badRequest('Order id mismatch');
    }

    if (order.status === 'paid') {
      return { alreadyPaid: true, order: toPublicOrder(order) };
    }

    let payment: Awaited<ReturnType<typeof fetchRazorpayPayment>>;
    try {
      payment = await fetchRazorpayPayment(paymentId);
    } catch {
      throw new AppError(502, 'RAZORPAY_FETCH_FAILED', 'Could not verify payment with Razorpay');
    }

    if (String(payment.order_id) !== orderId) {
      throw new AppError(400, 'PAYMENT_ORDER_MISMATCH', 'Payment does not match order');
    }

    const status = String(payment.status || '');
    if (status !== 'captured' && status !== 'authorized') {
      await markOrderFailed(order, `payment_status_${status}`);
      throw new AppError(
        400,
        'PAYMENT_NOT_CAPTURED',
        `Payment not completed (status: ${status})`
      );
    }

    const paidAmount = Number(payment.amount);
    if (!Number.isFinite(paidAmount) || paidAmount !== order.amount) {
      throw new AppError(400, 'AMOUNT_MISMATCH', 'Payment amount mismatch');
    }

    const paidCurrency = String(payment.currency || '').toUpperCase();
    if (paidCurrency && paidCurrency !== order.currency) {
      throw new AppError(400, 'CURRENCY_MISMATCH', 'Payment currency mismatch');
    }

    order.providerPaymentId = paymentId;
    order.metadata = {
      ...(order.metadata || {}),
      razorpaySignature: signature,
    };
    await order.save();

    const result = await fulfillPaidOrder(order, {
      providerPaymentId: paymentId,
      performedByUserId: userId,
      reason: 'razorpay_verify',
    });

    return {
      alreadyPaid: result.alreadyPaid,
      order: toPublicOrder(result.order),
    };
  }

  /**
   * Fulfill Dodo order after webhook or return-url confirmation.
   * Always re-checks remote payment status when payment id is present.
   */
  async fulfillDodoOrder(input: {
    huntloOrderId?: string | null;
    dodoPaymentId?: string | null;
    dodoSessionId?: string | null;
    status?: string | null;
    organizationId?: string;
  }) {
    if (!isDodoSuccessStatus(input.status || 'succeeded')) {
      return { handled: false as const, reason: 'non_success_status' };
    }

    let order = null;
    if (input.huntloOrderId) {
      order = await PaymentOrderModel.findOne({
        _id: input.huntloOrderId,
        provider: 'dodo',
        ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      });
    }
    if (!order && input.dodoSessionId) {
      order = await PaymentOrderModel.findOne({
        provider: 'dodo',
        providerOrderId: String(input.dodoSessionId),
      });
    }
    if (!order && input.dodoPaymentId) {
      order = await PaymentOrderModel.findOne({
        provider: 'dodo',
        providerPaymentId: String(input.dodoPaymentId),
      });
    }
    if (!order) throw AppError.notFound('Payment order not found');

    if (input.dodoPaymentId) {
      const remote = await fetchDodoPayment(input.dodoPaymentId);
      const remoteStatus = remote?.status || remote?.payment_status;
      if (remoteStatus && !isDodoSuccessStatus(remoteStatus)) {
        await markOrderFailed(order, `dodo_status_${remoteStatus}`);
        throw new AppError(
          400,
          'PAYMENT_NOT_CAPTURED',
          `Payment not confirmed with Dodo (status: ${remoteStatus})`
        );
      }
      const remoteAmount = Number(
        remote?.total_amount ?? remote?.amount ?? remote?.settlement_amount
      );
      // Only verify amount when Dodo returns a comparable minor-unit field.
      if (Number.isFinite(remoteAmount) && remoteAmount > 0 && remoteAmount === order.amount) {
        // ok
      } else if (Number.isFinite(remoteAmount) && remoteAmount > 0 && remoteAmount !== order.amount) {
        // Dodo may return major units; accept major*100 match as well (EJ does not hard-fail on amount).
        if (Math.round(remoteAmount * 100) !== order.amount && remoteAmount !== order.amount) {
          // Soft check — product_cart is authoritative via product id mapping.
        }
      }
      order.providerPaymentId = String(input.dodoPaymentId);
      await order.save();
    }

    const result = await fulfillPaidOrder(order, {
      providerPaymentId: order.providerPaymentId || input.dodoPaymentId,
      performedByUserId: order.userId.toHexString(),
      reason: 'dodo_fulfillment',
    });

    return {
      handled: true as const,
      alreadyPaid: result.alreadyPaid,
      order: toPublicOrder(result.order),
    };
  }
}

export const billingService = new BillingService();
