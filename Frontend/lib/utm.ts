const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmParams = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
};

const STORAGE_KEY = "huntlo.utm.last";
const VISITOR_KEY = "huntlo.utm.visitor";
const SESSION_KEY = "huntlo.utm.session";
const TRACKED_KEY = "huntlo.utm.trackedSession";

function readParam(params: URLSearchParams, key: string): string | null {
  const value = params.get(key)?.trim() || "";
  return value || null;
}

export function readUtmFromSearch(search: string): UtmParams | null {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const utm: UtmParams = {
    utmSource: readParam(params, "utm_source"),
    utmMedium: readParam(params, "utm_medium"),
    utmCampaign: readParam(params, "utm_campaign"),
    utmContent: readParam(params, "utm_content"),
    utmTerm: readParam(params, "utm_term"),
  };
  const hasAny = UTM_KEYS.some((key) => Boolean(params.get(key)?.trim()));
  return hasAny ? utm : null;
}

export function hasUtm(utm: UtmParams | null | undefined): boolean {
  if (!utm) return false;
  return Boolean(
    utm.utmSource ||
      utm.utmMedium ||
      utm.utmCampaign ||
      utm.utmContent ||
      utm.utmTerm
  );
}

function randomId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = randomId("vid");
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return randomId("vid");
  }
}

export function getOrCreateSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = randomId("sid");
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return randomId("sid");
  }
}

export function persistUtm(utm: UtmParams): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // ignore quota / private mode
  }
}

export function loadPersistedUtm(): UtmParams | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UtmParams;
    return hasUtm(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function markSessionTracked(sessionId: string): void {
  try {
    window.sessionStorage.setItem(TRACKED_KEY, sessionId);
  } catch {
    // ignore
  }
}

export function wasSessionTracked(sessionId: string): boolean {
  try {
    return window.sessionStorage.getItem(TRACKED_KEY) === sessionId;
  } catch {
    return false;
  }
}

/** Snapshot for register / public event payloads. */
export function buildAttributionPayload(extra?: {
  landingPage?: string | null;
  referrer?: string | null;
}): {
  sessionId: string;
  visitorId: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  landingPage: string | null;
  referrer: string | null;
} | null {
  if (typeof window === "undefined") return null;
  const fromUrl = readUtmFromSearch(window.location.search);
  if (fromUrl) persistUtm(fromUrl);
  const utm = fromUrl ?? loadPersistedUtm();
  if (!hasUtm(utm) || !utm) return null;

  return {
    sessionId: getOrCreateSessionId(),
    visitorId: getOrCreateVisitorId(),
    ...utm,
    landingPage:
      extra?.landingPage ??
      `${window.location.pathname}${window.location.search}`,
    referrer: extra?.referrer ?? (document.referrer || null),
  };
}

export function appendUtmToUrl(baseUrl: string, utm: UtmParams | null): string {
  if (!utm || !hasUtm(utm)) return baseUrl;
  try {
    const url = new URL(baseUrl);
    if (utm.utmSource) url.searchParams.set("utm_source", utm.utmSource);
    if (utm.utmMedium) url.searchParams.set("utm_medium", utm.utmMedium);
    if (utm.utmCampaign) url.searchParams.set("utm_campaign", utm.utmCampaign);
    if (utm.utmContent) url.searchParams.set("utm_content", utm.utmContent);
    if (utm.utmTerm) url.searchParams.set("utm_term", utm.utmTerm);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
