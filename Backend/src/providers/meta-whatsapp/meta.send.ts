import { getMetaGraphBaseUrl } from './meta.config.js';

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

export async function sendMetaWhatsAppText(input: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  body: string;
}): Promise<{ messageId?: string }> {
  const to = digitsOnly(input.to);
  if (!to) {
    throw Object.assign(new Error('WhatsApp recipient phone is invalid.'), {
      statusCode: 400,
    });
  }

  const url = `${getMetaGraphBaseUrl()}/${encodeURIComponent(input.phoneNumberId)}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: input.body },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string; error_user_msg?: string };
  };

  if (!res.ok) {
    throw Object.assign(
      new Error(
        data.error?.error_user_msg ||
          data.error?.message ||
          `Meta WhatsApp send failed (${res.status})`
      ),
      { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  }

  return { messageId: data.messages?.[0]?.id };
}
