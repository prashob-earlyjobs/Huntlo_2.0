/**
 * Shared helpers for sourcing-session and People Scout contact reveal flows.
 * Ported from EJHunterLanding `utils/contactReveal.js` — do not invent FJ shapes.
 */

export type FutureJobsRevealType = 'EMAIL' | 'PHONE';

export function looksValidContact(value: unknown, revealType: FutureJobsRevealType): boolean {
  const s = String(value ?? '').trim();
  if (!s || s === '[object Object]') return false;
  if (revealType === 'EMAIL') return s.includes('@');
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7;
}

function collectStringsFromUnknown(input: unknown, out: string[]): void {
  if (input == null) return;
  if (typeof input === 'string' || typeof input === 'number') {
    out.push(String(input));
    return;
  }
  if (Array.isArray(input)) {
    for (const v of input) collectStringsFromUnknown(v, out);
    return;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    const keys = [
      'value',
      'values',
      'email',
      'emails',
      'phone',
      'phones',
      'mobile',
      'mobile_phone',
      'number',
      'numbers',
      'contact',
    ];
    for (const k of keys) {
      if (k in obj) collectStringsFromUnknown(obj[k], out);
    }
  }
}

/**
 * Extract contact strings from a Future Jobs reveal response.
 * Prefer `data.revealStatus.email|phone.values` (scout + sourcing shape).
 */
export function extractRevealValues(
  fj: unknown,
  revealType: FutureJobsRevealType
): string[] {
  const raw: string[] = [];
  const root = fj && typeof fj === 'object' ? (fj as Record<string, unknown>) : {};
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : null;

  const rs =
    data?.revealStatus && typeof data.revealStatus === 'object'
      ? (data.revealStatus as Record<string, unknown>)
      : null;
  if (rs) {
    const channel = revealType === 'EMAIL' ? rs.email : rs.phone;
    if (channel && typeof channel === 'object' && Array.isArray((channel as { values?: unknown }).values)) {
      collectStringsFromUnknown((channel as { values: unknown }).values, raw);
    }
  }

  if (data && Array.isArray(data.values) && data.values.length > 0) {
    collectStringsFromUnknown(data.values, raw);
  } else if (Array.isArray(data) && data.length > 0) {
    const match = data.find(
      (entry) =>
        entry &&
        typeof entry === 'object' &&
        String((entry as { type?: unknown }).type || '').toUpperCase() === revealType
    );
    if (match && typeof match === 'object') {
      const m = match as { values?: unknown };
      if (Array.isArray(m.values) && m.values.length > 0) {
        collectStringsFromUnknown(m.values, raw);
      } else {
        collectStringsFromUnknown(match, raw);
      }
    }
  } else if (data?.value != null) {
    collectStringsFromUnknown(data.value, raw);
  } else if (data && typeof data === 'object' && !Array.isArray(data)) {
    collectStringsFromUnknown(data, raw);
  }

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const v of raw.map((x) => String(x).trim())) {
    if (!looksValidContact(v, revealType)) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    deduped.push(v);
  }
  return deduped;
}

/**
 * Canonical LinkedIn profile URL for DB keys. Host is normalized; slug case is preserved
 * (member IDs like ACoAA… are case-sensitive for Future Jobs).
 */
export function normalizeLinkedinProfileUrl(url: string | null | undefined): string {
  let s = String(url || '').trim();
  if (!s) return '';

  try {
    if (!/^https?:\/\//i.test(s)) {
      s = `https://${s}`;
    }
    const parsed = new URL(s);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'linkedin.com') {
      const path = parsed.pathname.replace(/\/+$/, '');
      const inMatch = path.match(/^\/in\/([^/]+)/i);
      if (inMatch?.[1]) {
        const slug = decodeURIComponent(inMatch[1]).replace(/\/+$/, '');
        if (slug) {
          return `https://www.linkedin.com/in/${slug}`;
        }
      }
      return `https://www.linkedin.com${path || ''}`.replace(/\/+$/, '');
    }
    return s.replace(/\/+$/, '');
  } catch {
    return s.replace(/\/+$/, '');
  }
}

/** Lowercase slug variant for legacy cache rows written before case was preserved. */
export function lowercaseLinkedinProfileUrl(url: string | null | undefined): string {
  const canonical = normalizeLinkedinProfileUrl(url);
  if (!canonical) return '';
  return canonical.replace(
    /^(https:\/\/www\.linkedin\.com\/in\/)([^/]+)/i,
    (_match, prefix: string, slug: string) => `${prefix}${slug.toLowerCase()}`
  );
}

/** Keys to try when loading cache (canonical first, then legacy lowercase). */
export function linkedinCacheLookupKeys(url: string | null | undefined): string[] {
  const canonical = normalizeLinkedinProfileUrl(url);
  if (!canonical) return [];
  const lower = lowercaseLinkedinProfileUrl(canonical);
  return lower && lower !== canonical ? [canonical, lower] : [canonical];
}
