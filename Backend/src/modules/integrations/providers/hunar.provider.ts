import { isHunarConfigured, testHunarConnection } from '../../../providers/hunar/hunar.config.js';
import type { VoiceProvider } from './types.js';

export const hunarProvider: VoiceProvider = {
  id: 'hunar',

  async connect() {
    if (!isHunarConfigured()) {
      throw Object.assign(
        new Error('Hunar voice is not configured. Set HUNAR_VOICE_API_KEY on the server.'),
        { statusCode: 503 }
      );
    }
    const test = await testHunarConnection();
    if (!test.ok) {
      throw Object.assign(new Error(test.message), { statusCode: 400 });
    }
    return {
      mode: 'connected',
      message: 'Huntlo Voice AI connected',
      tokens: {
        accessToken: null,
        refreshToken: null,
        displayName: 'Huntlo Voice AI',
        providerAccountId: 'hunar',
        scopes: ['voice'],
        config: {
          platformManaged: true,
          persona: process.env.HUNAR_VOICE_PERSONA || 'NEHA',
        },
      },
    };
  },

  async test() {
    return testHunarConnection();
  },
};
