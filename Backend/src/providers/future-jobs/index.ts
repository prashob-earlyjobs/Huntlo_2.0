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
  GEO_EXPAND_STEPS,
  applyGeoExpandStep,
  canExpandGeoFurther,
  hasRegionOrLocationFilter,
  nextGeoExpandStep,
  parseGeoDistanceKm,
} from './futureJobs.filterMapping.js';
import {
  POST_SESSION_CREATE_PROFILES_WAIT_MS,
  POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT,
  getPostSessionCreateProfilesWaitMs,
} from './futureJobs.payload.js';
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
  GEO_EXPAND_STEPS,
  POST_SESSION_CREATE_PROFILES_WAIT_MS,
  POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT,
  SOURCING_PROMPT_MAX_LENGTH,
  applyGeoExpandStep,
  baseSessionFromPrompt,
  buildFjAuthHeaders,
  buildSessionPayloadForApply,
  buildSessionPayloadFromPromptAndFilter,
  buildSourcingSessionPayloadFromPrompt,
  canExpandGeoFurther,
  createLiveFutureJobsProvider,
  createMockFutureJobsProvider,
  enrichFilterFormSkillsFromPrompt,
  ensureSkillsForFutureJobs,
  extractRevealValues,
  filterFormFromAnnotation,
  filterFormFromCreateResponse,
  fjAuthStyleLabel,
  getFutureJobsConfig,
  getPostSessionCreateProfilesWaitMs,
  hasRegionOrLocationFilter,
  linkedinCacheLookupKeys,
  looksValidContact,
  lowercaseLinkedinProfileUrl,
  mapFjDocToCandidate,
  mergeFilterFormIntoSession,
  nextGeoExpandStep,
  normalizeApiKey,
  normalizeFilterFormForUi,
  normalizeLinkedinProfileUrl,
  normalizePromptPlainText,
  normalizeRegionForFutureJobs,
  parseGeoDistanceKm,
  promptForSourcingApi,
  resetFutureJobsCircuit,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
  shouldUseFutureJobsMock,
};

export type { GeoExpandStep } from './futureJobs.filterMapping.js';

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
