import { withVocallabsAuth } from './rylo.agents.js';
import { ryloGetPostCallDataUrl } from './rylo.config.js';

const HIDDEN_KEYS = new Set(['cut_the_call', 'contact_id']);
const KEY_TTL_MS = 60_000;
const keyCache = new Map<string, { at: number; keys: string[] }>();

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Field names the agent is set up to capture, before any call is placed. */
export function readPostCallDataKeys(body: unknown): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    const record = asRecord(value);
    if (!record) return;
    const key = typeof record.key === 'string' ? record.key.trim() : '';
    const definesField = typeof record.prompt === 'string' || typeof record.description === 'string';
    if (
      definesField &&
      key &&
      !key.startsWith('ai_') &&
      !HIDDEN_KEYS.has(key) &&
      !seen.has(key)
    ) {
      seen.add(key);
      keys.push(key.slice(0, 80));
    }
    for (const child of Object.values(record)) {
      if (child && typeof child === 'object') walk(child);
    }
  };
  walk(body);
  return keys;
}

export async function listRyloPostCallDataKeys(agentId: string): Promise<string[]> {
  const id = agentId.trim();
  if (!id) return [];
  const cached = keyCache.get(id);
  if (cached && Date.now() - cached.at < KEY_TTL_MS) return cached.keys;
  try {
    const response = await withVocallabsAuth((token) =>
      fetch(ryloGetPostCallDataUrl(id), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) return cached?.keys ?? [];
    const keys = readPostCallDataKeys(body);
    keyCache.set(id, { at: Date.now(), keys });
    return keys;
  } catch {
    return cached?.keys ?? [];
  }
}
