import type { RequestHandler } from 'express';

import { getLogger } from '../config/logger.js';
import { getRequestId } from './request-id.js';

export const requestTimingMiddleware: RequestHandler = (req, res, next) => {
  const logger = getLogger();

  res.on('finish', () => {
    const durationMs = Date.now() - req.startTimeMs;
    const payload = {
      requestId: getRequestId(req),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) {
      logger.error(payload, 'Request completed with server error');
    } else if (res.statusCode >= 400) {
      logger.warn(payload, 'Request completed with client error');
    } else if (durationMs >= 1000) {
      logger.warn(payload, 'Slow request completed');
    } else {
      logger.info(payload, 'Request completed');
    }
  });

  next();
};
