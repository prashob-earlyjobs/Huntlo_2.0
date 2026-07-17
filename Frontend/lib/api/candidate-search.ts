import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import { buildQueryString } from "./types";

export type CandidateFilterForm = Record<string, unknown>;

export type SearchAnnotationResponse = {
  success: true;
  filterForm: CandidateFilterForm;
  annotation?: unknown;
  futureJobs?: unknown;
};

export type SearchApplyResponse = {
  success: true;
  prompt: string;
  sessionId: string;
  savedSessionId: string;
  sessionUpdated: boolean;
  page: number;
  limit: number;
  canFetchMore: boolean;
  filterForm: CandidateFilterForm;
  sessionPayload?: Record<string, unknown>;
  candidates: CandidateSearchSummary[];
  profilesPagination: SearchPagination;
  polling: boolean;
  partial?: boolean;
  regionExpandFallbackUsed?: boolean;
};

export type SearchPendingResponse = {
  success: false;
  sessionPending: true;
  fjStatusCode: 207;
  sessionId: string;
  savedSessionId?: string;
  message: string;
  filterForm: CandidateFilterForm;
};

export type SearchApplyResult = SearchApplyResponse | SearchPendingResponse;

export type SearchPagination = {
  totalDocs: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CandidateSearchSummary = {
  id: string;
  candidateId: string;
  sourcingSessionId: string;
  sessionId: string | null;
  name: string;
  headline?: string | null;
  currentRole: string | null;
  currentCompany: string | null;
  location: string;
  experienceYears: number | null;
  skills: string[];
  educationPreview?: unknown[];
  finalScore?: number | null;
  matchScore?: number | null;
  linkedinProfileUrl?: string | null;
  linkedinUrl?: string | null;
  profileSignals?: string[];
  rank?: number;
  contactStatus?: string;
};

export type StoredCandidatesResponse = {
  success: true;
  sessionId: string | null;
  savedSessionId: string;
  fromStored?: boolean;
  candidates: CandidateSearchSummary[];
  profilesPagination: SearchPagination;
  status?: string;
  polling?: boolean;
  canFetchMore?: boolean;
  filterForm?: CandidateFilterForm | null;
  prompt?: string;
  sessionTitle?: string;
  totalDocs?: number;
  createdAt?: string | null;
  lastPolledAt?: string | null;
};

export type FetchMoreResponse = {
  success: true;
  sessionId: string;
  savedSessionId: string;
  candidates: CandidateSearchSummary[];
  newlyAddedCount: number;
  storedProfileCount: number;
  totalDocs: number;
  canFetchMore: boolean;
  profilesPagination: SearchPagination;
  polling: boolean;
};

export type SourcingSessionSummary = {
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

/** Apply/create/fetch-more can wait 20s + poll up to ~90s on the server. */
const LONG_SEARCH_TIMEOUT_MS = 120_000;

async function rawPost<T>(
  path: string,
  body: unknown,
  options?: { timeoutMs?: number }
): Promise<T> {
  const result = await apiClient.request<T>(path, {
    method: "POST",
    body,
    raw: true,
    sensitive: false,
    timeoutMs: options?.timeoutMs,
  });
  return result.data;
}

async function rawGet<T>(path: string): Promise<T> {
  const result = await apiClient.request<T>(path, {
    method: "GET",
    raw: true,
  });
  return result.data;
}

export interface CandidateSearchApi {
  annotateCandidateSearch(input: {
    prompt: string;
    linkedin_profile_url?: string;
  }): Promise<SearchAnnotationResponse>;
  autocompleteCandidateFilter(input: {
    filter_type?: string;
    query: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<{ success: true; filterType: string; query: string; suggestions: unknown[] }>;
  createCandidateSearchSession(input: {
    prompt: string;
    filterForm?: CandidateFilterForm;
    session?: Record<string, unknown>;
    jobId?: string | null;
  }): Promise<SearchApplyResult | { success: true; sessionId: string; savedSessionId: string }>;
  applyCandidateSearch(input: {
    prompt: string;
    filterForm: CandidateFilterForm;
    sessionId?: string;
    page?: number;
    limit?: number;
    jobId?: string | null;
  }): Promise<SearchApplyResult>;
  getSourcingSessionProfiles(
    sessionId: string,
    params?: { page?: number; limit?: number }
  ): Promise<StoredCandidatesResponse>;
  getStoredSessionCandidates(
    sessionId: string,
    params?: { page?: number; limit?: number; all?: boolean; metaOnly?: boolean }
  ): Promise<StoredCandidatesResponse>;
  fetchMoreCandidates(
    sessionId: string,
    body?: { page?: number; limit?: number }
  ): Promise<FetchMoreResponse>;
  getAllSourcedCandidates(params?: {
    page?: number;
    limit?: number;
    sessionId?: string;
    q?: string;
  }): Promise<{
    success: true;
    page: number;
    limit: number;
    search: string;
    totalInScope: number;
    candidates: CandidateSearchSummary[];
    profilesPagination: SearchPagination;
  }>;
  getCandidateDetails(
    candidateId: string,
    params?: { sessionId?: string }
  ): Promise<{ success: true; fromStored: boolean; candidate: CandidateSearchSummary }>;
  getSourcingSessions(params?: { limit?: number }): Promise<{
    success: true;
    sessions: SourcingSessionSummary[];
  }>;
  getRecentSearches(params?: { limit?: number }): Promise<{
    success: true;
    recentSearches: Array<{
      savedSessionId: string;
      sessionId: string | null;
      title: string;
      prompt: string;
      resultCount: number;
      status: string;
      createdAt: string | null;
    }>;
  }>;
}

const mockCandidateSearchApi: CandidateSearchApi = {
  async annotateCandidateSearch({ prompt }) {
    await simulateMockLatency();
    const { INTERPRETED_FILTER_STATE } = await import("@/lib/mock-search");
    return {
      success: true,
      filterForm: INTERPRETED_FILTER_STATE as unknown as CandidateFilterForm,
      annotation: { prompt },
    };
  },
  async autocompleteCandidateFilter({ query, filter_type }) {
    await simulateMockLatency();
    return {
      success: true,
      filterType: filter_type ?? "region",
      query,
      suggestions: query.length >= 3 ? [`${query}apura`, `${query}alore`] : [],
    };
  },
  async createCandidateSearchSession() {
    await simulateMockLatency();
    return {
      success: true,
      sessionId: "mock-fj-session",
      savedSessionId: "mock-saved-session",
    };
  },
  async applyCandidateSearch({ prompt, filterForm }) {
    await simulateMockLatency();
    return {
      success: true,
      prompt,
      sessionId: "mock-fj-session",
      savedSessionId: "mock-saved-session",
      sessionUpdated: false,
      page: 1,
      limit: 20,
      canFetchMore: false,
      filterForm,
      candidates: [],
      profilesPagination: {
        totalDocs: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      polling: false,
    };
  },
  async getSourcingSessionProfiles(sessionId) {
    await simulateMockLatency();
    return {
      success: true,
      sessionId,
      savedSessionId: sessionId,
      fromStored: true,
      candidates: [],
      profilesPagination: {
        totalDocs: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },
  async getStoredSessionCandidates(sessionId) {
    return this.getSourcingSessionProfiles(sessionId);
  },
  async fetchMoreCandidates(sessionId) {
    await simulateMockLatency();
    return {
      success: true,
      sessionId,
      savedSessionId: sessionId,
      candidates: [],
      newlyAddedCount: 0,
      storedProfileCount: 0,
      totalDocs: 0,
      canFetchMore: false,
      profilesPagination: {
        totalDocs: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      polling: false,
    };
  },
  async getAllSourcedCandidates() {
    await simulateMockLatency();
    return {
      success: true,
      page: 1,
      limit: 20,
      search: "",
      totalInScope: 0,
      candidates: [],
      profilesPagination: {
        totalDocs: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },
  async getCandidateDetails(candidateId) {
    await simulateMockLatency();
    return {
      success: true,
      fromStored: true,
      candidate: {
        id: candidateId,
        candidateId,
        sourcingSessionId: "",
        sessionId: null,
        name: "Mock Candidate",
        currentRole: null,
        currentCompany: null,
        location: "",
        experienceYears: null,
        skills: [],
      },
    };
  },
  async getSourcingSessions() {
    await simulateMockLatency();
    return { success: true, sessions: [] };
  },
  async getRecentSearches() {
    await simulateMockLatency();
    return { success: true, recentSearches: [] };
  },
};

const liveCandidateSearchApi: CandidateSearchApi = {
  async annotateCandidateSearch(input) {
    return rawPost<SearchAnnotationResponse>("/candidates/search/annotate", {
      prompt: input.prompt,
      linkedin_profile_url: input.linkedin_profile_url ?? "",
    });
  },
  async autocompleteCandidateFilter(input) {
    const qs = buildQueryString({
      filter_type: input.filter_type ?? "region",
      query: input.query,
      limit: input.limit ?? 10,
    });
    const result = await apiClient.request<{
      success: true;
      filterType: string;
      query: string;
      suggestions: unknown[];
    }>(`/candidates/filters/autocomplete${qs}`, {
      method: "GET",
      raw: true,
      signal: input.signal,
    });
    return result.data;
  },
  async createCandidateSearchSession(input) {
    return rawPost("/candidates/search/create", input, {
      timeoutMs: LONG_SEARCH_TIMEOUT_MS,
    });
  },
  async applyCandidateSearch(input) {
    return rawPost<SearchApplyResult>(
      "/candidates/search/apply",
      {
        prompt: input.prompt,
        filterForm: input.filterForm,
        sessionId: input.sessionId ?? "",
        page: input.page ?? 1,
        limit: input.limit ?? 20,
        jobId: input.jobId ?? null,
      },
      { timeoutMs: LONG_SEARCH_TIMEOUT_MS }
    );
  },
  async getSourcingSessionProfiles(sessionId, params) {
    const qs = buildQueryString(params ?? {});
    return rawGet(`/candidates/session/${encodeURIComponent(sessionId)}/profiles${qs}`);
  },
  async getStoredSessionCandidates(sessionId, params) {
    const qs = buildQueryString({
      page: params?.page,
      limit: params?.limit,
      ...(params?.all ? { all: "1" } : {}),
      ...(params?.metaOnly ? { metaOnly: "1" } : {}),
    });
    return rawGet(
      `/candidates/session/${encodeURIComponent(sessionId)}/stored-candidates${qs}`
    );
  },
  async fetchMoreCandidates(sessionId, body) {
    return rawPost(
      `/candidates/session/${encodeURIComponent(sessionId)}/fetch-more`,
      body ?? {},
      { timeoutMs: LONG_SEARCH_TIMEOUT_MS }
    );
  },
  async getAllSourcedCandidates(params) {
    const qs = buildQueryString(params ?? {});
    return rawGet(`/candidates/all${qs}`);
  },
  async getCandidateDetails(candidateId, params) {
    const qs = buildQueryString(params ?? {});
    return rawGet(
      `/candidates/candidate/${encodeURIComponent(candidateId)}/details${qs}`
    );
  },
  async getSourcingSessions(params) {
    const qs = buildQueryString(params ?? { limit: 50 });
    // Wrapped in successResponse data envelope
    const result = await apiClient.get<{
      success: true;
      sessions: SourcingSessionSummary[];
    }>(`/candidates/sessions${qs}`);
    return result.data;
  },
  async getRecentSearches(params) {
    const qs = buildQueryString(params ?? { limit: 6 });
    return rawGet(`/candidates/recent-searches${qs}`);
  },
};

export const candidateSearchApi = createDomainService({
  mock: mockCandidateSearchApi,
  live: liveCandidateSearchApi,
});

export async function annotateCandidateSearch(
  input: Parameters<CandidateSearchApi["annotateCandidateSearch"]>[0]
) {
  return candidateSearchApi.annotateCandidateSearch(input);
}

export async function autocompleteCandidateFilter(
  input: Parameters<CandidateSearchApi["autocompleteCandidateFilter"]>[0]
) {
  return candidateSearchApi.autocompleteCandidateFilter(input);
}

export async function createCandidateSearchSession(
  input: Parameters<CandidateSearchApi["createCandidateSearchSession"]>[0]
) {
  return candidateSearchApi.createCandidateSearchSession(input);
}

export async function applyCandidateSearch(
  input: Parameters<CandidateSearchApi["applyCandidateSearch"]>[0]
) {
  return candidateSearchApi.applyCandidateSearch(input);
}

export async function getSourcingSessionProfiles(
  sessionId: string,
  params?: { page?: number; limit?: number }
) {
  return candidateSearchApi.getSourcingSessionProfiles(sessionId, params);
}

export async function getStoredSessionCandidates(
  sessionId: string,
  params?: { page?: number; limit?: number; all?: boolean; metaOnly?: boolean }
) {
  return candidateSearchApi.getStoredSessionCandidates(sessionId, params);
}

export async function fetchMoreCandidates(
  sessionId: string,
  body?: { page?: number; limit?: number }
) {
  return candidateSearchApi.fetchMoreCandidates(sessionId, body);
}

export async function getAllSourcedCandidates(
  params?: Parameters<CandidateSearchApi["getAllSourcedCandidates"]>[0]
) {
  return candidateSearchApi.getAllSourcedCandidates(params);
}

export async function getCandidateDetails(
  candidateId: string,
  params?: { sessionId?: string }
) {
  return candidateSearchApi.getCandidateDetails(candidateId, params);
}

export async function getSourcingSessions(params?: { limit?: number }) {
  return candidateSearchApi.getSourcingSessions(params);
}

export async function getRecentSearches(params?: { limit?: number }) {
  return candidateSearchApi.getRecentSearches(params);
}
