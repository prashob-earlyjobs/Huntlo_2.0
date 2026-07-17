import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { processHunarWebhook } from '../screening/webhook.service.js';
import type { HunarWebhookKind } from '../../providers/hunar/hunar.webhook.js';

/**
 * Hunar voice callbacks — path matches buildHunarCallbackUrls:
 * POST /api/v1/webhooks/hunar/{call-status|call-recording|call-result|call-summary}?screeningId=
 */
export const hunarWebhookRouter = Router();

hunarWebhookRouter.use(...webhookBodyMiddleware);

async function handleKind(kind: HunarWebhookKind, req: Request, res: Response) {
  const screeningId = String(req.query?.screeningId || '').trim() || null;
  const campaignId = String(req.query?.campaignId || '').trim() || null;

  // Outreach campaign voice callbacks are acknowledged; enrollment updates land later.
  if (campaignId && !screeningId) {
    res.status(200).json({
      success: true,
      data: { ignored: true, reason: 'campaign_voice_callback', campaignId },
    });
    return;
  }

  const result = await processHunarWebhook({
    kind,
    screeningId,
    body: req.body,
    headers: req.headers as Record<string, string | string[] | undefined>,
    rawBody: req.rawBody ?? null,
  });
  res.status(200).json({ success: true, data: result });
}

hunarWebhookRouter.post(
  '/call-status',
  asyncHandler(async (req, res) => handleKind('call-status', req, res))
);
hunarWebhookRouter.post(
  '/call-recording',
  asyncHandler(async (req, res) => handleKind('call-recording', req, res))
);
hunarWebhookRouter.post(
  '/call-result',
  asyncHandler(async (req, res) => handleKind('call-result', req, res))
);
hunarWebhookRouter.post(
  '/call-summary',
  asyncHandler(async (req, res) => handleKind('call-summary', req, res))
);

/** Aggregated ingress also accepted at POST /hunar with ?kind= */
hunarWebhookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const kind = String(req.query.kind || req.body?.kind || 'call-status').trim() as HunarWebhookKind;
    const allowed: HunarWebhookKind[] = [
      'call-status',
      'call-recording',
      'call-result',
      'call-summary',
    ];
    await handleKind(allowed.includes(kind) ? kind : 'call-status', req, res);
  })
);
