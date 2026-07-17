import { AppError } from '../../../shared/errors/app-error.js';

export const SEARCH_ERROR_CODES = {
  SEARCH_QUOTA_EXHAUSTED: 'SEARCH_QUOTA_EXHAUSTED',
  INVALID_SEARCH_PROMPT: 'INVALID_SEARCH_PROMPT',
  INVALID_FILTER_FORM: 'INVALID_FILTER_FORM',
  AUTOCOMPLETE_QUERY_TOO_SHORT: 'AUTOCOMPLETE_QUERY_TOO_SHORT',
  SOURCING_SESSION_NOT_FOUND: 'SOURCING_SESSION_NOT_FOUND',
  SOURCING_SESSION_FORBIDDEN: 'SOURCING_SESSION_FORBIDDEN',
  FUTURE_JOBS_PENDING: 'FUTURE_JOBS_PENDING',
  FUTURE_JOBS_UNAVAILABLE: 'FUTURE_JOBS_UNAVAILABLE',
  FUTURE_JOBS_TIMEOUT: 'FUTURE_JOBS_TIMEOUT',
  SEARCH_PERSISTENCE_FAILED: 'SEARCH_PERSISTENCE_FAILED',
  SEARCH_ALREADY_RUNNING: 'SEARCH_ALREADY_RUNNING',
} as const;

export function searchQuotaExhausted(
  message = 'Candidate search quota exhausted',
  meta?: Record<string, unknown>
): AppError {
  return new AppError(429, SEARCH_ERROR_CODES.SEARCH_QUOTA_EXHAUSTED, message, {
    meta,
  });
}

export function invalidSearchPrompt(message = 'Invalid search prompt'): AppError {
  return new AppError(422, SEARCH_ERROR_CODES.INVALID_SEARCH_PROMPT, message);
}

export function invalidFilterForm(message = 'Invalid filter form'): AppError {
  return new AppError(422, SEARCH_ERROR_CODES.INVALID_FILTER_FORM, message);
}

export function autocompleteQueryTooShort(): AppError {
  return new AppError(
    400,
    SEARCH_ERROR_CODES.AUTOCOMPLETE_QUERY_TOO_SHORT,
    'Autocomplete query must contain at least 3 characters'
  );
}

export function sourcingSessionNotFound(message = 'Sourcing session not found'): AppError {
  return new AppError(404, SEARCH_ERROR_CODES.SOURCING_SESSION_NOT_FOUND, message);
}

export function sourcingSessionForbidden(
  message = 'You do not have access to this sourcing session'
): AppError {
  return new AppError(403, SEARCH_ERROR_CODES.SOURCING_SESSION_FORBIDDEN, message);
}

export function futureJobsUnavailable(message = 'Future Jobs is unavailable', cause?: unknown): AppError {
  return new AppError(502, SEARCH_ERROR_CODES.FUTURE_JOBS_UNAVAILABLE, message, {
    cause,
  });
}

export function futureJobsTimeout(message = 'Future Jobs request timed out'): AppError {
  return new AppError(504, SEARCH_ERROR_CODES.FUTURE_JOBS_TIMEOUT, message);
}

export function searchPersistenceFailed(message = 'Failed to persist search results'): AppError {
  return new AppError(500, SEARCH_ERROR_CODES.SEARCH_PERSISTENCE_FAILED, message, {
    isOperational: false,
  });
}

export function searchAlreadyRunning(message = 'A search is already running for this session'): AppError {
  return new AppError(409, SEARCH_ERROR_CODES.SEARCH_ALREADY_RUNNING, message);
}
