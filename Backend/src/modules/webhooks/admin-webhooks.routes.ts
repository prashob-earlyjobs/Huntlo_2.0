import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { enqueueJob } from '../../workers/queue.js';
import { requireAdmin, requireAdminPermission } from '../admin/require-admin.js';
import { recordAdminMutation } from '../admin/admin-audit.js';
import { retryWebhookEvent } from './process.service.js';
import {
  WEBHOOK_PROCESSING_STATUSES,
  WEBHOOK_PROVIDERS,
  WebhookEventModel,
} from './webhook-event.model.js';

const adminAuth = [requireAuth, requireAdmin];

const listSchema = z.object({
  status: z.enum(WEBHOOK_PROCESSING_STATUSES).optional(),
  provider: z.enum(WEBHOOK_PROVIDERS).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const idSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

function toPublic(doc: {
  _id: { toHexString(): string };
  provider: string;
  providerEventId: string;
  eventType: string;
  payloadHash: string;
  signatureValid: boolean;
  processingStatus: string;
  receivedAt: Date;
  processedAt: Date | null;
  attempts: number;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  error: string | null;
  createdAt: Date;
}) {
  return {
    id: doc._id.toHexString(),
    provider: doc.provider,
    providerEventId: doc.providerEventId,
    eventType: doc.eventType,
    payloadHash: doc.payloadHash,
    signatureValid: doc.signatureValid,
    processingStatus: doc.processingStatus,
    receivedAt: doc.receivedAt.toISOString(),
    processedAt: doc.processedAt?.toISOString() ?? null,
    attempts: doc.attempts,
    relatedEntityType: doc.relatedEntityType,
    relatedEntityId: doc.relatedEntityId,
    error: doc.error,
    createdAt: doc.createdAt.toISOString(),
  };
}

export const adminWebhooksRouter = Router();

adminWebhooksRouter.get(
  '/',
  ...adminAuth,
  requireAdminPermission('admin:webhooks:read'),
  asyncHandler(async (req, res) => {
    const query = listSchema.parse(req.query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.processingStatus = query.status;
    if (query.provider) filter.provider = query.provider;

    const [items, total] = await Promise.all([
      WebhookEventModel.find(filter)
        .sort({ receivedAt: -1 })
        .skip(query.offset)
        .limit(query.limit),
      WebhookEventModel.countDocuments(filter),
    ]);

    successResponse(
      res,
      {
        items: items.map(toPublic),
        total,
        limit: query.limit,
        offset: query.offset,
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

adminWebhooksRouter.get(
  '/:id',
  ...adminAuth,
  requireAdminPermission('admin:webhooks:read'),
  asyncHandler(async (req, res) => {
    const { id } = idSchema.parse(req.params);
    const doc = await WebhookEventModel.findById(id);
    if (!doc) throw AppError.notFound('Webhook event not found');
    successResponse(res, toPublic(doc), { meta: { requestId: getRequestId(req) } });
  })
);

adminWebhooksRouter.post(
  '/:id/retry',
  ...adminAuth,
  requireAdminPermission('admin:webhooks:write'),
  asyncHandler(async (req, res) => {
    const { id } = idSchema.parse(req.params);
    await enqueueJob({
      type: 'webhook.retry',
      entityType: 'webhook_event',
      entityId: id,
      payload: { webhookEventId: id, mode: 'retry' },
      priority: 90,
      maxAttempts: 5,
      idempotencyKey: `webhook:retry:${id}:${Date.now()}`,
    });
    const result = await retryWebhookEvent(id);
    await recordAdminMutation(req, {
      action: 'admin.webhook.retried',
      relatedEntityType: 'webhook_event',
      relatedEntityId: id,
    });
    successResponse(res, result, { meta: { requestId: getRequestId(req) } });
  })
);
