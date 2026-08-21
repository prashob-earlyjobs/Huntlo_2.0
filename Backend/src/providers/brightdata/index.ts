import { getEnv } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { FutureJobsProvider } from '../future-jobs/futureJobs.types.js';
import {
  catalogFromMetadataFields,
  MOCK_BRIGHTDATA_METADATA_FIELDS,
  type BrightDataFilterField,
} from './brightdata.catalog.js';
import { createLiveBrightDataSearchProvider, fetchBrightDataDatasetMetadata } from './brightdata.client.js';
import { BRIGHTDATA_PEOPLE_DATASET_ID } from './brightdata.constants.js';
import { createMockBrightDataSearchProvider } from './brightdata.mock.js';

export function shouldUseBrightDataMock(): boolean {
  try {
    const env = getEnv();
    return env.BRIGHTDATA_USE_MOCK === true || env.APP_ENV === 'test';
  } catch {
    return false;
  }
}

export function assertBrightDataConfigured(): void {
  if (shouldUseBrightDataMock()) return;
  const key = getEnv().BRIGHTDATA_API_KEY.trim();
  if (!key) {
    throw new AppError(
      503,
      'BRIGHTDATA_NOT_CONFIGURED',
      'Bright Data API key is not configured.'
    );
  }
}

export function getBrightDataSearchProvider(): FutureJobsProvider {
  if (shouldUseBrightDataMock()) {
    return createMockBrightDataSearchProvider();
  }
  assertBrightDataConfigured();
  return createLiveBrightDataSearchProvider();
}

export { createLiveBrightDataSearchProvider } from './brightdata.client.js';
export { createMockBrightDataSearchProvider } from './brightdata.mock.js';
export { mapBrightDataRecordToFjDoc, buildBrightDataSearchFilter } from './brightdata.mapper.js';
export { BRIGHTDATA_PEOPLE_DATASET_ID } from './brightdata.constants.js';
export type { BrightDataFilterField } from './brightdata.catalog.js';

const METADATA_TTL_MS = 15 * 60 * 1000;
let cachedCatalog: { at: number; fields: BrightDataFilterField[] } | null = null;

export async function getBrightDataFilterCatalog(): Promise<BrightDataFilterField[]> {
  assertBrightDataConfigured();
  if (cachedCatalog && Date.now() - cachedCatalog.at < METADATA_TTL_MS) {
    return cachedCatalog.fields;
  }
  const rawFields = shouldUseBrightDataMock()
    ? MOCK_BRIGHTDATA_METADATA_FIELDS
    : asRecordFields(await fetchBrightDataDatasetMetadata());
  const fields = catalogFromMetadataFields(rawFields);
  cachedCatalog = { at: Date.now(), fields };
  return fields;
}

function asRecordFields(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'fields' in payload) {
    return (payload as { fields?: unknown }).fields;
  }
  return payload;
}
