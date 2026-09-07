/** Huntlo/Meta WhatsApp outreach (single- and multi-channel) sends through the communication gateway. */

export type GatewayWhatsAppButton = {
  id: string;
  title: string;
};

export type GatewayWhatsAppQuestion = {
  id: string;
  question: string;
  required?: boolean;
  answer_type?: 'yes_no' | 'text';
  pass_condition?: string;
  buttons?: GatewayWhatsAppButton[];
};

export const WHATSAPP_YES_NO_BUTTONS: GatewayWhatsAppButton[] = [
  { id: 'yes', title: 'Yes' },
  { id: 'no', title: 'No' },
];

export async function sendWhatsAppViaGateway(input: {
  to: string;
  campaignId: string;
  template?: string | null;
  variables?: string[];
  body?: string | null;
  prompt?: string | null;
  autoReply?: boolean;
  threadId?: string | null;
  buttons?: GatewayWhatsAppButton[] | null;
  questions?: GatewayWhatsAppQuestion[] | null;
}): Promise<{ messageId?: string; threadId?: string }> {
  const base = String(process.env.COMMUNICATION_GATEWAY_URL || 'http://localhost:5055/api/v1')
    .trim()
    .replace(/\/$/, '');
  const to = String(input.to || '').replace(/\D/g, '');
  const template = String(input.template || '').trim();
  const body = String(input.body || '').trim();
  const threadId = String(input.threadId || '').trim();
  const buttons = (input.buttons || [])
    .map((button) => ({
      id: String(button.id || '').trim(),
      title: String(button.title || '').trim().slice(0, 20),
    }))
    .filter((button) => button.id && button.title)
    .slice(0, 3);
  const buttonSession = !template && Boolean(body) && buttons.length > 0;
  // Session Yes/No messages match the Postman payload: no autoReply query, no prompt/questions.
  const url = `${base}/messages/send${
    buttonSession || input.autoReply === false ? '' : '?autoReply=true'
  }`;
  const payload = buttonSession
    ? {
        type: 'whatsapp',
        vendor: 'huntlo',
        to,
        campaignId: input.campaignId,
        ...(threadId ? { threadId } : {}),
        body,
        buttons,
      }
    : {
        type: 'whatsapp',
        vendor: 'huntlo',
        to,
        campaignId: input.campaignId,
        ...(template ? { template, variables: input.variables || [] } : {}),
        ...(!template && body ? { body } : {}),
        ...(input.prompt ? { prompt: input.prompt } : {}),
        ...(threadId ? { threadId } : {}),
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    messageId?: string;
    threadId?: string;
    conversationId?: string;
    message?: string;
    error?: string | string[] | { message?: string };
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
      (Array.isArray(data.error) && data.error.filter(Boolean).join('; ')) ||
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
