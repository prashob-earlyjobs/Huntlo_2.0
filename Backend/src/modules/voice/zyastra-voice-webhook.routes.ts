import { Router, type Request, type Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  fetchZyastraRecording,
  isZyastraConfigured,
} from '../../providers/zyastra/index.js';
import { VoiceCallModel } from './voice-call.model.js';
import { processZyastraVoiceWebhook } from './zyastra-voice-webhook.service.js';

/**
 * Zyastra AI Voice callbacks — primary mount:
 *   POST /api/integrations/voice/zyastra
 * Optional alias:
 *   POST /api/v1/webhooks/zyastra
 *
 * Recording proxy (streams via Huntlo’s Zyastra credentials):
 *   GET /api/integrations/voice/zyastra/recording/:callId
 */
export const zyastraVoiceWebhookRouter = Router();

zyastraVoiceWebhookRouter.get(
  '/recording/:callId',
  asyncHandler(async (req: Request, res: Response) => {
    const callId = String(req.params.callId || '').trim();
    if (!callId) {
      throw new AppError(400, 'CALL_ID_REQUIRED', 'callId is required');
    }

    const row = await VoiceCallModel.findOne({ callId }).sort({ updatedAt: -1 }).lean();
    if (!row || row.provider !== 'zyastra') {
      throw new AppError(404, 'RECORDING_NOT_FOUND', 'Recording not found');
    }

    if (!isZyastraConfigured()) {
      throw new AppError(503, 'ZYASTRA_NOT_CONFIGURED', 'Zyastra voice API is not configured');
    }

    const fetched = await fetchZyastraRecording(callId);
    if (!fetched.ok) {
      throw new AppError(
        fetched.statusCode >= 400 && fetched.statusCode < 600 ? fetched.statusCode : 502,
        'ZYASTRA_RECORDING_FETCH_FAILED',
        fetched.message
      );
    }

    if (fetched.kind === 'redirect' || fetched.kind === 'json-url') {
      res.redirect(302, fetched.url);
      return;
    }

    // Allow <audio> on the frontend origin (localhost / app) to load this stream.
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', fetched.contentType || 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.setHeader('Accept-Ranges', 'bytes');
    res.status(200).send(fetched.body);
  })
);

const zyastraWebhookPosts = Router();
zyastraWebhookPosts.use(...webhookBodyMiddleware);

async function handle(req: Request, res: Response) {
  const result = await processZyastraVoiceWebhook({
    body: req.body,
    headers: req.headers as Record<string, string | string[] | undefined>,
    rawBody: req.rawBody ?? null,
  });
  res.status(200).json({ success: true, data: result });
}

zyastraWebhookPosts.post('/', asyncHandler(handle));
zyastraWebhookPosts.post('/callback', asyncHandler(handle));
zyastraVoiceWebhookRouter.use(zyastraWebhookPosts);
