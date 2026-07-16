"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";

import { SessionResults } from "@/components/sessions/session-results";
import {
  getApiErrorMessage,
  mapApiSessionToUi,
  sourcingApi,
  type SourcingSessionApi,
} from "@/lib/api";
import type { SessionCandidate, SourcingSession } from "@/lib/mock-sessions";
import { useRealtime } from "@/providers/realtime-provider";

const POLL_INTERVAL_MS = 2500;

export function SessionResultsPageClient({ sessionId }: { sessionId: string }) {
  const { subscribe } = useRealtime();
  const [session, setSession] = useState<SourcingSession | null>(null);
  const [candidates, setCandidates] = useState<SessionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFoundSession, setNotFoundSession] = useState(false);

  const refresh = useCallback(async () => {
    try {
      // Progress endpoint advances one provider poll tick when the worker is idle.
      await sourcingApi.getProgress(sessionId).catch(() => null);
      const [apiSession, apiCandidates] = await Promise.all([
        sourcingApi.getSession(sessionId),
        sourcingApi.getSessionCandidates(sessionId),
      ]);
      if (!apiSession) {
        setNotFoundSession(true);
        return;
      }
      setSession(mapApiSessionToUi(apiSession));
      setCandidates(apiCandidates);
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

  // WebSocket progressive updates
  useEffect(() => {
    return subscribe("candidates.search.poll", (event) => {
      const data = event.data as { sessionId?: string } | null;
      if (!data || data.sessionId !== sessionId) return;
      void refresh();
    });
  }, [subscribe, sessionId, refresh]);

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

/** Re-export for typed progress payloads if needed by tests. */
export type { SourcingSessionApi };
