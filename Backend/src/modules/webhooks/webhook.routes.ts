import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { getMetaWebhookVerifyToken } from '../../providers/meta-whatsapp/meta.config.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ingestWebhook } from './ingest.service.js';
import type { WebhookProvider } from './webhook-event.model.js';

export const webhooksRouter = Router();

webhooksRouter.use(...webhookBodyMiddleware);

function organizationFromRequest(req: Request): string | null {
  return (
    (req.headers['x-organization-id'] as string | undefined) ||
    (req.query.organizationId as string | undefined) ||
    null
  );
}

function asBody(req: Request): Record<string, unknown> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (req.rawBody && req.rawBody.length > 0) {
    try {
      return JSON.parse(req.rawBody.toString('utf8')) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

async function handlePost(
  provider: WebhookProvider,
  req: Request,
  res: Response,
  options?: { hunarKind?: string }
) {
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    throw AppError.badRequest('Empty webhook body');
  }

  const body = asBody(req);
  const query: Record<string, unknown> = {
    ...(req.query as Record<string, unknown>),
  };
  if (provider === 'hunar') {
    const screeningId = String(query.screeningId || '').trim();
    if (screeningId) {
      body._ingestMeta = { ...(body._ingestMeta as object || {}), screeningId };
    }
    const kind = String(options?.hunarKind || query.kind || body.kind || 'call-status');
    query.kind = kind;
    body.kind = kind;
  }

  const result = await ingestWebhook({
    provider,
    rawBody,
    body,
    headers: req.headers as Record<string, string | string[] | undefined>,
    query,
    organizationId: organizationFromRequest(req),
  });

  // Provider-appropriate responses: always 200 on accept/duplicate for retries.
  if (provider === 'hunar') {
    const data =
      result.processingResult && typeof result.processingResult === 'object'
        ? result.processingResult
        : { duplicate: result.duplicate, status: result.duplicate ? 'duplicate' : 'accepted' };
    res.status(result.statusCode).json({ success: true, data, ...result.body });
    return;
  }

  res.status(result.statusCode).json(result.body);
}

/** Meta WhatsApp subscription verification */
webhooksRouter.get(
  '/meta',
  asyncHandler(async (req, res) => {
    const mode = String(req.query['hub.mode'] || '');
    const token = String(req.query['hub.verify_token'] || '');
    const challenge = String(req.query['hub.challenge'] || '');
    const expected = getMetaWebhookVerifyToken();
    if (mode === 'subscribe' && expected && token === expected) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Verify failed' },
    });
  })
);

webhooksRouter.post(
  '/meta',
  asyncHandler(async (req, res) => handlePost('meta', req, res))
);

webhooksRouter.post(
  '/gupshup',
  asyncHandler(async (req, res) => handlePost('gupshup', req, res))
);

webhooksRouter.post(
  '/hunar',
  asyncHandler(async (req, res) => handlePost('hunar', req, res))
);

webhooksRouter.post(
  '/hunar/call-status',
  asyncHandler(async (req, res) =>
    handlePost('hunar', req, res, { hunarKind: 'call-status' })
  )
);
webhooksRouter.post(
  '/hunar/call-recording',
  asyncHandler(async (req, res) =>
    handlePost('hunar', req, res, { hunarKind: 'call-recording' })
  )
);
webhooksRouter.post(
  '/hunar/call-result',
  asyncHandler(async (req, res) =>
    handlePost('hunar', req, res, { hunarKind: 'call-result' })
  )
);
webhooksRouter.post(
  '/hunar/call-summary',
  asyncHandler(async (req, res) =>
    handlePost('hunar', req, res, { hunarKind: 'call-summary' })
  )
);

webhooksRouter.post(
  '/calendly',
  asyncHandler(async (req, res) => handlePost('calendly', req, res))
);

webhooksRouter.post(
  '/razorpay',
  asyncHandler(async (req, res) => handlePost('razorpay', req, res))
);

webhooksRouter.post(
  '/dodo',
  asyncHandler(async (req, res) => handlePost('dodo', req, res))
);
