import { getEnv, isTest } from '../../config/env.js';
import type { BrightDataConfig } from './brightData.types.js';

export function getBrightDataConfig(): BrightDataConfig {
  const env = getEnv();
  return {
    baseUrl: env.BRIGHTDATA_API_BASE_URL.replace(/\/$/, ''),
    apiKey: (env.BRIGHTDATA_API_KEY || '').trim(),
    linkedinDatasetId: (env.BRIGHTDATA_LINKEDIN_DATASET_ID || '').trim(),
    contactDatasetId: (env.BRIGHTDATA_CONTACT_DATASET_ID || '').trim(),
    timeoutMs: env.BRIGHTDATA_TIMEOUT_MS,
    maxResults: env.BRIGHTDATA_MAX_RESULTS,
    useMock: shouldUseBrightDataMock(),
  };
}

/**
 * Mock when explicitly enabled, in test, or when required config
 * (API key / dataset id) is missing outside production.
 */
export function shouldUseBrightDataMock(): boolean {
  const env = getEnv();
  if (typeof env.BRIGHTDATA_USE_MOCK === 'boolean') {
    return env.BRIGHTDATA_USE_MOCK;
  }
  if (isTest()) return true;
  const apiKey = (env.BRIGHTDATA_API_KEY || '').trim();
  const datasetId = (env.BRIGHTDATA_LINKEDIN_DATASET_ID || '').trim();
  if (!apiKey || !datasetId) return true;
  return false;
}

/** Threshold used to decide whether Future Jobs results need a Bright Data top-up. */
export function getBrightDataCandidateThreshold(): number {
  return getEnv().BRIGHTDATA_CANDIDATE_THRESHOLD;
}
