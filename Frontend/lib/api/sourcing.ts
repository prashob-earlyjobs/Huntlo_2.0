import { apiClient } from "./client";
import type { SearchHistoryEntry, SessionCandidate, SourcingSession } from "./contracts";
import { normalizeLabelList } from "@/lib/normalize-label-list";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type { InterpretedCriterion } from "@/lib/mock-search";
import type { SessionState } from "@/lib/mock-sessions";

export type SourcingListParams = ApiQueryParams & {
  status?: string;
  jobId?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type SourcingInterpretResult = {
  query: string;
  interpretedCriteria: InterpretedCriterion[];
  normalizedFilters: Record<string, unknown> | null;
  requiresConfirmation: boolean;
};

export type SourcingProgress = {
  sessionId: string;
  status: string;
  progress: number;
  totalResults: number;
  estimatedResults: number;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type SourcingSessionApi = SourcingSession & {
  status?: string;
  progress?: number;
  estimatedResults?: number;
  naturalLanguageQuery?: string;
  interpretedCriteria?: InterpretedCriterion[];
  normalizedFilters?: Record<string, unknown> | null;
  requiresConfirmation?: boolean;
  message?: string;
  coverage?: number;
  externalSessionId?: string | null;
  saved?: boolean;
  savedAt?: string | null;
  savedListId?: string | null;
};

export type SourcedCandidateApi = {
  id: string;
  sourcingSessionId: string;
  externalCandidateId: string;
  name: string;
  headline: string | null;
  linkedinUrl: string | null;
  profilePictureUrl?: string | null;
  title: string | null;
  company: string | null;
  location: string;
  experienceYears: number | null;
  skills: string[];
  educationPreview: unknown[];
  profileSignals: string[];
  rank: number;
  matchScore: number | null;
  saved?: boolean;
};

export type CreateSourcingSessionInput = {
  query: string;
  name?: string;
  jobId?: string | null;
  filters?: Record<string, unknown>;
  interpretedCriteria?: InterpretedCriterion[];
  confirmFilters?: boolean;
  run?: boolean;
};

/** Map backend session statuses onto the UI SessionState union. */
export function mapSessionState(status: string | undefined | null): SessionState {
  switch (status) {
    case "completed":
      return "completed";
    case "partial":
      return "partial";
    case "failed":
    case "cancelled":
      return "failed";
    case "draft":
      return "empty";
    case "queued":
    case "running":
    case "polling":
      return "running";
    default:
      return "running";
  }
}

export function mapApiSessionToUi(session: SourcingSessionApi): SourcingSession {
  const status = session.status ?? session.state;
  return {
    id: session.id,
    name: session.name,
    query: session.query ?? session.naturalLanguageQuery ?? "",
    resultCount: session.resultCount ?? session.estimatedResults ?? 0,
    date: session.date ?? new Date().toISOString(),
    relatedJobId: session.relatedJobId ?? null,
    relatedJobTitle: session.relatedJobTitle ?? null,
    owner: session.owner ?? "You",
    quotaUsed: session.quotaUsed ?? 0,
    state: mapSessionState(status),
    candidateIds: session.candidateIds ?? [],
    coverage: session.coverage ?? session.progress,
    failureReason: session.failureReason ?? undefined,
    isSavedSearch: Boolean(session.saved ?? session.isSavedSearch ?? session.savedAt),
    savedListId: session.savedListId ?? null,
  };
}

export function mapApiCandidateToSessionCandidate(
  candidate: SourcedCandidateApi
): SessionCandidate {
  const role = candidate.title ?? "";
  const company = candidate.company ?? "";
  const score =
    typeof candidate.matchScore === "number"
      ? Math.round(Math.min(100, Math.max(0, candidate.matchScore * 20)))
      : 70;

  return {
    id: candidate.id,
    name: candidate.name,
    headline:
      candidate.headline ??
      ([role, company].filter(Boolean).join(" · ") || "Sourced candidate"),
    currentRole: role || "—",
    currentCompany: company || "—",
    previousCompany: "—",
    location: candidate.location || "—",
    experienceYears: candidate.experienceYears ?? 0,
    skills: normalizeLabelList(candidate.skills, 24),
    matchScore: score,
    matchBreakdown: {
      skills: score,
      role: score,
      experience: score,
      location: score,
      industry: score,
      education: score,
    },
    contactStatus: "Not contacted",
    saved: Boolean(candidate.saved),
    linkedin: Boolean(candidate.linkedinUrl),
    avatarUrl: candidate.profilePictureUrl ?? null,
    email: "",
    emailVerified: false,
    phone: "",
    phoneVerified: false,
    emailRevealed: false,
    phoneRevealed: false,
    education: [],
    experience: company
      ? [
          {
            company,
            role: role || "—",
            duration: "Current",
            description: "",
            current: true,
          },
        ]
      : [],
    summary: normalizeLabelList(candidate.profileSignals, 12).join(" · ") || "",
    signals: normalizeLabelList(candidate.profileSignals, 12),
    status: "Active",
    updated: "Just now",
    activity: [
      {
        id: `act-${candidate.id}`,
        kind: "sourced",
        title: `${candidate.name} sourced from AI search`,
        time: "Just now",
      },
    ],
    similar: [],
  };
}

export function mapApiSessionToHistoryEntry(
  session: SourcingSessionApi
): SearchHistoryEntry {
  return {
    id: session.id,
    sessionId: session.id,
    name: session.name,
    query: session.query ?? session.naturalLanguageQuery ?? "",
    relatedJob: session.relatedJobTitle ?? null,
    results: session.resultCount ?? 0,
    saved: 0,
    owner: session.owner ?? "You",
    date: session.date ?? "",
    usage: session.quotaUsed ?? 0,
    state: mapSessionState(session.status ?? session.state),
  };
}

export interface SourcingApi {
  interpret(query: string): Promise<SourcingInterpretResult>;
  listSessions(params?: SourcingListParams): Promise<SourcingSessionApi[]>;
  listHistory(): Promise<SearchHistoryEntry[]>;
  getSession(id: string): Promise<SourcingSessionApi | null>;
  getSessionCandidates(id: string): Promise<SessionCandidate[]>;
  /** Raw sourcing results (includes LinkedIn URL / external IDs for pool sync). */
  getSessionResults(id: string): Promise<SourcedCandidateApi[]>;
  getProgress(id: string): Promise<SourcingProgress>;
  createSession(body: CreateSourcingSessionInput): Promise<SourcingSessionApi>;
  startSession(body: {
    query: string;
    jobId?: string | null;
  }): Promise<SourcingSession>;
  runSession(id: string): Promise<SourcingSessionApi>;
  cancelSession(id: string): Promise<SourcingSessionApi>;
  rerunSession(id: string): Promise<SourcingSessionApi>;
  duplicateSession(id: string): Promise<SourcingSessionApi>;
  deleteSession(id: string): Promise<{ id: string; deleted: boolean }>;
}

const mockSourcingApi: SourcingApi = {
  async interpret(query) {
    await simulateMockLatency();
    const { INTERPRETED_CRITERIA, INTERPRETED_FILTER_STATE } = await import(
      "@/lib/mock-search"
    );
    return {
      query,
      interpretedCriteria: INTERPRETED_CRITERIA,
      normalizedFilters: INTERPRETED_FILTER_STATE as unknown as Record<string, unknown>,
      requiresConfirmation: true,
    };
  },
  async listSessions() {
    await simulateMockLatency();
    const { SOURCING_SESSIONS } = await import("@/lib/mock-sessions");
    return SOURCING_SESSIONS.map((session) => ({
      ...session,
      status: session.state,
    }));
  },
  async listHistory() {
    await simulateMockLatency();
    const { SEARCH_HISTORY } = await import("@/lib/mock-sessions");
    return SEARCH_HISTORY;
  },
  async getSession(id) {
    await simulateMockLatency();
    const { getSession } = await import("@/lib/mock-sessions");
    const session = getSession(id);
    return session ? { ...session, status: session.state } : null;
  },
  async getSessionCandidates(id) {
    await simulateMockLatency();
    const { getSession, getSessionCandidates } = await import("@/lib/mock-sessions");
    const session = getSession(id);
    if (!session) return [];
    return getSessionCandidates(session);
  },
  async getSessionResults(id) {
    const candidates = await this.getSessionCandidates(id);
    return candidates.map((candidate, index) => ({
      id: candidate.id,
      sourcingSessionId: id,
      externalCandidateId: candidate.id,
      name: candidate.name,
      headline: candidate.headline || null,
      linkedinUrl: null,
      title: candidate.currentRole === "—" ? null : candidate.currentRole,
      company: candidate.currentCompany === "—" ? null : candidate.currentCompany,
      location: candidate.location,
      experienceYears: candidate.experienceYears,
      skills: candidate.skills,
      educationPreview: [],
      profileSignals: candidate.signals,
      rank: index + 1,
      matchScore: candidate.matchScore / 20,
    }));
  },
  async getProgress(id) {
    await simulateMockLatency();
    const session = await this.getSession(id);
    return {
      sessionId: id,
      status: session?.status ?? "completed",
      progress: session?.coverage ?? 100,
      totalResults: session?.resultCount ?? 0,
      estimatedResults: session?.resultCount ?? 0,
      errorMessage: session?.failureReason ?? null,
    };
  },
  async createSession(body) {
    await simulateMockLatency();
    const { SOURCING_SESSIONS } = await import("@/lib/mock-sessions");
    const session = SOURCING_SESSIONS[0]!;
    return {
      ...session,
      query: body.query,
      relatedJobId: body.jobId ?? session.relatedJobId,
      status: body.run ? "running" : "draft",
      requiresConfirmation: !body.confirmFilters && body.run,
    };
  },
  async startSession(body) {
    const session = await this.createSession({
      query: body.query,
      jobId: body.jobId,
      confirmFilters: true,
      run: true,
    });
    return mapApiSessionToUi(session);
  },
  async runSession(id) {
    const session = await this.getSession(id);
    if (!session) throw new Error("Session not found");
    return { ...session, status: "running", state: "running" };
  },
  async cancelSession(id) {
    const session = await this.getSession(id);
    if (!session) throw new Error("Session not found");
    return { ...session, status: "cancelled", state: "failed" };
  },
  async rerunSession(id) {
    return this.runSession(id);
  },
  async duplicateSession(id) {
    const session = await this.getSession(id);
    if (!session) throw new Error("Session not found");
    return { ...session, id: `${id}-copy`, status: "draft", state: "empty" };
  },
  async deleteSession(id) {
    await simulateMockLatency();
    return { id, deleted: true };
  },
};

const liveSourcingApi: SourcingApi = {
  async interpret(query) {
    const result = await apiClient.post<SourcingInterpretResult>(
      "/sourcing/interpret",
      { query },
      { sensitive: false }
    );
    return result.data;
  },
  async listSessions(params) {
    const qs = buildQueryString(params ?? {});
    const result = await apiClient.get<{ items: SourcingSessionApi[] }>(
      `/sourcing/sessions${qs}`
    );
    return result.data.items ?? [];
  },
  async listHistory() {
    const sessions = await this.listSessions({ limit: 100, sort: "-createdAt" });
    return sessions.map(mapApiSessionToHistoryEntry);
  },
  async getSession(id) {
    try {
      const result = await apiClient.get<SourcingSessionApi>(`/sourcing/sessions/${id}`);
      return result.data;
    } catch {
      return null;
    }
  },
  async getSessionCandidates(id) {
    const items = await this.getSessionResults(id);
    return items.map(mapApiCandidateToSessionCandidate);
  },
  async getSessionResults(id) {
    const result = await apiClient.get<{ items: SourcedCandidateApi[] }>(
      `/sourcing/sessions/${id}/results?limit=300`
    );
    return result.data.items ?? [];
  },
  async getProgress(id) {
    const result = await apiClient.get<SourcingProgress>(
      `/sourcing/sessions/${id}/progress`
    );
    return result.data;
  },
  async createSession(body) {
    const result = await apiClient.post<SourcingSessionApi>(
      "/sourcing/sessions",
      body,
      { sensitive: false }
    );
    return result.data;
  },
  async startSession(body) {
    const session = await this.createSession({
      query: body.query,
      jobId: body.jobId,
      confirmFilters: true,
      run: true,
    });
    return mapApiSessionToUi(session);
  },
  async runSession(id) {
    const result = await apiClient.post<SourcingSessionApi>(
      `/sourcing/sessions/${id}/run`,
      {},
      { sensitive: false }
    );
    return result.data;
  },
  async cancelSession(id) {
    const result = await apiClient.post<SourcingSessionApi>(
      `/sourcing/sessions/${id}/cancel`,
      {},
      { sensitive: false }
    );
    return result.data;
  },
  async rerunSession(id) {
    const result = await apiClient.post<SourcingSessionApi>(
      `/sourcing/sessions/${id}/rerun`,
      {},
      { sensitive: false }
    );
    return result.data;
  },
  async duplicateSession(id) {
    const result = await apiClient.post<SourcingSessionApi>(
      `/sourcing/sessions/${id}/duplicate`,
      {},
      { sensitive: false }
    );
    return result.data;
  },
  async deleteSession(id) {
    const result = await apiClient.delete<{ id: string; deleted: boolean }>(
      `/sourcing/sessions/${id}`
    );
    return result.data;
  },
};

export const sourcingApi = createDomainService({
  mock: mockSourcingApi,
  live: liveSourcingApi,
});
