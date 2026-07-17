import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { getEnv } from '../config/env.js';
import { getLogger } from '../config/logger.js';
import { AppError } from '../shared/errors/app-error.js';
import { errorResponse } from '../shared/http/response.js';
import { getRequestId } from './request-id.js';

function zodToDetails(error: ZodError): Array<{ path?: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || undefined,
    message: issue.message,
  }));
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const logger = getLogger();
  const requestId = getRequestId(req);

  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      logger.error(
        {
          err,
          requestId,
          userId: req.userId ?? req.auth?.sub ?? null,
          organizationId: req.organizationId ?? req.auth?.orgId ?? null,
          errorClass: err.code,
        },
        err.message
      );
    } else {
      logger.warn(
        {
          err: { code: err.code, statusCode: err.statusCode },
          requestId,
          userId: req.userId ?? req.auth?.sub ?? null,
          organizationId: req.organizationId ?? req.auth?.orgId ?? null,
          errorClass: err.code,
        },
        err.message
      );
    }

    errorResponse(res, {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      requestId,
      details: err.details,
      meta: err.meta,
    });
    return;
  }

  if (err instanceof ZodError) {
    errorResponse(res, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      requestId,
      details: zodToDetails(err),
    });
    return;
  }

  if (err instanceof Error && err.message.startsWith('CORS origin not allowed')) {
    errorResponse(res, {
      statusCode: 403,
      code: 'CORS_FORBIDDEN',
      message: 'Origin not allowed by CORS policy',
      requestId,
    });
    return;
  }

  logger.error(
    {
      err,
      requestId,
      userId: req.userId ?? req.auth?.sub ?? null,
      organizationId: req.organizationId ?? req.auth?.orgId ?? null,
      errorClass: 'INTERNAL_ERROR',
    },
    'Unhandled error'
  );

  const message =
    getEnv().APP_ENV === 'production' ? 'Internal server error' : err instanceof Error ? err.message : 'Internal server error';

  errorResponse(res, {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message,
    requestId,
  });
};
