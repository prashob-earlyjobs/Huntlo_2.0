"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { SearchHistoryTable } from "@/components/sessions/search-history-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, sourcingApi } from "@/lib/api";
import type { SearchHistoryEntry } from "@/lib/mock-sessions";
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
        const history = await sourcingApi.listHistory();
        if (!cancelled) setEntries(history);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

      <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card">
        <div className="px-4 py-2.5">
          <p className="text-xs text-muted-foreground">Total searches</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {loading ? "—" : entries.length}
          </p>
        </div>
        <div className="px-4 py-2.5">
          <p className="text-xs text-muted-foreground">Candidates saved</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {loading ? "—" : entries.reduce((sum, entry) => sum + entry.saved, 0)}
          </p>
        </div>
        <div className="px-4 py-2.5">
          <p className="text-xs text-muted-foreground">Credits used</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {loading ? "—" : entries.reduce((sum, entry) => sum + entry.usage, 0)}
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <SearchHistoryTable entries={entries} loading={loading} />
    </>
  );
}
