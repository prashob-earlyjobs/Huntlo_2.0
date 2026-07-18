"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notFound } from "next/navigation";

import { SessionResults } from "@/components/sessions/session-results";
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

const POLL_INTERVAL_MS = 2500;
const FETCH_MORE_GAP_MS = 1500;
const MAX_PROGRESS_POLL_ATTEMPTS = 15;
/** Same ~90s window as the previous 30×3s schedule. */
const PROGRESS_POLL_INTERVAL_MS = 6000;

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
    saved: candidate.saved,
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
  const progressAttemptsRef = useRef<Record<string, number>>({});
  const { subscribe, state: realtimeState } = useRealtime();

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
  }, [sessionId]);

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
        timer = window.setTimeout(() => {
          void run();
        }, POLL_INTERVAL_MS * 2);
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
      };
      const matches =
        data.savedSessionId === sessionId ||
        (fjSessionId != null && data.sessionId === fjSessionId);
      if (matches) void refresh("socket-completed");
    });
  }, [subscribe, sessionId, fjSessionId, refresh]);

  if (notFoundSession) {
    notFound();
  }

  if (loading && !session) {
    return (
      <div className="space-y-4 p-1">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
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
      />
    </>
  );
}
