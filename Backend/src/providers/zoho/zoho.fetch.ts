import type { InboxFetchOptions, InboxReplyItem } from '../email/inbox-reply.js';
import { stripEmailQuotedReply } from '../email/strip-quoted-reply.js';
import {
  getZohoDcConfig,
  normalizeZohoDataCenter,
  zohoDataCenterOrder,
  type ZohoDataCenter,
} from './zoho.oauth.js';

type ZohoAccount = {
  accountId?: string | number;
  mailboxAddress?: string;
  primaryEmailAddress?: string;
  accountName?: string;
  incomingUserName?: string;
  displayName?: string;
  emailAddress?:
    | string
    | Array<{ mailId?: string; isPrimary?: boolean; isAlias?: boolean }>;
  sendMailDetails?: Array<{ fromAddress?: string; displayName?: string }>;
};

type ZohoFolder = {
  folderId?: string | number;
  folderName?: string;
};

type ZohoMessageMeta = {
  messageId?: string | number;
  threadId?: string | number;
  fromAddress?: string;
  sender?: string;
  toAddress?: string;
  subject?: string;
  summary?: string;
  receivedTime?: string | number;
  folderId?: string | number;
};

function authHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    Accept: 'application/json',
  };
}

async function parseZohoError(res: Response): Promise<never> {
  const body = (await res.json().catch(() => ({}))) as {
    data?: { errorCode?: string; moreInfo?: string };
    status?: { description?: string };
  };
  const msg =
    body.data?.moreInfo ||
    body.data?.errorCode ||
    body.status?.description ||
    `Zoho request failed (${res.status})`;
  throw Object.assign(new Error(msg), {
    statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectEmailsFromZohoAccount(account: ZohoAccount): string[] {
  const out: string[] = [];
  const push = (value: unknown) => {
    const raw = String(value || '')
      .trim()
      .toLowerCase();
    if (raw.includes('@') && !out.includes(raw)) out.push(raw);
  };

  push(account.mailboxAddress);
  push(account.primaryEmailAddress);
  push(account.incomingUserName);
  if (typeof account.emailAddress === 'string') {
    push(account.emailAddress);
  } else if (Array.isArray(account.emailAddress)) {
    const primary = account.emailAddress.find((row) => row.isPrimary);
    push(primary?.mailId);
    for (const row of account.emailAddress) push(row.mailId);
  }
  for (const row of account.sendMailDetails || []) push(row.fromAddress);
  return out;
}

function emailFromZohoAccount(account: ZohoAccount): string | null {
  return collectEmailsFromZohoAccount(account)[0] || null;
}

export async function fetchZohoAccounts(
  accessToken: string,
  dataCenter?: ZohoDataCenter | string
): Promise<ZohoAccount[]> {
  const dc = getZohoDcConfig(dataCenter);
  const res = await fetch(`https://${dc.mailApiHost}/api/accounts`, {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) await parseZohoError(res);
  const data = (await res.json()) as { data?: ZohoAccount[] | ZohoAccount };
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === 'object') return [data.data];
  return [];
}

async function fetchZohoAccountDetails(
  accessToken: string,
  accountId: string,
  dataCenter?: ZohoDataCenter | string
): Promise<ZohoAccount | null> {
  const dc = getZohoDcConfig(dataCenter);
  const res = await fetch(
    `https://${dc.mailApiHost}/api/accounts/${encodeURIComponent(accountId)}`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as {
    data?: ZohoAccount | ZohoAccount[];
  };
  if (Array.isArray(data.data)) return data.data[0] || null;
  return data.data || null;
}

async function resolveZohoAccountOnDc(
  accessToken: string,
  dataCenter: ZohoDataCenter | string,
  preferredEmail?: string | null
): Promise<{ accountId: string; email: string | null; dataCenter: ZohoDataCenter }> {
  const accounts = await fetchZohoAccounts(accessToken, dataCenter);
  if (!accounts.length) {
    throw Object.assign(new Error('No Zoho Mail accounts found for this token.'), {
      statusCode: 400,
    });
  }
  const preferred = String(preferredEmail || '')
    .trim()
    .toLowerCase();

  let match =
    (preferred
      ? accounts.find((a) => collectEmailsFromZohoAccount(a).includes(preferred))
      : null) || accounts[0];

  if (!match?.accountId) {
    throw Object.assign(new Error('No Zoho Mail accounts found for this token.'), {
      statusCode: 400,
    });
  }

  let email = emailFromZohoAccount(match);
  if (!email) {
    const detailed = await fetchZohoAccountDetails(
      accessToken,
      String(match.accountId),
      dataCenter
    );
    if (detailed) {
      match = { ...match, ...detailed };
      email = emailFromZohoAccount(match);
    }
  }

  return {
    accountId: String(match.accountId),
    email,
    dataCenter: normalizeZohoDataCenter(dataCenter),
  };
}

export async function resolveZohoAccountId(
  accessToken: string,
  dataCenter?: ZohoDataCenter | string,
  preferredEmail?: string | null
): Promise<{ accountId: string; email: string | null; dataCenter: ZohoDataCenter }> {
  let lastError: unknown;
  for (const dc of zohoDataCenterOrder(dataCenter)) {
    try {
      return await resolveZohoAccountOnDc(accessToken, dc, preferredEmail);
    } catch (error) {
      lastError = error;
    }
  }
  throw (
    lastError ||
    Object.assign(new Error('No Zoho Mail accounts found for this token.'), {
      statusCode: 400,
    })
  );
}

async function resolveInboxFolderId(
  accessToken: string,
  accountId: string,
  dataCenter?: ZohoDataCenter | string
): Promise<string> {
  const dc = getZohoDcConfig(dataCenter);
  const res = await fetch(
    `https://${dc.mailApiHost}/api/accounts/${encodeURIComponent(accountId)}/folders`,
    { headers: authHeaders(accessToken) }
  );
  if (!res.ok) await parseZohoError(res);
  const data = (await res.json()) as { data?: ZohoFolder[] };
  const folders = Array.isArray(data.data) ? data.data : [];
  const inbox =
    folders.find((f) => String(f.folderName || '').toLowerCase() === 'inbox') || folders[0];
  if (!inbox?.folderId) {
    throw Object.assign(new Error('Zoho Inbox folder not found.'), { statusCode: 502 });
  }
  return String(inbox.folderId);
}

async function fetchMessageContent(input: {
  accessToken: string;
  accountId: string;
  folderId: string;
  messageId: string;
  dataCenter?: ZohoDataCenter | string;
}): Promise<{ text: string; html: string | null }> {
  const dc = getZohoDcConfig(input.dataCenter);
  const res = await fetch(
    `https://${dc.mailApiHost}/api/accounts/${encodeURIComponent(input.accountId)}/folders/${encodeURIComponent(input.folderId)}/messages/${encodeURIComponent(input.messageId)}/content`,
    { headers: authHeaders(input.accessToken) }
  );
  if (!res.ok) return { text: '', html: null };
  const data = (await res.json().catch(() => ({}))) as {
    data?: { content?: string; messageContent?: string };
  };
  const content = String(data.data?.content || data.data?.messageContent || '').trim();
  if (!content) return { text: '', html: null };
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return { text: stripHtml(content), html: content };
  }
  return { text: content, html: null };
}

/**
 * List + fetch recent Zoho inbox messages for reply-sync.
 */
export async function fetchRecentZohoInboxReplies(
  accessToken: string,
  input: {
    accountId: string;
    dataCenter?: ZohoDataCenter | string;
  } & InboxFetchOptions
): Promise<InboxReplyItem[]> {
  const maxResults = Math.min(Math.max(input.maxResults ?? 15, 1), 50);
  const newerThanDays = Math.max(input.newerThanDays ?? 2, 1);
  const sinceMs = Date.now() - newerThanDays * 24 * 60 * 60 * 1000;
  const dc = getZohoDcConfig(input.dataCenter);
  const folderId = await resolveInboxFolderId(accessToken, input.accountId, input.dataCenter);

  const listUrl = new URL(
    `https://${dc.mailApiHost}/api/accounts/${encodeURIComponent(input.accountId)}/messages/view`
  );
  listUrl.searchParams.set('folderId', folderId);
  listUrl.searchParams.set('limit', String(maxResults));
  listUrl.searchParams.set('start', '0');

  const listRes = await fetch(listUrl.toString(), { headers: authHeaders(accessToken) });
  if (!listRes.ok) await parseZohoError(listRes);
  const listData = (await listRes.json()) as { data?: ZohoMessageMeta[] };
  const metas = Array.isArray(listData.data) ? listData.data : [];

  const items: InboxReplyItem[] = [];
  for (const meta of metas) {
    const messageId = String(meta.messageId || '').trim();
    if (!messageId) continue;

    const receivedRaw = meta.receivedTime;
    const receivedAt =
      typeof receivedRaw === 'number'
        ? new Date(receivedRaw)
        : receivedRaw
          ? new Date(String(receivedRaw))
          : new Date();
    if (Number.isFinite(receivedAt.getTime()) && receivedAt.getTime() < sinceMs) continue;

    const folderForContent = String(meta.folderId || folderId);
    const body = await fetchMessageContent({
      accessToken,
      accountId: input.accountId,
      folderId: folderForContent,
      messageId,
      dataCenter: input.dataCenter,
    });

    items.push({
      providerMessageId: messageId,
      providerThreadId: meta.threadId ? String(meta.threadId) : null,
      from: String(meta.fromAddress || meta.sender || '').trim(),
      to: meta.toAddress ? String(meta.toAddress) : null,
      subject: meta.subject ? String(meta.subject) : null,
      bodyText: stripEmailQuotedReply(body.text || String(meta.summary || '').trim()),
      bodyHtml: body.html,
      receivedAt: Number.isFinite(receivedAt.getTime()) ? receivedAt : new Date(),
    });
  }
  return items;
}
