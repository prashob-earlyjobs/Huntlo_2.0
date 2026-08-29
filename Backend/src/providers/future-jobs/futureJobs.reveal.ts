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

function encodeLinkedinSlug(slug: string): string {
  return encodeURIComponent(slug);
}

/** True when the value is an opaque LinkedIn member id (`ACoAA…`), not a vanity slug. */
export function isLinkedinMemberUrnSlug(slug: string): boolean {
  return /^ACoAA[A-Za-z0-9_-]+$/i.test(slug.trim());
}

/**
 * Canonical LinkedIn profile URL for DB keys / FJ reveal.
 * Host is normalized; slug case is preserved (ACoAA… is case-sensitive).
 * Literal spaces are encoded — FJ 422s `"spaces are not allowed in the URL"`.
 */
export function normalizeLinkedinProfileUrl(url: string | null | undefined): string {
  let s = String(url || '').trim();
  if (!s) return '';
  // WHATWG URL rejects unescaped spaces; FJ rejects them in the JSON body too.
  s = s.replace(/\s/g, '%20');

  try {
    if (!/^https?:\/\//i.test(s)) {
      if (/^ACoAA[A-Za-z0-9_-]+$/i.test(s.replace(/%20/g, ''))) {
        return `https://www.linkedin.com/in/${s.replace(/%20/g, '')}`;
      }
      if (!/linkedin\.com/i.test(s)) return '';
      s = `https://${s}`;
    }
    const parsed = new URL(s);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'linkedin.com') return '';
    const path = parsed.pathname.replace(/\/+$/, '');
    const inMatch = path.match(/^\/in\/([^/]+)/i);
    if (!inMatch?.[1]) return '';
    let slug = decodeURIComponent(inMatch[1]).replace(/\/+$/, '').trim();
    if (!slug || slug.includes('/')) return '';
    const encoded = isLinkedinMemberUrnSlug(slug) ? slug : encodeLinkedinSlug(slug);
    return `https://www.linkedin.com/in/${encoded}`;
  } catch {
    return '';
  }
}

/** FJ reveal-contacts only accepts `linkedin.com/in/…` with no whitespace. */
export function isFjRevealLinkedinUrl(url: string | null | undefined): boolean {
  const canonical = normalizeLinkedinProfileUrl(url);
  return Boolean(canonical) && !/\s/.test(canonical);
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function linkedinSlugFromValue(value: unknown): string {
  const raw = asString(value);
  if (!raw) return '';
  if (isLinkedinMemberUrnSlug(raw)) return raw.replace(/\/+$/, '');
  const normalized = normalizeLinkedinProfileUrl(raw);
  const match = normalized.match(/\/in\/([^/?#]+)/i);
  if (!match?.[1]) return '';
  try {
    return decodeURIComponent(match[1]).replace(/\/+$/, '');
  } catch {
    return match[1].replace(/\/+$/, '');
  }
}

/**
 * Future Jobs `POST /wl/scout-people/reveal-contacts` resolves opaque
 * `/in/ACoAA…` member URLs. Vanity/flagship URLs often 404.
 * Prefer member URNs from the stored search profile, then any other URL.
 */
export function linkedinUrlsForContactReveal(input: {
  rawDoc?: unknown;
  linkedinProfileUrl?: string | null;
  basicLinkedinUrl?: string | null;
  externalCandidateId?: string | null;
}): string[] {
  const raw = asRecord(input.rawDoc);
  const nested = asRecord(raw?.data);
  const profile = asRecord(raw?.profile) || asRecord(nested?.profile) || raw;
  const values = [
    profile?.id,
    profile?._id,
    raw?._id,
    raw?.id,
    input.externalCandidateId,
    profile?.linkedin_profile_url,
    profile?.linkedin_flagship_url,
    input.linkedinProfileUrl,
    input.basicLinkedinUrl,
  ];

  const memberUrls: string[] = [];
  const otherUrls: string[] = [];
  const seen = new Set<string>();

  const add = (value: unknown) => {
    const slug = linkedinSlugFromValue(value);
    const url =
      slug && isLinkedinMemberUrnSlug(slug)
        ? `https://www.linkedin.com/in/${slug}`
        : normalizeLinkedinProfileUrl(asString(value));
    if (!url || !isFjRevealLinkedinUrl(url) || seen.has(url)) return;
    seen.add(url);
    if (isLinkedinMemberUrnSlug(linkedinSlugFromValue(url))) memberUrls.push(url);
    else otherUrls.push(url);
  };

  for (const value of values) add(value);
  return [...memberUrls, ...otherUrls];
}

function scoutLookupProfile(fj: unknown): Record<string, unknown> | null {
  const root = asRecord(fj);
  if (!root) return null;
  const data = asRecord(root.data);
  const nestedProfile = asRecord(data?.profile) || asRecord(root.profile);
  if (nestedProfile) return nestedProfile;
  const listed = Array.isArray(data?.profiles)
    ? data.profiles
    : Array.isArray(root.profiles)
      ? root.profiles
      : [];
  const first = listed.length > 0 ? asRecord(listed[0]) : null;
  if (!first) {
    return data && (data.linkedin_profile_url || data.linkedin_flagship_url) ? data : null;
  }
  return asRecord(first.profile) || first;
}

/**
 * LinkedIn URLs from `POST /wl/scout-people/lookup` so reveal-contacts can use
 * the member URN FJ just scouted. Live FJ still 404s vanity/flagship on
 * `/reveal-contacts` after lookup — only `profile.linkedin_profile_url` (`/in/ACoAA…`) works.
 */
export function linkedinUrlsFromScoutLookup(fj: unknown): string[] {
  const root = asRecord(fj);
  const data = asRecord(root?.data) || root;
  const resolved = scoutLookupProfile(fj);
  if (!resolved) return [];
  return linkedinUrlsForContactReveal({
    rawDoc: resolved,
    linkedinProfileUrl: asString(resolved.linkedin_profile_url),
    basicLinkedinUrl: asString(resolved.linkedin_flagship_url),
    externalCandidateId:
      asString(resolved.person_id) ||
      asString(data?.scoutId) ||
      asString(resolved._id) ||
      asString(resolved.id),
  });
}

/** Keys to try when loading cache (canonical first, then legacy lowercase). */
export function linkedinCacheLookupKeys(url: string | null | undefined): string[] {
  const canonical = normalizeLinkedinProfileUrl(url);
  if (!canonical) return [];
  const lower = lowercaseLinkedinProfileUrl(canonical);
  return lower && lower !== canonical ? [canonical, lower] : [canonical];
}
