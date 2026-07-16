import type { Response } from 'express';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SuccessMeta = {
  requestId?: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: SuccessMeta;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path?: string; message: string }>;
  };
  requestId: string;
};

export function successResponse<T>(
  res: Response,
  data: T,
  options?: {
    statusCode?: number;
    meta?: SuccessMeta;
  }
): Response {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    ...(options?.meta ? { meta: options.meta } : {}),
  };
  return res.status(options?.statusCode ?? 200).json(body);
}

export function errorResponse(
  res: Response,
  options: {
    statusCode: number;
    code: string;
    message: string;
    requestId: string;
    details?: Array<{ path?: string; message: string }>;
  }
): Response {
  const body: ErrorResponse = {
    success: false,
    error: {
      code: options.code,
      message: options.message,
      ...(options.details?.length ? { details: options.details } : {}),
    },
    requestId: options.requestId,
  };
  return res.status(options.statusCode).json(body);
}
