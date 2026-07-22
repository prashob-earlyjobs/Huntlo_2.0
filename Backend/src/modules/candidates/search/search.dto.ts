import type { SourcedCandidateDocument } from '../../sourcing/sourced-candidate.model.js';
import type { SourcingSessionDocument } from '../../sourcing/sourcing-session.model.js';
import { labelListFromUnknown } from '../../../shared/strings/label-list.js';
import { profileSignalsFromFjDoc } from '../../../shared/sourcing/profile-signals.js';

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
  profilePictureUrl: string | null;
  profileSignals: string[];
  rank: number;
  saved?: boolean;
  /** Candidate list names this profile already belongs to (when known). */
  lists?: string[];
};

export type CandidateExperienceDto = {
  company: string;
  role: string;
  duration: string;
  description: string;
  current: boolean;
};

export type CandidateEducationDto = {
  school: string;
  degree: string;
  field: string;
  years: string;
};

export type CandidateMatchBreakdownDto = {
  skills: number;
  role: number;
  experience: number;
  location: number;
  industry: number;
  education: number;
};

export type CandidateDetailsDto = CandidateSummaryDto & {
  mappedCandidate: unknown;
  rawDoc: unknown;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  summary: string | null;
  recommendation: string | null;
  experience: CandidateExperienceDto[];
  education: CandidateEducationDto[];
  profileAnalysis: unknown;
  matchBreakdown: CandidateMatchBreakdownDto | null;
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
  saved: boolean;
  savedAt: string | null;
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
  quotaUsed: number;
  createdAt: string | null;
  lastActivity: string | null;
  saved: boolean;
  savedAt: string | null;
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
  futureJobsSessionId?: string | null,
  saved = false,
  lists: string[] = []
): CandidateSummaryDto {
  const candidateId = String(
    candidate.candidateId || candidate.externalCandidateId || candidate._id.toHexString()
  );
  const linkedin =
    candidate.linkedinProfileUrl ||
    candidate.basicProfile?.linkedinUrl ||
    null;
  const profilePictureUrl =
    candidate.profilePictureUrl ||
    candidate.basicProfile?.profilePictureUrl ||
    null;
  const storedSignals = labelListFromUnknown(candidate.profileSignals, 12);
  const rawSignals = profileSignalsFromFjDoc(
    candidate.rawDoc ?? candidate.rawProviderReference ?? null
  );
  const profileSignals = labelListFromUnknown(
    [...storedSignals, ...rawSignals],
    12
  );
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
    skills: labelListFromUnknown(candidate.skills, 24),
    educationPreview: candidate.educationPreview ?? [],
    finalScore: candidate.finalScore ?? candidate.matchScore ?? null,
    matchScore: candidate.matchScore ?? candidate.finalScore ?? null,
    candidateSummary: candidate.candidateSummary ?? null,
    contactStatus: candidate.contactStatus ?? 'Not contacted',
    linkedinProfileUrl: linkedin,
    linkedinUrl: linkedin,
    profilePictureUrl,
    profileSignals,
    rank: candidate.rank ?? 0,
    saved: saved || lists.length > 0,
    lists,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function yearLabel(start: unknown, end?: unknown): string {
  const startYear = asString(start).slice(0, 4);
  const endYear = asString(end).slice(0, 4);
  if (startYear && endYear) return `${startYear}–${endYear}`;
  if (startYear && !endYear) return `${startYear}–Present`;
  return '';
}

function employerToExperience(entry: unknown, current: boolean): CandidateExperienceDto | null {
  const job = asRecord(entry);
  if (!job) return null;
  const company = asString(job.name) || asString(job.company_name);
  const role = asString(job.title) || asString(job.job_title);
  if (!company && !role) return null;
  return {
    company: company || '—',
    role: role || '—',
    duration: yearLabel(job.start_date, job.end_date) || asString(job.years_at_company) || '—',
    description: asString(job.description),
    current,
  };
}

function extractFjDetailsCandidate(rawDoc: unknown): Record<string, unknown> | null {
  const root = asRecord(rawDoc);
  if (!root) return null;
  const nested = asRecord(root.data);
  const candidate =
    asRecord(root.candidate) ||
    asRecord(nested?.candidate) ||
    (Array.isArray(root.all_employers) || Array.isArray(root.past_employers) ? root : null);
  return candidate;
}

function extractFjProfileAnalysis(rawDoc: unknown): Record<string, unknown> | null {
  const root = asRecord(rawDoc);
  if (!root) return null;
  const nested = asRecord(root.data);
  return (
    asRecord(root.profileAnalysis) ||
    asRecord(nested?.profileAnalysis) ||
    asRecord(asRecord(root.candidate)?.profileAnalysis) ||
    null
  );
}

/** True when rawDoc is the full Future Jobs candidate-details payload (not list profile doc). */
export function hasFullFjCandidateDetails(rawDoc: unknown): boolean {
  const candidate = extractFjDetailsCandidate(rawDoc);
  if (!candidate) return false;
  return (
    Array.isArray(candidate.all_employers) ||
    Array.isArray(candidate.past_employers) ||
    Array.isArray(candidate.education_background) ||
    Boolean(asString(candidate.summary))
  );
}

function experienceFromFjDetails(rawDoc: unknown): CandidateExperienceDto[] {
  const candidate = extractFjDetailsCandidate(rawDoc);
  if (!candidate) return [];
  const current = Array.isArray(candidate.current_employers)
    ? candidate.current_employers
    : [];
  const past = Array.isArray(candidate.past_employers) ? candidate.past_employers : [];
  const all = Array.isArray(candidate.all_employers) ? candidate.all_employers : [];
  const source = current.length || past.length ? [...current, ...past] : all;
  const currentNames = new Set(
    current
      .map((entry) => {
        const job = asRecord(entry);
        return `${asString(job?.name)}|${asString(job?.title)}`.toLowerCase();
      })
      .filter(Boolean)
  );
  const out: CandidateExperienceDto[] = [];
  for (const entry of source) {
    const job = asRecord(entry);
    const key = `${asString(job?.name)}|${asString(job?.title)}`.toLowerCase();
    const isCurrent = currentNames.has(key) || !asString(job?.end_date);
    const mapped = employerToExperience(entry, isCurrent && Boolean(asString(job?.name)));
    if (mapped) out.push(mapped);
  }
  return out;
}

function educationFromFjDetails(rawDoc: unknown): CandidateEducationDto[] {
  const candidate = extractFjDetailsCandidate(rawDoc);
  if (!candidate) return [];
  const rows = Array.isArray(candidate.education_background)
    ? candidate.education_background
    : [];
  return rows
    .map((entry) => {
      const edu = asRecord(entry);
      if (!edu) return null;
      return {
        school: asString(edu.institute_name) || '—',
        degree: asString(edu.degree_name) || '—',
        field: asString(edu.field_of_study) || '—',
        years: yearLabel(edu.start_date, edu.end_date) || '—',
      };
    })
    .filter((entry): entry is CandidateEducationDto => Boolean(entry));
}

function matchBreakdownFromFjDetails(
  rawDoc: unknown
): CandidateMatchBreakdownDto | null {
  const analysis = asRecord(extractFjProfileAnalysis(rawDoc)?.analysis);
  const breakdown = Array.isArray(analysis?.scoreBreakdown)
    ? analysis.scoreBreakdown
    : [];
  if (!breakdown.length) return null;

  const pick = (predicates: string[]): number => {
    for (const row of breakdown) {
      const item = asRecord(row);
      if (!item) continue;
      const label = `${asString(item.label)} ${asString(item.code)}`.toLowerCase();
      if (!predicates.some((p) => label.includes(p))) continue;
      const weight = Number(item.weight);
      const awarded = Number(item.awarded);
      if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(awarded)) continue;
      return Math.round(Math.min(100, Math.max(0, (awarded / weight) * 100)));
    }
    return 70;
  };

  return {
    role: pick(['job title', 'jt']),
    skills: pick(['mandatory', 'core', 'mand', 'skill']),
    experience: pick(['experience', 'years']),
    location: pick(['region', 'location']),
    industry: pick(['industry', 'ind']),
    education: pick(['education', 'edu']),
  };
}

export function toCandidateDetailsDto(
  candidate: SourcedCandidateDocument,
  futureJobsSessionId?: string | null
): CandidateDetailsDto {
  const rawDoc = candidate.rawDoc ?? candidate.rawProviderReference ?? null;
  const fjCandidate = extractFjDetailsCandidate(rawDoc);
  const analysisRoot = extractFjProfileAnalysis(rawDoc);
  const summary =
    asString(fjCandidate?.summary) ||
    asString(fjCandidate?.headline) ||
    candidate.candidateSummary ||
    null;
  const recommendation =
    asString(asRecord(analysisRoot)?.recommendation) ||
    asString(asRecord(asRecord(analysisRoot)?.analysis)?.recommendation) ||
    null;

  const base = toCandidateSummaryDto(candidate, futureJobsSessionId);
  if (fjCandidate) {
    const picture =
      asString(fjCandidate.profile_picture_permalink) ||
      asString(fjCandidate.profile_picture_url);
    if (picture) base.profilePictureUrl = picture;
    const headline = asString(fjCandidate.headline);
    if (headline) base.headline = headline;
  }

  return {
    ...base,
    mappedCandidate: candidate.mappedCandidate ?? null,
    rawDoc,
    firstSeenAt: candidate.firstSeenAt?.toISOString?.() ?? null,
    lastSeenAt: candidate.lastSeenAt?.toISOString?.() ?? null,
    summary,
    recommendation,
    experience: experienceFromFjDetails(rawDoc),
    education: educationFromFjDetails(rawDoc),
    profileAnalysis: analysisRoot,
    matchBreakdown: matchBreakdownFromFjDetails(rawDoc),
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
    saved: Boolean(session.savedAt),
    savedAt: session.savedAt?.toISOString?.() ?? null,
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
