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
    throw Object.assign(
      new Error('Outlook notification URL must be public HTTPS (OUTLOOK_NOTIFICATION_URL or PUBLIC_API_BASE_URL).'),
      { statusCode: 503 }
    );
  }

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
      expirationDateTime: nextOutlookSubscriptionExpiry(),
      clientState: input.clientState,
    }),
  });
  if (!res.ok) await parseGraphError(res);
  return readSubscription((await res.json()) as { id?: string; expirationDateTime?: string });
}

/** Extend an existing subscription. Returns `missing` when Graph has already dropped it. */
export async function renewOutlookMailSubscription(input: {
  accessToken: string;
  subscriptionId: string;
}): Promise<OutlookSubscription | 'missing'> {
  const res = await fetch(
    `${GRAPH_SUBSCRIPTIONS}/${encodeURIComponent(input.subscriptionId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expirationDateTime: nextOutlookSubscriptionExpiry(),
      }),
    }
  );
  if (res.status === 404) return 'missing';
  if (!res.ok) await parseGraphError(res);
  return readSubscription((await res.json()) as { id?: string; expirationDateTime?: string });
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
