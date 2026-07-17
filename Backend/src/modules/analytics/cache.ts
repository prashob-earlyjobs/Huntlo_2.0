import { createHash } from 'node:crypto';

type CacheEntry = { expiresAt: number; value: unknown };

const store = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 30_000;

export function analyticsCacheKey(
  organizationId: string,
  scope: string,
  filters: unknown
): string {
  const hash = createHash('sha1')
    .update(JSON.stringify(filters ?? {}))
    .digest('hex')
    .slice(0, 16);
  return `${organizationId}:${scope}:${hash}`;
}

export function getCachedAnalytics<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCachedAnalytics<T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_TTL_MS
): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Test helper */
export function clearAnalyticsCache(): void {
  store.clear();
}
