import { getEnv } from './env.js';
import { shouldUseBrightDataMock } from '../providers/bright-data/brightData.auth.js';
import { shouldUseFutureJobsMock } from '../providers/future-jobs/futureJobs.auth.js';

type InfoLogger = {
  info: (obj: Record<string, unknown>, msg: string) => void;
};

/** Startup line so QA can see mock vs live without printing secrets. */
export function logSourcingProviderMode(logger: InfoLogger): void {
  const env = getEnv();
  logger.info(
    {
      appEnv: env.APP_ENV,
      futureJobsMock: shouldUseFutureJobsMock(),
      futureJobsKeyConfigured: Boolean((env.FUTURE_JOBS_API_KEY || '').trim()),
      futureJobsUseMockFlag: env.FUTURE_JOBS_USE_MOCK ?? null,
      brightDataMock: shouldUseBrightDataMock(),
      brightDataKeyConfigured: Boolean((env.BRIGHTDATA_API_KEY || '').trim()),
      brightDataUseMockFlag: env.BRIGHTDATA_USE_MOCK ?? null,
    },
    'sourcing provider mode'
  );
}
