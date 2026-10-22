import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export const futureJobsWebhookVerify = (req: Request, res: Response, next: NextFunction) => {
  // The webhook router parses JSON into req.body. FutureJobs signs the original bytes.
  const rawBytes = Buffer.isBuffer(req.rawBody)
    ? req.rawBody
    : Buffer.isBuffer(req.body)
      ? req.body
      : null;
  if (!rawBytes) {
    return res.sendStatus(401);
  }

  const rawBody = rawBytes.toString('utf8');
  const header = req.get('X-FutureJobs-Signature') || '';
  const { t, v1 } = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const expected = crypto
    .createHmac('sha256', process.env.FUTUREJOBS_WEBHOOK_SECRET as string)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  const fresh = Math.abs(Date.now() / 1000 - Number(t)) < 300;
  const signature = typeof v1 === 'string' ? v1 : '';
  if (
    !fresh ||
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return res.sendStatus(401);
  }

  const event = JSON.parse(rawBody) as {
    eventType?: string;
    payload?: { challenge?: string };
  };
  if (event.eventType === 'webhook.verification') {
    return res.json({ challenge: event.payload?.challenge });
  }
  // Skip event.id if already processed (retries reuse it), then handle event.eventType.
  next();
};
