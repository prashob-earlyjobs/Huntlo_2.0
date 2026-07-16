/**
 * Meta WhatsApp Cloud API — ported from EJHunterLanding metaWhatsAppConfig/Client.
 */

export function getMetaGraphApiVersion(): string {
  const raw = String(process.env.META_GRAPH_API_VERSION || 'v21.0').trim();
  return raw.startsWith('v') ? raw : `v${raw}`;
}

export function getMetaGraphBaseUrl(): string {
  return `https://graph.facebook.com/${getMetaGraphApiVersion()}`;
}

export function getHuntloWhatsAppCredentials(): {
  phoneNumberId: string;
  accessToken: string;
  wabaId: string;
} | null {
  const phoneNumberId = String(process.env.HUNTLO_WHATSAPP_PHONE_NUMBER_ID || '')
    .trim()
    .replace(/\s/g, '');
  const accessToken = String(process.env.HUNTLO_WHATSAPP_ACCESS_TOKEN || '').trim();
  const wabaId = String(process.env.HUNTLO_WHATSAPP_WABA_ID || '')
    .trim()
    .replace(/\s/g, '');
  if (!phoneNumberId || !accessToken) return null;
  return { phoneNumberId, accessToken, wabaId };
}

export function isHuntloWhatsAppConfigured(): boolean {
  return Boolean(getHuntloWhatsAppCredentials());
}

const PHONE_NUMBER_ID_RE = /^\d{8,20}$/;

function parseGraphError(payload: Record<string, unknown>, status: number): string {
  const err = payload.error as Record<string, unknown> | undefined;
  if (err?.message) return String(err.message);
  if (err?.error_user_msg) return String(err.error_user_msg);
  if (status === 401) return 'Invalid Meta access token.';
  if (status === 404) {
    return 'Phone number ID not found. Check your Meta WhatsApp Phone Number ID.';
  }
  return 'Meta API request failed.';
}

export async function fetchMetaPhoneNumber(phoneNumberId: string, accessToken: string) {
  const url = `${getMetaGraphBaseUrl()}/${encodeURIComponent(phoneNumberId)}?fields=display_phone_number,verified_name`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw Object.assign(new Error(parseGraphError(data, res.status)), {
      statusCode: res.status === 401 ? 401 : 400,
    });
  }
  return data as {
    id?: string;
    display_phone_number?: string;
    verified_name?: string;
  };
}

export async function verifyMetaWhatsAppCredentials(body: Record<string, unknown>) {
  const phoneNumberId = String(body.phoneNumberId || body.metaPhoneNumberId || '')
    .trim()
    .replace(/\s/g, '');
  const accessToken = String(body.accessToken || body.metaAccessToken || '').trim();
  const wabaId = String(body.wabaId || body.metaWabaId || '')
    .trim()
    .replace(/\s/g, '');

  if (!phoneNumberId) {
    throw Object.assign(new Error('WhatsApp Phone Number ID is required.'), { statusCode: 400 });
  }
  if (!PHONE_NUMBER_ID_RE.test(phoneNumberId)) {
    throw Object.assign(
      new Error('Phone Number ID must be numeric (from Meta Business Manager).'),
      { statusCode: 400 }
    );
  }
  if (!accessToken || accessToken.length < 20) {
    throw Object.assign(new Error('Meta access token is required.'), { statusCode: 400 });
  }

  const info = await fetchMetaPhoneNumber(phoneNumberId, accessToken);
  const displayPhone = info.display_phone_number || '';
  const verifiedName = info.verified_name || '';

  return {
    verified: true as const,
    mode: 'meta' as const,
    message: verifiedName
      ? `Connected to ${verifiedName}${displayPhone ? ` (${displayPhone})` : ''}.`
      : displayPhone
        ? `Connected to WhatsApp number ${displayPhone}.`
        : 'Meta WhatsApp credentials verified.',
    phoneNumber: {
      id: phoneNumberId,
      displayPhoneNumber: displayPhone,
      verifiedName,
      wabaId,
    },
  };
}

export function getMetaWebhookVerifyToken(): string {
  return String(process.env.META_WEBHOOK_VERIFY_TOKEN || '').trim();
}
