import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { RevealResult } from "./candidates";
import type {
  PeopleScoutApi,
  ScoutLookupInput,
  ScoutLookupResponse,
  ScoutQuota,
  ScoutRevealInput,
} from "./people-scout";
import {
  mapLookupToRecent,
  normalizeLookupPayload,
} from "./people-scout";
import { LOOKUP_QUOTA, RECENT_LOOKUPS, SCOUT_PROFILE } from "@/lib/mock-scout";

export type EasyScoutLookupInput = {
  input: string;
  type: "linkedin-url" | "linkedin-username" | "din";
};

const mockEasyScoutApi: PeopleScoutApi = {
  async getQuota() {
    await simulateMockLatency();
    return {
      limit: LOOKUP_QUOTA.total,
      used: LOOKUP_QUOTA.total - LOOKUP_QUOTA.remaining,
      remaining: LOOKUP_QUOTA.remaining,
      costPerLookup: LOOKUP_QUOTA.costPerLookup,
    };
  },
  async getRecentLookups() {
    await simulateMockLatency();
    return RECENT_LOOKUPS;
  },
  async getLookup() {
    await simulateMockLatency();
    return null;
  },
  async lookup(input) {
    await simulateMockLatency();
    return {
      id: "easy-1",
      resultStatus: "found",
      maskedInput: input.input.slice(0, 12) + "••••",
      displayInput: input.input,
      lookupType: input.type.replace(/-/g, "_"),
      charged: true,
      cacheHit: false,
      creditsUsed: 1,
      saved: false,
      contactRevealed: "none",
      revealStatus: {
        email: { revealed: false, status: null, values: [] },
        phone: { revealed: false, status: null, values: [] },
      },
      createdAt: new Date().toISOString(),
      performedBy: "You",
      profile: { ...SCOUT_PROFILE, id: "easy-1" },
      matches: [],
    } satisfies ScoutLookupResponse;
  },
  async revealContact({ type }) {
    await simulateMockLatency();
    const value =
      type === "email" ? "candidate@example.com" : "+91 98XXX XX000";
    return {
      found: true,
      charged: true,
      source: "provider",
      contactType: type,
      values: [value],
      value,
      creditsCharged: type === "email" ? 2 : 5,
      candidateId: "easy-1",
    };
  },
  async saveToPool() {
    await simulateMockLatency();
    return { created: true, candidateId: "pool-easy-1" };
  },
};

const liveEasyScoutApi: PeopleScoutApi = {
  async getQuota() {
    const result = await apiClient.get<ScoutQuota>("/easy-scout/quota");
    return result.data;
  },
  async getRecentLookups() {
    const result = await apiClient.get<{ items: ScoutLookupResponse[] }>(
      "/easy-scout/lookups"
    );
    const items = Array.isArray(result.data)
      ? result.data
      : (result.data.items ?? []);
    return items.map((item) =>
      mapLookupToRecent(
        normalizeLookupPayload(item as unknown as Record<string, unknown>)
      )
    );
  },
  async getLookup(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(
        `/easy-scout/lookups/${id}`
      );
      return normalizeLookupPayload(result.data);
    } catch {
      return null;
    }
  },
  async lookup(input: ScoutLookupInput) {
    const result = await apiClient.post<Record<string, unknown>>(
      "/easy-scout/lookups",
      input
    );
    return normalizeLookupPayload(result.data);
  },
  async revealContact({ lookupId, type }: ScoutRevealInput) {
    const result = await apiClient.post<RevealResult>(
      `/easy-scout/lookups/${lookupId}/reveal/${type}`,
      {},
      { sensitive: true, timeoutMs: 60_000 }
    );
    return result.data;
  },
  async saveToPool(lookupId, listId) {
    const result = await apiClient.post<{
      created: boolean;
      candidate?: { id: string };
    }>(`/easy-scout/lookups/${lookupId}/save`, { listId: listId ?? null });
    return {
      created: result.data.created,
      candidateId: result.data.candidate?.id,
    };
  },
};

export const easyScoutApi = createDomainService({
  mock: mockEasyScoutApi,
  live: liveEasyScoutApi,
});
