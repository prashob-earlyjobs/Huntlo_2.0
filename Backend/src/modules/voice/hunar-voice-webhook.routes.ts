import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { processHunarWebhook } from '../screening/webhook.service.js';
import { processCampaignVoiceWebhook } from './voice-webhook.service.js';
import type { HunarWebhookKind } from '../../providers/hunar/hunar.webhook.js';

/**
 * Hunar voice callbacks — primary mount:
 *   POST /api/integrations/voice/hunar/{call-status|call-recording|call-result|call-summary}
 * Also mounted at /api/v1/webhooks/hunar and /api/v1/public/webhooks/hunar for compatibility.
 */
export const hunarVoiceWebhookRouter = Router();

hunarVoiceWebhookRouter.use(...webhookBodyMiddleware);

async function handleKind(kind: HunarWebhookKind, req: Request, res: Response) {
  const screeningId = String(req.query?.screeningId || '').trim() || null;
  const campaignId = String(req.query?.campaignId || '').trim() || null;

  if (campaignId && !screeningId) {
    const result = await processCampaignVoiceWebhook({
      kind,
      campaignId,
      body: req.body,
      headers: req.headers as Record<string, string | string[] | undefined>,
      rawBody: req.rawBody ?? null,
    });
    res.status(200).json({ success: true, data: result });
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

hunarVoiceWebhookRouter.post(
  '/call-status',
  asyncHandler(async (req, res) => handleKind('call-status', req, res))
);
hunarVoiceWebhookRouter.post(
  '/call-recording',
  asyncHandler(async (req, res) => handleKind('call-recording', req, res))
);
hunarVoiceWebhookRouter.post(
  '/call-result',
  asyncHandler(async (req, res) => handleKind('call-result', req, res))
);
hunarVoiceWebhookRouter.post(
  '/call-summary',
  asyncHandler(async (req, res) => handleKind('call-summary', req, res))
);

hunarVoiceWebhookRouter.post(
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
