/**
 * Send email via Zoho Mail REST API (OAuth).
 * https://www.zoho.com/mail/help/api/post-send-an-email.html
 */

import { getZohoDcConfig, type ZohoDataCenter } from './zoho.oauth.js';

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
