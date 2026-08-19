/**
 * Hyrefast video interview API.
 * Docs: https://developers.hyrefast.ai/
 * Spec: https://developers.hyrefast.ai/openapi.yaml
 *
 * Staging is the documented default for integration testing.
 * Override with HYREFAST_API_BASE_URL for production.
 */

export const HYREFAST_DEFAULT_BASE_URL = 'https://staging-api.hyrefast.ai/external/api/v1';

export function getHyrefastApiKey(): string {
  return String(process.env.HYREFAST_API_KEY || '').trim();
}

export function getHyrefastBaseUrl(): string {
  return String(process.env.HYREFAST_API_BASE_URL || HYREFAST_DEFAULT_BASE_URL)
    .trim()
    .replace(/\/$/, '');
}

export function isHyrefastConfigured(): boolean {
  return Boolean(getHyrefastApiKey());
}

export function hyrefastUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${getHyrefastBaseUrl()}${suffix}`;
}
