import type { SourcedCandidateDocument } from '../../sourcing/sourced-candidate.model.js';
import type { SourcingSessionDocument } from '../../sourcing/sourcing-session.model.js';

export type SearchPaginationDto = {
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CandidateSummaryDto = {
  id: string;
  candidateId: string;
  sourcingSessionId: string;
  sessionId: string | null;
  name: string;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  location: string;
  experienceYears: number | null;
  skills: string[];
  educationPreview: unknown[];
  finalScore: number | null;
  matchScore: number | null;
  candidateSummary: string | null;
  contactStatus: string;
  linkedinProfileUrl: string | null;
  linkedinUrl: string | null;
  profileSignals: string[];
  rank: number;
};

export type CandidateDetailsDto = CandidateSummaryDto & {
  mappedCandidate: unknown;
  rawDoc: unknown;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
};

export type SourcingSessionDto = {
  savedSessionId: string;
  sessionId: string | null;
  organizationId: string;
  userId: string;
  jobId: string | null;
  sessionTitle: string;
  prompt: string;
  filterForm: Record<string, unknown> | null;
  interpretedCriteria: unknown;
  sessionPayload: Record<string, unknown> | null;
  status: string;
  totalDocs: number;
  candidateCountFirstPage: number;
  canFetchMore: boolean;
  polling: boolean;
  regionExpandFallbackUsed: boolean;
  regionExpandStep: string | null;
  profilesPagination: SearchPaginationDto;
  startedAt: string | null;
  completedAt: string | null;
  lastPolledAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SourcingSessionSummaryDto = {
  savedSessionId: string;
  sessionId: string | null;
  title: string;
  prompt: string;
  filterSummary: string;
  jobId: string | null;
  jobTitle: string | null;
  resultCount: number;
  savedCandidateCount: number;
  owner: string | null;
  status: string;
  createdAt: string | null;
  lastActivity: string | null;
};

export type CandidateSearchPollEvent = {
  type: 'candidates.search.poll';
  sessionId: string;
  savedSessionId: string;
  status: string;
  polling: boolean;
  candidates: CandidateSummaryDto[];
  newCandidates: CandidateSummaryDto[];
  newCandidateCount: number;
  totalDocs: number;
  canFetchMore: boolean;
  profilesPagination: SearchPaginationDto;
  regionExpandFallbackUsed: boolean;
  error: string | null;
  timestamp: string;
};

export function buildPaginationDto(input: {
  totalDocs: number;
  page: number;
  limit: number;
}): SearchPaginationDto {
  const totalDocs = Math.max(0, input.totalDocs);
  const page = Math.max(1, input.page);
  const limit = Math.max(1, input.limit);
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit) || 1);
  return {
    totalDocs,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function toCandidateSummaryDto(
  candidate: SourcedCandidateDocument,
  futureJobsSessionId?: string | null
): CandidateSummaryDto {
  const candidateId = String(
    candidate.candidateId || candidate.externalCandidateId || candidate._id.toHexString()
  );
  const linkedin =
    candidate.linkedinProfileUrl ||
    candidate.basicProfile?.linkedinUrl ||
    null;
  return {
    id: candidate._id.toHexString(),
    candidateId,
    sourcingSessionId: candidate.sourcingSessionId.toHexString(),
    sessionId: futureJobsSessionId ?? candidate.futureJobsSessionId ?? null,
    name: candidate.name || candidate.basicProfile?.name || 'Unknown',
    firstName: candidate.firstName ?? null,
    lastName: candidate.lastName ?? null,
    headline: candidate.basicProfile?.headline ?? null,
    currentRole: candidate.currentRole ?? candidate.currentEmployment?.title ?? null,
    currentCompany: candidate.currentCompany ?? candidate.currentEmployment?.company ?? null,
    location: candidate.location ?? '',
    experienceYears: candidate.experienceYears ?? null,
    skills: candidate.skills ?? [],
    educationPreview: candidate.educationPreview ?? [],
    finalScore: candidate.finalScore ?? candidate.matchScore ?? null,
    matchScore: candidate.matchScore ?? candidate.finalScore ?? null,
    candidateSummary: candidate.candidateSummary ?? null,
    contactStatus: candidate.contactStatus ?? 'Not contacted',
    linkedinProfileUrl: linkedin,
    linkedinUrl: linkedin,
    profileSignals: candidate.profileSignals ?? [],
    rank: candidate.rank ?? 0,
  };
}

export function toCandidateDetailsDto(
  candidate: SourcedCandidateDocument,
  futureJobsSessionId?: string | null
): CandidateDetailsDto {
  return {
    ...toCandidateSummaryDto(candidate, futureJobsSessionId),
    mappedCandidate: candidate.mappedCandidate ?? null,
    rawDoc: candidate.rawDoc ?? candidate.rawProviderReference ?? null,
    firstSeenAt: candidate.firstSeenAt?.toISOString?.() ?? null,
    lastSeenAt: candidate.lastSeenAt?.toISOString?.() ?? null,
  };
}

export function toSourcingSessionDto(session: SourcingSessionDocument): SourcingSessionDto {
  const fjId = session.futureJobsSessionId || session.externalSessionId || null;
  const totalDocs = session.totalDocs ?? session.totalResults ?? 0;
  const page = session.profilesPagination?.page ?? 1;
  const limit = session.profilesPagination?.limit ?? 20;
  return {
    savedSessionId: session._id.toHexString(),
    sessionId: fjId,
    organizationId: session.organizationId.toHexString(),
    userId: (session.userId ?? session.ownerUserId).toHexString(),
    jobId: session.jobId ? session.jobId.toHexString() : null,
    sessionTitle: session.sessionTitle || session.name,
    prompt: session.prompt || session.naturalLanguageQuery || '',
    filterForm: (session.filterForm ?? session.normalizedFilters ?? null) as Record<
      string,
      unknown
    > | null,
    interpretedCriteria: session.interpretedCriteria ?? [],
    sessionPayload: (session.sessionPayload ?? session.providerPayload ?? null) as Record<
      string,
      unknown
    > | null,
    status: session.status,
    totalDocs,
    candidateCountFirstPage: session.candidateCountFirstPage ?? 0,
    canFetchMore: Boolean(session.canFetchMore),
    polling: Boolean(session.polling),
    regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
    regionExpandStep: session.regionExpandStep ?? null,
    profilesPagination: buildPaginationDto({ totalDocs, page, limit }),
    startedAt: session.startedAt?.toISOString?.() ?? null,
    completedAt: session.completedAt?.toISOString?.() ?? null,
    lastPolledAt: session.lastPolledAt?.toISOString?.() ?? null,
    createdAt: session.createdAt?.toISOString?.() ?? null,
    updatedAt: session.updatedAt?.toISOString?.() ?? null,
  };
}

export function filterFormSummary(filterForm: unknown): string {
  if (!filterForm || typeof filterForm !== 'object') return '';
  const form = filterForm as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof form.currentTitle === 'string' && form.currentTitle.trim()) {
    parts.push(form.currentTitle.trim());
  }
  if (Array.isArray(form.location) && form.location.length) {
    parts.push(form.location.filter(Boolean).join(', '));
  }
  if (typeof form.keywordSkills === 'string' && form.keywordSkills.trim()) {
    parts.push(form.keywordSkills.trim());
  }
  return parts.slice(0, 3).join(' · ');
}
