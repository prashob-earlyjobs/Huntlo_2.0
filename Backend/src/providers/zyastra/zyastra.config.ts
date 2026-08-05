/**
 * Zyastra AI Voice — non-Indian dial path.
 * Docs: Backend/scripts/Zyastra_AI_Voice_API_Integration_Guide.pdf
 */

export const ZYASTRA_API_BASE_URL = 'https://astraapi.zyvka.com/api/v1/external';
export const ZYASTRA_TRIGGER_URL = `${ZYASTRA_API_BASE_URL}/voice/trigger`;

export function getZyastraApiKey(): string {
  return String(process.env.ZYASTRA_API_KEY || '').trim();
}

export function getZyastraApiSecret(): string {
  return String(process.env.ZYASTRA_API_SECRET || '').trim();
}

export function getZyastraWebhookSecret(): string {
  return String(process.env.ZYASTRA_WEBHOOK_SECRET || '').trim();
}

export function getPublicApiBaseUrl(): string {
  return String(
    process.env.PUBLIC_API_BASE_URL || process.env.API_PUBLIC_BASE_URL || ''
  )
    .trim()
    .replace(/\/$/, '');
}

export function isZyastraConfigured(): boolean {
  return Boolean(getZyastraApiKey() && getZyastraApiSecret());
}

export function buildZyastraWebhookUrl(): string {
  const base = getPublicApiBaseUrl();
  if (!base) {
    const err = new Error(
      'PUBLIC_API_BASE_URL is not configured. Set it so Zyastra can deliver voice call callbacks.'
    );
    (err as Error & { code?: string }).code = 'ZYASTRA_CALLBACK_URL_MISSING';
    throw err;
  }
  return `${base}/api/integrations/voice/zyastra`;
}
