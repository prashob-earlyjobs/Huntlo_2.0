import type { SourcedCandidateDocument } from '../../sourcing/sourced-candidate.model.js';
import type { SourcingSessionDocument } from '../../sourcing/sourcing-session.model.js';
import { labelListFromUnknown } from '../../../shared/strings/label-list.js';
import { profileSignalsFromFjDoc } from '../../../shared/sourcing/profile-signals.js';
import { experienceYearsFromFjDoc } from '../../../providers/future-jobs/futureJobs.search-docs.js';

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
  experience: CandidateExperienceDto[];
  education: CandidateEducationDto[];
  finalScore: number | null;
  matchScore: number | null;
  /** Future Jobs fit label (`"strong"`, `"good"`, …). */
  fit: string | null;
  candidateSummary: string | null;
  summary: string | null;
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
  location?: string;
  seniority?: string;
  employmentType?: string;
  industries?: string[];
  companyLogoUrl?: string;
  companyWebsite?: string;
  companySize?: string;
  companyHq?: string;
};

export type CandidateEducationDto = {
  school: string;
  degree: string;
  field: string;
  years: string;
  location?: string;
  schoolLogoUrl?: string;
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
  const rawDoc = candidate.rawDoc ?? candidate.rawProviderReference ?? null;
  const fjCandidate = extractFjDetailsCandidate(rawDoc);
  const basic = asRecord(fjCandidate?.basic_profile);
  const linkedin =
    candidate.linkedinProfileUrl ||
    candidate.basicProfile?.linkedinUrl ||
    linkedinFromFjCandidate(fjCandidate) ||
    null;
  const profilePictureUrl =
    candidate.profilePictureUrl ||
    candidate.basicProfile?.profilePictureUrl ||
    firstNonEmpty(
      fjCandidate?.profile_picture_permalink,
      fjCandidate?.profile_picture_url,
      basic?.profile_picture_permalink
    ) ||
    null;
  const storedSignals = labelListFromUnknown(candidate.profileSignals, 12);
  const rawSignals = profileSignalsFromFjDoc(
    candidate.rawDoc ?? candidate.rawProviderReference ?? null
  );
  const profileSignals = labelListFromUnknown(
    [...storedSignals, ...rawSignals],
    12
  );
  const history = candidateHistoryFromRawDoc(rawDoc, {
    fallbackSummary: candidate.candidateSummary ?? null,
    educationPreview: candidate.educationPreview ?? [],
  });
  const headline =
    firstNonEmpty(
      candidate.basicProfile?.headline,
      fjCandidate?.headline,
      basic?.headline
    ) || null;
  const storedSkills = labelListFromUnknown(candidate.skills, 24);
  const profileSkills = labelListFromUnknown(fjCandidate?.skills, 24);
  const skills =
    storedSkills.length > 0
      ? storedSkills
      : profileSkills.length > 0
        ? profileSkills
        : skillsFromFjHeadline(headline ?? '');
  const summary =
    history.summary ||
    headline ||
    null;
  return {
    id: candidate._id.toHexString(),
    candidateId,
    sourcingSessionId: candidate.sourcingSessionId.toHexString(),
    sessionId: futureJobsSessionId ?? candidate.futureJobsSessionId ?? null,
    name: candidate.name || candidate.basicProfile?.name || asString(fjCandidate?.name) || 'Unknown',
    firstName: candidate.firstName ?? null,
    lastName: candidate.lastName ?? null,
    headline,
    currentRole:
      candidate.currentRole ??
      candidate.currentEmployment?.title ??
      (asString(basic?.current_title) || null),
    currentCompany: candidate.currentCompany ?? candidate.currentEmployment?.company ?? null,
    location:
      candidate.location ||
      locationLabel(basic?.location) ||
      asString(fjCandidate?.region) ||
      '',
    experienceYears:
      (typeof candidate.experienceYears === 'number' &&
      Number.isFinite(candidate.experienceYears) &&
      candidate.experienceYears > 0
        ? candidate.experienceYears
        : experienceYearsFromFjDoc(candidate.rawDoc)) ??
      candidate.experienceYears ??
      null,
    skills,
    educationPreview: candidate.educationPreview ?? [],
    experience: history.experience,
    education: history.education,
    finalScore: candidate.finalScore ?? candidate.matchScore ?? null,
    matchScore: candidate.matchScore ?? candidate.finalScore ?? null,
    fit: fitFromStoredCandidate(candidate),
    candidateSummary: summary ?? candidate.candidateSummary ?? null,
    summary,
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

function fitFromStoredCandidate(candidate: SourcedCandidateDocument): string | null {
  const stored = asString((candidate as { fit?: unknown }).fit);
  if (stored) return stored;
  const raw = asRecord(candidate.rawDoc);
  const profile = asRecord(raw?.profile);
  return firstNonEmpty(raw?.fit, profile?.fit) || null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function calendarParts(value: unknown): { year: number; month: number | null } | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const n = Math.trunc(value);
    if (n >= 1900 && n <= 2100) return { year: n, month: null };
  }
  const text = asString(value);
  if (!text) return null;
  const iso = text.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (iso) {
    return { year: Number(iso[1]), month: Number(iso[2]) };
  }
  if (/^\d{4}$/.test(text)) return { year: Number(text), month: null };
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) return null;
  const d = new Date(parsed);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

function yearToken(value: unknown): string {
  const parts = calendarParts(value);
  return parts ? String(parts.year) : '';
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function monthYearLabel(value: unknown): string {
  const parts = calendarParts(value);
  if (!parts) return '';
  if (!parts.month) return String(parts.year);
  return `${SHORT_MONTHS[parts.month - 1]} ${parts.year}`;
}

function yearLabel(start: unknown, end?: unknown): string {
  const startYear = yearToken(start);
  const endYear = yearToken(end);
  if (startYear && endYear) return `${startYear}–${endYear}`;
  if (startYear && !endYear) return `${startYear}–Present`;
  return '';
}

function experienceDuration(start: unknown, end?: unknown): string {
  const startL = monthYearLabel(start);
  if (!startL) return '';
  const endL = end != null && end !== '' ? monthYearLabel(end) : 'Present';
  return endL ? `${startL}–${endL}` : startL;
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const text = asString(value);
    if (text) return text;
  }
  return '';
}

function locationLabel(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  const record = asRecord(value);
  if (!record) return '';
  return firstNonEmpty(
    record.full_location,
    record.raw,
    [record.city, record.state, record.country].filter((part) => asString(part)).join(', '),
    record.city,
    record.country
  );
}

/** Headline tokens such as `Node.js | React | TypeScript` when FJ `skills` is empty. */
export function skillsFromFjHeadline(headline: string, cap = 16): string[] {
  if (!headline.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of headline.split(/[|,]/)) {
    const label = part.replace(/\s+/g, ' ').trim();
    if (label.length < 2 || label.length > 48) continue;
    if (/^(open to|ex[- ]|building\b|looking for)/i.test(label)) continue;
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= cap) break;
  }
  return out;
}

function stringList(value: unknown, cap = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter(Boolean)
    .slice(0, cap);
}

function employerCompany(job: Record<string, unknown>): string {
  const nested = asRecord(job.company) || asRecord(job.employer);
  return firstNonEmpty(
    job.name,
    job.company_name,
    job.employer_name,
    job.companyName,
    job.company,
    nested?.name,
    nested?.company_name
  );
}

function employerRole(job: Record<string, unknown>): string {
  return firstNonEmpty(
    job.title,
    job.job_title,
    job.employee_title,
    job.occupation,
    job.position
  );
}

function employerToExperience(entry: unknown, current: boolean): CandidateExperienceDto | null {
  const job = asRecord(entry);
  if (!job) return null;
  const company = employerCompany(job);
  const role = employerRole(job);
  if (!company && !role) return null;
  const location = locationLabel(job.location) || asString(job.location);
  const seniority = asString(job.seniority_level ?? job.seniorityLevel);
  const employmentType = asString(job.employment_type ?? job.employmentType);
  const industries = stringList(job.company_industries ?? job.companyIndustries);
  const companyLogoUrl = firstNonEmpty(
    job.company_profile_picture_permalink,
    job.company_logo_url,
    job.companyLogoUrl
  );
  const companySize = firstNonEmpty(
    job.company_headcount_range,
    typeof job.company_headcount_latest === 'number'
      ? `${job.company_headcount_latest} employees`
      : ''
  );
  const companyHq = asString(job.company_hq_location ?? job.companyHqLocation);
  const nestedCompany = asRecord(job.company) || asRecord(job.employer);
  const companyWebsite = firstNonEmpty(
    job.company_website,
    job.company_website_domain,
    job.companyWebsite,
    job.website,
    nestedCompany?.website,
    nestedCompany?.company_website,
    nestedCompany?.domain
  );
  const mapped: CandidateExperienceDto = {
    company: company || '—',
    role: role || '—',
    duration:
      experienceDuration(
        job.start_date ?? job.startDate ?? job.start,
        job.end_date ?? job.endDate ?? job.end
      ) ||
      asString(job.years_at_company) ||
      asString(job.duration) ||
      '—',
    description: firstNonEmpty(job.description, job.employee_description),
    current,
  };
  if (location) mapped.location = location;
  if (seniority) mapped.seniority = seniority;
  if (employmentType) mapped.employmentType = employmentType;
  if (industries.length) mapped.industries = industries;
  if (companyLogoUrl) mapped.companyLogoUrl = companyLogoUrl;
  if (companyWebsite) mapped.companyWebsite = companyWebsite;
  if (companySize) mapped.companySize = companySize;
  if (companyHq) mapped.companyHq = companyHq;
  return mapped;
}

function looksLikePersonProfile(record: Record<string, unknown>): boolean {
  const education = asRecord(record.education);
  const experience = asRecord(record.experience);
  return Boolean(
    asString(record.fullName) ||
      asString(record.full_name) ||
      asString(record.name) ||
      asString(record.firstName) ||
      asString(record.first_name) ||
      asString(record.headline) ||
      Array.isArray(record.current_employers) ||
      Array.isArray(record.current_employers_object) ||
      Array.isArray(record.education_background) ||
      Array.isArray(record.education) ||
      Array.isArray(education?.schools) ||
      Array.isArray(asRecord(experience?.employment_details)?.current) ||
      Array.isArray(asRecord(experience?.employment_details)?.past)
  );
}

function firstArray(...values: unknown[]): unknown[] {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value;
  }
  return [];
}

function employmentDetailsFromCandidate(
  candidate: Record<string, unknown>
): { current: unknown[]; past: unknown[] } {
  const experience = asRecord(candidate.experience);
  const details =
    asRecord(experience?.employment_details) || asRecord(candidate.employment_details);
  return {
    current: firstArray(details?.current),
    past: firstArray(details?.past),
  };
}

function extractFjDetailsCandidate(rawDoc: unknown): Record<string, unknown> | null {
  const root = asRecord(rawDoc);
  if (!root) return null;
  const nested = asRecord(root.data);
  const profile = asRecord(root.profile) || asRecord(nested?.profile);
  const candidate = asRecord(root.candidate) || asRecord(nested?.candidate);
  if (profile && looksLikePersonProfile(profile)) return profile;
  if (candidate) return candidate;
  if (profile) return profile;
  if (
    Array.isArray(root.all_employers) ||
    Array.isArray(root.past_employers) ||
    Array.isArray(root.current_employers) ||
    Array.isArray(root.current_employers_object)
  ) {
    return root;
  }
  return looksLikePersonProfile(root) ? root : null;
}

function extractFjProfileAnalysis(rawDoc: unknown): Record<string, unknown> | null {
  const root = asRecord(rawDoc);
  if (!root) return null;
  const nested = asRecord(root.data);
  return (
    asRecord(root.profileAnalysis) ||
    asRecord(nested?.profileAnalysis) ||
    asRecord(asRecord(root.candidate)?.profileAnalysis) ||
    asRecord(asRecord(root.profile)?.profileAnalysis) ||
    null
  );
}

function linkedinFromFjCandidate(candidate: Record<string, unknown> | null): string {
  if (!candidate) return '';
  const social = asRecord(candidate.social_handles);
  const professional = asRecord(social?.professional_network_identifier);
  return firstNonEmpty(
    candidate.linkedin_profile_url,
    candidate.linkedinUrl,
    professional?.profile_url,
    asRecord(candidate.basic_profile)?.linkedin_profile_url
  );
}

/** True when rawDoc already has search-profile history (no extra details fetch needed). */
export function hasFullFjCandidateDetails(rawDoc: unknown): boolean {
  const candidate = extractFjDetailsCandidate(rawDoc);
  if (!candidate) return false;
  const education = asRecord(candidate.education);
  const details = employmentDetailsFromCandidate(candidate);
  return (
    Array.isArray(candidate.all_employers) ||
    Array.isArray(candidate.past_employers) ||
    Array.isArray(candidate.education_background) ||
    Array.isArray(education?.schools) ||
    details.current.length > 0 ||
    details.past.length > 0 ||
    Boolean(asString(candidate.summary))
  );
}

function experienceKey(entry: unknown): string {
  const job = asRecord(entry);
  if (!job) return '';
  return `${employerCompany(job)}|${employerRole(job)}`.toLowerCase();
}

function experienceFromFjDetails(rawDoc: unknown): CandidateExperienceDto[] {
  const candidate = extractFjDetailsCandidate(rawDoc);
  if (!candidate) return [];
  const details = employmentDetailsFromCandidate(candidate);
  const current = details.current.length
    ? details.current
    : firstArray(
        candidate.current_employers,
        candidate.current_employers_object,
        candidate.currentEmployers
      );
  const past = details.past.length
    ? details.past
    : firstArray(candidate.past_employers, candidate.pastEmployers);
  const all = firstArray(
    candidate.all_employers,
    Array.isArray(candidate.experience) ? candidate.experience : null,
    candidate.experiences,
    candidate.positions
  );
  const source = current.length || past.length ? [...current, ...past] : all;
  const currentNames = new Set(current.map(experienceKey).filter(Boolean));
  const out: CandidateExperienceDto[] = [];
  const seen = new Set<string>();
  for (const entry of source) {
    const job = asRecord(entry);
    const end = firstNonEmpty(job?.end_date, job?.endDate, job?.end);
    const isCurrent = currentNames.has(experienceKey(entry)) || !end;
    const mapped = employerToExperience(entry, isCurrent);
    if (!mapped) continue;
    const key = `${mapped.company}|${mapped.role}|${mapped.duration}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(mapped);
  }
  return out;
}

function mapEducationEntry(entry: unknown): CandidateEducationDto | null {
  const edu = asRecord(entry);
  if (!edu) return null;
  const school = firstNonEmpty(
    edu.institute_name,
    edu.school,
    edu.school_name,
    edu.college,
    edu.university,
    edu.name
  );
  const degree = firstNonEmpty(edu.degree_name, edu.degree);
  const field = firstNonEmpty(edu.field_of_study, edu.field, edu.major);
  if (!school && !degree) return null;
  const location = locationLabel(edu.location);
  const schoolLogoUrl = firstNonEmpty(
    edu.institute_logo_permalink,
    edu.school_logo_url,
    edu.logo
  );
  const mapped: CandidateEducationDto = {
    school: school || '—',
    degree: degree || '—',
    field: field || '—',
    years:
      yearLabel(
        edu.start_year ?? edu.startYear ?? edu.start_date ?? edu.startDate ?? edu.start,
        edu.end_year ?? edu.endYear ?? edu.end_date ?? edu.endDate ?? edu.end
      ) || '—',
  };
  if (location) mapped.location = location;
  if (schoolLogoUrl) mapped.schoolLogoUrl = schoolLogoUrl;
  return mapped;
}

function educationRowsFromCandidate(candidate: Record<string, unknown>): unknown[] {
  const education = asRecord(candidate.education);
  return firstArray(
    candidate.education_background,
    candidate.educations,
    candidate.education_history,
    candidate.schools,
    education?.schools,
    education?.education_background,
    Array.isArray(candidate.education) ? candidate.education : null
  );
}

function educationFromFjDetails(rawDoc: unknown): CandidateEducationDto[] {
  const candidate = extractFjDetailsCandidate(rawDoc);
  if (!candidate) return [];
  return educationRowsFromCandidate(candidate)
    .map(mapEducationEntry)
    .filter((entry): entry is CandidateEducationDto => Boolean(entry));
}

function candidateHistoryFromRawDoc(
  rawDoc: unknown,
  opts?: { fallbackSummary?: string | null; educationPreview?: unknown[] }
): {
  experience: CandidateExperienceDto[];
  education: CandidateEducationDto[];
  summary: string | null;
} {
  const candidate = extractFjDetailsCandidate(rawDoc);
  const experience = experienceFromFjDetails(rawDoc);
  const fromProfile = educationFromFjDetails(rawDoc);
  const education =
    fromProfile.length > 0
      ? fromProfile
      : (opts?.educationPreview ?? [])
          .map(mapEducationEntry)
          .filter((entry): entry is CandidateEducationDto => Boolean(entry));
  const summary =
    firstNonEmpty(candidate?.summary, candidate?.about, candidate?.bio, opts?.fallbackSummary) ||
    null;
  return { experience, education, summary };
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
  const history = candidateHistoryFromRawDoc(rawDoc, {
    fallbackSummary: candidate.candidateSummary ?? null,
    educationPreview: candidate.educationPreview ?? [],
  });
  const summary = history.summary;
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
    experience: history.experience,
    education: history.education,
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
