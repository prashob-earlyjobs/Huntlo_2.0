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

export type MetaReplyButton = {
  id: string;
  title: string;
};

export function buildMetaInteractiveButtonsPayload(input: {
  to: string;
  body: string;
  buttons: MetaReplyButton[];
}): Record<string, unknown> {
  const to = digitsOnly(input.to);
  const buttons = input.buttons.slice(0, 3).map((button) => ({
    type: 'reply',
    reply: {
      id: String(button.id || '').slice(0, 256) || 'btn',
      title: String(button.title || '').slice(0, 20) || 'OK',
    },
  }));
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: String(input.body || '').slice(0, 1024) },
      action: { buttons },
    },
  };
}

/** Session interactive reply buttons (Yes / No). Requires an open 24h customer-care window. */
export async function sendMetaWhatsAppReplyButtons(input: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  body: string;
  buttons: MetaReplyButton[];
}): Promise<{ messageId?: string }> {
  const payload = buildMetaInteractiveButtonsPayload(input);
  if (!payload.to) {
    throw Object.assign(new Error('WhatsApp recipient phone is invalid.'), {
      statusCode: 400,
    });
  }
  if (!Array.isArray(input.buttons) || input.buttons.length < 1) {
    throw Object.assign(new Error('WhatsApp reply buttons require at least one button.'), {
      statusCode: 400,
    });
  }

  beacon('interactive-send', {
    to: input.to,
    bodyPreview: String(input.body || '').slice(0, 80),
    buttons: input.buttons.map((button) => button.title),
  });

  const url = `${getMetaGraphBaseUrl()}/${encodeURIComponent(input.phoneNumberId)}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
          `Meta WhatsApp interactive send failed (${res.status})`
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
  /** Dynamic URL suffixes for CTA URL buttons (index 0 = first button). */
  urlButtonParameters?: string[];
}): Promise<{ messageId?: string }> {
  const to = digitsOnly(input.to);
  if (!to) {
    throw Object.assign(new Error('WhatsApp recipient phone is invalid.'), {
      statusCode: 400,
    });
  }

  const components: Array<Record<string, unknown>> = [];

  if (input.bodyParameters.length > 0) {
    components.push({
      type: 'body',
      parameters: input.bodyParameters.map((text) => ({
        type: 'text',
        text: String(text || '').slice(0, 1024) || '-',
      })),
    });
  }

  const urlButtonParameters = input.urlButtonParameters || [];
  urlButtonParameters.forEach((text, index) => {
    const value = String(text || '').trim();
    if (!value) return;
    components.push({
      type: 'button',
      sub_type: 'url',
      index: String(index),
      parameters: [
        {
          type: 'text',
          // Meta URL button params are usually path/query suffixes.
          text: value.slice(0, 1024),
        },
      ],
    });
  });

  beacon('template-send', {
    to: input.to,
    templateName: input.templateName,
    languageCode: input.languageCode,
    bodyParameters: input.bodyParameters,
    urlButtonParameters,
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
