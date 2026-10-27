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

/**
 * POST /b2b/createAuthToken/ with RYLO_CLIENT_ID and RYLO_CLIENT_SECRET.
 * Returns the bearer token used on later Rylo calls.
 */
export async function createRyloAuthToken(): Promise<RyloAuthToken> {
  const clientId = getRyloClientId();
  const clientSecret = getRyloClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error('RYLO_CLIENT_ID and RYLO_CLIENT_SECRET are not configured');
  }

  const response = await fetch(RYLO_CREATE_AUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Rylo auth failed (${response.status})`);
  }

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
