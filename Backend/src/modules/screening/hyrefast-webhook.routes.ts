import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { AppError } from '../../shared/errors/app-error.js';
import { processHyrefastWebhook } from './hyrefast-webhook.service.js';

/**
 * Hyrefast video interview webhooks.
 *   POST /api/v1/webhooks/hyrefast
 *   POST /api/v1/public/webhooks/hyrefast
 */
export const hyrefastWebhookRouter = Router();

const posts = Router();
posts.use(...webhookBodyMiddleware);

posts.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await processHyrefastWebhook(req);
      res.status(200).json(result);
    } catch (err) {
      const statusCode =
        err instanceof Error &&
        typeof (err as Error & { statusCode?: number }).statusCode === 'number'
          ? (err as Error & { statusCode: number }).statusCode
          : 500;
      if (statusCode === 401) {
        throw new AppError(
          401,
          'HYREFAST_WEBHOOK_INVALID_SIGNATURE',
          err instanceof Error ? err.message : 'Invalid signature'
        );
      }
      throw err;
    }
  })
);

hyrefastWebhookRouter.use(posts);
