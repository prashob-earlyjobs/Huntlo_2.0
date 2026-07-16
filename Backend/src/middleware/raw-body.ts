import express, { type Request, type RequestHandler } from 'express';

/**
 * Captures the raw request body as a Buffer before JSON parsing.
 * Required for webhook signature verification (HMAC over raw bytes).
 */
export const rawBodyParser: RequestHandler = express.raw({
  type: (req) => {
    const request = req as Request;
    const contentType = request.headers['content-type'] ?? '';
    return (
      request.originalUrl.includes('/webhooks/') ||
      contentType.includes('application/json') ||
      contentType.includes('application/octet-stream')
    );
  },
  limit: '2mb',
  verify(req, _res, buf) {
    (req as Request).rawBody = buf;
  },
});

export function attachParsedJsonBody(): RequestHandler {
  return (req, _res, next) => {
    if (req.rawBody && Buffer.isBuffer(req.body)) {
      const contentType = req.headers['content-type'] ?? '';
      if (contentType.includes('json') && req.rawBody.length > 0) {
        try {
          req.body = JSON.parse(req.rawBody.toString('utf8')) as unknown;
        } catch {
          req.body = {};
        }
      }
    }
    next();
  };
}

/** Webhook-only middleware chain: raw body + optional JSON parse. */
export const webhookBodyMiddleware: RequestHandler[] = [rawBodyParser, attachParsedJsonBody()];

declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: Buffer;
  }
}
