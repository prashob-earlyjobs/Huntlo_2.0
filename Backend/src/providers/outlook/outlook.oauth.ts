/**
 * Outlook / Microsoft Graph OAuth — ported from EJHunterLanding outlookMailConfig/OAuth.
 */

export const OUTLOOK_MAIL_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'User.Read',
  'Mail.Send',
  'Mail.Read',
];

export function getOutlookOAuthConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = String(process.env.MICROSOFT_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.MICROSOFT_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function getOutlookTenantId(): string {
  return String(process.env.MICROSOFT_TENANT_ID || 'common').trim() || 'common';
}

export function getOutlookOAuthRedirectUri(frontendUrl: string): string {
  const explicit = String(process.env.MICROSOFT_OAUTH_REDIRECT_URI || '').trim();
  if (explicit) return explicit;
  const frontend = frontendUrl.replace(/\/$/, '');
  return `${frontend}/integrations/outlook/callback`;
}

export function getOutlookOAuthEndpoints(tenantId?: string) {
  const tenant = String(tenantId || getOutlookTenantId()).trim() || 'common';
  const base = `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0`;
  return {
    authorizeUrl: `${base}/authorize`,
    tokenUrl: `${base}/token`,
    tenant,
  };
}

export function buildOutlookOAuthAuthorizeUrl(input: {
  state: string;
  redirectUri: string;
  codeChallenge?: string;
}): string {
  const config = getOutlookOAuthConfig();
  if (!config) return '';
  const { authorizeUrl } = getOutlookOAuthEndpoints();
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: input.redirectUri,
    response_mode: 'query',
    scope: OUTLOOK_MAIL_SCOPES.join(' '),
    prompt: 'consent',
    state: input.state,
  });
  if (input.codeChallenge) {
    params.set('code_challenge', input.codeChallenge);
    params.set('code_challenge_method', 'S256');
  }
  return `${authorizeUrl}?${params.toString()}`;
}

export async function exchangeOutlookAuthCode(input: {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
  tenantId?: string;
}) {
  const config = getOutlookOAuthConfig();
  if (!config) {
    throw Object.assign(new Error('Microsoft OAuth is not configured.'), { statusCode: 503 });
  }
  const { tokenUrl } = getOutlookOAuthEndpoints(input.tenantId);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: input.code,
    redirect_uri: input.redirectUri,
    grant_type: 'authorization_code',
  });
  if (input.codeVerifier) body.set('code_verifier', input.codeVerifier);
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      typeof data.error_description === 'string'
        ? data.error_description
        : typeof data.error === 'string'
          ? data.error
          : 'Outlook token exchange failed';
    throw Object.assign(new Error(msg), { statusCode: 400 });
  }
  return data;
}

export async function fetchMicrosoftProfile(accessToken: string) {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as {
    id?: string;
    displayName?: string;
    mail?: string;
    userPrincipalName?: string;
  };
  if (!res.ok) {
    throw Object.assign(new Error('Could not load Microsoft profile'), { statusCode: 502 });
  }
  return {
    id: String(data.id || '').trim(),
    displayName: String(data.displayName || '').trim(),
    email: String(data.mail || data.userPrincipalName || '').trim(),
  };
}

export async function refreshOutlookAccessToken(refreshToken: string, tenantId?: string) {
  const config = getOutlookOAuthConfig();
  if (!config) throw Object.assign(new Error('Microsoft OAuth is not configured.'), { statusCode: 503 });
  const { tokenUrl } = getOutlookOAuthEndpoints(tenantId);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw Object.assign(new Error('Outlook refresh failed'), { statusCode: 400 });
  }
  return data;
}
