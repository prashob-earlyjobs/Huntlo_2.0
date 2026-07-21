/**
 * Gmail users.watch + history.list for Pub/Sub push notifications.
 * Topic must exist in GCP and allow publish from gmail-api-push@system.gserviceaccount.com.
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export function getGmailPubSubTopic(): string {
  return String(process.env.GMAIL_PUBSUB_TOPIC || '').trim();
}

export function isGmailPushConfigured(): boolean {
  return Boolean(getGmailPubSubTopic());
}

async function parseGmailError(res: Response): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw Object.assign(
    new Error(body.error?.message || `Gmail request failed (${res.status})`),
    { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
  );
}

export type GmailWatchResult = {
  historyId: string;
  expiration: string | null;
};

/** Start (or renew) a Gmail mailbox watch → Pub/Sub topic. */
export async function startGmailWatch(accessToken: string): Promise<GmailWatchResult | null> {
  const topicName = getGmailPubSubTopic();
  if (!topicName) return null;

  const res = await fetch(`${GMAIL_API_BASE}/watch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topicName,
      labelIds: ['INBOX'],
    }),
  });
  if (!res.ok) await parseGmailError(res);
  const data = (await res.json()) as { historyId?: string | number; expiration?: string };
  return {
    historyId: String(data.historyId || ''),
    expiration: data.expiration ? String(data.expiration) : null,
  };
}

export async function stopGmailWatch(accessToken: string): Promise<void> {
  const res = await fetch(`${GMAIL_API_BASE}/stop`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404) await parseGmailError(res);
}

/**
 * List message ids added since startHistoryId.
 * Returns next historyId to store. Throws with statusCode 404 when history is too old.
 */
export async function listGmailHistoryMessageIds(
  accessToken: string,
  startHistoryId: string
): Promise<{ historyId: string; messageIds: string[] }> {
  const messageIds = new Set<string>();
  let pageToken: string | undefined;
  let latestHistoryId = startHistoryId;

  for (let page = 0; page < 10; page += 1) {
    const url = new URL(`${GMAIL_API_BASE}/history`);
    url.searchParams.set('startHistoryId', startHistoryId);
    url.searchParams.set('historyTypes', 'messageAdded');
    url.searchParams.set('labelId', 'INBOX');
    url.searchParams.set('maxResults', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) await parseGmailError(res);

    const data = (await res.json()) as {
      history?: Array<{
        messagesAdded?: Array<{ message?: { id?: string; labelIds?: string[] } }>;
      }>;
      historyId?: string | number;
      nextPageToken?: string;
    };

    if (data.historyId) latestHistoryId = String(data.historyId);

    for (const row of data.history || []) {
      for (const added of row.messagesAdded || []) {
        const id = added.message?.id;
        if (id) messageIds.add(id);
      }
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return { historyId: latestHistoryId, messageIds: [...messageIds] };
}

/** Decode Pub/Sub push body → { emailAddress, historyId }. */
export function decodeGmailPubSubPush(body: Record<string, unknown>): {
  emailAddress: string;
  historyId: string;
  messageId: string;
} | null {
  const message =
    body.message && typeof body.message === 'object'
      ? (body.message as Record<string, unknown>)
      : null;
  if (!message) return null;

  const rawData = String(message.data || '');
  if (!rawData) return null;

  let parsed: { emailAddress?: string; historyId?: string | number };
  try {
    parsed = JSON.parse(Buffer.from(rawData, 'base64').toString('utf8')) as {
      emailAddress?: string;
      historyId?: string | number;
    };
  } catch {
    return null;
  }

  const emailAddress = String(parsed.emailAddress || '').trim().toLowerCase();
  const historyId = String(parsed.historyId || '').trim();
  if (!emailAddress) return null;

  return {
    emailAddress,
    historyId,
    messageId: String(message.messageId || message.message_id || ''),
  };
}
