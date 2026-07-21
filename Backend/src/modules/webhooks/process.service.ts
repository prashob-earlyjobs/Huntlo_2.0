import { getLogger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import { webhookMetrics } from '../../shared/observability/metrics.js';
import { handleProviderWebhook } from '../conversations/provider-sync.js';
import { processCalendlyWebhookPayload } from '../scheduling/calendly-webhook.service.js';
import { processHunarWebhook } from '../screening/webhook.service.js';
import {
  fulfillPaidOrder,
  markOrderFailed,
  markOrderRefunded,
} from '../billing/fulfillment.service.js';
import { PaymentOrderModel } from '../billing/payment-order.model.js';
import { billingService } from '../billing/billing.service.js';
import type { HunarWebhookKind } from '../../providers/hunar/hunar.webhook.js';
import { webhookLogContext } from './sanitize.js';
import {
  WebhookEventModel,
  type WebhookEventDocument,
  type WebhookProvider,
} from './webhook-event.model.js';

async function processMetaOrGupshup(
  provider: 'meta' | 'gupshup',
  event: WebhookEventDocument
) {
  const mapped = provider === 'meta' ? 'meta-whatsapp' : 'gupshup';
  const result = await handleProviderWebhook({
    provider: mapped,
    organizationId: event.organizationId ? String(event.organizationId) : null,
    payload: event.payload,
  });
  getLogger()
    .child({ component: 'webhooks', provider })
    .info(
      {
        ingested: result.ingested,
        duplicates: result.duplicates,
        statuses: result.statuses,
        providerEventId: event.providerEventId,
      },
      'WhatsApp webhook ingest result'
    );
  return { result };
}

async function processHunar(event: WebhookEventDocument) {
  const kind = (event.eventType || 'call-status') as HunarWebhookKind;
  const meta = (event.payload._ingestMeta || {}) as {
    screeningId?: string;
    campaignId?: string;
  };
  const screeningId =
    meta.screeningId ||
    String((event.payload as { screeningId?: string }).screeningId || '') ||
    null;
  const campaignId =
    meta.campaignId ||
    (event.relatedEntityType === 'campaign' ? event.relatedEntityId : null) ||
    String((event.payload as { campaignId?: string }).campaignId || '') ||
    null;

  const { _ingestMeta: _drop, ...body } = event.payload as Record<string, unknown> & {
    _ingestMeta?: unknown;
  };

  if (campaignId && !screeningId) {
    const { processCampaignVoiceWebhook } = await import('../voice/voice-webhook.service.js');
    const result = await processCampaignVoiceWebhook({
      kind: ['call-status', 'call-recording', 'call-result', 'call-summary'].includes(kind)
        ? kind
        : 'call-status',
      campaignId,
      body,
      headers: event.headers,
      alreadyVerified: event.signatureValid,
    });
    return {
      result,
      relatedEntityType: 'campaign',
      relatedEntityId: campaignId,
    };
  }

  const sid = event.relatedEntityId || screeningId;
  if (!sid) {
    throw AppError.badRequest('Hunar webhook missing screeningId or campaignId');
  }

  const result = await processHunarWebhook({
    kind: ['call-status', 'call-recording', 'call-result', 'call-summary'].includes(
      kind
    )
      ? kind
      : 'call-status',
    screeningId: sid,
    body,
    headers: event.headers,
    alreadyVerified: event.signatureValid,
  });
  return {
    result,
    relatedEntityType: 'screening',
    relatedEntityId: sid,
  };
}

async function processCalendly(event: WebhookEventDocument) {
  const payload =
    event.payload.payload && typeof event.payload.payload === 'object'
      ? (event.payload.payload as Record<string, unknown>)
      : event.payload;
  const result = await processCalendlyWebhookPayload(payload);
  return { result };
}

async function processRazorpay(event: WebhookEventDocument) {
  const eventName = event.eventType;
  const payload =
    event.payload.payload && typeof event.payload.payload === 'object'
      ? (event.payload.payload as Record<string, unknown>)
      : {};
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

  if (eventName === 'payment.captured' || eventName === 'payment.authorized') {
    const razorpayOrderId = String(paymentEntity?.order_id || '');
    const paymentId = String(paymentEntity?.id || '');
    if (razorpayOrderId && paymentId) {
      const order = await PaymentOrderModel.findOne({
        provider: 'razorpay',
        providerOrderId: razorpayOrderId,
      });
      if (!order) {
        return {
          result: { handled: false, reason: 'unknown_order' },
          relatedEntityType: 'payment_order',
          relatedEntityId: razorpayOrderId,
        };
      }
      if (order.status !== 'paid') {
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
      return {
        result: { handled: true },
        relatedEntityType: 'payment_order',
        relatedEntityId: order._id.toHexString(),
      };
    }
  } else if (eventName === 'payment.failed') {
    const razorpayOrderId = String(paymentEntity?.order_id || '');
    if (razorpayOrderId) {
      const order = await PaymentOrderModel.findOne({
        provider: 'razorpay',
        providerOrderId: razorpayOrderId,
      });
      if (order) await markOrderFailed(order, 'razorpay_payment_failed');
      return {
        result: { handled: Boolean(order) },
        relatedEntityType: 'payment_order',
        relatedEntityId: order?._id.toHexString() ?? razorpayOrderId,
      };
    }
  } else if (eventName === 'refund.processed' || eventName === 'refund.created') {
    const paymentId = String(refundEntity?.payment_id || paymentEntity?.id || '');
    if (paymentId) {
      const order = await PaymentOrderModel.findOne({
        provider: 'razorpay',
        providerPaymentId: paymentId,
      });
      if (order) await markOrderRefunded(order, eventName);
      return {
        result: { handled: Boolean(order) },
        relatedEntityType: 'payment_order',
        relatedEntityId: order?._id.toHexString() ?? paymentId,
      };
    }
  }

  return { result: { handled: false, ignored: true } };
}

async function processDodo(event: WebhookEventDocument) {
  const type = event.eventType;
  const data =
    event.payload.data && typeof event.payload.data === 'object'
      ? (event.payload.data as Record<string, unknown>)
      : {};
  const metadata = {
    ...(event.payload.metadata && typeof event.payload.metadata === 'object'
      ? (event.payload.metadata as Record<string, unknown>)
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

  if (type === 'payment.succeeded' || type === 'subscription.active') {
    const huntloOrderId = String(
      metadata.huntlo_order_id || metadata.huntloOrderId || ''
    );
    if (!huntloOrderId) {
      return { result: { handled: false, reason: 'unknown_entity' } };
    }
    const paymentId = data.payment_id || data.id || null;
    const status =
      type === 'subscription.active' ? 'active' : data.status || 'succeeded';
    await billingService.fulfillDodoOrder({
      huntloOrderId,
      dodoPaymentId: paymentId ? String(paymentId) : '',
      dodoSessionId: String(
        metadata.dodo_session_id || data.checkout_session_id || ''
      ),
      status: String(status),
    });
    return {
      result: { handled: true },
      relatedEntityType: 'payment_order',
      relatedEntityId: huntloOrderId,
    };
  }

  if (type === 'payment.failed') {
    const orderId = String(metadata.huntlo_order_id || '');
    if (orderId) {
      const order = await PaymentOrderModel.findById(orderId);
      if (order) await markOrderFailed(order, 'dodo_payment_failed');
      return {
        result: { handled: Boolean(order) },
        relatedEntityType: 'payment_order',
        relatedEntityId: orderId,
      };
    }
  }

  return { result: { handled: false, ignored: true } };
}

export async function processWebhookEvent(webhookEventId: string): Promise<{
  status: string;
  result?: unknown;
}> {
  const logger = getLogger().child({ component: 'webhooks' });
  const event = await WebhookEventModel.findById(webhookEventId);
  if (!event) throw AppError.notFound('Webhook event not found');

  if (event.processingStatus === 'processed' || event.processingStatus === 'ignored') {
    return { status: event.processingStatus, result: { skipped: true } };
  }
  if (event.processingStatus === 'duplicate') {
    return { status: 'duplicate', result: { skipped: true } };
  }

  // Claim processing — avoid duplicate business transitions.
  const claimed = await WebhookEventModel.findOneAndUpdate(
    {
      _id: webhookEventId,
      processingStatus: { $in: ['received', 'queued', 'failed'] },
    },
    {
      $set: { processingStatus: 'processing' },
      $inc: { attempts: 1 },
    },
    { new: true }
  );
  if (!claimed) {
    const current = await WebhookEventModel.findById(webhookEventId);
    return {
      status: current?.processingStatus || 'unknown',
      result: { skipped: true, reason: 'already_claimed' },
    };
  }

  try {
    let outcome: {
      result?: unknown;
      relatedEntityType?: string;
      relatedEntityId?: string;
      ignored?: boolean;
    };

    switch (claimed.provider as WebhookProvider) {
      case 'meta':
        outcome = await processMetaOrGupshup('meta', claimed);
        break;
      case 'gupshup':
        outcome = await processMetaOrGupshup('gupshup', claimed);
        break;
      case 'hunar':
        outcome = await processHunar(claimed);
        break;
      case 'calendly':
        outcome = await processCalendly(claimed);
        break;
      case 'razorpay':
        outcome = await processRazorpay(claimed);
        break;
      case 'dodo':
        outcome = await processDodo(claimed);
        break;
      case 'gmail': {
        const { decodeGmailPubSubPush } = await import('../../providers/gmail/gmail.watch.js');
        const { syncGmailRepliesForEmail } = await import(
          '../outreach/email-reply-sync.service.js'
        );
        const decoded = decodeGmailPubSubPush(claimed.payload);
        if (!decoded) {
          outcome = { result: { ignored: true, reason: 'invalid_pubsub_payload' }, ignored: true };
          break;
        }
        const synced = await syncGmailRepliesForEmail(decoded.emailAddress);
        outcome = {
          result: { synced, emailAddress: decoded.emailAddress, historyId: decoded.historyId },
        };
        break;
      }
      default:
        throw new Error(`Unsupported provider ${claimed.provider}`);
    }

    const ignored =
      Boolean((outcome.result as { ignored?: boolean } | undefined)?.ignored) ||
      ((outcome.result as { handled?: boolean } | undefined)?.handled === false &&
        (outcome.result as { reason?: string } | undefined)?.reason ===
          'unknown_entity');

    claimed.processingStatus = ignored ? 'ignored' : 'processed';
    claimed.processedAt = new Date();
    claimed.error = null;
    if (outcome.relatedEntityType) claimed.relatedEntityType = outcome.relatedEntityType;
    if (outcome.relatedEntityId) claimed.relatedEntityId = outcome.relatedEntityId;
    await claimed.save();

    webhookMetrics.recordProcessed(String(claimed.provider));

    logger.info(
      webhookLogContext({
        provider: claimed.provider,
        providerEventId: claimed.providerEventId,
        eventType: claimed.eventType,
        signatureValid: claimed.signatureValid,
        status: claimed.processingStatus,
      }),
      'Webhook processed'
    );

    return { status: claimed.processingStatus, result: outcome.result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    claimed.processingStatus = 'failed';
    claimed.error = message.slice(0, 4000);
    await claimed.save();
    webhookMetrics.recordFailed(String(claimed.provider));
    logger.error(
      {
        ...webhookLogContext({
          provider: claimed.provider,
          providerEventId: claimed.providerEventId,
          eventType: claimed.eventType,
          signatureValid: claimed.signatureValid,
          status: 'failed',
          error: message,
        }),
        err: error,
      },
      'Webhook processing failed'
    );
    throw error;
  }
}

export async function retryWebhookEvent(webhookEventId: string) {
  const event = await WebhookEventModel.findById(webhookEventId);
  if (!event) throw AppError.notFound('Webhook event not found');
  if (event.processingStatus === 'processed') {
    return { status: 'processed', result: { skipped: true } };
  }
  event.processingStatus = 'queued';
  event.error = null;
  await event.save();
  return processWebhookEvent(webhookEventId);
}
