/** Huntlo/Meta WhatsApp outreach (single- and multi-channel) sends through the communication gateway. */

export async function sendWhatsAppViaGateway(input: {
  to: string;
  campaignId: string;
  template?: string | null;
  variables?: string[];
  body?: string | null;
  prompt?: string | null;
  autoReply?: boolean;
  threadId?: string | null;
}): Promise<{ messageId?: string; threadId?: string }> {
  const base = String(process.env.COMMUNICATION_GATEWAY_URL || 'http://localhost:5055/api/v1')
    .trim()
    .replace(/\/$/, '');
  const url = `${base}/messages/send${input.autoReply === false ? '' : '?autoReply=true'}`;
  const to = String(input.to || '').replace(/\D/g, '');
  const template = String(input.template || '').trim();
  const body = String(input.body || '').trim();

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'whatsapp',
      vendor: 'huntlo',
      to,
      campaignId: input.campaignId,
      ...(template ? { template, variables: input.variables || [] } : {}),
      ...(!template && body ? { body } : {}),
      ...(input.prompt ? { prompt: input.prompt } : {}),
      ...(input.threadId ? { threadId: input.threadId } : {}),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    messageId?: string;
    threadId?: string;
    conversationId?: string;
    message?: string;
    error?: string | { message?: string };
    data?: {
      id?: string;
      messageId?: string;
      threadId?: string;
      conversationId?: string;
    };
  };
  if (!res.ok) {
    const errorMessage =
      (typeof data.error === 'string' && data.error) ||
      (typeof data.error === 'object' && data.error?.message) ||
      data.message ||
      `WhatsApp gateway send failed (${res.status})`;
    throw Object.assign(new Error(errorMessage), {
      statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
    });
  }

  return {
    messageId: data.data?.id || data.data?.messageId || data.id || data.messageId,
    threadId:
      data.data?.threadId ||
      data.data?.conversationId ||
      data.threadId ||
      data.conversationId,
  };
}
