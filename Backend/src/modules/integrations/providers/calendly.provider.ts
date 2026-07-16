import {
  fetchCalendlyEventTypes,
  fetchCalendlyUser,
} from '../../../providers/calendly/calendly.client.js';
import type { SchedulingProvider } from './types.js';

export const calendlyProvider: SchedulingProvider = {
  id: 'calendly',

  async connect(_ctx, body) {
    const personalAccessToken = String(body.personalAccessToken || body.token || '').trim();
    const user = await fetchCalendlyUser(personalAccessToken);
    return {
      mode: 'connected',
      message: 'Calendly connected',
      tokens: {
        // EJ stored schedulingUrl in accessToken and PAT in refreshToken
        accessToken: user.schedulingUrl,
        refreshToken: personalAccessToken,
        email: user.email,
        displayName: user.name || user.slug || user.email,
        providerAccountId: user.uri || user.email,
        scopes: ['calendly'],
        config: {
          schedulingUrl: user.schedulingUrl,
          userUri: user.uri,
          slug: user.slug,
        },
      },
    };
  },

  async test(ctx) {
    if (!ctx.refreshToken) return { ok: false, message: 'Calendly is not connected.' };
    try {
      const user = await fetchCalendlyUser(ctx.refreshToken);
      return {
        ok: true,
        message: user.email
          ? `Connected as ${user.name || user.email} (${user.email}).`
          : `Connected as ${user.name || 'Calendly user'}.`,
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Calendly test failed',
      };
    }
  },

  async listEventTypes(ctx) {
    if (!ctx.refreshToken) return [];
    return fetchCalendlyEventTypes(
      ctx.refreshToken,
      typeof ctx.config?.userUri === 'string' ? ctx.config.userUri : undefined
    );
  },
};
