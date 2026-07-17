/**
 * IMAP inbox read helpers for SMTP / Zoho-SMTP integrations.
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

import type { InboxFetchOptions, InboxReplyItem } from '../email/inbox-reply.js';

export type ImapFetchConfig = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
};

function inferImapHostFromSmtp(smtpHost: string): string {
  const host = String(smtpHost || '').trim().toLowerCase();
  if (!host) return '';
  if (host.startsWith('smtp.')) return `imap.${host.slice(5)}`;
  if (host.includes('smtp')) return host.replace(/smtp/gi, 'imap');
  return host;
}

export function resolveImapConfig(input: {
  imapHost?: string | null;
  imapPort?: number | string | null;
  smtpHost?: string | null;
  smtpSecurity?: string | null;
  username: string;
  password: string;
}): ImapFetchConfig | null {
  const host =
    String(input.imapHost || '').trim() || inferImapHostFromSmtp(String(input.smtpHost || ''));
  if (!host || !input.username || !input.password) return null;

  const security = String(input.smtpSecurity || 'tls').toLowerCase();
  const portRaw = Number(input.imapPort);
  const port =
    Number.isFinite(portRaw) && portRaw > 0
      ? Math.floor(portRaw)
      : security === 'none'
        ? 143
        : 993;
  const secure = port === 993 || security === 'ssl';

  return {
    host,
    port,
    secure,
    username: input.username,
    password: input.password,
  };
}

/**
 * Fetch recent INBOX messages over IMAP (SINCE window).
 */
export async function fetchRecentImapInboxReplies(
  config: ImapFetchConfig,
  options: InboxFetchOptions = {}
): Promise<InboxReplyItem[]> {
  const maxResults = Math.min(Math.max(options.maxResults ?? 15, 1), 50);
  const newerThanDays = Math.max(options.newerThanDays ?? 2, 1);
  const since = new Date(Date.now() - newerThanDays * 24 * 60 * 60 * 1000);

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.username, pass: config.password },
    logger: false,
  });

  const items: InboxReplyItem[] = [];
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      // IMAP SINCE uses date (not time); over-fetch then clamp in JS.
      const uids = await client.search({ since }, { uid: true });
      if (!uids || uids.length === 0) return [];

      const recent = uids.slice(-maxResults).reverse();
      for await (const msg of client.fetch(
        recent,
        { uid: true, envelope: true, source: true },
        { uid: true }
      )) {
        const uid = String(msg.uid || '');
        if (!uid) continue;

        let bodyText = '';
        let bodyHtml: string | null = null;
        let from = '';
        let to: string | null = null;
        let subject: string | null = null;
        let receivedAt = new Date();

        if (msg.source) {
          try {
            const parsed = await simpleParser(msg.source);
            bodyText = String(parsed.text || '').trim();
            bodyHtml = parsed.html ? String(parsed.html) : null;
            from = parsed.from?.text || '';
            to = parsed.to ? (Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to.text) || null : null;
            subject = parsed.subject || null;
            if (parsed.date) receivedAt = parsed.date;
          } catch {
            // fall through to envelope
          }
        }

        if (!from && msg.envelope?.from?.[0]) {
          const f = msg.envelope.from[0];
          from = f.address
            ? f.name
              ? `${f.name} <${f.address}>`
              : f.address
            : String(f.name || '');
        }
        if (!to && msg.envelope?.to?.[0]?.address) {
          to = msg.envelope.to[0].address;
        }
        if (!subject && msg.envelope?.subject) subject = String(msg.envelope.subject);
        if (msg.envelope?.date) receivedAt = msg.envelope.date;

        if (receivedAt.getTime() < since.getTime()) continue;

        items.push({
          providerMessageId: uid,
          providerThreadId: msg.envelope?.messageId
            ? String(msg.envelope.messageId)
            : null,
          from,
          to,
          subject,
          bodyText: bodyText || String(msg.envelope?.subject || ''),
          bodyHtml,
          receivedAt,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    try {
      await client.logout();
    } catch {
      client.close();
    }
  }

  return items;
}
