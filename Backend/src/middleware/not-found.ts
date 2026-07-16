import type { RequestHandler } from 'express';

import { AppError } from '../shared/errors/app-error.js';
import { errorResponse } from '../shared/http/response.js';
import { getRequestId } from './request-id.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  errorResponse(res, {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: getRequestId(req),
  });
};

export function assertFound<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw AppError.notFound(message);
  }
  return value;
}
