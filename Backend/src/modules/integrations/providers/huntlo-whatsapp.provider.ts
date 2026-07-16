import {
  getHuntloWhatsAppCredentials,
  isHuntloWhatsAppConfigured,
  verifyMetaWhatsAppCredentials,
} from '../../../providers/meta-whatsapp/meta.config.js';
import type { WhatsAppProvider } from './types.js';

export const huntloWhatsAppProvider: WhatsAppProvider = {
  id: 'huntlo-whatsapp',

  async connect() {
    const creds = getHuntloWhatsAppCredentials();
    if (!creds || !isHuntloWhatsAppConfigured()) {
      throw Object.assign(
        new Error(
          'Huntlo WhatsApp is not available. Contact support or connect your own Meta account.'
        ),
        { statusCode: 503 }
      );
    }
    const verified = await verifyMetaWhatsAppCredentials({
      phoneNumberId: creds.phoneNumberId,
      accessToken: creds.accessToken,
      wabaId: creds.wabaId,
    });
    return {
      mode: 'connected',
      message: 'Huntlo WhatsApp connected',
      tokens: {
        // Platform-managed — do not store server token on user integration
        accessToken: null,
        refreshToken: null,
        email: verified.phoneNumber.displayPhoneNumber || null,
        phone: verified.phoneNumber.displayPhoneNumber || null,
        displayName: verified.phoneNumber.verifiedName || 'Huntlo WhatsApp',
        providerAccountId: verified.phoneNumber.id,
        scopes: ['whatsapp', 'whatsapp_business_messaging'],
        config: {
          whatsappMode: 'huntlo',
          whatsappProvider: 'meta',
          metaPhoneNumberId: verified.phoneNumber.id,
          metaWabaId: creds.wabaId || '',
        },
      },
    };
  },

  async test() {
    const creds = getHuntloWhatsAppCredentials();
    if (!creds) {
      return { ok: false, message: 'Huntlo WhatsApp is not configured on the server.' };
    }
    try {
      const verified = await verifyMetaWhatsAppCredentials({
        phoneNumberId: creds.phoneNumberId,
        accessToken: creds.accessToken,
        wabaId: creds.wabaId,
      });
      return { ok: true, message: verified.message };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Huntlo WhatsApp test failed',
      };
    }
  },
};
