"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SearchHistoryTable } from "@/components/sessions/search-history-table";
import {
  SearchHistoryMetricsSkeleton,
  SearchHistoryPageSkeleton,
} from "@/components/sessions/search-history-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, sourcingApi } from "@/lib/api";
import { getSourcingSessions } from "@/lib/api/candidate-search";
import type { SearchHistoryEntry } from "@/lib/mock-sessions";
import { mapSessionState } from "@/lib/api/sourcing";
import { ROUTES } from "@/lib/routes";

function formatHistoryDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SearchHistoryPageClient() {
  const [entries, setEntries] = useState<SearchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getSourcingSessions({ limit: 100 });
        if (cancelled) return;
        setEntries(
          result.sessions.map((session) => ({
            id: session.savedSessionId,
            sessionId: session.savedSessionId,
            name: session.title || session.prompt || "Untitled search",
            query: session.prompt,
            relatedJob: session.jobTitle,
            results: session.resultCount,
            saved: session.savedCandidateCount,
            owner: session.owner ?? "You",
            date: formatHistoryDate(session.createdAt),
            usage: session.quotaUsed ?? 0,
            state: mapSessionState(session.status),
          }))
        );
      } catch (err) {
        try {
          const history = await sourcingApi.listHistory();
          if (!cancelled) {
            setEntries(
              history.map((entry) => ({
                ...entry,
                date: formatHistoryDate(entry.date),
              }))
            );
          }
        } catch {
          if (!cancelled) setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalSearches = entries.length;
    const candidatesFound = entries.reduce((sum, entry) => sum + entry.results, 0);
    const creditsUsed = entries.reduce((sum, entry) => sum + entry.usage, 0);
    return { totalSearches, candidatesFound, creditsUsed };
  }, [entries]);

  if (loading && entries.length === 0 && !error) {
    return <SearchHistoryPageSkeleton />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Search History"
        description="Revisit, refine and rerun your previous candidate searches."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.search} />}
          >
            <Plus aria-hidden />
            New Search
          </Button>
        }
      />

      {loading ? (
        <SearchHistoryMetricsSkeleton />
      ) : (
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border">
          <div className="border-b border-border px-4 py-3 sm:border-b-0">
            <p className="text-xs font-medium text-muted-foreground">
              Total searches
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {metrics.totalSearches.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="border-b border-border px-4 py-3 sm:border-b-0">
            <p className="text-xs font-medium text-muted-foreground">
              Candidates found
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {metrics.candidatesFound.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Credits used
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {metrics.creditsUsed.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <SearchHistoryTable
        entries={entries}
        loading={loading}
        onDelete={async (entry) => {
          const sessionId = entry.sessionId || entry.id;
          if (!sessionId) return;
          try {
            await sourcingApi.deleteSession(sessionId);
            setEntries((prev) => prev.filter((row) => row.id !== entry.id));
          } catch (err) {
            setError(getApiErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
