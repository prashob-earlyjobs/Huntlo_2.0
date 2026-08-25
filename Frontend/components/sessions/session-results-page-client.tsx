"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";

import { SessionResults } from "@/components/sessions/session-results";
import { SessionResultsPageSkeleton } from "@/components/sessions/session-results-skeleton";
import {
  getApiErrorMessage,
  mapApiCandidateToSessionCandidate,
  mapApiSessionToUi,
  mapSessionState,
  sourcingApi,
} from "@/lib/api";
import {
  fetchMoreCandidates,
  getStoredSessionCandidates,
  type CandidateSearchSummary,
  type SearchPagination,
} from "@/lib/api/candidate-search";
import type { SearchFilterState } from "@/lib/mock-search";
import type { SessionCandidate, SortOptionId, SourcingSession } from "@/lib/mock-sessions";
import { providerPayloadToFilters } from "@/lib/search-filter-adapters";
import { useRealtime } from "@/providers/realtime-provider";

/**
 * Vendor debug strip: on in `next dev`, and in QA/prod builds only when
 * `NEXT_PUBLIC_SHOW_VENDOR_DEBUG=true` is set at Frontend build time.
 */
const SHOW_VENDOR_DEBUG_STRIP =
  process.env.NODE_ENV !== "production" ||
  ["true", "1", "yes"].includes(
    (process.env.NEXT_PUBLIC_SHOW_VENDOR_DEBUG ?? "").trim().toLowerCase()
  );

const FETCH_MORE_GAP_MS = 1500;
const MAX_PROGRESS_POLL_ATTEMPTS = 15;
/** Same ~90s window as the previous 30×3s schedule. */
const PROGRESS_POLL_INTERVAL_MS = 6000;
/** Default page size for the API-paginated results table (matches the "Rows"
 * options offered in the pager — see session-results.tsx). */
const DEFAULT_RESULTS_PAGE_SIZE = 20;

/** Set by search-workspace after Apply; absent when opening search history. */
function liveSearchStorageKey(sessionId: string) {
  return `huntlo:search:${sessionId}`;
}

function isLiveSearchSession(sessionId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(sessionStorage.getItem(liveSearchStorageKey(sessionId)));
  } catch {
    return false;
  }
}

function clearLiveSearchSession(sessionId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(liveSearchStorageKey(sessionId));
  } catch {
    // ignore
  }
}

/**
 * Debug/testing-only vendor + poll-ladder snapshot — carried on the
 * `candidates.search.poll` / `candidates.search.completed` socket payloads
 * (see Backend `debug` field on `CandidateSearchPollPayload`). Sourced
 * entirely from the socket; never fetched over REST.
 */
type VendorDebugSnapshot = {
  pollAttemptCount: number;
  maxPollAttempts: number;
  candidateSource: string;
  usedBrightDataFallback: boolean;
  sourceBreakdown: { future_jobs: number; bright_data: number };
};

function candidateIdentity(c: CandidateSearchSummary | SessionCandidate): string {
  if ("candidateId" in c && c.candidateId) return String(c.candidateId);
  if ("linkedinUrl" in c && c.linkedinUrl) return String(c.linkedinUrl).toLowerCase();
  return c.id;
}

function mergeCandidates(
  existing: SessionCandidate[],
  incoming: SessionCandidate[]
): SessionCandidate[] {
  const map = new Map<string, SessionCandidate>();
  for (const c of existing) map.set(candidateIdentity(c), c);
  for (const c of incoming) {
    const key = candidateIdentity(c);
    if (!map.has(key)) map.set(key, c);
  }
  return [...map.values()];
}

function mapSearchSummaryToSessionCandidate(
  candidate: CandidateSearchSummary
): SessionCandidate {
  return mapApiCandidateToSessionCandidate({
    id: candidate.id,
    sourcingSessionId: candidate.sourcingSessionId,
    externalCandidateId: candidate.candidateId,
    name: candidate.name,
    headline: candidate.headline ?? null,
    linkedinUrl: candidate.linkedinProfileUrl ?? candidate.linkedinUrl ?? null,
    profilePictureUrl: candidate.profilePictureUrl ?? null,
    title: candidate.currentRole,
    company: candidate.currentCompany,
    location: candidate.location,
    experienceYears: candidate.experienceYears,
    skills: candidate.skills ?? [],
    educationPreview: candidate.educationPreview ?? [],
    profileSignals: candidate.profileSignals ?? [],
    rank: candidate.rank ?? 0,
    matchScore: candidate.matchScore ?? candidate.finalScore ?? null,
    saved: candidate.saved,
    lists: candidate.lists ?? [],
    source: candidate.source,
  });
}

export function SessionResultsPageClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<SourcingSession | null>(null);
  const [candidates, setCandidates] = useState<SessionCandidate[]>([]);
  const [sessionFilters, setSessionFilters] = useState<SearchFilterState | null>(
    null
  );
  const [fjSessionId, setFjSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundSession, setNotFoundSession] = useState(false);
  const [canFetchMore, setCanFetchMore] = useState(false);
  const [vendorDebug, setVendorDebug] = useState<VendorDebugSnapshot | null>(null);
  const progressAttemptsRef = useRef<Record<string, number>>({});
  const { subscribe, state: realtimeState } = useRealtime();

  // API-paginated browsing of stored candidates — only drives the table once
  // the session is at rest (not "running"). While running we keep the
  // existing full accumulation + progressive reveal below untouched, since
  // paginating a list that's still growing live would be confusing.
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsPageSize, setResultsPageSize] = useState(DEFAULT_RESULTS_PAGE_SIZE);
  const [resultsSort, setResultsSort] = useState<SortOptionId>("best-match");
  const [resultsSearch, setResultsSearch] = useState("");
  const [pagedCandidates, setPagedCandidates] = useState<SessionCandidate[]>([]);
  const [pagedPagination, setPagedPagination] = useState<SearchPagination | null>(null);
  const [pagedLoading, setPagedLoading] = useState(false);
  const [pagedError, setPagedError] = useState<string | null>(null);
  const pagedRequestTokenRef = useRef(0);

  /**
   * One-time hydration only (mount / explicit refresh) — NOT a polling
   * loop. Needed because a reopened/already-completed session never gets a
   * fresh `candidates.search.poll` socket tick to seed the strip from, so
   * without this the debug strip would stay blank forever after reload.
   * All *live* updates while a search is running still come from sockets.
   */
  const hydrateVendorDebug = useCallback(async () => {
    if (!SHOW_VENDOR_DEBUG_STRIP) return;
    try {
      const progress = await sourcingApi.getProgress(sessionId);
      setVendorDebug({
        pollAttemptCount: progress.pollAttemptCount ?? 0,
        maxPollAttempts: progress.maxPollAttempts ?? 0,
        candidateSource: progress.candidateSource ?? "future_jobs",
        usedBrightDataFallback: Boolean(progress.usedBrightDataFallback),
        sourceBreakdown: progress.sourceBreakdown ?? { future_jobs: 0, bright_data: 0 },
      });
    } catch {
      // Debug-only surface — never let this affect the real UI.
    }
  }, [sessionId]);

  const refresh = useCallback(async (reason: string) => {
    try {
      // Prefer MongoDB-stored candidates (no quota, no Future Jobs on reopen)
      const stored = await getStoredSessionCandidates(sessionId, {
        all: true,
      }).catch(() => null);

      const apiSession = await sourcingApi.getSession(sessionId);
      if (!apiSession) {
        setNotFoundSession(true);
        console.log("[SessionResults][refresh]", { reason, sessionId, missing: true });
        return null;
      }

      const mapped = mapApiSessionToUi(apiSession);
      setSession(mapped);
      const externalId =
        (apiSession as { externalSessionId?: string | null }).externalSessionId ??
        stored?.sessionId ??
        null;
      setFjSessionId(externalId);

      let candidateCount = 0;
      if (stored?.candidates?.length) {
        const mappedCandidates = stored.candidates.map(mapSearchSummaryToSessionCandidate);
        setCandidates((prev) => mergeCandidates(prev, mappedCandidates));
        setCanFetchMore(Boolean(stored.canFetchMore));
        candidateCount = mappedCandidates.length;
      } else {
        const apiCandidates = await sourcingApi.getSessionCandidates(sessionId);
        setCandidates((prev) => mergeCandidates(prev, apiCandidates));
        candidateCount = apiCandidates.length;
      }
      if (stored?.filterForm) {
        setSessionFilters(providerPayloadToFilters(stored.filterForm));
      }

      void hydrateVendorDebug();
      setError(null);
      console.log("[SessionResults][refresh]", {
        reason,
        sessionId,
        fjSessionId: externalId,
        status: apiSession.status ?? apiSession.state,
        uiState: mapped.state,
        candidateCount,
        canFetchMore: stored?.canFetchMore ?? null,
        resultCount: mapped.resultCount,
      });
      return apiSession;
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.log("[SessionResults][refresh:error]", {
        reason,
        sessionId,
        error: getApiErrorMessage(err),
      });
      return null;
    }
  }, [sessionId, hydrateVendorDebug]);

  useEffect(() => {
    console.log("[SessionResults][mount]", { sessionId });
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await refresh("mount");
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
      console.log("[SessionResults][unmount]", { sessionId });
    };
  }, [refresh, sessionId]);

  useEffect(() => {
    console.log("[SessionResults][realtime]", { sessionId, realtimeState });
  }, [sessionId, realtimeState]);

  const loadedSessionId = session?.id ?? null;
  const loadedSessionState = session?.state ?? null;

  const loadResultsPage = useCallback(
    async (opts: { page: number; pageSize: number; sort: SortOptionId; search: string }) => {
      const token = ++pagedRequestTokenRef.current;
      setPagedLoading(true);
      setPagedError(null);
      try {
        const result = await getStoredSessionCandidates(sessionId, {
          page: opts.page,
          limit: opts.pageSize,
          sort: opts.sort,
          search: opts.search.trim() || undefined,
        });
        if (pagedRequestTokenRef.current !== token) return;
        setPagedCandidates(result.candidates.map(mapSearchSummaryToSessionCandidate));
        setPagedPagination(result.profilesPagination ?? null);
      } catch (err) {
        if (pagedRequestTokenRef.current !== token) return;
        setPagedError(getApiErrorMessage(err));
      } finally {
        if (pagedRequestTokenRef.current === token) setPagedLoading(false);
      }
    },
    [sessionId]
  );

  // Fetch one page of stored candidates whenever the session is at rest and
  // the page/sort/search inputs change. Skipped while "running" (the live
  // socket/poll accumulation below owns the table then) and for "empty"
  // drafts that were never run (nothing to page through).
  useEffect(() => {
    if (!loadedSessionId) return;
    if (loadedSessionState === "running" || loadedSessionState === "empty") return;
    void loadResultsPage({
      page: resultsPage,
      pageSize: resultsPageSize,
      sort: resultsSort,
      search: resultsSearch,
    });
  }, [
    loadedSessionId,
    loadedSessionState,
    resultsPage,
    resultsPageSize,
    resultsSort,
    resultsSearch,
    loadResultsPage,
  ]);

  const handleResultsPageChange = useCallback((page: number) => {
    setResultsPage(page);
  }, []);
  const handleResultsPageSizeChange = useCallback((size: number) => {
    setResultsPageSize(size);
    setResultsPage(1);
  }, []);
  const handleResultsSortChange = useCallback((sort: SortOptionId) => {
    setResultsSort(sort);
    setResultsPage(1);
  }, []);
  const handleResultsSearchChange = useCallback((search: string) => {
    setResultsSearch(search);
    setResultsPage(1);
  }, []);
  const reloadResultsPage = useCallback(() => {
    void loadResultsPage({
      page: resultsPage,
      pageSize: resultsPageSize,
      sort: resultsSort,
      search: resultsSearch,
    });
  }, [loadResultsPage, resultsPage, resultsPageSize, resultsSort, resultsSearch]);
  // "Export" should still cover every matching candidate, not just the page
  // currently on screen — fetched on demand at click-time.
  const fetchAllResultsForExport = useCallback(async () => {
    const result = await getStoredSessionCandidates(sessionId, {
      all: true,
      sort: resultsSort,
      search: resultsSearch.trim() || undefined,
    });
    return result.candidates.map(mapSearchSummaryToSessionCandidate);
  }, [sessionId, resultsSort, resultsSearch]);

  // Progress-poll only while a search is still active. History reopen of a
  // completed session stays on MongoDB stored-candidates (no provider calls).
  useEffect(() => {
    if (!loadedSessionId) return;
    if (loadedSessionState !== "running") return;

    let cancelled = false;
    let timer: number | null = null;

    const poll = async () => {
      const previousAttempt = progressAttemptsRef.current[sessionId] ?? 0;
      if (cancelled || previousAttempt >= MAX_PROGRESS_POLL_ATTEMPTS) return;

      const attempt = previousAttempt + 1;
      progressAttemptsRef.current[sessionId] = attempt;

      try {
        // Drives session/candidate progression only — the debug strip is
        // populated purely from `candidates.search.poll` socket payloads
        // (see the `debug` field), never from this REST response.
        const progress = await sourcingApi.getProgress(sessionId);
        const stored = await getStoredSessionCandidates(sessionId, { all: true });
        if (cancelled) return;

        const incoming = stored.candidates.map(mapSearchSummaryToSessionCandidate);
        setCandidates((prev) => mergeCandidates(prev, incoming));
        setCanFetchMore(Boolean(stored.canFetchMore));
        setSession((prev) =>
          prev
            ? {
                ...prev,
                state: mapSessionState(progress.status),
                coverage: progress.progress,
                resultCount: progress.totalResults,
                failureReason: progress.errorMessage ?? prev.failureReason,
              }
            : prev
        );

        console.log(
          `[SessionResults][poll-response ${attempt}/${MAX_PROGRESS_POLL_ATTEMPTS}]`,
          {
            sessionId,
            progress,
            candidates: stored.candidates,
            candidateCount: stored.candidates.length,
            canFetchMore: stored.canFetchMore,
          }
        );
      } catch (err) {
        console.log(
          `[SessionResults][poll-response ${attempt}/${MAX_PROGRESS_POLL_ATTEMPTS}:error]`,
          {
            sessionId,
            error: getApiErrorMessage(err),
          }
        );
      }

      if (!cancelled && attempt < MAX_PROGRESS_POLL_ATTEMPTS) {
        timer = window.setTimeout(() => {
          void poll();
        }, PROGRESS_POLL_INTERVAL_MS);
      }
    };

    console.log("[SessionResults][REST poll:setup]", {
      sessionId,
      uiState: loadedSessionState,
      maxAttempts: MAX_PROGRESS_POLL_ATTEMPTS,
      completedAttempts: progressAttemptsRef.current[sessionId] ?? 0,
    });
    void poll();

    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [loadedSessionId, loadedSessionState, sessionId]);

  const sessionState = session?.state ?? null;

  // Apply often returns the first page only (completed + canFetchMore).
  // Only continue paging for a live Apply redirect (sessionStorage marker).
  // Opening search history must stay credit-free and read MongoDB only.
  useEffect(() => {
    if (!canFetchMore) return;
    if (!sessionState || sessionState === "running") return;
    if (!isLiveSearchSession(sessionId)) {
      console.log("[SessionResults][fetch-more:skipped-history]", {
        sessionId,
        uiState: sessionState,
      });
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const run = async () => {
      console.log("[SessionResults][fetch-more]", {
        sessionId,
        uiState: sessionState,
      });
      try {
        const result = await fetchMoreCandidates(sessionId, {
          page: 1,
          limit: 300,
        });
        if (cancelled) return;

        const incoming = result.candidates.map(mapSearchSummaryToSessionCandidate);
        if (incoming.length > 0) {
          setCandidates((prev) => mergeCandidates(prev, incoming));
        }
        setCanFetchMore(Boolean(result.canFetchMore));
        setSession((prev) =>
          prev
            ? {
                ...prev,
                resultCount: result.totalDocs || prev.resultCount,
              }
            : prev
        );

        console.log("[SessionResults][fetch-more:result]", {
          sessionId,
          newlyAddedCount: result.newlyAddedCount,
          totalDocs: result.totalDocs,
          canFetchMore: result.canFetchMore,
          polling: result.polling,
        });

        if (result.canFetchMore || result.polling) {
          timer = window.setTimeout(() => {
            void run();
          }, FETCH_MORE_GAP_MS);
        } else {
          clearLiveSearchSession(sessionId);
        }
      } catch (err) {
        if (cancelled) return;
        console.log("[SessionResults][fetch-more:error]", {
          sessionId,
          error: getApiErrorMessage(err),
        });
        // Stop auto-paging on failure — retrying FJ "no profiles" / outages
        // only spam 502s. User can refresh if needed.
        setCanFetchMore(false);
        clearLiveSearchSession(sessionId);
      }
    };

    void run();
    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [canFetchMore, sessionId, sessionState]);

  // Debug: log every realtime event so we can see if the socket is alive.
  useEffect(() => {
    return subscribe("*", (event) => {
      console.log("[SessionResults][socket:*]", { sessionId, event });
    });
  }, [subscribe, sessionId]);

  // WebSocket: merge new candidates filtered by this session
  useEffect(() => {
    return subscribe("candidates.search.poll", (event) => {
      console.log("[SessionResults][socket:candidates.search.poll]", {
        sessionId,
        event,
      });

      const data = (event.data ?? event) as {
        sessionId?: string;
        savedSessionId?: string;
        status?: string;
        polling?: boolean;
        newCandidates?: CandidateSearchSummary[];
        candidates?: CandidateSearchSummary[];
        canFetchMore?: boolean;
        totalDocs?: number;
        debug?: VendorDebugSnapshot;
      };

      const matches =
        data.savedSessionId === sessionId ||
        (fjSessionId != null && data.sessionId === fjSessionId);
      console.log("[SessionResults][socket:poll:match]", {
        sessionId,
        fjSessionId,
        matches,
        data,
      });
      if (!matches) return;

      // Debug strip is driven entirely off this socket payload — no REST
      // getProgress call — and keeps updating even once the session is
      // terminal since the completed event below carries `debug` too.
      if (SHOW_VENDOR_DEBUG_STRIP && data.debug) {
        setVendorDebug(data.debug);
      }

      const incoming = [
        ...(data.newCandidates ?? []),
        ...(data.candidates ?? []),
      ].map(mapSearchSummaryToSessionCandidate);

      if (incoming.length > 0) {
        setCandidates((prev) => mergeCandidates(prev, incoming));
      }
      if (typeof data.canFetchMore === "boolean") {
        setCanFetchMore(data.canFetchMore);
      }
      if (data.status) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                state:
                  data.status === "completed"
                    ? "completed"
                    : data.status === "partial"
                      ? "partial"
                      : data.status === "failed" || data.status === "cancelled"
                        ? "failed"
                        : "running",
                resultCount: data.totalDocs ?? prev.resultCount,
              }
            : prev
        );
      }
    });
  }, [subscribe, sessionId, fjSessionId]);

  useEffect(() => {
    return subscribe("candidates.search.completed", (event) => {
      console.log("[SessionResults][socket:candidates.search.completed]", {
        sessionId,
        event,
      });

      const data = (event.data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
        debug?: VendorDebugSnapshot;
      };
      const matches =
        data.savedSessionId === sessionId ||
        (fjSessionId != null && data.sessionId === fjSessionId);
      if (matches) {
        // The terminal event carries the final debug snapshot too — the
        // strip keeps reflecting reality (poll count, vendor, breakdown)
        // even once the session has reached a terminal state, still with
        // no REST call involved.
        if (SHOW_VENDOR_DEBUG_STRIP && data.debug) {
          setVendorDebug(data.debug);
        }
        void refresh("socket-completed");
      }
    });
  }, [subscribe, sessionId, fjSessionId, refresh]);

  if (notFoundSession) {
    notFound();
  }

  if (loading && !session) {
    return <SessionResultsPageSkeleton />;
  }

  if (!session) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error ?? "Unable to load search session."}
      </p>
    );
  }

  return (
    <>
      {error ? (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {SHOW_VENDOR_DEBUG_STRIP && vendorDebug ? (
        <VendorDebugStrip progress={vendorDebug} />
      ) : null}
      <SessionResults
        session={session}
        candidates={candidates}
        initialFilters={sessionFilters}
        futureJobsSessionId={fjSessionId}
        pagedResults={{
          candidates: pagedCandidates,
          pagination: pagedPagination,
          loading: pagedLoading,
          error: pagedError,
          page: resultsPage,
          pageSize: resultsPageSize,
          sort: resultsSort,
          search: resultsSearch,
          onPageChange: handleResultsPageChange,
          onPageSizeChange: handleResultsPageSizeChange,
          onSortChange: handleResultsSortChange,
          onSearchChange: handleResultsSearchChange,
          onReload: reloadResultsPage,
          fetchAllForExport: fetchAllResultsForExport,
        }}
      />
    </>
  );
}

/**
 * Testing/QA-only strip surfacing the FJ poll ladder attempt count and the
 * Bright Data fallback vendor breakdown. Shown in `next dev`, or in a
 * production build when `NEXT_PUBLIC_SHOW_VENDOR_DEBUG=true`.
 */
function VendorDebugStrip({ progress }: { progress: VendorDebugSnapshot }) {
  const breakdown = progress.sourceBreakdown;
  return (
    <p className="mb-3 rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">Debug (live)</span>
      {" · "}Poll {progress.pollAttemptCount ?? 0}/{progress.maxPollAttempts ?? "?"}
      {" · "}Vendor: {progress.candidateSource ?? "future_jobs"}
      {breakdown ? (
        <>
          {" · "}FJ: {breakdown.future_jobs} · BD: {breakdown.bright_data}
        </>
      ) : null}
      {" · "}
      <span
        className={
          progress.usedBrightDataFallback ? "text-foreground" : undefined
        }
      >
        BD fallback tried: {progress.usedBrightDataFallback ? "yes" : "no"}
      </span>
    </p>
  );
}
