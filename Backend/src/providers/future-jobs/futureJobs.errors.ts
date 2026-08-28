import { createChildLogger } from '../../config/logger.js';

export const FUTURE_JOBS_UPSTREAM_USER_MESSAGE =
  "We couldn't complete the search right now. Please try again shortly.";

export const FUTURE_JOBS_UPSTREAM_ERROR_CODE = 'FUTURE_JOBS_UPSTREAM_ERROR';

export const FUTURE_JOBS_CIRCUIT_OPEN_CODE = 'FUTURE_JOBS_CIRCUIT_OPEN';

export const FUTURE_JOBS_PROFILE_NOT_FOUND_CODE = 'FUTURE_JOBS_PROFILE_NOT_FOUND';

export const FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE = 'FUTURE_JOBS_INVALID_LINKEDIN_URL';

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

/** FJ sometimes returns HTTP 400 when fetch-more has no additional matches. */
export function isFjNoMoreProfilesError(err: unknown): boolean {
  if (!isFutureJobsUpstreamError(err)) return false;
  if (err.code === 'FUTURE_JOBS_NO_MORE_PROFILES') return true;
  if (err.fjHttpStatus !== 400) return false;
  const details = err.details;
  let message = err.message || '';
  if (typeof details === 'string') {
    message = details;
  } else if (details && typeof details === 'object') {
    const o = details as Record<string, unknown>;
    if (typeof o.message === 'string') message = o.message;
    else if (typeof o.error === 'string') message = o.error;
  }
  return /no profiles match/i.test(message);
}

/** FJ reveal-contacts 404 when the LinkedIn URL is not resolvable (often vanity/flagship). */
export function isFjProfileNotFoundError(err: unknown): boolean {
  if (!isFutureJobsUpstreamError(err)) return false;
  if (err.code === FUTURE_JOBS_PROFILE_NOT_FOUND_CODE) return true;
  if (err.fjHttpStatus !== 404) return false;
  const details = err.details;
  let message = err.message || '';
  if (typeof details === 'string') {
    message = details;
  } else if (details && typeof details === 'object') {
    const o = details as Record<string, unknown>;
    if (typeof o.message === 'string') message = o.message;
    else if (typeof o.error === 'string') message = o.error;
  }
  return /no profile found/i.test(message);
}

function fjHttpBodyText(data: unknown): string {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

export function isFjInvalidLinkedinUrlResponse(status: number, data: unknown): boolean {
  if (status !== 422) return false;
  return /invalid linkedin profile url|spaces are not allowed/i.test(fjHttpBodyText(data));
}

/** FJ 422 when reveal-contacts rejects the LinkedIn URL (spaces / not a profile URL). */
export function isFjInvalidLinkedinUrlError(err: unknown): boolean {
  if (!isFutureJobsUpstreamError(err)) return false;
  if (err.code === FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE) return true;
  return isFjInvalidLinkedinUrlResponse(err.fjHttpStatus, err.details);
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

  const fjMessage =
    data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
      ? String((data as { message: string }).message)
      : typeof data === 'string'
        ? data
        : '';
  const noMoreProfiles =
    res.status === 400 && /no profiles match/i.test(fjMessage);
  const revealProfileNotFound =
    res.status === 404 && /no profile found/i.test(fjMessage);
  const invalidLinkedinUrl = isFjInvalidLinkedinUrlResponse(res.status, data);
  const expectedMiss = noMoreProfiles || revealProfileNotFound || invalidLinkedinUrl;

  throw createFutureJobsUpstreamError({
    details: data,
    fjHttpStatus: res.status,
    fjOperation: logContext.fjOperation ?? logContext.label,
    // Business "exhausted" / "not found" / invalid-input responses — not an upstream outage.
    statusCode: expectedMiss ? res.status : 502,
    message: noMoreProfiles
      ? fjMessage || 'No profiles match your search criteria.'
      : revealProfileNotFound
        ? fjMessage || 'No profile found for the given linkedin_profile_url'
        : invalidLinkedinUrl
          ? 'Invalid LinkedIn profile URL'
          : undefined,
    code: noMoreProfiles
      ? 'FUTURE_JOBS_NO_MORE_PROFILES'
      : revealProfileNotFound
        ? FUTURE_JOBS_PROFILE_NOT_FOUND_CODE
        : invalidLinkedinUrl
          ? FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE
          : undefined,
    logFailure: !expectedMiss,
    logExtra: logContext.extra,
  });
}
