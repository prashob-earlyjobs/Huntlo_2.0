/**
 * API response envelopes — kept in sync with Backend/src/shared/http/response.ts.
 * When OpenAPI generation is wired, these become the generated baseline.
 */

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

export type SuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: SuccessMeta;
};

export type ErrorDetail = {
  path?: string;
  message: string;
};

export type ErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
  requestId: string;
};

export type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export function isSuccessEnvelope<T>(
  envelope: ApiEnvelope<T>
): envelope is SuccessEnvelope<T> {
  return envelope.success === true;
}

export function isErrorEnvelope<T>(envelope: ApiEnvelope<T>): envelope is ErrorEnvelope {
  return envelope.success === false;
}
