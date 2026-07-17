import type { Request, Response } from 'express';

import { getRequestId } from '../../../middleware/request-id.js';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { successResponse } from '../../../shared/http/response.js';
import { candidateSearchService } from './search.service.js';
import {
  allCandidatesQuerySchema,
  annotateSearchSchema,
  applySearchSchema,
  autocompleteQuerySchema,
  candidateDetailsQuerySchema,
  claimPublicSearchSchema,
  createSearchSchema,
  fetchMoreBodySchema,
  legacySearchSchema,
  recentSearchesQuerySchema,
  sessionProfilesQuerySchema,
  sessionsListQuerySchema,
  storedCandidatesQuerySchema,
} from './search.validation.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
    requestId: getRequestId(req),
  };
}

export const annotateSearch = asyncHandler(async (req: Request, res: Response) => {
  const input = annotateSearchSchema.parse(req.body);
  const result = await candidateSearchService.annotate(actorFrom(req), input);
  // Annotate returns success payload at top level for frontend drawer contract
  res.status(200).json(result);
});

export const autocompleteFilters = asyncHandler(async (req: Request, res: Response) => {
  const query = autocompleteQuerySchema.parse(req.query);
  const result = await candidateSearchService.autocomplete(actorFrom(req), query);
  res.status(200).json(result);
});

export const createSearch = asyncHandler(async (req: Request, res: Response) => {
  const input = createSearchSchema.parse(req.body);
  const result = await candidateSearchService.create(actorFrom(req), input);
  res.status(200).json(result);
});

export const applySearch = asyncHandler(async (req: Request, res: Response) => {
  const input = applySearchSchema.parse(req.body);
  const result = await candidateSearchService.apply(actorFrom(req), input);
  res.status(200).json(result);
});

/** LEGACY: Prefer POST /search/apply for the dashboard flow. */
export const legacySearch = asyncHandler(async (req: Request, res: Response) => {
  const input = legacySearchSchema.parse(req.body);
  const result = await candidateSearchService.legacySearch(actorFrom(req), input);
  res.status(200).json(result);
});

export const getSessionProfiles = asyncHandler(async (req: Request, res: Response) => {
  const query = sessionProfilesQuerySchema.parse(req.query);
  const result = await candidateSearchService.getSessionProfiles(
    actorFrom(req),
    String(req.params.sessionId),
    query
  );
  res.status(200).json(result);
});

export const fetchMoreCandidates = asyncHandler(async (req: Request, res: Response) => {
  const body = fetchMoreBodySchema.parse(req.body ?? {});
  const result = await candidateSearchService.fetchMore(
    actorFrom(req),
    String(req.params.sessionId),
    body
  );
  res.status(200).json(result);
});

export const getStoredCandidates = asyncHandler(async (req: Request, res: Response) => {
  const query = storedCandidatesQuerySchema.parse(req.query);
  const result = await candidateSearchService.getStoredCandidates(
    actorFrom(req),
    String(req.params.sessionId),
    query
  );
  res.status(200).json(result);
});

export const getAllSourcedCandidates = asyncHandler(async (req: Request, res: Response) => {
  const query = allCandidatesQuerySchema.parse(req.query);
  const result = await candidateSearchService.getAllCandidates(actorFrom(req), query);
  res.status(200).json(result);
});

export const getCandidateSearchDetails = asyncHandler(async (req: Request, res: Response) => {
  const query = candidateDetailsQuerySchema.parse(req.query);
  const result = await candidateSearchService.getCandidateDetails(
    actorFrom(req),
    String(req.params.candidateId),
    query
  );
  res.status(200).json(result);
});

export const listSearchSessions = asyncHandler(async (req: Request, res: Response) => {
  const query = sessionsListQuerySchema.parse(req.query);
  const result = await candidateSearchService.listSessions(actorFrom(req), query);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const getRecentSearches = asyncHandler(async (req: Request, res: Response) => {
  const query = recentSearchesQuerySchema.parse(req.query);
  const result = await candidateSearchService.recentSearches(actorFrom(req), query);
  res.status(200).json(result);
});

export const claimPublicSearch = asyncHandler(async (req: Request, res: Response) => {
  const input = claimPublicSearchSchema.parse(req.body);
  const result = await candidateSearchService.claimPublicSearch(actorFrom(req), input);
  res.status(200).json(result);
});
