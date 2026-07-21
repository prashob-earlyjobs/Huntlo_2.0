import { appendFileSync } from 'node:fs';
import { getMetaGraphBaseUrl } from './meta.config.js';

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

function beacon(event: string, payload: Record<string, unknown>): void {
  try {
    appendFileSync(
      '/tmp/huntlo-whatsapp-send.log',
      `${new Date().toISOString()} ${event} ${JSON.stringify(payload)}\n`
    );
  } catch {
    // ignore beacon failures
  }
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

  // Hard stop: session free-text must never carry Meta template placeholders.
  // That bug is what delivered literal "{{1}}" / "{{2}}" to candidates.
  if (/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(input.body || '')) {
    beacon('text-blocked', { to: input.to, bodyPreview: String(input.body || '').slice(0, 80) });
    throw Object.assign(
      new Error(
        'Refusing Meta WhatsApp free-text send: body still contains {{variables}}. ' +
          'Cold outreach must use sendMetaWhatsAppTemplate with body parameters.'
      ),
      { statusCode: 400, code: 'UNFILLED_WHATSAPP_VARIABLES' }
    );
  }

  beacon('text-send', { to: input.to, bodyPreview: String(input.body || '').slice(0, 80) });

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

/**
 * Cold outbound send via an approved WhatsApp Business template.
 * Body component parameters must match the approved template order ({{1}}, {{2}}, …).
 */
export async function sendMetaWhatsAppTemplate(input: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  templateName: string;
  languageCode: string;
  bodyParameters: string[];
}): Promise<{ messageId?: string }> {
  const to = digitsOnly(input.to);
  if (!to) {
    throw Object.assign(new Error('WhatsApp recipient phone is invalid.'), {
      statusCode: 400,
    });
  }

  const components =
    input.bodyParameters.length > 0
      ? [
          {
            type: 'body',
            parameters: input.bodyParameters.map((text) => ({
              type: 'text',
              text: String(text || '').slice(0, 1024) || '-',
            })),
          },
        ]
      : [];

  beacon('template-send', {
    to: input.to,
    templateName: input.templateName,
    languageCode: input.languageCode,
    bodyParameters: input.bodyParameters,
  });

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
      type: 'template',
      template: {
        name: input.templateName,
        language: { code: input.languageCode },
        ...(components.length ? { components } : {}),
      },
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
          `Meta WhatsApp template send failed (${res.status})`
      ),
      { statusCode: res.status >= 400 && res.status < 600 ? res.status : 502 }
    );
  }

  return { messageId: data.messages?.[0]?.id };
}
