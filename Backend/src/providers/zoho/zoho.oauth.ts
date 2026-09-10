/**
 * Zoho Mail DC + OAuth config — ported from EJHunterLanding zohoMailConfig.js
 */

export const ZOHO_MAIL_SCOPES = [
  'ZohoMail.messages.CREATE',
  'ZohoMail.messages.READ',
  'ZohoMail.accounts.READ',
  'ZohoMail.folders.READ',
] as const;

/**
 * Recruit OAuth scopes.
 * Prefer group operation scopes (not *.ALL) — India / some client types reject
 * ZohoRecruit.org.ALL and ZohoRecruit.modules.ALL with "Invalid scope(s)".
 * modules.READ|CREATE|UPDATE covers list + Candidate_Status + notes.
 * @see https://www.zoho.com/recruit/developer-guide/apiv2/oauth-overview.html
 */
export const ZOHO_RECRUIT_SCOPES = [
  'ZohoRecruit.org.READ',
  'ZohoRecruit.modules.READ',
  'ZohoRecruit.modules.CREATE',
  'ZohoRecruit.modules.UPDATE',
] as const;

export type ZohoDataCenter = 'com' | 'eu' | 'in' | 'com.au' | 'jp' | 'ca' | 'sa';

export const ZOHO_DC_CONFIG: Record<
  ZohoDataCenter,
  {
    accountsHost: string;
    mailApiHost: string;
    recruitApiHost: string;
    smtpHost: string;
    imapHost: string;
  }
> = {
  com: {
    accountsHost: 'accounts.zoho.com',
    mailApiHost: 'mail.zoho.com',
    recruitApiHost: 'recruit.zoho.com',
    smtpHost: 'smtp.zoho.com',
    imapHost: 'imap.zoho.com',
  },
  eu: {
    accountsHost: 'accounts.zoho.eu',
    mailApiHost: 'mail.zoho.eu',
    recruitApiHost: 'recruit.zoho.eu',
    smtpHost: 'smtp.zoho.eu',
    imapHost: 'imap.zoho.eu',
  },
  in: {
    accountsHost: 'accounts.zoho.in',
    mailApiHost: 'mail.zoho.in',
    recruitApiHost: 'recruit.zoho.in',
    smtpHost: 'smtp.zoho.in',
    imapHost: 'imap.zoho.in',
  },
  'com.au': {
    accountsHost: 'accounts.zoho.com.au',
    mailApiHost: 'mail.zoho.com.au',
    recruitApiHost: 'recruit.zoho.com.au',
    smtpHost: 'smtp.zoho.com.au',
    imapHost: 'imap.zoho.com.au',
  },
  jp: {
    accountsHost: 'accounts.zoho.jp',
    mailApiHost: 'mail.zoho.jp',
    recruitApiHost: 'recruit.zoho.jp',
    smtpHost: 'smtp.zoho.jp',
    imapHost: 'imap.zoho.jp',
  },
  ca: {
    accountsHost: 'accounts.zohocloud.ca',
    mailApiHost: 'mail.zohocloud.ca',
    recruitApiHost: 'recruit.zohocloud.ca',
    smtpHost: 'smtp.zohocloud.ca',
    imapHost: 'imap.zohocloud.ca',
  },
  sa: {
    accountsHost: 'accounts.zoho.sa',
    mailApiHost: 'mail.zoho.sa',
    recruitApiHost: 'recruit.zoho.sa',
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

/** Infer DC from OAuth `accounts-server` (e.g. https://accounts.zoho.in). */
export function dataCenterFromAccountsServer(accountsServer: unknown): ZohoDataCenter | '' {
  const raw = String(accountsServer || '').trim();
  if (!raw) return '';
  try {
    const host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.toLowerCase();
    if (host === 'accounts.zoho.in' || host.endsWith('.zoho.in')) return 'in';
    if (host === 'accounts.zoho.eu' || host.endsWith('.zoho.eu')) return 'eu';
    if (host === 'accounts.zoho.com.au' || host.endsWith('.zoho.com.au')) return 'com.au';
    if (host === 'accounts.zoho.jp' || host.endsWith('.zoho.jp')) return 'jp';
    if (host.includes('zohocloud.ca')) return 'ca';
    if (host === 'accounts.zoho.sa' || host.endsWith('.zoho.sa')) return 'sa';
    if (host === 'accounts.zoho.com' || host.endsWith('.zoho.com')) return 'com';
  } catch {
    return '';
  }
  return '';
}

/** Infer DC from token `api_domain` (e.g. https://www.zohoapis.in). */
export function dataCenterFromApiDomain(apiDomain: unknown): ZohoDataCenter | '' {
  const raw = String(apiDomain || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.includes('zohoapis.in') || raw.includes('recruit.zoho.in')) return 'in';
  if (raw.includes('zohoapis.eu') || raw.includes('recruit.zoho.eu')) return 'eu';
  if (raw.includes('zohoapis.com.au') || raw.includes('recruit.zoho.com.au')) return 'com.au';
  if (raw.includes('zohoapis.jp') || raw.includes('recruit.zoho.jp')) return 'jp';
  if (raw.includes('zohocloud.ca')) return 'ca';
  if (raw.includes('zohoapis.sa') || raw.includes('recruit.zoho.sa')) return 'sa';
  if (raw.includes('zohoapis.com') || raw.includes('recruit.zoho.com')) return 'com';
  return '';
}

/**
 * Resolve Zoho DC from callback hints + token response.
 * Prefer location / accounts-server / api_domain over a bare dataCenter hint
 * (callers often default the hint to US `com`).
 */
export function resolveZohoDataCenter(input: {
  location?: unknown;
  accountsServer?: unknown;
  dataCenter?: unknown;
  apiDomain?: unknown;
}): ZohoDataCenter {
  return (
    dataCenterFromZohoLocation(input.location) ||
    dataCenterFromAccountsServer(input.accountsServer) ||
    dataCenterFromApiDomain(input.apiDomain) ||
    (typeof input.dataCenter === 'string' && input.dataCenter.trim()
      ? normalizeZohoDataCenter(input.dataCenter)
      : '') ||
    'com'
  );
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

export function getZohoRecruitOAuthRedirectUri(frontendUrl: string): string {
  const fromEnv = process.env.ZOHO_RECRUIT_OAUTH_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;
  return `${frontendUrl.replace(/\/$/, '')}/integrations/zoho-recruit/callback`;
}

export function buildZohoOAuthAuthorizeUrl(input: {
  dataCenter?: unknown;
  state: string;
  redirectUri: string;
  scopes?: readonly string[];
}): string | null {
  const config = getZohoOAuthConfig();
  if (!config || !input.redirectUri) return null;
  const dc = getZohoDcConfig(input.dataCenter);
  const scopes = input.scopes?.length ? input.scopes : ZOHO_MAIL_SCOPES;
  const params = new URLSearchParams({
    scope: scopes.join(','),
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
  const dataCenter = resolveZohoDataCenter({
    dataCenter: input.dataCenter,
    accountsServer: input.accountsServer,
    apiDomain: data.api_domain,
  });
  return {
    ...data,
    dataCenter,
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
