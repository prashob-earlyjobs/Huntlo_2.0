import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
    startTimeMs: number;
    rawBody?: Buffer;
  }
}

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId =
    incoming && incoming.trim().length > 0 ? incoming.trim() : randomUUID();

  req.requestId = requestId;
  req.startTimeMs = Date.now();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
};

export function getRequestId(req: { requestId?: string }): string {
  return req.requestId ?? 'unknown';
}
