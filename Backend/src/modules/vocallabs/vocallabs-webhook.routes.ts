import { Router, type Request, type Response } from 'express';

import { webhookBodyMiddleware } from '../../middleware/raw-body.js';
import { emitAiCallUpdated } from '../../realtime/events.js';
import { setCampaignContactCallStatus } from './campaign-contacts.js';
import { logRyloCall, readRyloCallLink } from '../../providers/rylo/rylo.call-lookup.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

/**
 * Vocallabs callbacks. Prints the request body and acknowledges.
 *   POST /api/v1/webhooks/vocallabs
 *   POST /api/v1/webhooks/vocallabs-pre
 *   POST /api/v1/webhooks/vocallabs-post
 */
function bodyForLog(req: Request): unknown {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = Buffer.isBuffer(req.body) && req.body.length > 0 ? req.body : req.rawBody;
  if (!raw || raw.length === 0) return null;
  const text = raw.toString('utf8');
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function readField(body: unknown, key: string): string {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
  const value = (body as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

function vocallabsLogRouter(label: string, options?: { loadCall?: boolean }): Router {
  const router = Router();
  router.use(...webhookBodyMiddleware);
  router.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
      const body = bodyForLog(req);
      console.info(`[vocallabs webhook ${label}]`, JSON.stringify(body, null, 2));
      if (options?.loadCall) {
        const callId = readField(body, 'call_id');
        if (callId) {
          const reads = await logRyloCall(callId);
          const link = readRyloCallLink(reads, {
            callId,
            queueId: readField(body, 'queue_id'),
            status: readField(body, 'status'),
          });
          if (link) {
            const updated = await setCampaignContactCallStatus(link);
            if (updated) emitAiCallUpdated(updated);
          }
        }
      }
      res.status(200).json({ received: true });
    })
  );
  return router;
}

export const vocallabsWebhookRouter = vocallabsLogRouter('vocallabs');
export const vocallabsPreWebhookRouter = vocallabsLogRouter('pre');
export const vocallabsPostWebhookRouter = vocallabsLogRouter('post', { loadCall: true });
