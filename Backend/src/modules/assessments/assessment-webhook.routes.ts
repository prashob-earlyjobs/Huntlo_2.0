import { Router } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { processAssessmentWebhook } from './webhook.service.js';

export const assessmentWebhookRouter = Router();

assessmentWebhookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    await processAssessmentWebhook(req, res);
  })
);

assessmentWebhookRouter.post(
  '/events',
  asyncHandler(async (req, res) => {
    await processAssessmentWebhook(req, res);
  })
);
