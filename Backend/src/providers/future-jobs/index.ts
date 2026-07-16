import {
  buildFjAuthHeaders,
  fjAuthStyleLabel,
  getFutureJobsConfig,
  normalizeApiKey,
  shouldUseFutureJobsMock,
} from './futureJobs.auth.js';
import { createLiveFutureJobsProvider, resetFutureJobsCircuit } from './futureJobs.client.js';
import {
  FUTURE_JOBS_CIRCUIT_OPEN_CODE,
  FUTURE_JOBS_UPSTREAM_ERROR_CODE,
  FUTURE_JOBS_UPSTREAM_USER_MESSAGE,
  FutureJobsUpstreamError,
  createFutureJobsUpstreamError,
} from './futureJobs.errors.js';
import {
  DEFAULT_FILTER_FORM,
  SOURCING_PROMPT_MAX_LENGTH,
  baseSessionFromPrompt,
  buildSessionPayloadForApply,
  buildSessionPayloadFromPromptAndFilter,
  buildSourcingSessionPayloadFromPrompt,
  enrichFilterFormSkillsFromPrompt,
  ensureSkillsForFutureJobs,
  filterFormFromAnnotation,
  filterFormFromCreateResponse,
  mapFjDocToCandidate,
  mergeFilterFormIntoSession,
  normalizeFilterFormForUi,
  normalizePromptPlainText,
  normalizeRegionForFutureJobs,
  promptForSourcingApi,
} from './futureJobs.mapper.js';
import {
  createMockFutureJobsProvider,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from './futureJobs.mock.js';
import {
  extractRevealValues,
  linkedinCacheLookupKeys,
  looksValidContact,
  lowercaseLinkedinProfileUrl,
  normalizeLinkedinProfileUrl,
} from './futureJobs.reveal.js';
import type { FutureJobsProvider } from './futureJobs.types.js';

export type {
  FilterAutocompleteParams,
  FutureJobsAnnotationData,
  FutureJobsApiResponse,
  FutureJobsAuthStyle,
  FutureJobsConfig,
  FutureJobsCreateSessionData,
  FutureJobsFilterForm,
  FutureJobsMappedCandidate,
  FutureJobsProfileDoc,
  FutureJobsProfilesPage,
  FutureJobsProvider,
  FutureJobsQueries,
  FutureJobsSession,
  GetProfilesOptions,
  MockFutureJobsMode,
  ProfilesPollPayload,
  ProfilesWhenReadyOptions,
} from './futureJobs.types.js';

export type { FutureJobsRevealType } from './futureJobs.reveal.js';

export {
  FUTURE_JOBS_CIRCUIT_OPEN_CODE,
  FUTURE_JOBS_UPSTREAM_ERROR_CODE,
  FUTURE_JOBS_UPSTREAM_USER_MESSAGE,
  FutureJobsUpstreamError,
  createFutureJobsUpstreamError,
  DEFAULT_FILTER_FORM,
  SOURCING_PROMPT_MAX_LENGTH,
  baseSessionFromPrompt,
  buildFjAuthHeaders,
  buildSessionPayloadForApply,
  buildSessionPayloadFromPromptAndFilter,
  buildSourcingSessionPayloadFromPrompt,
  createLiveFutureJobsProvider,
  createMockFutureJobsProvider,
  enrichFilterFormSkillsFromPrompt,
  ensureSkillsForFutureJobs,
  extractRevealValues,
  filterFormFromAnnotation,
  filterFormFromCreateResponse,
  fjAuthStyleLabel,
  getFutureJobsConfig,
  linkedinCacheLookupKeys,
  looksValidContact,
  lowercaseLinkedinProfileUrl,
  mapFjDocToCandidate,
  mergeFilterFormIntoSession,
  normalizeApiKey,
  normalizeFilterFormForUi,
  normalizeLinkedinProfileUrl,
  normalizePromptPlainText,
  normalizeRegionForFutureJobs,
  promptForSourcingApi,
  resetFutureJobsCircuit,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
  shouldUseFutureJobsMock,
};

export type {
  FutureJobsFilterForm as FilterForm,
  FutureJobsMappedCandidate as MappedCandidate,
} from './futureJobs.types.js';

/**
 * Factory — returns mock provider when mock mode is on / no API key (non-prod),
 * otherwise the live HTTP client (which still re-checks mock on each call).
 */
export function getFutureJobsProvider(): FutureJobsProvider {
  if (shouldUseFutureJobsMock()) {
    return createMockFutureJobsProvider();
  }
  return createLiveFutureJobsProvider();
}
