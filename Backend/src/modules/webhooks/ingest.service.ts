import mongoose from 'mongoose';

import { getEnv } from '../../config/env.js';
import { getLogger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import { webhookMetrics } from '../../shared/observability/metrics.js';
import { enqueueJob } from '../../workers/queue.js';
import { extractEventMeta } from './extract.js';
import {
  sanitizeHeaders,
  sanitizeWebhookPayload,
  webhookLogContext,
} from './sanitize.js';
import { verifyProviderSignature } from './verify.js';
import {
  hashWebhookRawBody,
  WebhookEventModel,
  type WebhookProvider,
  type WebhookEventDocument,
} from './webhook-event.model.js';

const MAX_PAYLOAD_BYTES = 1_048_576; // 1 MiB

export type IngestWebhookInput = {
  provider: WebhookProvider;
  rawBody: Buffer;
  body: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
  organizationId?: string | null;
};

export type IngestWebhookResult = {
  statusCode: number;
  body: Record<string, unknown>;
  event: WebhookEventDocument | null;
  duplicate: boolean;
  /** Present when processing was awaited (tests / WEBHOOK_SYNC_PROCESS). */
  processingResult?: unknown;
};

function toPublicAck(input: {
  received: boolean;
  duplicate?: boolean;
  queued?: boolean;
  eventId?: string;
}) {
  return {
    received: input.received,
    duplicate: Boolean(input.duplicate),
    queued: Boolean(input.queued),
    eventId: input.eventId,
  };
}

export async function ingestWebhook(
  input: IngestWebhookInput
): Promise<IngestWebhookResult> {
  const logger = getLogger().child({ component: 'webhooks' });
  webhookMetrics.recordReceived(input.provider);

  if (!input.rawBody || input.rawBody.length === 0) {
    webhookMetrics.recordRejected(input.provider);
    throw AppError.badRequest('Empty webhook body');
  }
  if (input.rawBody.length > MAX_PAYLOAD_BYTES) {
    webhookMetrics.recordRejected(input.provider);
    throw new AppError(413, 'PAYLOAD_TOO_LARGE', 'Webhook payload exceeds size limit');
  }

  const signature = verifyProviderSignature({
    provider: input.provider,
    rawBody: input.rawBody,
    headers: input.headers,
    query: input.query,
  });

  if (!signature.valid) {
    webhookMetrics.recordRejected(input.provider);
    logger.warn(
      webhookLogContext({
        provider: input.provider,
        providerEventId: 'unknown',
        eventType: 'unsigned',
        signatureValid: false,
        error: signature.reason,
      }),
      'Webhook signature rejected'
    );
    throw new AppError(
      401,
      'INVALID_SIGNATURE',
      signature.reason || 'Invalid webhook signature'
    );
  }

  const body = (signature.parsedBody || input.body || {}) as Record<string, unknown>;
  const meta = extractEventMeta({
    provider: input.provider,
    body,
    rawBody: input.rawBody,
    query: input.query,
    headers: input.headers,
  });
  const payloadHash = hashWebhookRawBody(input.rawBody);
  const sanitized = sanitizeWebhookPayload(input.provider, body);
  const headers = sanitizeHeaders(input.headers);

  // Idempotency: provider event id first, then payload hash for same provider.
  const existingById = await WebhookEventModel.findOne({
    provider: input.provider,
    providerEventId: meta.providerEventId,
  });
  if (existingById) {
    webhookMetrics.recordDuplicate(input.provider);
    logger.info(
      webhookLogContext({
        provider: input.provider,
        providerEventId: meta.providerEventId,
        eventType: meta.eventType,
        signatureValid: true,
        status: 'duplicate',
      }),
      'Duplicate webhook by providerEventId'
    );
    return {
      statusCode: 200,
      duplicate: true,
      event: existingById,
      body: toPublicAck({
        received: true,
        duplicate: true,
        eventId: existingById._id.toHexString(),
      }),
    };
  }

  const existingByHash = await WebhookEventModel.findOne({
    provider: input.provider,
    payloadHash,
    processingStatus: { $in: ['received', 'queued', 'processing', 'processed'] },
  });
  if (existingByHash) {
    return {
      statusCode: 200,
      duplicate: true,
      event: existingByHash,
      body: toPublicAck({
        received: true,
        duplicate: true,
        eventId: existingByHash._id.toHexString(),
      }),
    };
  }

  const hunarScreeningId =
    input.provider === 'hunar'
      ? String(
          input.query?.screeningId ||
            (body._ingestMeta as { screeningId?: string } | undefined)?.screeningId ||
            ''
        ).trim() || null
      : null;

  let event: WebhookEventDocument;
  try {
    event = await WebhookEventModel.create({
      provider: input.provider,
      providerEventId: meta.providerEventId,
      eventType: meta.eventType,
      payloadHash,
      signatureValid: true,
      processingStatus: 'received',
      receivedAt: new Date(),
      payload: {
        ...sanitized,
        ...(hunarScreeningId
          ? { _ingestMeta: { screeningId: hunarScreeningId } }
          : {}),
      },
      headers,
      organizationId: input.organizationId
        ? new mongoose.Types.ObjectId(input.organizationId)
        : null,
      relatedEntityType: hunarScreeningId ? 'screening' : null,
      relatedEntityId: hunarScreeningId,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const dup = await WebhookEventModel.findOne({
        provider: input.provider,
        providerEventId: meta.providerEventId,
      });
      return {
        statusCode: 200,
        duplicate: true,
        event: dup,
        body: toPublicAck({
          received: true,
          duplicate: true,
          eventId: dup?._id.toHexString(),
        }),
      };
    }
    throw error;
  }

  await enqueueJob({
    type: 'webhook.retry',
    organizationId: input.organizationId ?? null,
    entityType: 'webhook_event',
    entityId: event._id.toHexString(),
    payload: {
      webhookEventId: event._id.toHexString(),
      provider: input.provider,
      mode: 'process',
    },
    priority: 80,
    maxAttempts: 8,
    idempotencyKey: `webhook:process:${event._id.toHexString()}`,
  });

  event.processingStatus = 'queued';
  await event.save();

  const { processWebhookEvent } = await import('./process.service.js');
  const processing = processWebhookEvent(event._id.toHexString());
  let processingResult: unknown;
  // Tests and optional sync mode await processing; production returns immediately.
  if (getEnv().APP_ENV === 'test' || process.env.WEBHOOK_SYNC_PROCESS === 'true') {
    try {
      const outcome = await processing;
      processingResult = outcome.result;
    } catch {
      // Status already marked failed on the event — HTTP still acknowledges receipt.
    }
  } else {
    void processing.catch((error) => {
      logger.error(
        { err: error, eventId: event._id.toHexString() },
        'Async webhook processing failed'
      );
    });
  }

  logger.info(
    webhookLogContext({
      provider: input.provider,
      providerEventId: meta.providerEventId,
      eventType: meta.eventType,
      signatureValid: true,
      status: 'queued',
    }),
    'Webhook accepted and queued'
  );

  webhookMetrics.recordAccepted(input.provider);

  return {
    statusCode: 200,
    duplicate: false,
    event,
    processingResult,
    body: toPublicAck({
      received: true,
      queued: true,
      eventId: event._id.toHexString(),
    }),
  };
}
