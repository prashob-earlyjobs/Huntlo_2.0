/** Send email via Microsoft Graph. */

export async function sendOutlookMail(input: {
  accessToken: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<{ messageId?: string }> {
  const contentType = input.html ? 'HTML' : 'Text';
  const content = input.html || input.text || '';

  const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject: input.subject,
        body: { contentType, content },
        toRecipients: [{ emailAddress: { address: input.to } }],
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw Object.assign(
      new Error(data.error?.message || `Outlook send failed (${res.status})`),
      { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  }

  // Graph sendMail returns 202 with empty body
  return {};
}
