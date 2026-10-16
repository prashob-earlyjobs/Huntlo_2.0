/** Outlook outreach sends through the communication gateway. The gateway loads the mailbox token from `from`. */

export async function sendOutlookViaGateway(input: {
  to: string;
  from: string;
  subject: string;
  html: string;
  campaignId?: string | null;
  prompt?: string | null;
  autoReply?: boolean;
  threadId?: string | null;
}): Promise<{ messageId?: string; threadId?: string }> {
  const base = String(process.env.COMMUNICATION_GATEWAY_URL || 'http://localhost:5055/api/v1')
    .trim()
    .replace(/\/$/, '');
  const url = `${base}/messages/send${input.autoReply === false ? '' : '?autoReply=true'}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'email',
      vendor: 'outlook',
      to: input.to,
      from: input.from,
      subject: input.subject,
      html: input.html,
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      ...(input.prompt ? { prompt: input.prompt } : {}),
      ...(input.threadId ? { threadId: input.threadId } : {}),
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
      `Outlook gateway send failed (${res.status})`;
    throw Object.assign(new Error(errorMessage), {
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
    });
  }

  return {
    messageId: data.data?.id || data.data?.messageId || data.id || data.messageId,
    threadId: data.data?.threadId || data.threadId,
  };
}
