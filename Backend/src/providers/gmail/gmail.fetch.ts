/**
 * Gmail API read helpers for inbound reply sync.
 * Uses the documented Gmail REST endpoints only:
 *  - users.messages.list  (GET /gmail/v1/users/me/messages)
 *  - users.messages.get   (GET /gmail/v1/users/me/messages/{id})
 * https://developers.google.com/gmail/api/reference/rest/v1/users.messages
 */

import { stripEmailQuotedReply } from '../email/strip-quoted-reply.js';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export type GmailFetchOptions = {
  /** Max messages to return (Gmail API caps maxResults at 500; we clamp lower). */
  maxResults?: number;
  /** Gmail search operator `newer_than:<n>d` window. */
  newerThanDays?: number;
  pageToken?: string;
};

export type GmailReplyItem = {
  providerMessageId: string;
  providerThreadId: string | null;
  from: string;
  to: string | null;
  subject: string | null;
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: Date;
};

type GmailMessagePart = {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailMessagePart[];
};

type GmailHeader = { name: string; value: string };

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function headerValue(headers: GmailHeader[] | undefined, name: string): string | null {
  const found = headers?.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return found ? found.value : null;
}

/** Depth-first search for the first text/plain (and text/html) body parts. */
function extractBody(payload: GmailMessagePart | undefined): { text: string; html: string | null } {
  let text = '';
  let html: string | null = null;

  const visit = (part?: GmailMessagePart) => {
    if (!part) return;
    if (!text && part.mimeType === 'text/plain' && part.body?.data) {
      text = decodeBase64Url(part.body.data);
    }
    if (!html && part.mimeType === 'text/html' && part.body?.data) {
      html = decodeBase64Url(part.body.data);
    }
    for (const sub of part.parts || []) visit(sub);
  };
  visit(payload);

  if (!text && payload?.body?.data && !payload.parts) {
    text = decodeBase64Url(payload.body.data);
  }
  return { text, html };
}

async function parseGmailError(res: Response): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw Object.assign(
    new Error(body.error?.message || `Gmail request failed (${res.status})`),
    { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
  );
}

/**
 * List + fetch recent inbox messages for reply-sync. Never throws for a single
 * unreadable message — only for list-level failures (e.g. expired token).
 */
export async function fetchRecentInboxReplies(
  accessToken: string,
  options: GmailFetchOptions = {}
): Promise<GmailReplyItem[]> {
  const maxResults = Math.min(Math.max(options.maxResults ?? 15, 1), 50);
  const newerThanDays = Math.max(options.newerThanDays ?? 2, 1);

  const listUrl = new URL(`${GMAIL_API_BASE}/messages`);
  listUrl.searchParams.set('q', `in:inbox newer_than:${newerThanDays}d`);
  listUrl.searchParams.set('maxResults', String(maxResults));
  if (options.pageToken) listUrl.searchParams.set('pageToken', options.pageToken);

  const listRes = await fetch(listUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) await parseGmailError(listRes);
  const listData = (await listRes.json()) as {
    messages?: Array<{ id: string; threadId: string }>;
  };
  const refs = listData.messages || [];
  if (!refs.length) return [];

  const items: GmailReplyItem[] = [];
  for (const ref of refs) {
    const msgRes = await fetch(`${GMAIL_API_BASE}/messages/${ref.id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!msgRes.ok) continue; // skip unreadable message rather than failing the whole batch

    const msg = (await msgRes.json()) as {
      id: string;
      threadId?: string;
      internalDate?: string;
      snippet?: string;
      payload?: GmailMessagePart & { headers?: GmailHeader[] };
    };
    const headers = msg.payload?.headers;
    const { text, html } = extractBody(msg.payload);

    items.push({
      providerMessageId: msg.id,
      providerThreadId: msg.threadId || null,
      from: headerValue(headers, 'From') || '',
      to: headerValue(headers, 'To'),
      subject: headerValue(headers, 'Subject'),
      bodyText: stripEmailQuotedReply(text || msg.snippet || ''),
      bodyHtml: html,
      receivedAt: msg.internalDate ? new Date(Number(msg.internalDate)) : new Date(),
    });
  }
  return items;
}

export type GmailThreadingMeta = {
  threadId: string | null;
  /** RFC 2822 Message-ID header value, e.g. `<abc@mail.gmail.com>`. */
  rfcMessageId: string | null;
};

/**
 * Resolve Gmail conversation threadId + RFC Message-ID for reply threading.
 * Gmail only keeps messages in one inbox thread when In-Reply-To/References
 * point at the prior message's Message-ID (API id alone is not enough).
 */
export async function getGmailThreadingMeta(
  accessToken: string,
  messageId: string
): Promise<GmailThreadingMeta> {
  const id = String(messageId || '').trim();
  if (!id || id.startsWith('<') || id.startsWith('campaign-job:') || id.includes(':')) {
    return { threadId: null, rfcMessageId: null };
  }
  const url = new URL(`${GMAIL_API_BASE}/messages/${encodeURIComponent(id)}`);
  url.searchParams.set('format', 'metadata');
  url.searchParams.append('metadataHeaders', 'Message-ID');
  url.searchParams.append('metadataHeaders', 'Message-Id');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { threadId: null, rfcMessageId: null };
  const data = (await res.json().catch(() => ({}))) as {
    threadId?: string;
    payload?: { headers?: GmailHeader[] };
  };
  const headers = data.payload?.headers || [];
  const rfcMessageId =
    headerValue(headers, 'Message-ID') || headerValue(headers, 'Message-Id');
  return {
    threadId: data.threadId ? String(data.threadId) : null,
    rfcMessageId: rfcMessageId ? String(rfcMessageId).trim() : null,
  };
}

/** Look up the Gmail conversation threadId for an existing message id. */
export async function getGmailThreadIdForMessage(
  accessToken: string,
  messageId: string
): Promise<string | null> {
  const meta = await getGmailThreadingMeta(accessToken, messageId);
  return meta.threadId;
}
