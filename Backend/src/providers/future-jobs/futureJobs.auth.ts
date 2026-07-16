import { getEnv, isTest } from '../../config/env.js';
import type { FutureJobsAuthStyle, FutureJobsConfig } from './futureJobs.types.js';

/**
 * Strip invisible / non-Latin-1 characters often pasted into .env.
 * HTTP headers must be ByteString-safe.
 */
export function normalizeApiKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[^\x20-\x7E]/g, '').trim();
}

export function getFutureJobsConfig(): FutureJobsConfig {
  const env = getEnv();
  const apiKey = normalizeApiKey(env.FUTURE_JOBS_API_KEY);
  const authStyle = env.FUTURE_JOBS_AUTH_STYLE as FutureJobsAuthStyle;

  return {
    baseUrl: env.FUTURE_JOBS_API_URL.replace(/\/$/, ''),
    apiKey,
    authStyle,
    useMock: shouldUseFutureJobsMock(),
    timeoutMs: env.FUTURE_JOBS_TIMEOUT_MS,
    maxRetries: env.FUTURE_JOBS_MAX_RETRIES,
    circuitFailureThreshold: env.FUTURE_JOBS_CIRCUIT_FAILURE_THRESHOLD,
    circuitResetMs: env.FUTURE_JOBS_CIRCUIT_RESET_MS,
  };
}

/**
 * Mock when explicitly enabled, in test, or when API key is missing outside production.
 */
export function shouldUseFutureJobsMock(): boolean {
  const env = getEnv();
  const apiKey = normalizeApiKey(env.FUTURE_JOBS_API_KEY);

  if (env.FUTURE_JOBS_USE_MOCK === true) return true;

  if (!apiKey && env.APP_ENV !== 'production') return true;

  if (typeof env.FUTURE_JOBS_USE_MOCK === 'boolean') {
    return env.FUTURE_JOBS_USE_MOCK;
  }

  if (isTest()) return true;
  if (!apiKey) return true;
  return false;
}

/** Same auth styles as POST /wl/sourcing-session. */
export function buildFjAuthHeaders(
  apiKey: string,
  authStyle?: FutureJobsAuthStyle
): Record<string, string> {
  const style = authStyle ?? getFutureJobsConfig().authStyle;

  if (style === 'bearer') {
    return { Authorization: `Bearer ${apiKey}` };
  }
  if (style === 'x-api-key') {
    return { 'X-Api-Key': apiKey };
  }
  return { 'x-fj-api-key': apiKey };
}

export function fjAuthStyleLabel(authStyle?: FutureJobsAuthStyle): string {
  return authStyle ?? getFutureJobsConfig().authStyle;
}
