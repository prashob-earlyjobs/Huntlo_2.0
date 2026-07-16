/**
 * Calendly PAT client — ported from EJHunterLanding calendlyClient.js
 */

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
