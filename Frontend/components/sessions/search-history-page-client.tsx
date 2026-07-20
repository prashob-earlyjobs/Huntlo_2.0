"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
            name: session.title,
            query: session.prompt,
            relatedJob: session.jobTitle,
            results: session.resultCount,
            saved: session.savedCandidateCount,
            owner: session.owner ?? "You",
            date: session.createdAt ?? "",
            usage: 0,
            state: mapSessionState(session.status),
          }))
        );
      } catch (err) {
        // Fallback to legacy sourcing list
        try {
          const history = await sourcingApi.listHistory();
          if (!cancelled) setEntries(history);
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

  if (loading && entries.length === 0 && !error) {
    return <SearchHistoryPageSkeleton />;
  }

  return (
    <>
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
        <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card">
          <div className="px-4 py-2.5">
            <p className="text-xs text-muted-foreground">Total searches</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {entries.length}
            </p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-xs text-muted-foreground">Candidates saved</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {entries.reduce((sum, entry) => sum + entry.saved, 0)}
            </p>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-xs text-muted-foreground">Credits used</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {entries.reduce((sum, entry) => sum + entry.usage, 0)}
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
    </>
  );
}
