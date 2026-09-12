/**
 * Send email via Zoho Mail REST API (OAuth).
 * https://www.zoho.com/mail/help/api/post-send-an-email.html
 */

import { createHash } from 'node:crypto';

import { getZohoDcConfig, type ZohoDataCenter } from './zoho.oauth.js';

const ZOHO_SUBJECT_TOKEN_RE = /\s·\s[a-f0-9]{8}$/i;

/**
 * Zoho / gateway conversation matching is subject-sensitive.
 * Append a stable 8-hex token from `uniqueKey` (e.g. enrollmentId) so each
 * candidate thread stays unique while follow-ups can reuse the same subject.
 */
export function withUniqueZohoSubject(subject: string, uniqueKey: string): string {
  const base = String(subject || '').trim() || '(no subject)';
  const key = String(uniqueKey || '').trim();
  if (!key) return base;
  if (ZOHO_SUBJECT_TOKEN_RE.test(base)) return base;
  const token = createHash('sha256').update(key).digest('hex').slice(0, 8);
  return `${base} · ${token}`;
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
    `Zoho send failed (${res.status})`;
  throw Object.assign(new Error(msg), {
    statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
  });
}

export async function sendZohoMail(input: {
  accessToken: string;
  accountId: string;
  dataCenter?: ZohoDataCenter | string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<{ messageId?: string }> {
  const dc = getZohoDcConfig(input.dataCenter);
  const content = input.html || input.text || '';
  const res = await fetch(
    `https://${dc.mailApiHost}/api/accounts/${encodeURIComponent(input.accountId)}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${input.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        fromAddress: input.from,
        toAddress: input.to,
        subject: input.subject,
        content,
        mailFormat: input.html ? 'html' : 'plaintext',
      }),
    }
  );

  if (!res.ok) await parseZohoError(res);
  const data = (await res.json().catch(() => ({}))) as {
    data?: { messageId?: string; mailId?: string };
  };
  return {
    messageId:
      (typeof data.data?.messageId === 'string' && data.data.messageId) ||
      (typeof data.data?.mailId === 'string' && data.data.mailId) ||
      undefined,
  };
}

/**
 * Zoho Mail outreach via communication gateway `/messages/send`
 * (same endpoint as Gmail; vendor: "zoho").
 */
export async function sendZohoViaGateway(input: {
  accessToken: string;
  accountId: string;
  fromAddress: string;
  to: string;
  subject: string;
  html: string;
  campaignId: string;
  dataCenter?: ZohoDataCenter | string | null;
  prompt?: string | null;
  autoReply?: boolean;
  /** When set, subject is made unique+stable for this conversation key. */
  uniqueSubjectKey?: string | null;
}): Promise<{ messageId?: string; threadId?: string }> {
  const base = String(process.env.COMMUNICATION_GATEWAY_URL || 'http://localhost:5055/api/v1')
    .trim()
    .replace(/\/$/, '');
  const url = `${base}/messages/send${input.autoReply === false ? '' : '?autoReply=true'}`;
  const subject = input.uniqueSubjectKey
    ? withUniqueZohoSubject(input.subject, input.uniqueSubjectKey)
    : input.subject;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'email',
      vendor: 'zoho',
      to: input.to,
      subject,
      html: input.html,
      accessToken: input.accessToken,
      campaignId: input.campaignId,
      accountId: input.accountId,
      fromAddress: input.fromAddress,
      ...(input.dataCenter ? { dataCenter: String(input.dataCenter) } : {}),
      ...(input.prompt ? { prompt: input.prompt } : {}),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    messageId?: string;
    threadId?: string;
    message?: string;
    error?: string | { message?: string };
    data?: { id?: string; messageId?: string; threadId?: string };
  };
  if (!res.ok) {
    const errorMessage =
      (typeof data.error === 'string' && data.error) ||
      (typeof data.error === 'object' && data.error?.message) ||
      data.message ||
      `Zoho gateway send failed (${res.status})`;
    throw Object.assign(new Error(errorMessage), {
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
    });
  }

  return {
    messageId: data.data?.id || data.data?.messageId || data.id || data.messageId,
    threadId: data.data?.threadId || data.threadId,
  };
}
