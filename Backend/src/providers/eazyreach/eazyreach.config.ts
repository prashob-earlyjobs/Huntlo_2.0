/** EazyReach B2B enrichment — https://docs.eazyreach.app/ */

export const EAZYREACH_DEFAULT_BASE_URL = 'https://api.superflow.run';

export function getEazyreachBaseUrl(): string {
  return String(process.env.EAZYREACH_BASE_URL || EAZYREACH_DEFAULT_BASE_URL)
    .trim()
    .replace(/\/$/, '');
}

/** Prefer a ready-made JWT from the dashboard when set. */
export function getEazyreachAuthToken(): string {
  return String(
    process.env.EAZYREACH_AUTH_TOKEN || process.env.EAZYREACH_API_TOKEN || ''
  ).trim();
}

export function getEazyreachApiKey(): string {
  return String(process.env.EAZYREACH_API_KEY || '').trim();
}

export function getEazyreachApiSecret(): string {
  return String(process.env.EAZYREACH_API_SECRET || '').trim();
}

export function isEazyreachConfigured(): boolean {
  return Boolean(
    getEazyreachAuthToken() || (getEazyreachApiKey() && getEazyreachApiSecret()) || getEazyreachApiKey()
  );
}
