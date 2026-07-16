import {
  getGupshupWhatsAppCredentials,
  isGupshupWhatsAppConfigured,
  verifyGupshupWhatsAppCredentials,
} from '../../../providers/gupshup/gupshup.config.js';
import type { WhatsAppProvider } from './types.js';

export const gupshupProvider: WhatsAppProvider = {
  id: 'gupshup',

  async connect() {
    if (!isGupshupWhatsAppConfigured()) {
      throw Object.assign(
        new Error(
          'Gupshup WhatsApp is not available. Ask an admin to configure Gupshup on the server.'
        ),
        { statusCode: 503 }
      );
    }
    const creds = getGupshupWhatsAppCredentials();
    return {
      mode: 'connected',
      message: 'Gupshup WhatsApp connected',
      tokens: {
        accessToken: null,
        refreshToken: null,
        email: creds?.userid || null,
        displayName: 'Gupshup WhatsApp',
        providerAccountId: creds?.userid || null,
        scopes: ['whatsapp', 'gupshup_messaging'],
        config: {
          whatsappMode: 'huntlo',
          whatsappProvider: 'gupshup',
        },
      },
    };
  },

  async test() {
    try {
      const verified = await verifyGupshupWhatsAppCredentials();
      return { ok: true, message: verified.message };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Gupshup test failed',
      };
    }
  },
};
