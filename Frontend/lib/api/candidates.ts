import { apiClient } from "./client";
import type { PoolCandidate, SavedList } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export type RevealContactType = "email" | "mobile";

export type RevealContactInput = {
  candidateId: string;
  type: RevealContactType;
};

export type RevealResult = {
  found: boolean;
  charged: boolean;
  source: "previous_reveal" | "shared_cache" | "provider" | "missing";
  contactType: RevealContactType;
  values: string[];
  value: string;
  creditsCharged: number;
  candidateId: string;
};

export type RevealStatus = {
  candidateId: string;
  email: { revealed: boolean; revealedAt: string | null };
  mobile: { revealed: boolean; revealedAt: string | null };
};

export type BulkRevealItemInput = {
  candidateId: string;
  contactTypes: RevealContactType[];
};

export type BulkRevealJob = {
  id: string;
  status: string;
  progress: number;
  counts: {
    success: number;
    cacheHit: number;
    previouslyRevealed: number;
    missing: number;
    failed: number;
    quotaExhausted: number;
  };
};

export type RevealedContactsLookup = {
  items: Array<{
    candidateId: string | null;
    linkedinUrl: string | null;
    email: { revealed: boolean; values: string[] };
    mobile: { revealed: boolean; values: string[] };
  }>;
};

export type CandidateDetail = {
  id: string;
  name?: string;
  basicProfile?: {
    name: string;
    headline?: string | null;
    linkedinUrl?: string | null;
  };
  revealStatus?: {
    email: { revealed: boolean; values?: string[] };
    mobile: { revealed: boolean; values?: string[] };
  };
  [key: string]: unknown;
};

export interface CandidatesApi {
  list(params?: ApiQueryParams): Promise<PoolCandidate[]>;
  getById(id: string): Promise<PoolCandidate | CandidateDetail | null>;
  listSavedLists(): Promise<SavedList[]>;
  enrich(candidateId: string): Promise<CandidateDetail>;
  revealContact(input: RevealContactInput): Promise<RevealResult>;
  getRevealStatus(candidateId: string): Promise<RevealStatus>;
  getActivity(candidateId: string): Promise<unknown[]>;
  bulkReveal(items: BulkRevealItemInput[]): Promise<BulkRevealJob>;
  getBulkRevealJob(jobId: string): Promise<BulkRevealJob>;
  lookupRevealedContacts(input: {
    candidateIds?: string[];
    linkedinUrls?: string[];
  }): Promise<RevealedContactsLookup>;
}

const mockCandidatesApi: CandidatesApi = {
  async list() {
    await simulateMockLatency();
    const { POOL_CANDIDATES } = await import("@/lib/mock-candidates");
    return POOL_CANDIDATES;
  },
  async getById(id) {
    await simulateMockLatency();
    const { getPoolCandidate } = await import("@/lib/mock-candidates");
    return getPoolCandidate(id) ?? null;
  },
  async listSavedLists() {
    await simulateMockLatency();
    const { SAVED_LISTS } = await import("@/lib/mock-candidates");
    return SAVED_LISTS;
  },
  async enrich(candidateId) {
    const candidate = await this.getById(candidateId);
    if (!candidate) throw new Error("Candidate not found");
    return candidate as CandidateDetail;
  },
  async revealContact({ candidateId, type }) {
    await simulateMockLatency();
    const value =
      type === "email" ? "revealed@example.com" : "+919876543210";
    return {
      found: true,
      charged: true,
      source: "provider",
      contactType: type,
      values: [value],
      value,
      creditsCharged: type === "email" ? 2 : 5,
      candidateId,
    };
  },
  async getRevealStatus(candidateId) {
    await simulateMockLatency();
    return {
      candidateId,
      email: { revealed: false, revealedAt: null },
      mobile: { revealed: false, revealedAt: null },
    };
  },
  async getActivity() {
    await simulateMockLatency();
    return [];
  },
  async bulkReveal(items) {
    await simulateMockLatency();
    return {
      id: "bulk-mock-1",
      status: "completed",
      progress: 100,
      counts: {
        success: items.length,
        cacheHit: 0,
        previouslyRevealed: 0,
        missing: 0,
        failed: 0,
        quotaExhausted: 0,
      },
    };
  },
  async getBulkRevealJob(jobId) {
    await simulateMockLatency();
    return {
      id: jobId,
      status: "completed",
      progress: 100,
      counts: {
        success: 0,
        cacheHit: 0,
        previouslyRevealed: 0,
        missing: 0,
        failed: 0,
        quotaExhausted: 0,
      },
    };
  },
  async lookupRevealedContacts() {
    await simulateMockLatency();
    return { items: [] };
  },
};

const liveCandidatesApi: CandidatesApi = {
  async list(params) {
    const result = await apiClient.get<{ items?: PoolCandidate[] } | PoolCandidate[]>(
      `/candidates${buildQueryString(params)}`
    );
    const data = result.data;
    if (Array.isArray(data)) return data;
    return data.items ?? [];
  },
  async getById(id) {
    try {
      const result = await apiClient.get<CandidateDetail>(`/candidates/${id}`);
      return result.data;
    } catch {
      return null;
    }
  },
  async listSavedLists() {
    const result = await apiClient.get<SavedList[]>("/candidates/lists");
    return result.data;
  },
  async enrich(candidateId) {
    const result = await apiClient.post<CandidateDetail>(
      `/candidates/${candidateId}/enrich`,
      {},
      { sensitive: false }
    );
    return result.data;
  },
  async revealContact({ candidateId, type }) {
    const path =
      type === "email"
        ? `/candidates/${candidateId}/reveal/email`
        : `/candidates/${candidateId}/reveal/mobile`;
    const result = await apiClient.post<RevealResult>(path, {}, { sensitive: true });
    return result.data;
  },
  async getRevealStatus(candidateId) {
    const result = await apiClient.get<RevealStatus>(
      `/candidates/${candidateId}/reveal-status`
    );
    return result.data;
  },
  async getActivity(candidateId) {
    const result = await apiClient.get<{ items?: unknown[] } | unknown[]>(
      `/candidates/${candidateId}/activity`
    );
    const data = result.data;
    return Array.isArray(data) ? data : data.items ?? [];
  },
  async bulkReveal(items) {
    const result = await apiClient.post<BulkRevealJob>(
      "/candidates/reveal/bulk",
      { items },
      { sensitive: true }
    );
    return result.data;
  },
  async getBulkRevealJob(jobId) {
    const result = await apiClient.get<BulkRevealJob>(
      `/candidates/reveal/bulk/${jobId}`
    );
    return result.data;
  },
  async lookupRevealedContacts(input) {
    const result = await apiClient.post<RevealedContactsLookup>(
      "/candidates/revealed-contacts/lookup",
      input,
      { sensitive: false }
    );
    return result.data;
  },
};

export const candidatesApi = createDomainService({
  mock: mockCandidatesApi,
  live: liveCandidatesApi,
});

/** Map UI "phone" kind to API "mobile". */
export function uiRevealKindToType(kind: "email" | "phone"): RevealContactType {
  return kind === "phone" ? "mobile" : "email";
}
