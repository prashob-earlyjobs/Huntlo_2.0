import type { Request, Response } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { ingestWebhook } from '../webhooks/ingest.service.js';

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

/**
 * Razorpay / Dodo webhook ingress — delegates to the centralized webhook layer
 * (signature verify, idempotency, async/safe processing).
 */
export async function processDodoWebhook(req: Request, res: Response) {
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    throw AppError.badRequest('Empty webhook body');
  }
  const result = await ingestWebhook({
    provider: 'dodo',
    rawBody,
    body: asBody(req),
    headers: req.headers as Record<string, string | string[] | undefined>,
    query: req.query as Record<string, unknown>,
  });
  return res.status(result.statusCode).json(result.body);
}

export async function processRazorpayWebhook(req: Request, res: Response) {
  const rawBody = req.rawBody;
  if (!rawBody || rawBody.length === 0) {
    throw AppError.badRequest('Empty webhook body');
  }
  const result = await ingestWebhook({
    provider: 'razorpay',
    rawBody,
    body: asBody(req),
    headers: req.headers as Record<string, string | string[] | undefined>,
    query: req.query as Record<string, unknown>,
  });
  return res.status(result.statusCode).json(result.body);
}
