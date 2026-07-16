/**
 * Gupshup WhatsApp Gateway — ported from EJHunterLanding gupshupWhatsAppConfig.js
 */

const GUPSHUP_GATEWAY_BASE_URL = 'https://mediaapi.smsgupshup.com/GatewayAPI/rest';
const GUPSHUP_GATEWAY_METHOD = 'SENDMESSAGE';

function readPair(
  useridKey: string,
  passwordKey: string,
  fallbackUseridKey: string,
  fallbackPasswordKey: string
): { userid: string; password: string } | null {
  const userid = String(
    process.env[useridKey] || process.env[fallbackUseridKey] || ''
  ).trim();
  const password = String(
    process.env[passwordKey] || process.env[fallbackPasswordKey] || ''
  ).trim();
  if (!userid || !password) return null;
  return { userid, password };
}

export function getGupshupReplyCredentials() {
  return readPair(
    'GUPSHUP_REPLY_USER_ID',
    'GUPSHUP_REPLY_PASSWORD',
    'GUPSHUP_USERID',
    'GUPSHUP_PASSWORD'
  );
}

export function getGupshupTemplateCredentials() {
  return readPair(
    'GUPSHUP_TEMPLATE_USER_ID',
    'GUPSHUP_TEMPLATE_PASSWORD',
    'GUPSHUP_USERID',
    'GUPSHUP_PASSWORD'
  );
}

export function getGupshupWhatsAppCredentials(mode: 'template' | 'reply' = 'template') {
  const creds =
    mode === 'reply' ? getGupshupReplyCredentials() : getGupshupTemplateCredentials();
  if (!creds) return null;
  return {
    ...creds,
    gatewayBaseUrl: GUPSHUP_GATEWAY_BASE_URL,
    method: GUPSHUP_GATEWAY_METHOD,
  };
}

export function isGupshupWhatsAppConfigured(): boolean {
  return Boolean(getGupshupReplyCredentials() || getGupshupTemplateCredentials());
}

export async function verifyGupshupWhatsAppCredentials() {
  const creds = getGupshupWhatsAppCredentials();
  if (!creds) {
    throw Object.assign(
      new Error(
        'Gupshup WhatsApp is not available. Ask an admin to configure Gupshup on the server.'
      ),
      { statusCode: 503 }
    );
  }
  return {
    verified: true as const,
    mode: 'gupshup' as const,
    message: `Gupshup WhatsApp is configured (${creds.userid}).`,
    userid: creds.userid,
  };
}
