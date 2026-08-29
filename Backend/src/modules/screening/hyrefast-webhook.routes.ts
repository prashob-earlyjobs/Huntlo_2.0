import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { processHyrefastWebhook } from './hyrefast-webhook.service.js';

/**
 * Hyrefast video screening callbacks.
 * Register this URL in Hyrefast (one webhook per workspace):
 *   POST {PUBLIC_API_BASE_URL}/api/v1/webhooks/hyrefast
 * Aliases:
 *   POST /api/v1/public/webhooks/hyrefast
 *   POST /api/integrations/screening/hyrefast
 */
export const hyrefastWebhookRouter = Router();

hyrefastWebhookRouter.use(...webhookBodyMiddleware);

async function handle(req: Request, res: Response) {
  // Ack quickly — Hyrefast retries after 10s. Processing is still awaited here
  // but stays lightweight (status update only; no score fetch yet).
  const result = await processHyrefastWebhook({
    body: req.body,
    headers: req.headers as Record<string, string | string[] | undefined>,
    rawBody: req.rawBody ?? null,
  });
  res.status(200).json(result);
}

hyrefastWebhookRouter.post('/', asyncHandler(handle));
hyrefastWebhookRouter.post('/callback', asyncHandler(handle));
