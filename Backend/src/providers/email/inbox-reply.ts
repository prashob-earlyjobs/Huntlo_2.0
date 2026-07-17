/** Shared shape for inbound email reply sync across Gmail / Outlook / Zoho / IMAP. */

export type InboxReplyItem = {
  providerMessageId: string;
  providerThreadId: string | null;
  from: string;
  to: string | null;
  subject: string | null;
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: Date;
};

export type InboxFetchOptions = {
  maxResults?: number;
  newerThanDays?: number;
};
