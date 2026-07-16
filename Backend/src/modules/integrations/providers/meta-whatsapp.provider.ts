import {
  getMetaWebhookVerifyToken,
  verifyMetaWhatsAppCredentials,
} from '../../../providers/meta-whatsapp/meta.config.js';
import type { WhatsAppProvider } from './types.js';

export const metaWhatsAppProvider: WhatsAppProvider = {
  id: 'meta-whatsapp',

  async connect(_ctx, body) {
    if (!getMetaWebhookVerifyToken()) {
      throw Object.assign(
        new Error(
          'WhatsApp inbound webhooks are not configured (META_WEBHOOK_VERIFY_TOKEN).'
        ),
        { statusCode: 503 }
      );
    }
    const confirmedWebhook = Boolean(
      body.confirmWebhookSetup ?? body.confirmWebhookConfigured
    );
    if (!confirmedWebhook) {
      throw Object.assign(
        new Error(
          "Confirm that you configured the Meta webhook with Huntlo's callback URL and verify token."
        ),
        { statusCode: 400 }
      );
    }

    const verified = await verifyMetaWhatsAppCredentials(body);
    const accessToken = String(body.accessToken || body.metaAccessToken || '').trim();
    const wabaId = String(body.wabaId || body.metaWabaId || '')
      .trim()
      .replace(/\s/g, '');

    return {
      mode: 'connected',
      message: 'Meta WhatsApp connected',
      tokens: {
        accessToken,
        refreshToken: null,
        email: verified.phoneNumber.displayPhoneNumber || null,
        phone: verified.phoneNumber.displayPhoneNumber || null,
        displayName:
          verified.phoneNumber.verifiedName ||
          verified.phoneNumber.displayPhoneNumber ||
          'Meta WhatsApp',
        providerAccountId: verified.phoneNumber.id,
        scopes: ['whatsapp', 'whatsapp_business_messaging'],
        config: {
          whatsappMode: 'own',
          metaPhoneNumberId: verified.phoneNumber.id,
          metaWabaId: wabaId,
        },
      },
    };
  },

  async test(ctx) {
    if (!ctx.accessToken || !ctx.config?.metaPhoneNumberId) {
      return { ok: false, message: 'Meta WhatsApp is not connected.' };
    }
    try {
      const verified = await verifyMetaWhatsAppCredentials({
        phoneNumberId: ctx.config.metaPhoneNumberId,
        accessToken: ctx.accessToken,
        wabaId: ctx.config.metaWabaId,
      });
      return { ok: true, message: verified.message };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Meta WhatsApp test failed',
      };
    }
  },

  verifyWebhook(query) {
    const mode = String(query['hub.mode'] || '');
    const token = String(query['hub.verify_token'] || '');
    const challenge = String(query['hub.challenge'] || '');
    const expected = getMetaWebhookVerifyToken();
    if (mode === 'subscribe' && expected && token === expected) {
      return { ok: true, challenge };
    }
    return { ok: false };
  },
};
