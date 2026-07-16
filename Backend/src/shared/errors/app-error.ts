export type ErrorDetail = {
  path?: string;
  message: string;
};

export type QuotaErrorMeta = {
  metric: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetail[];
  readonly meta?: Record<string, unknown>;
  readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    options?: {
      details?: ErrorDetail[];
      meta?: Record<string, unknown>;
      cause?: unknown;
      isOperational?: boolean;
    }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = options?.details;
    this.meta = options?.meta;
    this.isOperational = options?.isOperational ?? true;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(400, 'BAD_REQUEST', message, { details });
  }

  static validation(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(400, 'VALIDATION_ERROR', message, { details });
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(409, 'CONFLICT', message, { details });
  }

  static quotaExceeded(
    message: string,
    quota: QuotaErrorMeta,
    details?: ErrorDetail[]
  ): AppError {
    return new AppError(429, 'QUOTA_EXCEEDED', message, {
      details,
      meta: { quota },
    });
  }

  static internal(message = 'Internal server error', cause?: unknown): AppError {
    return new AppError(500, 'INTERNAL_ERROR', message, {
      cause,
      isOperational: false,
    });
  }
}
