import { Router } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';

/**
 * Webhook ingress scaffold — raw body preserved for signature verification.
 * Provider-specific handlers will be added in the integrations phase.
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
