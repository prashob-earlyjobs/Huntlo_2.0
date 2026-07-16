/**
 * Calendly PAT client — ported from EJHunterLanding calendlyClient.js
 * and campaignCalendlyBookingController.js (signature verification).
 * Field names match Calendly / EJ usage only — do not invent payloads.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const CALENDLY_API_BASE = 'https://api.calendly.com';
const DEFAULT_EVENT_TYPE_PAGE_SIZE = 100;
const MAX_EVENT_TYPE_PAGES = 5;

export async function fetchCalendlyUser(personalAccessToken: string) {
  const token = String(personalAccessToken || '').trim();
  if (!token) {
    throw Object.assign(new Error('Calendly personal access token is required.'), {
      statusCode: 400,
    });
  }

  const res = await fetch(`${CALENDLY_API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    title?: string;
    resource?: {
      name?: string;
      email?: string;
      scheduling_url?: string;
      uri?: string;
      slug?: string;
    };
  };

  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : typeof data.title === 'string'
          ? data.title
          : res.status === 401
            ? 'Invalid Calendly token. Check your personal access token and try again.'
            : 'Could not verify Calendly credentials.';
    throw Object.assign(new Error(msg), {
      statusCode: res.status === 401 ? 401 : res.status >= 500 ? 502 : 400,
    });
  }

  const resource = data.resource;
  if (!resource) {
    throw Object.assign(new Error('Unexpected response from Calendly.'), { statusCode: 502 });
  }

  return {
    name: String(resource.name || '').trim(),
    email: String(resource.email || '').trim(),
    schedulingUrl: String(resource.scheduling_url || '').trim(),
    uri: String(resource.uri || '').trim(),
    slug: String(resource.slug || '').trim(),
  };
}

export async function fetchCalendlyEventTypes(personalAccessToken: string, userUri?: string) {
  const token = String(personalAccessToken || '').trim();
  const resolvedUser = String(userUri || '').trim() || (await fetchCalendlyUser(token)).uri;
  if (!resolvedUser) {
    throw Object.assign(new Error('Unable to load Calendly user profile.'), { statusCode: 502 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const links: Array<{
    name: string;
    schedulingUrl: string;
    uri: string;
    duration?: number;
  }> = [];
  let pageToken = '';
  let page = 0;

  while (page < MAX_EVENT_TYPE_PAGES) {
    page += 1;
    const qs = new URLSearchParams({
      user: resolvedUser,
      active: 'true',
      sort: 'name:asc',
      count: String(DEFAULT_EVENT_TYPE_PAGE_SIZE),
    });
    if (pageToken) qs.set('page_token', pageToken);

    const res = await fetch(`${CALENDLY_API_BASE}/event_types?${qs.toString()}`, { headers });
    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      title?: string;
      collection?: Array<{
        name?: string;
        scheduling_url?: string;
        uri?: string;
        duration?: number;
      }>;
      pagination?: { next_page_token?: string };
    };

    if (!res.ok) {
      const msg =
        typeof data.message === 'string'
          ? data.message
          : typeof data.title === 'string'
            ? data.title
            : 'Could not load Calendly event types.';
      throw Object.assign(new Error(msg), { statusCode: res.status === 401 ? 401 : 400 });
    }

    for (const item of data.collection || []) {
      const schedulingUrl = String(item.scheduling_url || '').trim();
      if (!schedulingUrl) continue;
      links.push({
        name: String(item.name || '').trim(),
        schedulingUrl,
        uri: String(item.uri || '').trim(),
        duration: typeof item.duration === 'number' ? item.duration : undefined,
      });
    }

    pageToken = String(data.pagination?.next_page_token || '').trim();
    if (!pageToken) break;
  }

  return links;
}

export function calendlyUuidFromUri(uri: string): string {
  const raw = String(uri || '').trim();
  if (!raw) return '';
  const parts = raw.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

export async function calendlyApiGet(personalAccessToken: string, pathOrUri: string) {
  const token = String(personalAccessToken || '').trim();
  const target = String(pathOrUri || '').trim();
  if (!token || !target) {
    throw Object.assign(new Error('Calendly request is missing credentials or URL.'), {
      statusCode: 400,
    });
  }
  const url = target.startsWith('http')
    ? target
    : `${CALENDLY_API_BASE}${target.startsWith('/') ? '' : '/'}${target}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : typeof data.title === 'string'
          ? data.title
          : 'Calendly API request failed.';
    throw Object.assign(new Error(msg), {
      statusCode: res.status === 401 ? 401 : res.status >= 500 ? 502 : 400,
    });
  }
  return data;
}

/** Fields returned match Calendly scheduled_events collection items used by EJ. */
export async function fetchCalendlyScheduledEvents(
  personalAccessToken: string,
  options: {
    userUri: string;
    eventTypeUri?: string;
    minStartTime?: Date | string;
    status?: string;
  }
) {
  const token = String(personalAccessToken || '').trim();
  const userUri = String(options.userUri || '').trim();
  const eventTypeUri = String(options.eventTypeUri || '').trim();
  if (!token || !userUri) {
    throw Object.assign(new Error('Calendly user is required to load scheduled events.'), {
      statusCode: 400,
    });
  }

  const events: Array<Record<string, unknown>> = [];
  let pageToken = '';
  let page = 0;
  const minStart = options.minStartTime
    ? new Date(options.minStartTime).toISOString()
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  while (page < MAX_EVENT_TYPE_PAGES) {
    page += 1;
    const qs = new URLSearchParams({
      user: userUri,
      sort: 'start_time:desc',
      count: '100',
      min_start_time: minStart,
    });
    if (eventTypeUri) qs.set('event_type', eventTypeUri);
    if (options.status) qs.set('status', String(options.status));
    if (pageToken) qs.set('page_token', pageToken);

    const data = await calendlyApiGet(token, `/scheduled_events?${qs.toString()}`);
    const collection = Array.isArray(data.collection) ? data.collection : [];
    for (const item of collection) {
      if (item && typeof item === 'object') events.push(item as Record<string, unknown>);
    }
    const nextPage = String(
      (data.pagination as { next_page_token?: string } | undefined)?.next_page_token || ''
    ).trim();
    if (!nextPage) break;
    pageToken = nextPage;
  }

  return events;
}

export async function fetchCalendlyEventInvitees(
  personalAccessToken: string,
  eventUri: string
): Promise<Array<Record<string, unknown>>> {
  const token = String(personalAccessToken || '').trim();
  const uri = String(eventUri || '').trim();
  if (!token || !uri) return [];

  const uuid = calendlyUuidFromUri(uri);
  if (!uuid) return [];

  const invitees: Array<Record<string, unknown>> = [];
  let pageToken = '';
  let page = 0;

  while (page < MAX_EVENT_TYPE_PAGES) {
    page += 1;
    const qs = new URLSearchParams({ count: '100' });
    if (pageToken) qs.set('page_token', pageToken);
    const data = await calendlyApiGet(
      token,
      `/scheduled_events/${uuid}/invitees?${qs.toString()}`
    );
    const collection = Array.isArray(data.collection) ? data.collection : [];
    for (const item of collection) {
      if (item && typeof item === 'object') invitees.push(item as Record<string, unknown>);
    }
    const nextPage = String(
      (data.pagination as { next_page_token?: string } | undefined)?.next_page_token || ''
    ).trim();
    if (!nextPage) break;
    pageToken = nextPage;
  }

  return invitees;
}

/** Prefill query params only — EJ does not call a Calendly "create link" API. */
export function buildSchedulingUrl(
  baseUrl: string,
  opts: { name?: string; email?: string; campaignId?: string; utmSource?: string } = {}
): string {
  const raw = String(baseUrl || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const n = String(opts.name || '').trim();
    const e = String(opts.email || '').trim().toLowerCase();
    if (n) url.searchParams.set('name', n);
    if (e) url.searchParams.set('email', e);
    if (opts.campaignId) url.searchParams.set('utm_campaign', String(opts.campaignId));
    if (opts.utmSource) url.searchParams.set('utm_source', String(opts.utmSource));
    return url.toString();
  } catch {
    return raw;
  }
}

/**
 * Calendly webhook signature — EJ campaignCalendlyBookingController.js
 * Header: calendly-webhook-signature with parts t=<timestamp>,v1=<hex>
 * Signed string: `${timestamp}.${rawBody}`
 * HMAC-SHA256 hex digest, timing-safe compare.
 * When signing key / header / body missing → verification skipped (returns true).
 */
export function verifyCalendlySignature(
  rawBody: string | Buffer,
  signatureHeader: string | string[] | undefined,
  signingKey: string
): boolean {
  const key = String(signingKey || '').trim();
  const header = String(
    Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader || ''
  ).trim();
  if (!key || !header || !rawBody) return true;

  const parts = header.split(',').reduce<Record<string, string>>((acc, piece) => {
    const [k, v] = piece.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
  const payload = `${timestamp}.${bodyStr}`;
  const digest = createHmac('sha256', key).update(payload).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return digest === signature;
  }
}

/** Location label from Calendly event.location — EJ formatLocation. */
export function formatCalendlyLocation(location: unknown): string {
  if (!location || typeof location !== 'object') return '';
  const loc = location as { join_url?: string; location?: string };
  if (typeof loc.join_url === 'string' && loc.join_url.trim()) return loc.join_url.trim();
  if (typeof loc.location === 'string' && loc.location.trim()) return loc.location.trim();
  return '';
}

export function getCalendlyWebhookSigningKey(): string {
  return String(process.env.CALENDLY_WEBHOOK_SIGNING_KEY || '').trim();
}
