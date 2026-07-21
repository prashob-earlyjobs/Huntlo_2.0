import type { CandidateSearchSummary } from "@/lib/api/candidate-search";
import type {
  EducationEntry,
  ExperienceEntry,
  MatchBreakdown,
  SessionCandidate,
} from "@/lib/mock-sessions";
import { mapApiCandidateToSessionCandidate } from "@/lib/api/sourcing";
import { normalizeLabelList } from "@/lib/normalize-label-list";

export type CandidateDetailsApi = CandidateSearchSummary & {
  summary?: string | null;
  recommendation?: string | null;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  profileAnalysis?: unknown;
  matchBreakdown?: MatchBreakdown | null;
  mappedCandidate?: unknown;
  rawDoc?: unknown;
};

export function mapCandidateDetailsToSessionCandidate(
  base: SessionCandidate,
  details: CandidateDetailsApi
): SessionCandidate {
  const summaryCandidate = mapApiCandidateToSessionCandidate({
    id: details.id || base.id,
    sourcingSessionId: details.sourcingSessionId || base.id,
    externalCandidateId: details.candidateId || base.id,
    name: details.name || base.name,
    headline: details.headline ?? base.headline,
    linkedinUrl: details.linkedinProfileUrl ?? details.linkedinUrl ?? null,
    profilePictureUrl: details.profilePictureUrl ?? base.avatarUrl ?? null,
    title: details.currentRole ?? base.currentRole,
    company: details.currentCompany ?? base.currentCompany,
    location: details.location || base.location,
    experienceYears: details.experienceYears ?? base.experienceYears,
    skills: details.skills?.length ? details.skills : base.skills,
    educationPreview: details.educationPreview ?? [],
    profileSignals: details.profileSignals ?? base.signals,
    rank: details.rank ?? 0,
    matchScore: details.matchScore ?? details.finalScore ?? null,
  });

  const summary =
    details.summary?.trim() ||
    details.recommendation?.trim() ||
    summaryCandidate.summary ||
    base.summary;
  const signals = normalizeLabelList(
    [
      ...(details.recommendation?.trim() && details.summary?.trim()
        ? [details.recommendation.trim()]
        : []),
      ...base.signals,
    ],
    12
  );

  return {
    ...base,
    ...summaryCandidate,
    id: base.id,
    avatarUrl: details.profilePictureUrl ?? summaryCandidate.avatarUrl ?? base.avatarUrl,
    headline: details.headline?.trim() || summaryCandidate.headline || base.headline,
    summary,
    signals: signals.length ? signals : summaryCandidate.signals,
    experience:
      details.experience && details.experience.length > 0
        ? details.experience
        : summaryCandidate.experience,
    education:
      details.education && details.education.length > 0
        ? details.education
        : summaryCandidate.education,
    matchBreakdown: details.matchBreakdown ?? summaryCandidate.matchBreakdown,
    skills: normalizeLabelList(
      details.skills?.length ? details.skills : base.skills,
      24
    ),
  };
}
