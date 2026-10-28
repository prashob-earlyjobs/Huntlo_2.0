import {
  getRyloClientId,
  getRyloClientSecret,
  RYLO_CREATE_AUTH_TOKEN_URL,
} from './rylo.config.js';

export type RyloAuthToken = {
  authToken: string;
  id: string;
  status: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const RETRYABLE_AUTH_STATUS = new Set([429, 502, 503, 504]);
const AUTH_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class RyloAuthHttpError extends Error {
  constructor(readonly status: number, options?: { cause?: unknown }) {
    super(`Rylo auth failed (${status})`, options);
    this.name = 'RyloAuthHttpError';
  }
}

function retryableAuthError(error: unknown): boolean {
  return error instanceof RyloAuthHttpError && RETRYABLE_AUTH_STATUS.has(error.status);
}

async function requestRyloAuthToken(clientId: string, clientSecret: string): Promise<RyloAuthToken> {
  let response: Response;
  try {
    response = await fetch(RYLO_CREATE_AUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ clientId, clientSecret }),
    });
  } catch (error) {
    throw new RyloAuthHttpError(502, { cause: error });
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new RyloAuthHttpError(response.status);

  const record = asRecord(body);
  const nested = asRecord(record.data);
  const authToken = String(
    record.authToken || record.auth_token || nested.authToken || nested.auth_token || ''
  ).trim();
  const id = String(record.id || nested.id || '').trim();
  if (!authToken) {
    throw new Error('Rylo auth response did not include auth_token');
  }

  return {
    authToken,
    id,
    status: String(record.status || nested.status || '').trim(),
  };
}

/**
 * POST /b2b/createAuthToken/ with RYLO_CLIENT_ID and RYLO_CLIENT_SECRET.
 * Returns the bearer token used on later Rylo calls.
 * A 502 from the token service is retried; bad credentials are not.
 */
export async function createRyloAuthToken(): Promise<RyloAuthToken> {
  const clientId = getRyloClientId();
  const clientSecret = getRyloClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error('RYLO_CLIENT_ID and RYLO_CLIENT_SECRET are not configured');
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= AUTH_ATTEMPTS; attempt += 1) {
    try {
      return await requestRyloAuthToken(clientId, clientSecret);
    } catch (error) {
      lastError = error;
      if (!retryableAuthError(error) || attempt === AUTH_ATTEMPTS) throw error;
      await sleep(200 * attempt);
    }
  }
  throw lastError;
}
