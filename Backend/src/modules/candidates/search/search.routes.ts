import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../../middleware/auth.js';
import {
  annotateSearch,
  applySearch,
  autocompleteFilters,
  claimPublicSearch,
  createSearch,
  fetchMoreCandidates,
  getAllSourcedCandidates,
  getCandidateSearchDetails,
  getRecentSearches,
  getSessionProfiles,
  getStoredCandidates,
  legacySearch,
  listSearchSessions,
} from './search.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

/**
 * Candidate search routes — mount under `/api/v1/candidates`.
 * Static paths must be registered before `/:candidateId` reveal routes.
 */
export const candidateSearchRouter = Router();

candidateSearchRouter.post(
  '/search/annotate',
  ...orgAuth,
  requirePermission('sourcing:create', 'sourcing:view'),
  annotateSearch
);

candidateSearchRouter.post(
  '/search/create',
  ...orgAuth,
  requirePermission('sourcing:create'),
  createSearch
);

candidateSearchRouter.post(
  '/search/apply',
  ...orgAuth,
  requirePermission('sourcing:create', 'sourcing:edit'),
  applySearch
);

/** LEGACY one-shot search — prefer POST /search/apply. */
candidateSearchRouter.post(
  '/search',
  ...orgAuth,
  requirePermission('sourcing:create'),
  legacySearch
);

candidateSearchRouter.get(
  '/filters/autocomplete',
  ...orgAuth,
  requirePermission('sourcing:view', 'sourcing:create'),
  autocompleteFilters
);

candidateSearchRouter.get(
  '/session/:sessionId/profiles',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getSessionProfiles
);

candidateSearchRouter.post(
  '/session/:sessionId/fetch-more',
  ...orgAuth,
  requirePermission('sourcing:create', 'sourcing:edit'),
  fetchMoreCandidates
);

candidateSearchRouter.get(
  '/session/:sessionId/stored-candidates',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getStoredCandidates
);

candidateSearchRouter.get(
  '/all',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getAllSourcedCandidates
);

candidateSearchRouter.get(
  '/candidate/:candidateId/details',
  ...orgAuth,
  requirePermission('sourcing:view', 'candidates:view'),
  getCandidateSearchDetails
);

candidateSearchRouter.get(
  '/sessions',
  ...orgAuth,
  requirePermission('sourcing:view'),
  listSearchSessions
);

candidateSearchRouter.get(
  '/recent-searches',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getRecentSearches
);

candidateSearchRouter.post(
  '/claim-public-search',
  ...orgAuth,
  requirePermission('sourcing:create'),
  claimPublicSearch
);
