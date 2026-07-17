/**
 * Zoho Mail DC + OAuth config — ported from EJHunterLanding zohoMailConfig.js
 */

export const ZOHO_MAIL_SCOPES = [
  'ZohoMail.messages.CREATE',
  'ZohoMail.messages.READ',
  'ZohoMail.accounts.READ',
  'ZohoMail.folders.READ',
] as const;

export type ZohoDataCenter = 'com' | 'eu' | 'in' | 'com.au' | 'jp' | 'ca' | 'sa';

export const ZOHO_DC_CONFIG: Record<
  ZohoDataCenter,
  { accountsHost: string; mailApiHost: string; smtpHost: string; imapHost: string }
> = {
  com: {
    accountsHost: 'accounts.zoho.com',
    mailApiHost: 'mail.zoho.com',
    smtpHost: 'smtp.zoho.com',
    imapHost: 'imap.zoho.com',
  },
  eu: {
    accountsHost: 'accounts.zoho.eu',
    mailApiHost: 'mail.zoho.eu',
    smtpHost: 'smtp.zoho.eu',
    imapHost: 'imap.zoho.eu',
  },
  in: {
    accountsHost: 'accounts.zoho.in',
    mailApiHost: 'mail.zoho.in',
    smtpHost: 'smtp.zoho.in',
    imapHost: 'imap.zoho.in',
  },
  'com.au': {
    accountsHost: 'accounts.zoho.com.au',
    mailApiHost: 'mail.zoho.com.au',
    smtpHost: 'smtp.zoho.com.au',
    imapHost: 'imap.zoho.com.au',
  },
  jp: {
    accountsHost: 'accounts.zoho.jp',
    mailApiHost: 'mail.zoho.jp',
    smtpHost: 'smtp.zoho.jp',
    imapHost: 'imap.zoho.jp',
  },
  ca: {
    accountsHost: 'accounts.zohocloud.ca',
    mailApiHost: 'mail.zohocloud.ca',
    smtpHost: 'smtp.zohocloud.ca',
    imapHost: 'imap.zohocloud.ca',
  },
  sa: {
    accountsHost: 'accounts.zoho.sa',
    mailApiHost: 'mail.zoho.sa',
    smtpHost: 'smtp.zoho.sa',
    imapHost: 'imap.zoho.sa',
  },
};

export function normalizeZohoDataCenter(value: unknown): ZohoDataCenter {
  const raw = String(value || 'com').trim().toLowerCase();
  if (raw === 'us' || raw === 'com') return 'com';
  if (raw === 'au') return 'com.au';
  if (raw in ZOHO_DC_CONFIG) return raw as ZohoDataCenter;
  return 'com';
}

export function dataCenterFromZohoLocation(location: unknown): ZohoDataCenter | '' {
  const raw = String(location || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw === 'au') return 'com.au';
  if (raw === 'us') return 'com';
  if (raw in ZOHO_DC_CONFIG) return raw as ZohoDataCenter;
  return '';
}

export function getZohoDcConfig(dataCenter?: unknown) {
  return ZOHO_DC_CONFIG[normalizeZohoDataCenter(dataCenter)];
}

export function getZohoOAuthConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function getZohoOAuthRedirectUri(frontendUrl: string): string {
  const fromEnv = process.env.ZOHO_OAUTH_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;
  return `${frontendUrl.replace(/\/$/, '')}/integrations/zoho/callback`;
}

export function buildZohoOAuthAuthorizeUrl(input: {
  dataCenter?: unknown;
  state: string;
  redirectUri: string;
}): string | null {
  const config = getZohoOAuthConfig();
  if (!config || !input.redirectUri) return null;
  const dc = getZohoDcConfig(input.dataCenter);
  const params = new URLSearchParams({
    scope: ZOHO_MAIL_SCOPES.join(','),
    client_id: config.clientId,
    response_type: 'code',
    access_type: 'offline',
    redirect_uri: input.redirectUri,
    prompt: 'consent',
    state: input.state,
  });
  return `https://${dc.accountsHost}/oauth/v2/auth?${params.toString()}`;
}

export async function exchangeZohoAuthCode(input: {
  code: string;
  dataCenter?: unknown;
  accountsServer?: string;
  redirectUri: string;
}) {
  const config = getZohoOAuthConfig();
  if (!config) {
    throw Object.assign(new Error('Zoho OAuth is not configured.'), { statusCode: 503 });
  }
  const server = String(input.accountsServer || '').trim();
  const tokenUrl = server
    ? `${server.replace(/\/$/, '')}/oauth/v2/token`
    : `https://${getZohoDcConfig(input.dataCenter).accountsHost}/oauth/v2/token`;

  const body = new URLSearchParams({
    code: String(input.code),
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: input.redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || !data.access_token) {
    const msg =
      typeof data.error_description === 'string'
        ? data.error_description
        : typeof data.error === 'string'
          ? data.error
          : 'Zoho token exchange failed';
    throw Object.assign(new Error(msg), { statusCode: 400 });
  }
  return {
    ...data,
    dataCenter: normalizeZohoDataCenter(input.dataCenter),
  } as Record<string, unknown> & { dataCenter: ZohoDataCenter };
}

export async function refreshZohoAccessToken(
  refreshToken: string,
  dataCenter?: unknown
) {
  const config = getZohoOAuthConfig();
  if (!config) {
    throw Object.assign(new Error('Zoho OAuth is not configured.'), { statusCode: 503 });
  }
  const dc = getZohoDcConfig(dataCenter);
  const body = new URLSearchParams({
    refresh_token: String(refreshToken),
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  });
  const res = await fetch(`https://${dc.accountsHost}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok || !data.access_token) {
    throw Object.assign(new Error('Zoho refresh failed'), { statusCode: 400 });
  }
  return data;
}
