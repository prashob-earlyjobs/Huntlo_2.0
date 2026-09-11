import { getEnv } from '../../../config/env.js';
import { verifySmtpCredentials } from '../../../providers/smtp/smtp.js';
import {
  buildZohoOAuthAuthorizeUrl,
  exchangeZohoAuthCode,
  fetchZohoUserEmail,
  getZohoDcConfig,
  getZohoOAuthConfig,
  getZohoOAuthRedirectUri,
  normalizeZohoDataCenter,
  refreshZohoAccessToken,
  ZOHO_MAIL_SCOPES,
} from '../../../providers/zoho/zoho.oauth.js';
import { resolveZohoAccountId } from '../../../providers/zoho/zoho.fetch.js';
import type { EmailProvider } from './types.js';

function tokenExpiry(expiresIn: unknown): Date | null {
  const sec = Number(expiresIn);
  return Number.isFinite(sec) && sec > 0 ? new Date(Date.now() + sec * 1000) : null;
}

export const zohoMailProvider: EmailProvider = {
  id: 'zoho-mail',

  async connect(_ctx, body) {
    const mode = String(body.mode || body.zohoAuthMode || 'oauth').toLowerCase();

    if (mode === 'smtp') {
      const dataCenter = normalizeZohoDataCenter(body.dataCenter || body.zohoDataCenter);
      const dc = getZohoDcConfig(dataCenter);
      const config = await verifySmtpCredentials({
        ...body,
        smtpHost: body.smtpHost || dc.smtpHost,
      });
      return {
        mode: 'connected',
        message: 'Zoho Mail connected via SMTP',
        tokens: {
          accessToken: config.username,
          refreshToken: config.password,
          email: config.fromEmail,
          displayName: config.senderName || config.fromEmail,
          providerAccountId: config.fromEmail,
          scopes: ['smtp'],
          config: {
            zohoAuthMode: 'smtp',
            zohoDataCenter: dataCenter,
            smtpHost: config.smtpHost,
            smtpPort: config.smtpPort,
            smtpSecurity: config.security,
            imapHost: String(body.imapHost || dc.imapHost || '').trim() || dc.imapHost,
            imapPort: Number(body.imapPort) || 993,
          },
          credentials: {
            username: config.username,
          },
        },
      };
    }

    const code = String(body.code || '').trim();
    if (code) {
      const redirectUri =
        String(body.redirectUri || '').trim() ||
        getZohoOAuthRedirectUri(getEnv().FRONTEND_URL);
      const exchanged = await zohoMailProvider.exchangeCode!({
        code,
        redirectUri,
        extras: {
          dataCenter: body.dataCenter || body.zohoDataCenter,
          accountsServer: body.accountsServer,
          location: body.location,
        },
      });
      return { mode: 'connected', message: 'Zoho Mail connected', tokens: exchanged };
    }

    if (!getZohoOAuthConfig()) {
      throw Object.assign(
        new Error('Zoho OAuth is not configured. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET.'),
        { statusCode: 503 }
      );
    }
    return {
      mode: 'credentials_required',
      message: 'Zoho OAuth redirect will be started by the integrations service.',
    };
  },

  buildAuthorizeUrl(input) {
    return buildZohoOAuthAuthorizeUrl({
      state: input.state,
      redirectUri: input.redirectUri,
      dataCenter: undefined,
    });
  },

  async exchangeCode(input) {
    const tokens = await exchangeZohoAuthCode({
      code: input.code,
      redirectUri: input.redirectUri,
      dataCenter: input.extras?.dataCenter,
      accountsServer:
        typeof input.extras?.accountsServer === 'string'
          ? input.extras.accountsServer
          : undefined,
      location: input.extras?.location,
    });
    const accessToken = String(tokens.access_token || '');
    let email: string | null = null;
    let accountId: string | null = null;
    let dataCenter = tokens.dataCenter;

    try {
      const resolved = await resolveZohoAccountId(accessToken, tokens.dataCenter);
      email = resolved.email;
      accountId = resolved.accountId || null;
      dataCenter = resolved.dataCenter || dataCenter;
    } catch {
      // Fall through to userinfo.
    }

    if (!email || !email.includes('@')) {
      email = await fetchZohoUserEmail(accessToken, dataCenter);
    }

    return {
      accessToken,
      refreshToken: typeof tokens.refresh_token === 'string' ? tokens.refresh_token : null,
      expiresAt: tokenExpiry(tokens.expires_in),
      email,
      displayName: email,
      providerAccountId: accountId,
      scopes: [...ZOHO_MAIL_SCOPES],
      config: {
        zohoAuthMode: 'oauth',
        zohoDataCenter: dataCenter,
        apiDomain: tokens.api_domain ?? null,
        zohoAccountId: accountId,
      },
    };
  },

  async refresh(ctx) {
    if (!ctx.refreshToken) {
      throw Object.assign(new Error('Zoho refresh token missing'), { statusCode: 400 });
    }
    const dataCenter =
      typeof ctx.config?.zohoDataCenter === 'string' ? ctx.config.zohoDataCenter : undefined;
    const tokens = await refreshZohoAccessToken(ctx.refreshToken, dataCenter);
    return {
      accessToken: String(tokens.access_token || ''),
      expiresAt: tokenExpiry(tokens.expires_in),
    };
  },

  async test(ctx) {
    if (!ctx.accessToken && !ctx.refreshToken) {
      return { ok: false, message: 'Zoho Mail is not connected.' };
    }
    const mode = ctx.config?.zohoAuthMode;
    if (mode === 'smtp') {
      try {
        await verifySmtpCredentials({
          email: ctx.email || '',
          username: ctx.accessToken || '',
          password: ctx.refreshToken || '',
          smtpHost: ctx.config?.smtpHost,
          smtpPort: ctx.config?.smtpPort,
          security: ctx.config?.smtpSecurity,
        });
        return {
          ok: true,
          message: 'Zoho SMTP OK',
          details: ctx.email ? { email: ctx.email } : undefined,
        };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : 'Zoho SMTP test failed',
        };
      }
    }

    if (!ctx.accessToken) {
      return { ok: false, message: 'Zoho OAuth token missing' };
    }

    const dataCenter =
      typeof ctx.config?.zohoDataCenter === 'string'
        ? ctx.config.zohoDataCenter
        : undefined;

    try {
      const resolved = await resolveZohoAccountId(
        ctx.accessToken,
        dataCenter,
        ctx.email
      );
      let email = resolved.email || ctx.email || null;
      if (!email || !email.includes('@')) {
        email = await fetchZohoUserEmail(ctx.accessToken, resolved.dataCenter);
      }
      return {
        ok: true,
        message: email ? `Zoho Mail OK (${email})` : 'Zoho Mail OK',
        details: {
          ...(email ? { email } : {}),
          ...(resolved.accountId ? { accountId: resolved.accountId } : {}),
          ...(resolved.dataCenter ? { dataCenter: resolved.dataCenter } : {}),
        },
      };
    } catch (error) {
      const email = await fetchZohoUserEmail(ctx.accessToken, dataCenter);
      if (email) {
        return {
          ok: true,
          message: `Zoho Mail OK (${email})`,
          details: { email },
        };
      }
      return {
        ok: Boolean(ctx.accessToken),
        message:
          error instanceof Error
            ? error.message
            : ctx.accessToken
              ? 'Zoho OAuth tokens present'
              : 'Zoho OAuth token missing',
        details: ctx.email ? { email: ctx.email } : undefined,
      };
    }
  },
};
