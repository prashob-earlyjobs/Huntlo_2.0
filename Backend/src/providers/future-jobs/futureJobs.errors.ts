export const FUTURE_JOBS_UPSTREAM_USER_MESSAGE =
  "We couldn't complete the search right now. Please try again shortly.";

export const FUTURE_JOBS_UPSTREAM_ERROR_CODE = 'FUTURE_JOBS_UPSTREAM_ERROR';

export const FUTURE_JOBS_CIRCUIT_OPEN_CODE = 'FUTURE_JOBS_CIRCUIT_OPEN';

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

export function createFutureJobsUpstreamError(options?: {
  details?: unknown;
  fjHttpStatus?: number;
  fjOperation?: string;
  statusCode?: number;
  message?: string;
  code?: string;
}): FutureJobsUpstreamError {
  return new FutureJobsUpstreamError(options);
}

export function createFutureJobsCircuitOpenError(
  fjOperation?: string
): FutureJobsUpstreamError {
  return new FutureJobsUpstreamError({
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
  });
}
