/** Send email via Gmail API (OAuth access token). */

function toBase64Url(raw: string): string {
  return Buffer.from(raw, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** RFC 2047 encode Subject so non-ASCII (em dashes, etc.) do not mojibake. */
export function encodeRfc2047Subject(subject: string): string {
  const value = String(subject || '').replace(/[\r\n]+/g, ' ').trim();
  if (!value) return '(no subject)';
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  const b64 = Buffer.from(value, 'utf8').toString('base64');
  return `=?UTF-8?B?${b64}?=`;
}

function buildRfc822(input: {
  to: string;
  from?: string | null;
  subject: string;
  text?: string;
  html?: string;
  inReplyTo?: string | null;
  references?: string | null;
}): string {
  const boundary = `huntlo_${Date.now().toString(36)}`;
  const headers = [
    `To: ${input.to}`,
    input.from ? `From: ${input.from}` : null,
    `Subject: ${encodeRfc2047Subject(input.subject)}`,
    input.inReplyTo ? `In-Reply-To: ${input.inReplyTo}` : null,
    input.references ? `References: ${input.references}` : null,
    'MIME-Version: 1.0',
  ].filter(Boolean);

  if (input.html && input.text) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    return [
      ...headers,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      input.text,
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      '',
      input.html,
      `--${boundary}--`,
    ].join('\r\n');
  }

  if (input.html) {
    headers.push('Content-Type: text/html; charset="UTF-8"');
    return [...headers, '', input.html].join('\r\n');
  }

  headers.push('Content-Type: text/plain; charset="UTF-8"');
  return [...headers, '', input.text || ''].join('\r\n');
}

export async function sendGmailMessage(input: {
  accessToken: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string | null;
  /** Gmail conversation thread id — required to keep replies in the same inbox thread. */
  threadId?: string | null;
  /** RFC Message-ID of the message being replied to (optional; threadId is primary). */
  inReplyTo?: string | null;
  references?: string | null;
}): Promise<{ messageId?: string; threadId?: string }> {
  const raw = toBase64Url(
    buildRfc822({
      to: input.to,
      from: input.from,
      subject: input.subject,
      text: input.text,
      html: input.html,
      inReplyTo: input.inReplyTo,
      references: input.references,
    })
  );

  const body: Record<string, string> = { raw };
  if (input.threadId) body.threadId = input.threadId;

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    threadId?: string;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw Object.assign(
      new Error(data.error?.message || `Gmail send failed (${res.status})`),
      { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  }
  return { messageId: data.id, threadId: data.threadId };
}
