import { Router } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { getMetaWebhookVerifyToken } from '../../providers/meta-whatsapp/meta.config.js';
import { handleProviderWebhook } from '../conversations/provider-sync.js';

/**
 * Webhook ingress — raw body preserved for signature verification.
 */
export const webhookRouter = Router();

webhookRouter.use(...webhookBodyMiddleware);

webhookRouter.post(
  '/_probe',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      received: true,
      hasRawBody: Buffer.isBuffer(req.rawBody),
      contentType: req.headers['content-type'] ?? null,
    });
  })
);

/** Meta WhatsApp verification challenge */
webhookRouter.get(
  '/meta-whatsapp',
  asyncHandler(async (req, res) => {
    const mode = String(req.query['hub.mode'] || '');
    const token = String(req.query['hub.verify_token'] || '');
    const challenge = String(req.query['hub.challenge'] || '');
    const expected = getMetaWebhookVerifyToken();
    if (mode === 'subscribe' && expected && token === expected) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Verify failed' } });
  })
);

webhookRouter.post(
  '/meta-whatsapp',
  asyncHandler(async (req, res) => {
    const { ingestWebhook } = await import('../webhooks/ingest.service.js');
    const rawBody = req.rawBody;
    if (!rawBody || rawBody.length === 0) {
      res.status(400).json({ success: false, error: { code: 'EMPTY_BODY', message: 'Empty body' } });
      return;
    }
    const body =
      req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)
        ? (req.body as Record<string, unknown>)
        : (JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>);
    const result = await ingestWebhook({
      provider: 'meta',
      rawBody,
      body,
      headers: req.headers as Record<string, string | string[] | undefined>,
      query: req.query as Record<string, unknown>,
      organizationId:
        (req.headers['x-organization-id'] as string | undefined) ||
        (req.query.organizationId as string | undefined) ||
        null,
    });
    res.status(result.statusCode).json(result.body);
  })
);

webhookRouter.post(
  '/gupshup',
  asyncHandler(async (req, res) => {
    const { ingestWebhook } = await import('../webhooks/ingest.service.js');
    const rawBody = req.rawBody;
    if (!rawBody || rawBody.length === 0) {
      res.status(400).json({ success: false, error: { code: 'EMPTY_BODY', message: 'Empty body' } });
      return;
    }
    const body =
      req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)
        ? (req.body as Record<string, unknown>)
        : (JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>);
    const result = await ingestWebhook({
      provider: 'gupshup',
      rawBody,
      body,
      headers: req.headers as Record<string, string | string[] | undefined>,
      query: req.query as Record<string, unknown>,
      organizationId:
        (req.headers['x-organization-id'] as string | undefined) ||
        (req.query.organizationId as string | undefined) ||
        null,
    });
    res.status(result.statusCode).json(result.body);
  })
);

webhookRouter.post(
  '/gmail',
  asyncHandler(async (req, res) => {
    const organizationId =
      (req.headers['x-organization-id'] as string | undefined) ||
      (req.query.organizationId as string | undefined) ||
      null;
    const result = await handleProviderWebhook({
      provider: 'gmail',
      organizationId,
      payload: req.body,
      req,
    });
    res.status(200).json({ success: true, data: result });
  })
);

webhookRouter.post(
  '/outlook',
  asyncHandler(async (req, res) => {
    const organizationId =
      (req.headers['x-organization-id'] as string | undefined) ||
      (req.query.organizationId as string | undefined) ||
      null;
    const result = await handleProviderWebhook({
      provider: 'outlook',
      organizationId,
      payload: req.body,
      req,
    });
    res.status(200).json({ success: true, data: result });
  })
);

webhookRouter.post(
  '/zoho',
  asyncHandler(async (req, res) => {
    const organizationId =
      (req.headers['x-organization-id'] as string | undefined) ||
      (req.query.organizationId as string | undefined) ||
      null;
    const result = await handleProviderWebhook({
      provider: 'zoho-mail',
      organizationId,
      payload: req.body,
      req,
    });
    res.status(200).json({ success: true, data: result });
  })
);

webhookRouter.post(
  '/imap',
  asyncHandler(async (req, res) => {
    const organizationId =
      (req.headers['x-organization-id'] as string | undefined) ||
      (req.query.organizationId as string | undefined) ||
      null;
    const result = await handleProviderWebhook({
      provider: 'imap',
      organizationId,
      payload: req.body,
      req,
    });
    res.status(200).json({ success: true, data: result });
  })
);
