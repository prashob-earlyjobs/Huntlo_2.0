import { getBrightDataCandidateThreshold, getBrightDataConfig, shouldUseBrightDataMock } from './brightData.auth.js';
import { createLiveBrightDataProvider } from './brightData.client.js';
import {
  createMockBrightDataProvider,
  resetMockBrightDataState,
  setMockBrightDataMode,
} from './brightData.mock.js';
import {
  mapBrightDataProfileToFjDoc,
  mapBrightDataProfilesToFjDocs,
  detailsFromBrightDataRawDoc,
  resolveBrightDataDisplayFields,
  skillsFromBrightDataProfile,
  summaryFromBrightDataProfile,
  yearsOfExperienceFromBrightDataProfile,
  contactsFromBrightDataProfile,
} from './brightData.mapper.js';
import type { BrightDataProvider } from './brightData.types.js';

export type {
  BrightDataConfig,
  BrightDataContactLookup,
  BrightDataLinkedInProfile,
  BrightDataProvider,
  BrightDataSearchParams,
  BrightDataSnapshotStatus,
} from './brightData.types.js';
export type { MockBrightDataMode } from './brightData.mock.js';

export {
  getBrightDataCandidateThreshold,
  getBrightDataConfig,
  shouldUseBrightDataMock,
  createLiveBrightDataProvider,
  createMockBrightDataProvider,
  resetMockBrightDataState,
  setMockBrightDataMode,
  mapBrightDataProfileToFjDoc,
  mapBrightDataProfilesToFjDocs,
  detailsFromBrightDataRawDoc,
  resolveBrightDataDisplayFields,
  skillsFromBrightDataProfile,
  summaryFromBrightDataProfile,
  yearsOfExperienceFromBrightDataProfile,
  contactsFromBrightDataProfile,
};

/** Factory — mirrors `getFutureJobsProvider()`: mock in tests / missing config, live otherwise. */
export function getBrightDataProvider(): BrightDataProvider {
  if (shouldUseBrightDataMock()) {
    return createMockBrightDataProvider();
  }
  return createLiveBrightDataProvider();
}
