import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { RevealResult } from "./candidates";
import type {
  LookupResult,
  LookupType,
  RecentLookup,
  ScoutMatchOption,
  ScoutProfile,
} from "@/lib/mock-scout";
import { LOOKUP_QUOTA, RECENT_LOOKUPS, SCOUT_MATCH_OPTIONS, SCOUT_PROFILE } from "@/lib/mock-scout";

export type ScoutLookupInput = {
  input: string;
  type: "linkedin-url" | "linkedin-username" | "email";
};

export type ScoutRevealInput = {
  lookupId: string;
  profileId?: string;
  linkedinUrl?: string;
  type: "email" | "mobile";
};

export type ScoutLookupResponse = {
  id: string;
  resultStatus: string;
  maskedInput: string;
  displayInput?: string;
  lookupType: string;
  charged: boolean;
  cacheHit: boolean;
  creditsUsed: number;
  saved: boolean;
  contactRevealed: string;
  createdAt: string;
  performedBy: string | null;
  profile: ScoutProfile | null;
  matches: ScoutMatchOption[];
  candidateSnapshot?: {
    name?: string;
    linkedinProfileUrl?: string;
  } | null;
};

export type ScoutQuota = {
  limit: number;
  used: number;
  remaining: number;
  costPerLookup: number;
};

export interface PeopleScoutApi {
  getQuota(): Promise<ScoutQuota>;
  getRecentLookups(): Promise<RecentLookup[]>;
  getLookup(id: string): Promise<ScoutLookupResponse | null>;
  lookup(input: ScoutLookupInput): Promise<ScoutLookupResponse>;
  revealContact(input: ScoutRevealInput): Promise<RevealResult>;
  saveToPool(lookupId: string, listId?: string | null): Promise<{
    created: boolean;
    candidateId?: string;
  }>;
}

const TYPE_TO_API: Record<LookupType, ScoutLookupInput["type"]> = {
  "LinkedIn URL": "linkedin-url",
  "LinkedIn Username": "linkedin-username",
  "Email Address": "email",
};

const API_TO_TYPE: Record<string, LookupType> = {
  linkedin_url: "LinkedIn URL",
  linkedin_username: "LinkedIn Username",
  email: "Email Address",
};

const RESULT_MAP: Record<string, LookupResult> = {
  found: "Found",
  multiple_matches: "Multiple matches",
  not_found: "Not found",
  invalid_input: "Failed",
  quota_exhausted: "Failed",
  provider_unavailable: "Failed",
  failed: "Failed",
};

const REVEAL_MAP: Record<string, RecentLookup["contactRevealed"]> = {
  email: "Email",
  mobile: "Phone",
  both: "Both",
  none: "None",
};

export function uiLookupTypeToApi(type: LookupType): ScoutLookupInput["type"] {
  return TYPE_TO_API[type];
}

export function mapLookupToRecent(item: ScoutLookupResponse): RecentLookup {
  const snapName = item.candidateSnapshot?.name ?? item.profile?.name ?? null;
  return {
    id: item.id,
    candidateName: snapName,
    input: item.displayInput || item.maskedInput,
    type: API_TO_TYPE[item.lookupType] ?? "LinkedIn URL",
    result: RESULT_MAP[item.resultStatus] ?? "Failed",
    contactRevealed: REVEAL_MAP[item.contactRevealed] ?? "None",
    saved: item.saved,
    date: formatRelativeDate(item.createdAt),
    performedBy: item.performedBy ?? "You",
    creditsUsed: item.creditsUsed,
    note: item.cacheHit ? "Served from workspace cache" : "",
  };
}

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapMatches(
  matches: Array<{
    name?: string;
    headline?: string;
    company?: string;
    location?: string;
    linkedinProfileUrl?: string;
  }>
): ScoutMatchOption[] {
  return matches.map((match, index) => {
    const url = match.linkedinProfileUrl ?? "";
    const username = url.match(/\/in\/([^/?#]+)/i)?.[1] ?? `match-${index}`;
    return {
      id: `${username}-${index}`,
      name: match.name ?? "Candidate",
      headline: match.headline ?? "",
      company: match.company ?? "",
      location: match.location ?? "",
      linkedinUsername: decodeURIComponent(username),
    };
  });
}

function normalizeLookupPayload(raw: Record<string, unknown>): ScoutLookupResponse {
  const matchesRaw = Array.isArray(raw.matches) ? raw.matches : [];
  const maskedInput = String(raw.maskedInput ?? "");
  const displayInput = String(raw.displayInput ?? "").trim() || maskedInput;
  return {
    id: String(raw.id ?? ""),
    resultStatus: String(raw.resultStatus ?? "failed"),
    maskedInput,
    displayInput,
    lookupType: String(raw.lookupType ?? ""),
    charged: Boolean(raw.charged),
    cacheHit: Boolean(raw.cacheHit),
    creditsUsed: Number(raw.creditsUsed ?? 0),
    saved: Boolean(raw.saved),
    contactRevealed: String(raw.contactRevealed ?? "none"),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    performedBy: (raw.performedBy as string | null) ?? null,
    profile: (raw.profile as ScoutProfile | null) ?? null,
    matches: mapMatches(matchesRaw as Parameters<typeof mapMatches>[0]),
    candidateSnapshot: (raw.candidateSnapshot as ScoutLookupResponse["candidateSnapshot"]) ?? null,
  };
}

const mockPeopleScoutApi: PeopleScoutApi = {
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
  async getLookup(id) {
    await simulateMockLatency();
    return id
      ? {
          id,
          resultStatus: "found",
          maskedInput: SCOUT_PROFILE.linkedinUrl,
          lookupType: "linkedin_url",
          charged: true,
          cacheHit: false,
          creditsUsed: 2,
          saved: false,
          contactRevealed: "none",
          createdAt: new Date().toISOString(),
          performedBy: "You",
          profile: SCOUT_PROFILE,
          matches: [],
        }
      : null;
  },
  async lookup(input) {
    await simulateMockLatency();
    const needle = input.input.toLowerCase();
    if (needle.includes("quota")) {
      return {
        id: "lk-quota",
        resultStatus: "quota_exhausted",
        maskedInput: input.input,
        lookupType: input.type.replace(/-/g, "_"),
        charged: false,
        cacheHit: false,
        creditsUsed: 0,
        saved: false,
        contactRevealed: "none",
        createdAt: new Date().toISOString(),
        performedBy: "You",
        profile: null,
        matches: [],
      };
    }
    if (needle.includes("offline")) {
      return {
        id: "lk-offline",
        resultStatus: "provider_unavailable",
        maskedInput: input.input,
        lookupType: input.type.replace(/-/g, "_"),
        charged: false,
        cacheHit: false,
        creditsUsed: 0,
        saved: false,
        contactRevealed: "none",
        createdAt: new Date().toISOString(),
        performedBy: "You",
        profile: null,
        matches: [],
      };
    }
    if (needle.includes("notfound")) {
      return {
        id: "lk-missing",
        resultStatus: "not_found",
        maskedInput: input.input,
        lookupType: input.type.replace(/-/g, "_"),
        charged: false,
        cacheHit: false,
        creditsUsed: 0,
        saved: false,
        contactRevealed: "none",
        createdAt: new Date().toISOString(),
        performedBy: "You",
        profile: null,
        matches: [],
      };
    }
    if (needle.includes("multi")) {
      return {
        id: "lk-multi",
        resultStatus: "multiple_matches",
        maskedInput: input.input,
        lookupType: input.type.replace(/-/g, "_"),
        charged: false,
        cacheHit: false,
        creditsUsed: 0,
        saved: false,
        contactRevealed: "none",
        createdAt: new Date().toISOString(),
        performedBy: "You",
        profile: null,
        matches: SCOUT_MATCH_OPTIONS,
      };
    }
    return {
      id: "lk-found",
      resultStatus: "found",
      maskedInput: input.input,
      lookupType: input.type.replace(/-/g, "_"),
      charged: true,
      cacheHit: false,
      creditsUsed: 2,
      saved: false,
      contactRevealed: "none",
      createdAt: new Date().toISOString(),
      performedBy: "You",
      profile: SCOUT_PROFILE,
      matches: [],
    };
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
      candidateId: profileId ?? "scout",
    };
  },
  async saveToPool() {
    await simulateMockLatency();
    return { created: true, candidateId: "pool-1" };
  },
};

const livePeopleScoutApi: PeopleScoutApi = {
  async getQuota() {
    const result = await apiClient.get<ScoutQuota>("/people-scout/quota");
    return result.data;
  },
  async getRecentLookups() {
    const result = await apiClient.get<{ items: ScoutLookupResponse[] }>(
      "/people-scout/lookups"
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
        `/people-scout/lookups/${id}`
      );
      return normalizeLookupPayload(result.data);
    } catch {
      return null;
    }
  },
  async lookup(input) {
    const result = await apiClient.post<Record<string, unknown>>(
      "/people-scout/lookups",
      input
    );
    return normalizeLookupPayload(result.data);
  },
  async revealContact({ lookupId, profileId, linkedinUrl, type }) {
    if (lookupId) {
      const result = await apiClient.post<RevealResult>(
        `/people-scout/lookups/${lookupId}/reveal/${type}`,
        {},
        { sensitive: true }
      );
      return result.data;
    }
    const result = await apiClient.post<RevealResult>(
      `/people-scout/profiles/${profileId}/reveal`,
      { type, linkedinUrl },
      { sensitive: true }
    );
    return result.data;
  },
  async saveToPool(lookupId, listId) {
    const result = await apiClient.post<{
      created: boolean;
      candidate?: { id: string };
    }>(`/people-scout/lookups/${lookupId}/save`, { listId: listId ?? null });
    return {
      created: result.data.created,
      candidateId: result.data.candidate?.id,
    };
  },
};

export const peopleScoutApi = createDomainService({
  mock: mockPeopleScoutApi,
  live: livePeopleScoutApi,
});
