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
  FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE,
  FUTURE_JOBS_PROFILE_NOT_FOUND_CODE,
  FUTURE_JOBS_UPSTREAM_ERROR_CODE,
  FUTURE_JOBS_UPSTREAM_USER_MESSAGE,
  FutureJobsUpstreamError,
  createFutureJobsUpstreamError,
  fjUpstreamLogFields,
  isFjInvalidLinkedinUrlError,
  isFjInvalidLinkedinUrlResponse,
  isFjNoMoreProfilesError,
  isFjProfileNotFoundError,
  isFutureJobsUpstreamError,
  summarizeFjResponseForLog,
  throwIfFjHttpNotOk,
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
  MAX_SKILLS_RELAX_STEPS,
  applyGeoExpandStep,
  applySkillsRelaxStep,
  canExpandGeoFurther,
  canRelaxSkillsFilter,
  hasRegionOrLocationFilter,
  hasStrictSkillsFilter,
  nextGeoExpandStep,
  nextSkillsRelaxStep,
  parseGeoDistanceKm,
  filterFormToNaturalLanguage,
  buildJdTextFromPromptAndFilters,
  buildWlSearchFilters,
  yearsRangeFromFilterForm,
  parseYearsExperienceRangeFromText,
} from './futureJobs.filterMapping.js';
import {
  extractSearchProfileDocs,
  extractSearchTotalDocs,
  experienceYearsFromFjDoc,
  normalizeFjProfileDoc,
} from './futureJobs.search-docs.js';
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
  linkedinUrlsForContactReveal,
  linkedinUrlsFromScoutLookup,
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
  FutureJobsPreviewData,
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
  FUTURE_JOBS_INVALID_LINKEDIN_URL_CODE,
  FUTURE_JOBS_PROFILE_NOT_FOUND_CODE,
  FUTURE_JOBS_UPSTREAM_ERROR_CODE,
  FUTURE_JOBS_UPSTREAM_USER_MESSAGE,
  FutureJobsUpstreamError,
  createFutureJobsUpstreamError,
  fjUpstreamLogFields,
  isFjInvalidLinkedinUrlError,
  isFjInvalidLinkedinUrlResponse,
  isFjNoMoreProfilesError,
  isFjProfileNotFoundError,
  isFutureJobsUpstreamError,
  summarizeFjResponseForLog,
  throwIfFjHttpNotOk,
  DEFAULT_FILTER_FORM,
  GEO_EXPAND_STEPS,
  MAX_SKILLS_RELAX_STEPS,
  POST_SESSION_CREATE_PROFILES_WAIT_MS,
  POST_SESSION_CREATE_PROFILES_WAIT_MS_DEFAULT,
  SOURCING_PROMPT_MAX_LENGTH,
  applyGeoExpandStep,
  applySkillsRelaxStep,
  baseSessionFromPrompt,
  buildFjAuthHeaders,
  buildJdTextFromPromptAndFilters,
  buildWlSearchFilters,
  buildSessionPayloadForApply,
  buildSessionPayloadFromPromptAndFilter,
  buildSourcingSessionPayloadFromPrompt,
  canExpandGeoFurther,
  canRelaxSkillsFilter,
  createLiveFutureJobsProvider,
  createMockFutureJobsProvider,
  enrichFilterFormSkillsFromPrompt,
  ensureSkillsForFutureJobs,
  extractRevealValues,
  extractSearchProfileDocs,
  extractSearchTotalDocs,
  experienceYearsFromFjDoc,
  filterFormFromAnnotation,
  filterFormFromCreateResponse,
  filterFormToNaturalLanguage,
  fjAuthStyleLabel,
  getFutureJobsConfig,
  getPostSessionCreateProfilesWaitMs,
  hasRegionOrLocationFilter,
  hasStrictSkillsFilter,
  linkedinCacheLookupKeys,
  linkedinUrlsForContactReveal,
  linkedinUrlsFromScoutLookup,
  looksValidContact,
  lowercaseLinkedinProfileUrl,
  mapFjDocToCandidate,
  mergeFilterFormIntoSession,
  nextGeoExpandStep,
  nextSkillsRelaxStep,
  normalizeApiKey,
  normalizeFjProfileDoc,
  normalizeFilterFormForUi,
  normalizeLinkedinProfileUrl,
  normalizePromptPlainText,
  normalizeRegionForFutureJobs,
  parseGeoDistanceKm,
  parseYearsExperienceRangeFromText,
  promptForSourcingApi,
  yearsRangeFromFilterForm,
  resetFutureJobsCircuit,
  resetMockFutureJobsState,
  setMockFutureJobsMode,
  shouldUseFutureJobsMock,
};

export type {
  GeoExpandStep,
  WlSearchFilters,
  WlSearchRangeFilter,
} from './futureJobs.filterMapping.js';

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
