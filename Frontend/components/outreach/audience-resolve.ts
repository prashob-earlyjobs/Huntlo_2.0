import {
  candidatePoolApi,
  sourcingApi,
  type ApiPoolCandidate,
  type PoolListParams,
  type SourcedCandidateApi,
} from "@/lib/api";
import {
  fetchMoreCandidates,
  getStoredSessionCandidates,
} from "@/lib/api/candidate-search";
import type { AudienceStats } from "@/lib/mock-outreach";
import type { AudienceSource } from "@/lib/mock-outreach";

export type AudienceBuilderSlice = {
  source: AudienceSource | null;
  sourceDetail: string;
  selectedCandidateIds: string[];
  poolSearch: string;
};

export function statsFromPoolRows(rows: ApiPoolCandidate[]): AudienceStats {
  const selected = rows.length;
  const withEmail = rows.filter(
    (row) => Boolean(row.email) || Boolean(row.emailRevealed)
  ).length;
  const withPhone = rows.filter(
    (row) => Boolean(row.phone) || Boolean(row.phoneRevealed)
  ).length;
  const invalid = rows.filter(
    (row) =>
      !row.email &&
      !row.emailRevealed &&
      !row.phone &&
      !row.phoneRevealed
  ).length;
  return {
    selected,
    withEmail,
    withPhone,
    duplicates: 0,
    invalid,
  };
}

function normalizeLinkedin(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.trim().toLowerCase().replace(/\/+$/, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Paginate `/sourcing/sessions/:id/results` until exhausted. */
export async function listAllSessionResults(
  sessionId: string
): Promise<SourcedCandidateApi[]> {
  return sourcingApi.getSessionResults(sessionId);
}

/**
 * Advance polling / fetch-more so audience enrollment sees the full session
 * (Apply often returns the first page only, e.g. 11 of 35).
 */
export async function hydrateSourcingSessionResults(
  sessionId: string
): Promise<SourcedCandidateApi[]> {
  try {
    await sourcingApi.getProgress(sessionId);
  } catch {
    // Progress poll is best-effort; still read whatever is stored.
  }

  try {
    let stored = await getStoredSessionCandidates(sessionId, {
      all: true,
      limit: 300,
    });
    let attempts = 0;
    while ((stored.canFetchMore || stored.polling) && attempts < 8) {
      attempts += 1;
      if (stored.canFetchMore) {
        await fetchMoreCandidates(sessionId, { page: 1, limit: 300 });
      } else if (stored.polling) {
        await sourcingApi.getProgress(sessionId).catch(() => undefined);
        await sleep(1200);
      }
      stored = await getStoredSessionCandidates(sessionId, {
        all: true,
        limit: 300,
      });
    }
  } catch {
    // Fall through to results endpoint.
  }

  return listAllSessionResults(sessionId);
}

function mapSourcedToAudienceRow(
  result: SourcedCandidateApi,
  sessionId: string,
  pool?: ApiPoolCandidate | null
): ApiPoolCandidate {
  return {
    id: pool?.id || result.id,
    name: pool?.name || result.name,
    email: pool?.email ?? null,
    phone: pool?.phone ?? null,
    linkedinUrl: pool?.linkedinUrl || result.linkedinUrl,
    headline: pool?.headline ?? result.headline,
    currentTitle: pool?.currentTitle ?? result.title,
    currentCompany: pool?.currentCompany ?? result.company,
    location: pool?.location ?? result.location,
    experienceYears: pool?.experienceYears ?? result.experienceYears,
    skills: pool?.skills?.length ? pool.skills : result.skills,
    status: pool?.status ?? "new",
    pipelineStatus: pool?.pipelineStatus ?? "New",
    sourceType: "sourcing",
    sourceId: sessionId,
    externalCandidateId:
      pool?.externalCandidateId || result.externalCandidateId,
    emailRevealed: Boolean(pool?.emailRevealed || pool?.email),
    phoneRevealed: Boolean(pool?.phoneRevealed || pool?.phone),
  };
}

/** Paginate pool list until exhausted (backend max page size is 200). */
export async function listAllPoolPages(
  params: PoolListParams,
  pageSize = 200
): Promise<ApiPoolCandidate[]> {
  const all: ApiPoolCandidate[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const rows = await candidatePoolApi.listRaw({
      ...params,
      page,
      limit: pageSize,
    });
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
}

/** Load pool rows for the current audience selection (no side effects). */
export async function loadAudiencePoolRows(
  state: AudienceBuilderSlice
): Promise<ApiPoolCandidate[]> {
  if (!state.source) return [];

  // CSV / Excel import is always backed by a dedicated saved list. Never filter
  // from the global pool page — that drops anyone outside the latest 200.
  if (state.source === "CSV/Excel Import" && state.sourceDetail) {
    const listRows = await listAllPoolPages({ listId: state.sourceDetail });
    if (state.selectedCandidateIds.length === 0) return listRows;
    const wanted = new Set(state.selectedCandidateIds);
    const selected = listRows.filter((row) => wanted.has(row.id));
    // If selection ids are stale, still show everyone on the import list.
    return selected.length > 0 ? selected : listRows;
  }

  if (state.source === "Saved List" && state.sourceDetail) {
    const listRows = await listAllPoolPages({ listId: state.sourceDetail });
    if (state.selectedCandidateIds.length === 0) return listRows;
    const wanted = new Set(state.selectedCandidateIds);
    return listRows.filter((row) => wanted.has(row.id));
  }

  if (
    state.selectedCandidateIds.length > 0 &&
    (state.source === "Manual Add" ||
      state.source === "Candidate Pool" ||
      state.source === "Import from ATS")
  ) {
    const wanted = [...new Set(state.selectedCandidateIds)];
    const byId = new Map<string, ApiPoolCandidate>();

    // Direct lookups first so freshly created pool rows are not missed by pagination.
    await Promise.all(
      wanted.map(async (id) => {
        const ui = await candidatePoolApi.getById(id);
        if (!ui) return;
        byId.set(id, {
          id: ui.id,
          name: ui.name,
          email: ui.email || null,
          phone: ui.phone || null,
          linkedinUrl: null,
          headline: ui.headline || null,
          currentTitle: ui.currentRole || null,
          currentCompany: ui.currentCompany || null,
          location: ui.location || null,
          experienceYears: ui.experienceYears,
          skills: ui.skills ?? [],
          status: "saved",
          pipelineStatus: ui.pipelineStatus,
          emailRevealed: ui.emailRevealed,
          phoneRevealed: ui.phoneRevealed,
        });
      })
    );

    const missing = wanted.filter((id) => !byId.has(id));
    if (missing.length > 0 && state.source !== "Import from ATS") {
      const all = await listAllPoolPages({
        search: state.poolSearch.trim() || undefined,
      });
      for (const row of all) {
        if (missing.includes(row.id)) byId.set(row.id, row);
      }
    }

    return wanted
      .map((id) => byId.get(id))
      .filter((row): row is ApiPoolCandidate => Boolean(row));
  }

  if (state.source === "Candidate Pool") {
    return listAllPoolPages({
      search: state.poolSearch.trim() || undefined,
    });
  }

  if (state.source === "Sourcing Session" && state.sourceDetail) {
    const sessionId = state.sourceDetail;
    const results = await hydrateSourcingSessionResults(sessionId);

    // Enrich with any already-synced pool contacts, but never truncate to the
    // partial pool subset (that caused 11 shown when search had 35).
    const poolRows = await listAllPoolPages({ sourceType: "sourcing" });
    const byExternal = new Map<string, ApiPoolCandidate>();
    const byLinkedin = new Map<string, ApiPoolCandidate>();
    const bySourceMatch: ApiPoolCandidate[] = [];
    for (const row of poolRows) {
      if (row.sourceId === sessionId) bySourceMatch.push(row);
      if (row.externalCandidateId) {
        byExternal.set(row.externalCandidateId, row);
      }
      const linkedin = normalizeLinkedin(row.linkedinUrl);
      if (linkedin) byLinkedin.set(linkedin, row);
    }

    if (results.length === 0) {
      return bySourceMatch;
    }

    return results.map((result) => {
      const linkedin = normalizeLinkedin(result.linkedinUrl);
      const pool =
        (result.externalCandidateId
          ? byExternal.get(result.externalCandidateId)
          : undefined) ||
        (linkedin ? byLinkedin.get(linkedin) : undefined) ||
        null;
      return mapSourcedToAudienceRow(result, sessionId, pool);
    });
  }

  return [];
}

/**
 * Resolve pool candidate IDs ready for enrollment.
 * Sourcing sessions are synced into the pool (deduped by LinkedIn / external id).
 */
export async function resolveAudienceCandidateIds(
  state: AudienceBuilderSlice
): Promise<string[]> {
  if (!state.source) return [];

  if (state.selectedCandidateIds.length > 0) {
    return [...new Set(state.selectedCandidateIds)];
  }

  if (state.source === "Candidate Pool") {
    const rows = await listAllPoolPages({
      search: state.poolSearch.trim() || undefined,
    });
    return rows.map((row) => row.id);
  }

  if (state.source === "Saved List" && state.sourceDetail) {
    const rows = await listAllPoolPages({ listId: state.sourceDetail });
    return rows.map((row) => row.id);
  }

  if (state.source === "CSV/Excel Import" && state.sourceDetail) {
    const rows = await listAllPoolPages({ listId: state.sourceDetail });
    return rows.map((row) => row.id);
  }

  if (state.source === "Sourcing Session" && state.sourceDetail) {
    return ensureSourcingSessionInPool(state.sourceDetail);
  }

  return [];
}

export async function ensureSourcingSessionInPool(
  sessionId: string
): Promise<string[]> {
  return ensureSourcedCandidatesInPool(sessionId);
}

/**
 * Upsert sourced session candidates into the org pool and return pool IDs.
 * When `sourcedCandidateIds` is omitted, every result for the session is synced.
 * Optional `fallbacks` cover candidates present in the UI but missing from the
 * results endpoint (e.g. beyond the first page).
 */
export async function ensureSourcedCandidatesInPool(
  sessionId: string,
  sourcedCandidateIds?: string[],
  fallbacks: Array<{
    id: string;
    name: string;
    headline?: string | null;
    currentRole?: string | null;
    currentCompany?: string | null;
    location?: string | null;
    experienceYears?: number | null;
    skills?: string[];
    linkedinUrl?: string | null;
    externalCandidateId?: string | null;
  }> = []
): Promise<string[]> {
  // Full session first — Apply often stores page 1 only until fetch-more runs.
  const results = await hydrateSourcingSessionResults(sessionId);

  const wanted =
    sourcedCandidateIds && sourcedCandidateIds.length > 0
      ? new Set(sourcedCandidateIds)
      : null;

  const bySourcedId = new Map(results.map((result) => [result.id, result]));
  for (const fallback of fallbacks) {
    if (wanted && !wanted.has(fallback.id)) continue;
    if (bySourcedId.has(fallback.id)) continue;
    bySourcedId.set(fallback.id, {
      id: fallback.id,
      sourcingSessionId: sessionId,
      externalCandidateId: fallback.externalCandidateId || fallback.id,
      name: fallback.name,
      headline: fallback.headline ?? null,
      linkedinUrl: fallback.linkedinUrl ?? null,
      title: fallback.currentRole ?? null,
      company: fallback.currentCompany ?? null,
      location: fallback.location || "",
      experienceYears: fallback.experienceYears ?? null,
      skills: fallback.skills ?? [],
      educationPreview: [],
      profileSignals: [],
      rank: 0,
      matchScore: null,
    });
  }

  const selected = wanted
    ? [...bySourcedId.values()].filter((result) => wanted.has(result.id))
    : [...bySourcedId.values()];

  const byExternal = new Map<string, string>();
  const byLinkedin = new Map<string, string>();

  // Full-session sync: preload pool once. Targeted sync: look up per candidate.
  if (!wanted) {
    const existing = await listAllPoolPages({});
    for (const row of existing) {
      if (row.externalCandidateId) {
        byExternal.set(row.externalCandidateId, row.id);
      }
      const linkedin = normalizeLinkedin(row.linkedinUrl);
      if (linkedin) byLinkedin.set(linkedin, row.id);
    }
  }

  async function resolveExistingId(result: {
    name: string;
    externalCandidateId: string;
    linkedinUrl: string | null;
  }): Promise<string | undefined> {
    const linkedin = normalizeLinkedin(result.linkedinUrl);
    const cached =
      (result.externalCandidateId
        ? byExternal.get(result.externalCandidateId)
        : undefined) ?? (linkedin ? byLinkedin.get(linkedin) : undefined);
    if (cached) return cached;

    if (!wanted) return undefined;

    const hits = await candidatePoolApi.listRaw({
      limit: 50,
      search: result.name.trim() || undefined,
    });
    for (const row of hits) {
      if (
        result.externalCandidateId &&
        row.externalCandidateId === result.externalCandidateId
      ) {
        byExternal.set(result.externalCandidateId, row.id);
        return row.id;
      }
      const rowLinkedin = normalizeLinkedin(row.linkedinUrl);
      if (linkedin && rowLinkedin === linkedin) {
        byLinkedin.set(linkedin, row.id);
        return row.id;
      }
    }
    return undefined;
  }

  const ids: string[] = [];
  for (const result of selected) {
    const linkedin = normalizeLinkedin(result.linkedinUrl);
    const existingId = await resolveExistingId(result);

    if (existingId) {
      ids.push(existingId);
      continue;
    }

    const created = await candidatePoolApi.create({
      name: result.name,
      linkedinUrl: result.linkedinUrl || undefined,
      headline: result.headline,
      currentTitle: result.title,
      currentCompany: result.company,
      location: result.location || undefined,
      experienceYears: result.experienceYears,
      skills: result.skills ?? [],
      sourceType: "sourcing",
      sourceId: sessionId,
      externalCandidateId: result.externalCandidateId,
    });
    ids.push(created.id);
    if (result.externalCandidateId) {
      byExternal.set(result.externalCandidateId, created.id);
    }
    if (linkedin) byLinkedin.set(linkedin, created.id);
  }

  return [...new Set(ids)];
}

export function candidateSourceType(
  source: AudienceSource | null
): "candidate_pool" | "saved_list" | "manual" | "import" | "ats" {
  switch (source) {
    case "Candidate Pool":
      return "candidate_pool";
    case "Saved List":
      return "saved_list";
    case "CSV/Excel Import":
      return "import";
    case "Import from ATS":
      return "ats";
    default:
      return "manual";
  }
}
