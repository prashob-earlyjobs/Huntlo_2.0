import { getFutureJobsConfig, shouldUseFutureJobsMock } from '../../../providers/future-jobs/futureJobs.auth.js';
import type { CandidateDataProvider } from './types.js';

export const futureJobsProvider: CandidateDataProvider = {
  id: 'future-jobs',

  async connect() {
    const config = getFutureJobsConfig();
    const usingMock = shouldUseFutureJobsMock();
    if (!usingMock && !config.apiKey) {
      throw Object.assign(
        new Error('Future Jobs API key is not configured. Set FUTURE_JOBS_API_KEY.'),
        { statusCode: 503 }
      );
    }
    return {
      mode: 'connected',
      message: usingMock
        ? 'Future Jobs connected (mock mode)'
        : 'Future Jobs connected',
      tokens: {
        accessToken: null,
        refreshToken: null,
        displayName: 'Future Jobs',
        providerAccountId: 'future-jobs',
        scopes: ['candidate_data'],
        config: {
          platformManaged: true,
          apiUrl: config.baseUrl,
          authStyle: config.authStyle,
          mock: usingMock,
        },
      },
    };
  },

  async test() {
    const config = getFutureJobsConfig();
    const usingMock = shouldUseFutureJobsMock();
    if (usingMock) {
      return { ok: true, message: 'Future Jobs mock provider is ready.' };
    }
    if (!config.apiKey) {
      return { ok: false, message: 'Future Jobs API key is not configured.' };
    }
    return {
      ok: true,
      message: `Future Jobs configured (${config.authStyle}) at ${config.baseUrl}.`,
    };
  },
};
