import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { SearchHistoryTable } from "@/components/sessions/search-history-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SEARCH_HISTORY } from "@/lib/mock-sessions";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Search History" };

export default function SearchHistoryPage() {
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total searches
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {SEARCH_HISTORY.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Candidates saved
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {SEARCH_HISTORY.reduce((sum, entry) => sum + entry.saved, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Credits used
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {SEARCH_HISTORY.reduce((sum, entry) => sum + entry.usage, 0)}
          </p>
        </div>
      </div>

      <SearchHistoryTable entries={SEARCH_HISTORY} />
    </>
  );
}
