import { getGupshupWhatsAppCredentials } from './gupshup.config.js';

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '');
}

export async function sendGupshupText(input: {
  to: string;
  body: string;
  mode?: 'template' | 'reply';
}): Promise<{ messageId?: string }> {
  const creds = getGupshupWhatsAppCredentials(input.mode ?? 'reply');
  if (!creds) {
    throw Object.assign(new Error('Gupshup WhatsApp is not configured on the server.'), {
      statusCode: 503,
    });
  }

  const sendTo = digitsOnly(input.to);
  if (!sendTo) {
    throw Object.assign(new Error('WhatsApp recipient phone is invalid.'), {
      statusCode: 400,
    });
  }

  const params = new URLSearchParams({
    method: creds.method,
    userid: creds.userid,
    password: creds.password,
    send_to: sendTo,
    msg: input.body,
    msg_type: 'TEXT',
    auth_scheme: 'plain',
    v: '1.1',
    format: 'json',
  });

  const res = await fetch(`${creds.gatewayBaseUrl}?${params.toString()}`, {
    method: 'GET',
  });
  const data = (await res.json().catch(() => ({}))) as {
    response?: { id?: string; status?: string; details?: string };
    data?: { id?: string };
  };

  const status = String(data.response?.status || '').toLowerCase();
  if (!res.ok || (status && status !== 'success')) {
    throw Object.assign(
      new Error(data.response?.details || `Gupshup send failed (${res.status})`),
      { statusCode: 502 }
    );
  }

  return {
    messageId: data.response?.id || data.data?.id,
  };
}

/**
 * Gupshup HSM / template send. `templateId` is the Gupshup-side template id
 * (env-mapped from Huntlo catalogue ids). Body params are positional {{1}}, {{2}}.
 */
export async function sendGupshupTemplate(input: {
  to: string;
  templateId: string;
  bodyParameters: string[];
}): Promise<{ messageId?: string }> {
  const creds = getGupshupWhatsAppCredentials('template');
  if (!creds) {
    throw Object.assign(new Error('Gupshup WhatsApp template credentials are not configured.'), {
      statusCode: 503,
    });
  }

  const sendTo = digitsOnly(input.to);
  if (!sendTo) {
    throw Object.assign(new Error('WhatsApp recipient phone is invalid.'), {
      statusCode: 400,
    });
  }

  const params = new URLSearchParams({
    method: creds.method,
    userid: creds.userid,
    password: creds.password,
    send_to: sendTo,
    msg_type: 'TEXT',
    auth_scheme: 'plain',
    v: '1.1',
    format: 'json',
    isTemplate: 'true',
    template_id: input.templateId,
  });

  if (input.bodyParameters.length) {
    params.set('msg', input.bodyParameters.join('|'));
  }

  const res = await fetch(`${creds.gatewayBaseUrl}?${params.toString()}`, {
    method: 'GET',
  });
  const data = (await res.json().catch(() => ({}))) as {
    response?: { id?: string; status?: string; details?: string };
    data?: { id?: string };
  };

  const status = String(data.response?.status || '').toLowerCase();
  if (!res.ok || (status && status !== 'success')) {
    throw Object.assign(
      new Error(data.response?.details || `Gupshup template send failed (${res.status})`),
      { statusCode: 502 }
    );
  }

  return {
    messageId: data.response?.id || data.data?.id,
  };
}
