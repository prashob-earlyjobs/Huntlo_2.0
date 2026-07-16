import { Router } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { processCalendlyWebhook } from './calendly-webhook.service.js';

export const calendlyWebhookRouter = Router();

calendlyWebhookRouter.use(...webhookBodyMiddleware);

calendlyWebhookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    await processCalendlyWebhook(req, res);
  })
);
