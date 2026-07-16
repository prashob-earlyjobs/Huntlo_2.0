/**
 * Gmail OAuth helpers — ported from EJHunterLanding googleGmailOAuth.js
 * Exact Google token/userinfo endpoints and postmessage redirect_uri.
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
/** @react-oauth/google auth-code popup uses this redirect_uri */
const AUTH_CODE_REDIRECT_URI = 'postmessage';

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
];

export function getGoogleOAuthConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export async function exchangeGmailAuthCode(code: string) {
  const config = getGoogleOAuthConfig();
  if (!config) {
    throw Object.assign(
      new Error(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
      ),
      { statusCode: 503 }
    );
  }
  const body = new URLSearchParams({
    code: String(code),
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: AUTH_CODE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
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
          : 'Token exchange failed';
    throw Object.assign(new Error(msg), { statusCode: 400 });
  }
  return data;
}

export async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as { email?: string };
  if (!res.ok) throw Object.assign(new Error('Could not load Google account email'), { statusCode: 502 });
  return typeof data.email === 'string' ? data.email.trim() : '';
}

export async function refreshGmailAccessToken(refreshToken: string) {
  const config = getGoogleOAuthConfig();
  if (!config) throw Object.assign(new Error('Google OAuth is not configured.'), { statusCode: 503 });
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: String(refreshToken),
    grant_type: 'refresh_token',
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
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
          : 'Refresh failed';
    throw Object.assign(new Error(msg), { statusCode: 400 });
  }
  return data;
}
