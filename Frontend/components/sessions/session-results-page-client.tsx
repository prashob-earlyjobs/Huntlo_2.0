"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";

import { SessionResults } from "@/components/sessions/session-results";
import {
  getApiErrorMessage,
  mapApiCandidateToSessionCandidate,
  mapApiSessionToUi,
  sourcingApi,
} from "@/lib/api";
import {
  getStoredSessionCandidates,
  type CandidateSearchSummary,
} from "@/lib/api/candidate-search";
import type { SessionCandidate, SourcingSession } from "@/lib/mock-sessions";
import { useRealtime } from "@/providers/realtime-provider";

const POLL_INTERVAL_MS = 2500;

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
  });
}

export function SessionResultsPageClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<SourcingSession | null>(null);
  const [candidates, setCandidates] = useState<SessionCandidate[]>([]);
  const [fjSessionId, setFjSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundSession, setNotFoundSession] = useState(false);
  const [canFetchMore, setCanFetchMore] = useState(false);
  const { subscribe } = useRealtime();

  const refresh = useCallback(async () => {
    try {
      // Prefer MongoDB-stored candidates (no quota, no Future Jobs on reopen)
      const stored = await getStoredSessionCandidates(sessionId, {
        all: true,
      }).catch(() => null);

      const apiSession = await sourcingApi.getSession(sessionId);
      if (!apiSession) {
        setNotFoundSession(true);
        return null;
      }

      setSession(mapApiSessionToUi(apiSession));
      const externalId =
        (apiSession as { externalSessionId?: string | null }).externalSessionId ??
        stored?.sessionId ??
        null;
      setFjSessionId(externalId);

      if (stored?.candidates?.length) {
        const mapped = stored.candidates.map(mapSearchSummaryToSessionCandidate);
        setCandidates((prev) => mergeCandidates(prev, mapped));
        setCanFetchMore(Boolean(stored.canFetchMore));
      } else {
        const apiCandidates = await sourcingApi.getSessionCandidates(sessionId);
        setCandidates((prev) => mergeCandidates(prev, apiCandidates));
      }

      setError(null);
      return apiSession;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    }
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // REST polling fallback while session is active
  useEffect(() => {
    if (!session || session.state !== "running") return;

    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [session, refresh]);

  // WebSocket: merge new candidates filtered by this session
  useEffect(() => {
    return subscribe("candidates.search.poll", (event) => {
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
      const data = (event.data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
      };
      const matches =
        data.savedSessionId === sessionId ||
        (fjSessionId != null && data.sessionId === fjSessionId);
      if (matches) void refresh();
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
      <SessionResults session={session} candidates={candidates} />
    </>
  );
}
