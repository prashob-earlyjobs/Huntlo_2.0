import { verifySmtpCredentials } from '../../../providers/smtp/smtp.js';
import type { EmailProvider } from './types.js';

export const smtpProvider: EmailProvider = {
  id: 'smtp',

  async connect(_ctx, body) {
    const config = await verifySmtpCredentials(body);
    return {
      mode: 'connected',
      message: 'SMTP connected',
      tokens: {
        accessToken: config.username,
        refreshToken: config.password,
        email: config.fromEmail,
        displayName: config.senderName || config.fromEmail,
        providerAccountId: config.fromEmail,
        scopes: ['smtp'],
        config: {
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpSecurity: config.security,
        },
        credentials: {
          username: config.username,
        },
      },
    };
  },

  async test(ctx) {
    if (!ctx.refreshToken || !ctx.email) {
      return { ok: false, message: 'SMTP is not connected.' };
    }
    try {
      await verifySmtpCredentials({
        email: ctx.email,
        username: ctx.accessToken || ctx.email,
        password: ctx.refreshToken,
        smtpHost: ctx.config?.smtpHost,
        smtpPort: ctx.config?.smtpPort,
        security: ctx.config?.smtpSecurity,
      });
      return { ok: true, message: `SMTP OK (${ctx.email})` };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'SMTP test failed',
      };
    }
  },
};
