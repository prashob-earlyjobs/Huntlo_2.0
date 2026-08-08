import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { processZyastraVoiceWebhook } from './zyastra-voice-webhook.service.js';

/**
 * Zyastra AI Voice callbacks — primary mount:
 *   POST /api/integrations/voice/zyastra
 * Optional alias:
 *   POST /api/v1/webhooks/zyastra
 */
export const zyastraVoiceWebhookRouter = Router();

zyastraVoiceWebhookRouter.use(...webhookBodyMiddleware);

async function handle(req: Request, res: Response) {
  const result = await processZyastraVoiceWebhook({
    body: req.body,
    headers: req.headers as Record<string, string | string[] | undefined>,
    rawBody: req.rawBody ?? null,
  });
  res.status(200).json({ success: true, data: result });
}

zyastraVoiceWebhookRouter.post('/', asyncHandler(handle));
zyastraVoiceWebhookRouter.post('/callback', asyncHandler(handle));
