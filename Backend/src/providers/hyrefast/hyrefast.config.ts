/**
 * Hyrefast video interview API — server-to-server integration.
 * @see https://developers.hyrefast.ai/
 */

export function getHyrefastApiKey(): string {
  return String(process.env.HYREFAST_API_KEY || '').trim();
}

export function getHyrefastWebhookSecret(): string {
  return String(process.env.HYREFAST_WEBHOOK_SECRET || '').trim();
}

/**
 * Host only, e.g. https://api.hyrefast.ai or https://staging-api.hyrefast.ai
 * If HYREFAST_BASE_URL accidentally includes /external/api/v1, it is stripped.
 */
export function getHyrefastBaseUrl(): string {
  return String(process.env.HYREFAST_BASE_URL || 'https://api.hyrefast.ai')
    .trim()
    .replace(/\/$/, '')
    .replace(/\/external\/api\/v1$/i, '')
    .replace(/\/client\/api\/v1\/external$/i, '');
}

export function isHyrefastConfigured(): boolean {
  return Boolean(getHyrefastApiKey());
}

export async function testHyrefastConnection(): Promise<{ ok: boolean; message: string }> {
  const apiKey = getHyrefastApiKey();
  if (!apiKey) {
    return { ok: false, message: 'Hyrefast API key is not configured on the server.' };
  }
  const base = getHyrefastBaseUrl();
  const res = await fetch(`${base}/external/api/v1/jobs/list`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ page: 1, limit: 1 }),
  });
  if (res.status === 401 || res.status === 403) {
    return { ok: false, message: 'Hyrefast API key was rejected.' };
  }
  if (res.status === 404) {
    return {
      ok: false,
      message: `Hyrefast endpoint not found at ${base}. Use host only (no /external/api/v1 suffix).`,
    };
  }
  if (!res.ok && res.status >= 500) {
    return { ok: false, message: 'Hyrefast API is temporarily unavailable.' };
  }
  return { ok: true, message: 'Hyrefast video interview API is ready.' };
}
