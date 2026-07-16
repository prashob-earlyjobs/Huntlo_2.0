/**
 * Hunar voice API — fields and URLs from EJHunterLanding hunarVoiceCallService.js
 * and Hunar Sheets integration docs (event_type, call_id, status, recording_url, result).
 */

export const HUNAR_AGENTS_URL = 'https://api.voice.hunar.ai/external/v1/agents/';
export const HUNAR_BULK_CALLS_URL = 'https://api.voice.hunar.ai/external/v1/calls/bulk/';

export function getHunarApiKey(): string {
  return String(process.env.HUNAR_VOICE_API_KEY || '').trim();
}

export function getHunarVoicePersona(): string {
  return String(process.env.HUNAR_VOICE_PERSONA || 'NEHA').trim();
}

export function getHunarVoiceLanguage(): string {
  return String(process.env.HUNAR_VOICE_LANGUAGE || 'ENGLISH').trim();
}

/** Shared secret for inbound Hunar callbacks (ARCHITECTURE webhook secret). */
export function getHunarWebhookSecret(): string {
  return String(process.env.HUNAR_WEBHOOK_SECRET || '').trim();
}

export function getPublicApiBaseUrl(): string {
  return String(
    process.env.PUBLIC_API_BASE_URL || process.env.API_PUBLIC_BASE_URL || ''
  )
    .trim()
    .replace(/\/$/, '');
}

export function isHunarConfigured(): boolean {
  return Boolean(getHunarApiKey());
}

export async function testHunarConnection(): Promise<{ ok: boolean; message: string }> {
  const apiKey = getHunarApiKey();
  if (!apiKey) {
    return { ok: false, message: 'Hunar voice API key is not configured on the server.' };
  }
  const res = await fetch(HUNAR_AGENTS_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401 || res.status === 403) {
    return { ok: false, message: 'Hunar API key was rejected.' };
  }
  if (!res.ok && res.status >= 500) {
    return { ok: false, message: 'Hunar API is temporarily unavailable.' };
  }
  return {
    ok: true,
    message: `Hunar voice is ready (persona ${getHunarVoicePersona()}).`,
  };
}
