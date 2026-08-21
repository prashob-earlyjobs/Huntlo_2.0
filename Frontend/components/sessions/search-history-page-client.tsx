"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { useRealtime } from "@/providers/realtime-provider";

const DEFAULT_PAGE_SIZE = 20;
const RUNNING_REFRESH_MS = 10_000;

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [metrics, setMetrics] = useState({
    totalSearches: 0,
    candidatesFound: 0,
    creditsUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribe } = useRealtime();

  const loadPage = useCallback(
    async (nextPage: number, nextPageSize: number, options?: { soft?: boolean }) => {
      if (!options?.soft) setLoading(true);
      setError(null);
      try {
        const result = await getSourcingSessions({
          page: nextPage,
          limit: nextPageSize,
        });
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
        setPage(result.page);
        setPageSize(result.limit);
        setTotal(result.total);
        setTotalPages(Math.max(1, result.totalPages));
        setMetrics(result.metrics);
      } catch (err) {
        try {
          const history = await sourcingApi.listHistory();
          setEntries(
            history.map((entry) => ({
              ...entry,
              date: formatHistoryDate(entry.date),
            }))
          );
          setPage(1);
          setTotal(history.length);
          setTotalPages(1);
          setMetrics({
            totalSearches: history.length,
            candidatesFound: history.reduce((sum, entry) => sum + entry.results, 0),
            creditsUsed: history.reduce((sum, entry) => sum + entry.usage, 0),
          });
        } catch {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!options?.soft) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadPage(page, pageSize);
  }, [loadPage, page, pageSize]);

  // Keep Running rows live via WS + light soft refresh (no heal on the backend).
  const hasRunning = entries.some((entry) => entry.state === "running");
  useEffect(() => {
    if (!hasRunning) return;

    const patchFromEvent = (event: { data?: unknown } | Record<string, unknown>) => {
      const data = ((event as { data?: unknown }).data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
        status?: string;
        totalDocs?: number;
      };
      const targetId = data.savedSessionId;
      if (!targetId) return;
      setEntries((previous) =>
        previous.map((entry) => {
          if (entry.id !== targetId && entry.sessionId !== targetId) return entry;
          return {
            ...entry,
            state: mapSessionState(data.status),
            results:
              typeof data.totalDocs === "number" ? data.totalDocs : entry.results,
          };
        })
      );
    };

    const unsubPoll = subscribe("candidates.search.poll", patchFromEvent);
    const unsubDone = subscribe("candidates.search.completed", patchFromEvent);
    const timer = window.setInterval(() => {
      void loadPage(page, pageSize, { soft: true });
    }, RUNNING_REFRESH_MS);

    return () => {
      unsubPoll();
      unsubDone();
      window.clearInterval(timer);
    };
  }, [hasRunning, loadPage, page, pageSize, subscribe]);

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

      {loading && entries.length === 0 ? (
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
        loading={loading && entries.length === 0}
        pagingDisabled={loading}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
        onDelete={async (entry) => {
          const sessionId = entry.sessionId || entry.id;
          if (!sessionId) return;
          try {
            await sourcingApi.deleteSession(sessionId);
            const remainingOnPage = entries.length - 1;
            if (remainingOnPage <= 0 && page > 1) {
              setPage((value) => Math.max(1, value - 1));
            } else {
              await loadPage(page, pageSize);
            }
          } catch (err) {
            setError(getApiErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
