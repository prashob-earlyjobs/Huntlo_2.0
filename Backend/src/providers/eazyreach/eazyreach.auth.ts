import {
  getEazyreachApiKey,
  getEazyreachApiSecret,
  getEazyreachAuthToken,
  getEazyreachBaseUrl,
} from './eazyreach.config.js';

type CachedToken = { token: string; expiresAtMs: number };

let cached: CachedToken | null = null;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function extractToken(body: unknown): string {
  const record = asRecord(body);
  const nested = asRecord(record.data);
  return String(
    record.authToken ||
      record.auth_token ||
      record.accessToken ||
      record.access_token ||
      record.token ||
      nested.authToken ||
      nested.auth_token ||
      nested.accessToken ||
      nested.access_token ||
      nested.token ||
      ''
  ).trim();
}

/**
 * Resolve a Bearer token for EazyReach B2B calls.
 * Order: static AUTH_TOKEN → createAuthToken(key/secret) → API_KEY as Bearer.
 */
export async function resolveEazyreachBearerToken(): Promise<string> {
  const staticToken = getEazyreachAuthToken();
  if (staticToken) return staticToken;

  if (cached && cached.expiresAtMs > Date.now() + 30_000) {
    return cached.token;
  }

  const apiKey = getEazyreachApiKey();
  const apiSecret = getEazyreachApiSecret();
  if (apiKey && apiSecret) {
    const token = await exchangeApiKeyForToken(apiKey, apiSecret);
    if (token) {
      cached = { token, expiresAtMs: Date.now() + 50 * 60_000 };
      return token;
    }
  }

  if (apiKey) return apiKey;

  throw new Error(
    'EazyReach is not configured. Set EAZYREACH_AUTH_TOKEN or EAZYREACH_API_KEY (+ SECRET).'
  );
}

export function clearEazyreachTokenCache(): void {
  cached = null;
}

async function exchangeApiKeyForToken(
  apiKey: string,
  apiSecret: string
): Promise<string | null> {
  const base = getEazyreachBaseUrl();
  const bodies = [
    { apiKey, apiSecret },
    { api_key: apiKey, api_secret: apiSecret },
    { clientId: apiKey, clientSecret: apiSecret },
    { key: apiKey, secret: apiSecret },
  ];
  const paths = ['/b2b/createAuthToken/', '/b2b/createAuthToken', '/b2b/auth/token'];

  for (const path of paths) {
    for (const body of bodies) {
      try {
        const response = await fetch(`${base}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });
        const json: unknown = await response.json().catch(() => null);
        if (!response.ok) continue;
        const token = extractToken(json);
        if (token) return token;
      } catch {
        // try next shape
      }
    }
  }
  return null;
}
