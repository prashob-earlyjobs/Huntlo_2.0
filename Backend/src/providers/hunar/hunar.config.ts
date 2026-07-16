/**
 * Hunar voice API key helpers — from EJHunterLanding hunarVoiceCallService.js
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
