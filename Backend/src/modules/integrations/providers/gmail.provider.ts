import {
  exchangeGmailAuthCode,
  fetchGoogleEmail,
  getGoogleOAuthConfig,
  GMAIL_SCOPES,
  refreshGmailAccessToken,
} from '../../../providers/gmail/gmail.oauth.js';
import type { EmailProvider } from './types.js';

function tokenExpiry(expiresIn: unknown): Date | null {
  const sec = Number(expiresIn);
  return Number.isFinite(sec) && sec > 0 ? new Date(Date.now() + sec * 1000) : null;
}

export const gmailProvider: EmailProvider = {
  id: 'gmail',

  async connect(_ctx, body) {
    if (!getGoogleOAuthConfig()) {
      throw Object.assign(
        new Error(
          'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
        ),
        { statusCode: 503 }
      );
    }
    const code = String(body.code || '').trim();
    if (!code) {
      return {
        mode: 'credentials_required',
        message: 'Gmail connect requires an OAuth authorization code from Google.',
      };
    }
    const exchanged = await gmailProvider.exchangeCode!({
      code,
      redirectUri: 'postmessage',
    });
    return {
      mode: 'connected',
      message: 'Gmail connected',
      tokens: exchanged,
    };
  },

  async refresh(ctx) {
    if (!ctx.refreshToken) {
      throw Object.assign(new Error('Gmail refresh token missing'), { statusCode: 400 });
    }
    const tokens = await refreshGmailAccessToken(ctx.refreshToken);
    return {
      accessToken: String(tokens.access_token || ''),
      expiresAt: tokenExpiry(tokens.expires_in),
    };
  },

  async test(ctx) {
    if (!ctx.accessToken) return { ok: false, message: 'Gmail is not connected.' };
    try {
      const email = await fetchGoogleEmail(ctx.accessToken);
      return { ok: true, message: email ? `Gmail OK (${email})` : 'Gmail OK' };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Gmail test failed',
      };
    }
  },

  async exchangeCode(input) {
    const tokens = await exchangeGmailAuthCode(input.code);
    const accessToken = String(tokens.access_token || '');
    if (!accessToken) {
      throw Object.assign(new Error('No access token from Google'), { statusCode: 400 });
    }
    const email = await fetchGoogleEmail(accessToken);
    return {
      accessToken,
      refreshToken: typeof tokens.refresh_token === 'string' ? tokens.refresh_token : null,
      expiresAt: tokenExpiry(tokens.expires_in),
      email,
      displayName: email,
      providerAccountId: email,
      scopes: [...GMAIL_SCOPES],
      config: {},
    };
  },
};
