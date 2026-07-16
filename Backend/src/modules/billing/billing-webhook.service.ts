import type { Request, Response } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { verifyAndParseDodoWebhook } from '../../providers/dodo/dodo.webhook.js';
import {
  verifyRazorpayWebhookSignature,
} from '../../providers/razorpay/razorpay.client.js';
import { BillingWebhookEventModel } from './billing-webhook-event.model.js';
import { billingService } from './billing.service.js';
import {
  fulfillPaidOrder,
  hashPayload,
  markOrderFailed,
  markOrderRefunded,
} from './fulfillment.service.js';
import { PaymentOrderModel } from './payment-order.model.js';

function headerString(
  headers: Request['headers'],
  name: string
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function processDodoWebhook(req: Request, res: Response) {
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    throw AppError.badRequest('Empty webhook body');
  }

  let event: Record<string, unknown>;
  let signatureValid = false;
  try {
    event = verifyAndParseDodoWebhook(rawBody, req.headers as Record<string, string | string[] | undefined>);
    signatureValid = true;
  } catch (error) {
    const status =
      error && typeof error === 'object' && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode) || 400
        : 400;
    throw new AppError(
      status,
      (error as { code?: string })?.code || 'INVALID_SIGNATURE',
      error instanceof Error ? error.message : 'Webhook verification failed'
    );
  }

  const type = String(event.type || '');
  const providerEventId = String(
    event.webhook_id ||
      event.id ||
      `${type}:${hashPayload(rawBody).slice(0, 24)}`
  );
  const payloadHash = hashPayload(rawBody);

  try {
    await BillingWebhookEventModel.create({
      provider: 'dodo',
      providerEventId,
      payloadHash,
      signatureValid,
      processingStatus: 'received',
      eventType: type,
      payload: event,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    throw error;
  }

  try {
    // EJHunter handles payment.succeeded and subscription.active only.
    if (type === 'payment.succeeded' || type === 'subscription.active') {
      const data = (event.data && typeof event.data === 'object'
        ? event.data
        : {}) as Record<string, unknown>;
      const metadata = {
        ...(event.metadata && typeof event.metadata === 'object'
          ? (event.metadata as Record<string, unknown>)
          : {}),
        ...(data.metadata && typeof data.metadata === 'object'
          ? (data.metadata as Record<string, unknown>)
          : {}),
        ...(data.checkout_session &&
        typeof data.checkout_session === 'object' &&
        (data.checkout_session as { metadata?: unknown }).metadata &&
        typeof (data.checkout_session as { metadata?: unknown }).metadata === 'object'
          ? ((data.checkout_session as { metadata: Record<string, unknown> }).metadata)
          : {}),
      };

      const paymentId = data.payment_id || data.id || null;
      const status =
        type === 'subscription.active' ? 'active' : data.status || 'succeeded';

      await billingService.fulfillDodoOrder({
        huntloOrderId: String(
          metadata.huntlo_order_id || metadata.huntloOrderId || ''
        ),
        dodoPaymentId: paymentId ? String(paymentId) : '',
        dodoSessionId: String(
          metadata.dodo_session_id || data.checkout_session_id || ''
        ),
        status: String(status),
      });

      await BillingWebhookEventModel.updateOne(
        { provider: 'dodo', providerEventId },
        { $set: { processingStatus: 'processed', processedAt: new Date() } }
      );
    } else if (type === 'payment.failed') {
      const data = (event.data && typeof event.data === 'object'
        ? event.data
        : {}) as Record<string, unknown>;
      const metadata =
        data.metadata && typeof data.metadata === 'object'
          ? (data.metadata as Record<string, unknown>)
          : {};
      const orderId = String(metadata.huntlo_order_id || '');
      if (orderId) {
        const order = await PaymentOrderModel.findById(orderId);
        if (order) await markOrderFailed(order, 'dodo_payment_failed');
      }
      await BillingWebhookEventModel.updateOne(
        { provider: 'dodo', providerEventId },
        { $set: { processingStatus: 'processed', processedAt: new Date() } }
      );
    } else {
      await BillingWebhookEventModel.updateOne(
        { provider: 'dodo', providerEventId },
        { $set: { processingStatus: 'ignored', processedAt: new Date() } }
      );
    }
  } catch (error) {
    await BillingWebhookEventModel.updateOne(
      { provider: 'dodo', providerEventId },
      {
        $set: {
          processingStatus: 'failed',
          error: error instanceof Error ? error.message : 'processing failed',
        },
      }
    );
    throw error;
  }

  return res.status(200).json({ received: true });
}

/**
 * Razorpay webhook — official event envelope:
 * { event, payload: { payment?: { entity }, refund?: { entity }, order?: { entity } } }
 * Signature: X-Razorpay-Signature = HMAC-SHA256(rawBody, webhook_secret)
 */
export async function processRazorpayWebhook(req: Request, res: Response) {
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    throw AppError.badRequest('Empty webhook body');
  }

  const signature = headerString(req.headers, 'x-razorpay-signature');
  const signatureValid = verifyRazorpayWebhookSignature(rawBody, signature);
  if (!signatureValid) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Invalid Razorpay webhook signature');
  }

  const event = (typeof req.body === 'object' && req.body
    ? req.body
    : JSON.parse(rawBody.toString('utf8'))) as Record<string, unknown>;

  const eventName = String(event.event || '');
  const payload = (event.payload && typeof event.payload === 'object'
    ? event.payload
    : {}) as Record<string, unknown>;
  const paymentEntity = (
    payload.payment && typeof payload.payment === 'object'
      ? (payload.payment as { entity?: Record<string, unknown> }).entity
      : null
  ) as Record<string, unknown> | null;
  const refundEntity = (
    payload.refund && typeof payload.refund === 'object'
      ? (payload.refund as { entity?: Record<string, unknown> }).entity
      : null
  ) as Record<string, unknown> | null;

  const providerEventId = String(
    event.id ||
      `${eventName}:${paymentEntity?.id || refundEntity?.id || hashPayload(rawBody).slice(0, 16)}`
  );
  const payloadHash = hashPayload(rawBody);

  try {
    await BillingWebhookEventModel.create({
      provider: 'razorpay',
      providerEventId,
      payloadHash,
      signatureValid: true,
      processingStatus: 'received',
      eventType: eventName,
      payload: event,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    throw error;
  }

  try {
    if (eventName === 'payment.captured' || eventName === 'payment.authorized') {
      const razorpayOrderId = String(paymentEntity?.order_id || '');
      const paymentId = String(paymentEntity?.id || '');
      if (razorpayOrderId && paymentId) {
        const order = await PaymentOrderModel.findOne({
          provider: 'razorpay',
          providerOrderId: razorpayOrderId,
        });
        if (order && order.status !== 'paid') {
          const paidAmount = Number(paymentEntity?.amount);
          const paidCurrency = String(paymentEntity?.currency || '').toUpperCase();
          if (
            Number.isFinite(paidAmount) &&
            paidAmount === order.amount &&
            (!paidCurrency || paidCurrency === order.currency)
          ) {
            order.providerPaymentId = paymentId;
            await order.save();
            await fulfillPaidOrder(order, {
              providerPaymentId: paymentId,
              performedByUserId: order.userId.toHexString(),
              reason: 'razorpay_webhook',
            });
          }
        }
      }
      await BillingWebhookEventModel.updateOne(
        { provider: 'razorpay', providerEventId },
        { $set: { processingStatus: 'processed', processedAt: new Date() } }
      );
    } else if (eventName === 'payment.failed') {
      const razorpayOrderId = String(paymentEntity?.order_id || '');
      if (razorpayOrderId) {
        const order = await PaymentOrderModel.findOne({
          provider: 'razorpay',
          providerOrderId: razorpayOrderId,
        });
        if (order) await markOrderFailed(order, 'razorpay_payment_failed');
      }
      await BillingWebhookEventModel.updateOne(
        { provider: 'razorpay', providerEventId },
        { $set: { processingStatus: 'processed', processedAt: new Date() } }
      );
    } else if (eventName === 'refund.processed' || eventName === 'refund.created') {
      const paymentId = String(refundEntity?.payment_id || paymentEntity?.id || '');
      if (paymentId) {
        const order = await PaymentOrderModel.findOne({
          provider: 'razorpay',
          providerPaymentId: paymentId,
        });
        if (order) await markOrderRefunded(order, eventName);
      }
      await BillingWebhookEventModel.updateOne(
        { provider: 'razorpay', providerEventId },
        { $set: { processingStatus: 'processed', processedAt: new Date() } }
      );
    } else {
      await BillingWebhookEventModel.updateOne(
        { provider: 'razorpay', providerEventId },
        { $set: { processingStatus: 'ignored', processedAt: new Date() } }
      );
    }
  } catch (error) {
    await BillingWebhookEventModel.updateOne(
      { provider: 'razorpay', providerEventId },
      {
        $set: {
          processingStatus: 'failed',
          error: error instanceof Error ? error.message : 'processing failed',
        },
      }
    );
    throw error;
  }

  return res.status(200).json({ received: true });
}
