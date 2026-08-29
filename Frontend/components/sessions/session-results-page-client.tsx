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
} from "@/lib/api/candidate-search";
import type { SearchFilterState } from "@/lib/mock-search";
import type { SessionCandidate, SourcingSession } from "@/lib/mock-sessions";
import { providerPayloadToFilters } from "@/lib/search-filter-adapters";
import { useRealtime } from "@/providers/realtime-provider";

const FETCH_MORE_GAP_MS = 1500;
const MAX_PROGRESS_POLL_ATTEMPTS = 15;
/** Same ~90s window as the previous 30×3s schedule. */
const PROGRESS_POLL_INTERVAL_MS = 6000;
const RESULTS_PAGE_SIZE = 20;

export type SessionResultsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function emptyPagination(pageSize = RESULTS_PAGE_SIZE): SessionResultsPagination {
  return { page: 1, pageSize, total: 0, totalPages: 1 };
}

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
    fit: candidate.fit ?? null,
    saved: candidate.saved,
    lists: candidate.lists ?? [],
    experience: candidate.experience,
    education: candidate.education,
    summary: candidate.summary ?? candidate.candidateSummary ?? null,
    candidateSummary: candidate.candidateSummary ?? candidate.summary ?? null,
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
  const [pagination, setPagination] = useState<SessionResultsPagination>(emptyPagination);
  const [pageLoading, setPageLoading] = useState(false);
  const paginationRef = useRef({ page: 1, pageSize: RESULTS_PAGE_SIZE });
  const progressAttemptsRef = useRef<Record<string, number>>({});
  const { subscribe, state: realtimeState } = useRealtime();

  const applyPagination = useCallback((next: SessionResultsPagination) => {
    paginationRef.current = { page: next.page, pageSize: next.pageSize };
    setPagination(next);
  }, []);

  const loadCandidatesPage = useCallback(
    async (nextPage: number, nextLimit: number) => {
      const stored = await getStoredSessionCandidates(sessionId, {
        page: nextPage,
        limit: nextLimit,
      }).catch(() => null);

      if (stored) {
        const p = stored.profilesPagination;
        const pageSize = p?.limit ?? nextLimit;
        const page = p?.page ?? nextPage;
        const total = p?.totalDocs ?? stored.candidates.length;
        const totalPages = Math.max(
          1,
          p?.totalPages ?? (Math.ceil(total / pageSize) || 1)
        );
        setCandidates(stored.candidates.map(mapSearchSummaryToSessionCandidate));
        applyPagination({ page, pageSize, total, totalPages });
        setCanFetchMore(Boolean(stored.canFetchMore));
        if (stored.filterForm) {
          setSessionFilters(providerPayloadToFilters(stored.filterForm));
        }
        if (stored.sessionId) setFjSessionId(stored.sessionId);
        return stored.candidates.length;
      }

      const pageResult = await sourcingApi.getSessionResultsPage(sessionId, {
        page: nextPage,
        limit: nextLimit,
      });
      setCandidates(pageResult.items.map(mapApiCandidateToSessionCandidate));
      applyPagination({
        page: pageResult.pagination.page,
        pageSize: pageResult.pagination.limit,
        total: pageResult.pagination.total,
        totalPages: Math.max(1, pageResult.pagination.totalPages),
      });
      return pageResult.items.length;
    },
    [applyPagination, sessionId]
  );

  const refresh = useCallback(async (reason: string) => {
    try {
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
        null;
      if (externalId) setFjSessionId(externalId);

      const { page, pageSize } = paginationRef.current;
      const candidateCount = await loadCandidatesPage(page, pageSize);

      setError(null);
      console.log("[SessionResults][refresh]", {
        reason,
        sessionId,
        fjSessionId: externalId,
        status: apiSession.status ?? apiSession.state,
        uiState: mapped.state,
        candidateCount,
        page,
        pageSize,
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
  }, [loadCandidatesPage, sessionId]);

  useEffect(() => {
    applyPagination(emptyPagination());
    setCandidates([]);
  }, [applyPagination, sessionId]);

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
        const progress = await sourcingApi.getProgress(sessionId);
        const { page, pageSize } = paginationRef.current;
        const candidateCount = await loadCandidatesPage(page, pageSize);
        if (cancelled) return;

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
            candidateCount,
            page,
            pageSize,
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
  }, [loadCandidatesPage, loadedSessionId, loadedSessionState, sessionId]);

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
        const { page, pageSize } = paginationRef.current;
        if (incoming.length > 0 || result.totalDocs) {
          await loadCandidatesPage(page, pageSize);
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
  }, [canFetchMore, loadCandidatesPage, sessionId, sessionState]);

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

      const incoming = [
        ...(data.newCandidates ?? []),
        ...(data.candidates ?? []),
      ].map(mapSearchSummaryToSessionCandidate);

      if (incoming.length > 0 && paginationRef.current.page === 1) {
        setCandidates((prev) => {
          const merged = mergeCandidates(prev, incoming);
          return merged.slice(0, paginationRef.current.pageSize);
        });
      } else if (incoming.length > 0) {
        void loadCandidatesPage(
          paginationRef.current.page,
          paginationRef.current.pageSize
        );
      }
      if (typeof data.totalDocs === "number") {
        setPagination((prev) => {
          const totalPages = Math.max(
            1,
            Math.ceil(data.totalDocs! / prev.pageSize) || 1
          );
          const next = { ...prev, total: data.totalDocs!, totalPages };
          paginationRef.current = { page: next.page, pageSize: next.pageSize };
          return next;
        });
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
  }, [loadCandidatesPage, subscribe, sessionId, fjSessionId]);

  useEffect(() => {
    return subscribe("candidates.search.completed", (event) => {
      console.log("[SessionResults][socket:candidates.search.completed]", {
        sessionId,
        event,
      });

      const data = (event.data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
      };
      const matches =
        data.savedSessionId === sessionId ||
        (fjSessionId != null && data.sessionId === fjSessionId);
      if (matches) void refresh("socket-completed");
    });
  }, [subscribe, sessionId, fjSessionId, refresh]);

  const handlePageChange = useCallback(
    async (nextPage: number) => {
      if (nextPage === paginationRef.current.page) return;
      setPageLoading(true);
      try {
        await loadCandidatesPage(nextPage, paginationRef.current.pageSize);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setPageLoading(false);
      }
    },
    [loadCandidatesPage]
  );

  const handlePageSizeChange = useCallback(
    async (nextSize: number) => {
      setPageLoading(true);
      try {
        await loadCandidatesPage(1, nextSize);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setPageLoading(false);
      }
    },
    [loadCandidatesPage]
  );

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
      <SessionResults
        session={session}
        candidates={candidates}
        initialFilters={sessionFilters}
        futureJobsSessionId={fjSessionId}
        pagination={pagination}
        pageLoading={pageLoading}
        onPageChange={(page) => void handlePageChange(page)}
        onPageSizeChange={(pageSize) => void handlePageSizeChange(pageSize)}
      />
    </>
  );
}
