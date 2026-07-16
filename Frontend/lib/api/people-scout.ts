import { apiClient } from "./client";
import type { RecentLookup, ScoutProfile } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { RevealResult } from "./candidates";

export type ScoutLookupInput = {
  input: string;
  type: "linkedin-url" | "linkedin-username" | "email";
};

export type ScoutRevealInput = {
  profileId: string;
  linkedinUrl: string;
  type: "email" | "mobile";
};

export interface PeopleScoutApi {
  getRecentLookups(): Promise<RecentLookup[]>;
  getProfile(id: string): Promise<ScoutProfile | null>;
  lookup(input: ScoutLookupInput): Promise<RecentLookup>;
  revealContact(input: ScoutRevealInput): Promise<RevealResult>;
}

const mockPeopleScoutApi: PeopleScoutApi = {
  async getRecentLookups() {
    await simulateMockLatency();
    const { RECENT_LOOKUPS } = await import("@/lib/mock-scout");
    return RECENT_LOOKUPS;
  },
  async getProfile(id) {
    await simulateMockLatency();
    const { SCOUT_PROFILE } = await import("@/lib/mock-scout");
    return id === SCOUT_PROFILE.id ? SCOUT_PROFILE : null;
  },
  async lookup(input) {
    await simulateMockLatency();
    const { RECENT_LOOKUPS } = await import("@/lib/mock-scout");
    return { ...RECENT_LOOKUPS[0]!, input: input.input };
  },
  async revealContact({ profileId, type }) {
    await simulateMockLatency();
    const value = type === "email" ? "scout@example.com" : "+919999988888";
    return {
      found: true,
      charged: true,
      source: "provider",
      contactType: type,
      values: [value],
      value,
      creditsCharged: type === "email" ? 2 : 5,
      candidateId: profileId,
    };
  },
};

const livePeopleScoutApi: PeopleScoutApi = {
  async getRecentLookups() {
    const result = await apiClient.get<RecentLookup[]>("/people-scout/lookups");
    return result.data;
  },
  async getProfile(id) {
    const result = await apiClient.get<ScoutProfile>(`/people-scout/profiles/${id}`);
    return result.data;
  },
  async lookup(input) {
    const result = await apiClient.post<RecentLookup>("/people-scout/lookup", input);
    return result.data;
  },
  async revealContact({ profileId, linkedinUrl, type }) {
    const result = await apiClient.post<RevealResult>(
      `/people-scout/profiles/${profileId}/reveal`,
      { type, linkedinUrl },
      { sensitive: true }
    );
    return result.data;
  },
};

export const peopleScoutApi = createDomainService({
  mock: mockPeopleScoutApi,
  live: livePeopleScoutApi,
});
