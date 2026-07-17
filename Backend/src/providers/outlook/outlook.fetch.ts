/**
 * Outlook / Microsoft Graph inbox read helpers for inbound reply sync.
 * Requires Mail.Read (already in OUTLOOK_MAIL_SCOPES).
 */

import type { InboxFetchOptions, InboxReplyItem } from '../email/inbox-reply.js';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0/me';

type GraphRecipient = { emailAddress?: { name?: string; address?: string } };

type GraphMessage = {
  id?: string;
  conversationId?: string;
  subject?: string;
  bodyPreview?: string;
  receivedDateTime?: string;
  from?: GraphRecipient;
  toRecipients?: GraphRecipient[];
  body?: { contentType?: string; content?: string };
};

function formatAddress(r?: GraphRecipient): string {
  const address = String(r?.emailAddress?.address || '').trim();
  const name = String(r?.emailAddress?.name || '').trim();
  if (!address) return name;
  return name ? `${name} <${address}>` : address;
}

async function parseGraphError(res: Response): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw Object.assign(
    new Error(body.error?.message || `Outlook request failed (${res.status})`),
    { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
  );
}

/**
 * List recent inbox messages via Graph mailFolders/inbox/messages.
 */
export async function fetchRecentOutlookInboxReplies(
  accessToken: string,
  options: InboxFetchOptions = {}
): Promise<InboxReplyItem[]> {
  const maxResults = Math.min(Math.max(options.maxResults ?? 15, 1), 50);
  const newerThanDays = Math.max(options.newerThanDays ?? 2, 1);
  const since = new Date(Date.now() - newerThanDays * 24 * 60 * 60 * 1000).toISOString();

  const url = new URL(`${GRAPH_BASE}/mailFolders/inbox/messages`);
  url.searchParams.set('$top', String(maxResults));
  url.searchParams.set(
    '$select',
    'id,conversationId,subject,from,toRecipients,receivedDateTime,body,bodyPreview'
  );
  url.searchParams.set('$orderby', 'receivedDateTime desc');
  url.searchParams.set('$filter', `receivedDateTime ge ${since}`);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.body-content-type="text"',
    },
  });
  if (!res.ok) await parseGraphError(res);

  const data = (await res.json()) as { value?: GraphMessage[] };
  const rows = data.value || [];

  return rows
    .filter((msg) => msg.id)
    .map((msg) => {
      const contentType = String(msg.body?.contentType || '').toLowerCase();
      const content = String(msg.body?.content || '').trim();
      const preview = String(msg.bodyPreview || '').trim();
      const isHtml = contentType === 'html';
      return {
        providerMessageId: String(msg.id),
        providerThreadId: msg.conversationId ? String(msg.conversationId) : null,
        from: formatAddress(msg.from),
        to: msg.toRecipients?.[0] ? formatAddress(msg.toRecipients[0]) : null,
        subject: msg.subject ? String(msg.subject) : null,
        bodyText: isHtml ? preview || content.replace(/<[^>]+>/g, ' ').trim() : content || preview,
        bodyHtml: isHtml ? content || null : null,
        receivedAt: msg.receivedDateTime ? new Date(msg.receivedDateTime) : new Date(),
      } satisfies InboxReplyItem;
    });
}
