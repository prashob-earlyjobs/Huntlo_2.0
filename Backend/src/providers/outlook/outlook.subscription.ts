/**
 * Microsoft Graph change notifications for the signed-in user's inbox.
 * Mail subscriptions last at most 10,080 minutes (under 7 days).
 */

import { getPublicApiBaseUrl } from '../hunar/hunar.config.js';

const GRAPH_SUBSCRIPTIONS = 'https://graph.microsoft.com/v1.0/subscriptions';
/** Stay under Graph's 10,080-minute Outlook message cap. */
const SUBSCRIPTION_MINUTES = 6 * 24 * 60;
const INBOX_RESOURCE = "me/mailFolders('inbox')/messages";

export type OutlookSubscription = {
  id: string;
  expirationDateTime: string;
};

export type OutlookSubscriptionDetails = OutlookSubscription & {
  notificationUrl: string;
};

/** Compare callback URLs without trailing-slash or host-case noise. */
export function outlookNotificationUrlsMatch(left: string, right: string): boolean {
  const normalize = (value: string) => {
    const trimmed = value.trim();
    try {
      const url = new URL(trimmed);
      const path = url.pathname.replace(/\/$/, '');
      return `${url.protocol}//${url.host.toLowerCase()}${path}${url.search}`;
    } catch {
      return trimmed.replace(/\/$/, '');
    }
  };
  return Boolean(normalize(left)) && normalize(left) === normalize(right);
}

export function getOutlookNotificationUrl(): string {
  const explicit = String(process.env.OUTLOOK_NOTIFICATION_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const base = getPublicApiBaseUrl();
  if (!base) return '';
  return `${base}/api/v1/public/webhooks/outlook`;
}

/** Graph rejects non-HTTPS notification URLs during the validation handshake. */
export function isOutlookPushConfigured(): boolean {
  return getOutlookNotificationUrl().startsWith('https://');
}

export function nextOutlookSubscriptionExpiry(from = Date.now()): string {
  return new Date(from + SUBSCRIPTION_MINUTES * 60 * 1000).toISOString();
}

async function parseGraphError(res: Response): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw Object.assign(
    new Error(body.error?.message || `Outlook subscription failed (${res.status})`),
    { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
  );
}

function readSubscription(data: { id?: string; expirationDateTime?: string }): OutlookSubscription {
  const id = String(data.id || '').trim();
  const expirationDateTime = String(data.expirationDateTime || '').trim();
  if (!id || !expirationDateTime) {
    throw Object.assign(new Error('Outlook subscription response missing id or expiration'), {
      statusCode: 502,
    });
  }
  return { id, expirationDateTime };
}

export async function createOutlookMailSubscription(input: {
  accessToken: string;
  clientState: string;
}): Promise<OutlookSubscription> {
  const notificationUrl = getOutlookNotificationUrl();
  if (!notificationUrl.startsWith('https://')) {
    console.log('[outlook] subscription create skipped — notification URL is not public HTTPS', {
      notificationUrl: notificationUrl || '(empty)',
    });
    throw Object.assign(
      new Error('Outlook notification URL must be public HTTPS (OUTLOOK_NOTIFICATION_URL or PUBLIC_API_BASE_URL).'),
      { statusCode: 503 }
    );
  }

  const expirationDateTime = nextOutlookSubscriptionExpiry();
  console.log('[outlook] registering inbox subscription with Graph', {
    notificationUrl,
    resource: INBOX_RESOURCE,
    changeType: 'created',
    expirationDateTime,
  });

  const res = await fetch(GRAPH_SUBSCRIPTIONS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      changeType: 'created',
      notificationUrl,
      resource: INBOX_RESOURCE,
      expirationDateTime,
      clientState: input.clientState,
    }),
  });
  if (!res.ok) {
    const body = (await res.clone().json().catch(() => ({}))) as { error?: { message?: string } };
    console.log('[outlook] Graph subscription create failed', {
      status: res.status,
      message: body.error?.message || res.statusText,
      notificationUrl,
    });
    await parseGraphError(res);
  }
  const created = readSubscription((await res.json()) as { id?: string; expirationDateTime?: string });
  console.log('[outlook] Graph subscription created', {
    subscriptionId: created.id,
    expiration: created.expirationDateTime,
    notificationUrl,
  });
  return created;
}

/** Read a subscription, including the callback URL Graph will actually call. */
export async function getOutlookMailSubscription(input: {
  accessToken: string;
  subscriptionId: string;
}): Promise<OutlookSubscriptionDetails | 'missing'> {
  const res = await fetch(
    `${GRAPH_SUBSCRIPTIONS}/${encodeURIComponent(input.subscriptionId)}`,
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );
  if (res.status === 404) return 'missing';
  if (!res.ok) await parseGraphError(res);
  const data = (await res.json()) as {
    id?: string;
    expirationDateTime?: string;
    notificationUrl?: string;
  };
  return {
    ...readSubscription(data),
    notificationUrl: String(data.notificationUrl || '').trim(),
  };
}

/** Extend an existing subscription. Returns `missing` when Graph has already dropped it. */
export async function renewOutlookMailSubscription(input: {
  accessToken: string;
  subscriptionId: string;
}): Promise<OutlookSubscription | 'missing'> {
  const expirationDateTime = nextOutlookSubscriptionExpiry();
  console.log('[outlook] renewing Graph subscription', {
    subscriptionId: input.subscriptionId,
    expirationDateTime,
  });
  const res = await fetch(
    `${GRAPH_SUBSCRIPTIONS}/${encodeURIComponent(input.subscriptionId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expirationDateTime,
      }),
    }
  );
  if (res.status === 404) {
    console.log('[outlook] Graph subscription missing on renew', {
      subscriptionId: input.subscriptionId,
    });
    return 'missing';
  }
  if (!res.ok) {
    const body = (await res.clone().json().catch(() => ({}))) as { error?: { message?: string } };
    console.log('[outlook] Graph subscription renew failed', {
      subscriptionId: input.subscriptionId,
      status: res.status,
      message: body.error?.message || res.statusText,
    });
    await parseGraphError(res);
  }
  const renewed = readSubscription((await res.json()) as { id?: string; expirationDateTime?: string });
  console.log('[outlook] Graph subscription renewed', {
    subscriptionId: renewed.id,
    expiration: renewed.expirationDateTime,
  });
  return renewed;
}

export async function deleteOutlookMailSubscription(input: {
  accessToken: string;
  subscriptionId: string;
}): Promise<void> {
  const res = await fetch(
    `${GRAPH_SUBSCRIPTIONS}/${encodeURIComponent(input.subscriptionId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${input.accessToken}` },
    }
  );
  if (!res.ok && res.status !== 404) await parseGraphError(res);
}
