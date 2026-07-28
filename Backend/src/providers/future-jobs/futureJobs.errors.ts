import { createChildLogger } from '../../config/logger.js';

export const FUTURE_JOBS_UPSTREAM_USER_MESSAGE =
  "We couldn't complete the search right now. Please try again shortly.";

export const FUTURE_JOBS_UPSTREAM_ERROR_CODE = 'FUTURE_JOBS_UPSTREAM_ERROR';

export const FUTURE_JOBS_CIRCUIT_OPEN_CODE = 'FUTURE_JOBS_CIRCUIT_OPEN';

const FJ_RESPONSE_LOG_MAX_CHARS = 2_000;

const log = () => createChildLogger({ provider: 'future-jobs' });

export class FutureJobsUpstreamError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown;
  readonly fjHttpStatus: number;
  readonly fjOperation?: string;

  constructor(options?: {
    details?: unknown;
    fjHttpStatus?: number;
    fjOperation?: string;
    statusCode?: number;
    message?: string;
    code?: string;
  }) {
    super(options?.message ?? FUTURE_JOBS_UPSTREAM_USER_MESSAGE);
    this.name = 'FutureJobsUpstreamError';
    this.statusCode = options?.statusCode ?? 502;
    this.code = options?.code ?? FUTURE_JOBS_UPSTREAM_ERROR_CODE;
    this.details = options?.details ?? null;
    this.fjHttpStatus = options?.fjHttpStatus ?? 502;
    if (options?.fjOperation) this.fjOperation = options.fjOperation;
  }
}

/** Truncate / stringify FJ response bodies for safe terminal logs. */
export function summarizeFjResponseForLog(data: unknown, maxChars = FJ_RESPONSE_LOG_MAX_CHARS): unknown {
  if (data == null) return data;
  if (typeof data === 'string') {
    return data.length <= maxChars ? data : `${data.slice(0, maxChars)}…[truncated]`;
  }
  try {
    const json = JSON.stringify(data);
    if (json.length <= maxChars) return data;
    return `${json.slice(0, maxChars)}…[truncated]`;
  } catch {
    return String(data).slice(0, maxChars);
  }
}

export function fjUpstreamLogFields(err: FutureJobsUpstreamError): Record<string, unknown> {
  return {
    fjHttpStatus: err.fjHttpStatus,
    fjOperation: err.fjOperation ?? null,
    fjResponse: summarizeFjResponseForLog(err.details),
    fjErrorCode: err.code,
  };
}

export function isFutureJobsUpstreamError(err: unknown): err is FutureJobsUpstreamError {
  return err instanceof FutureJobsUpstreamError;
}

function logUpstreamFailure(err: FutureJobsUpstreamError, extra?: Record<string, unknown>): void {
  log().error(
    {
      ...fjUpstreamLogFields(err),
      ...extra,
    },
    'Future Jobs upstream request failed'
  );
}

export function createFutureJobsUpstreamError(options?: {
  details?: unknown;
  fjHttpStatus?: number;
  fjOperation?: string;
  statusCode?: number;
  message?: string;
  code?: string;
  /** When false, skip the failure log (caller already logged). Default true. */
  logFailure?: boolean;
  logExtra?: Record<string, unknown>;
}): FutureJobsUpstreamError {
  const err = new FutureJobsUpstreamError(options);
  if (options?.logFailure !== false) {
    logUpstreamFailure(err, options?.logExtra);
  }
  return err;
}

export function createFutureJobsCircuitOpenError(
  fjOperation?: string
): FutureJobsUpstreamError {
  return createFutureJobsUpstreamError({
    message: FUTURE_JOBS_UPSTREAM_USER_MESSAGE,
    code: FUTURE_JOBS_CIRCUIT_OPEN_CODE,
    statusCode: 503,
    fjHttpStatus: 503,
    fjOperation,
    details: { reason: 'circuit_open' },
  });
}

type HttpLikeResponse = {
  ok: boolean;
  status: number;
};

export function throwIfFjHttpNotOk(
  res: HttpLikeResponse | null | undefined,
  data: unknown,
  logContext: {
    label?: string;
    fjOperation?: string;
    extra?: Record<string, unknown>;
  } = {}
): void {
  if (!res || res.ok) return;

  throw createFutureJobsUpstreamError({
    details: data,
    fjHttpStatus: res.status,
    fjOperation: logContext.fjOperation ?? logContext.label,
    statusCode: 502,
    logExtra: logContext.extra,
  });
}
