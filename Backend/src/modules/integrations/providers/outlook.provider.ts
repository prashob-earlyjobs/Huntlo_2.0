import { getEnv } from '../../../config/env.js';
import {
  buildOutlookOAuthAuthorizeUrl,
  exchangeOutlookAuthCode,
  fetchMicrosoftProfile,
  getOutlookOAuthConfig,
  getOutlookOAuthRedirectUri,
  OUTLOOK_MAIL_SCOPES,
  refreshOutlookAccessToken,
} from '../../../providers/outlook/outlook.oauth.js';
import type { EmailProvider } from './types.js';

function tokenExpiry(expiresIn: unknown): Date | null {
  const sec = Number(expiresIn);
  return Number.isFinite(sec) && sec > 0 ? new Date(Date.now() + sec * 1000) : null;
}

export const outlookProvider: EmailProvider = {
  id: 'outlook',

  async connect(_ctx, body) {
    if (!getOutlookOAuthConfig()) {
      throw Object.assign(
        new Error(
          'Microsoft OAuth is not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.'
        ),
        { statusCode: 503 }
      );
    }
    // Direct code exchange (frontend popup/callback posts code)
    const code = String(body.code || '').trim();
    if (code) {
      const redirectUri =
        String(body.redirectUri || '').trim() ||
        getOutlookOAuthRedirectUri(getEnv().FRONTEND_URL);
      const exchanged = await outlookProvider.exchangeCode!({
        code,
        redirectUri,
        codeVerifier: typeof body.codeVerifier === 'string' ? body.codeVerifier : undefined,
      });
      return { mode: 'connected', message: 'Outlook connected', tokens: exchanged };
    }
    // Service layer starts OAuth redirect when no code
    return {
      mode: 'credentials_required',
      message: 'Outlook OAuth redirect will be started by the integrations service.',
    };
  },

  buildAuthorizeUrl(input) {
    if (!getOutlookOAuthConfig()) return null;
    return buildOutlookOAuthAuthorizeUrl(input);
  },

  async exchangeCode(input) {
    const tokens = await exchangeOutlookAuthCode({
      code: input.code,
      redirectUri: input.redirectUri,
      codeVerifier: input.codeVerifier,
      tenantId:
        typeof input.extras?.tenantId === 'string' ? input.extras.tenantId : undefined,
    });
    const accessToken = String(tokens.access_token || '');
    if (!accessToken) {
      throw Object.assign(new Error('No access token from Microsoft'), { statusCode: 400 });
    }
    const profile = await fetchMicrosoftProfile(accessToken);
    return {
      accessToken,
      refreshToken: typeof tokens.refresh_token === 'string' ? tokens.refresh_token : null,
      expiresAt: tokenExpiry(tokens.expires_in),
      email: profile.email,
      displayName: profile.displayName || profile.email,
      providerAccountId: profile.id || profile.email,
      scopes: [...OUTLOOK_MAIL_SCOPES],
      config: {
        outlookTenantId: process.env.MICROSOFT_TENANT_ID || 'common',
        outlookUserId: profile.id,
      },
    };
  },

  async refresh(ctx) {
    if (!ctx.refreshToken) {
      throw Object.assign(new Error('Outlook refresh token missing'), { statusCode: 400 });
    }
    const tenantId =
      typeof ctx.config?.outlookTenantId === 'string'
        ? ctx.config.outlookTenantId
        : undefined;
    const tokens = await refreshOutlookAccessToken(ctx.refreshToken, tenantId);
    return {
      accessToken: String(tokens.access_token || ''),
      expiresAt: tokenExpiry(tokens.expires_in),
    };
  },

  async test(ctx) {
    if (!ctx.accessToken) return { ok: false, message: 'Outlook is not connected.' };
    try {
      const profile = await fetchMicrosoftProfile(ctx.accessToken);
      return {
        ok: true,
        message: profile.email ? `Outlook OK (${profile.email})` : 'Outlook OK',
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Outlook test failed',
      };
    }
  },
};
