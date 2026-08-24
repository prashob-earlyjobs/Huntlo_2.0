"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  LayoutTemplate,
  Loader2,
  MoreHorizontal,
  Pencil,
  Play,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { SearchHistoryTableSkeleton } from "@/components/sessions/search-history-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SearchHistoryEntry } from "@/lib/mock-sessions";
import { ROUTES, sessionDetailPath } from "@/lib/routes";
import type { Status } from "@/lib/types";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const STATE_STATUS: Record<SearchHistoryEntry["state"], Status> = {
  completed: "Completed",
  running: "Running",
  partial: "Paused",
  failed: "Failed",
  empty: "Draft",
};

function HistoryRowActions({
  entry,
  onDelete,
}: {
  entry: SearchHistoryEntry;
  onDelete?: (entry: SearchHistoryEntry) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Actions for ${entry.name}`}
            />
          }
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {entry.sessionId ? (
            <DropdownMenuItem render={<Link href={sessionDetailPath(entry.sessionId)} />}>
              <Play aria-hidden />
              Rerun search
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem>
              <Play aria-hidden />
              Rerun search
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Copy aria-hidden />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil aria-hidden />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LayoutTemplate aria-hidden />
            Save as template
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{entry.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the search from your history. Saved candidates are not
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                onDelete?.(entry);
              }}
            >
              Delete search
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SearchHistoryTable({
  entries,
  loading = false,
  pagingDisabled = false,
  page = 1,
  pageSize = 20,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onDelete,
}: {
  entries: SearchHistoryEntry[];
  loading?: boolean;
  pagingDisabled?: boolean;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onDelete?: (entry: SearchHistoryEntry) => void;
}) {
  if (loading) {
    return <SearchHistoryTableSkeleton />;
  }

  if (entries.length === 0 && total === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No search history"
        description="Your recent AI candidate searches will appear here for quick reuse."
        actionLabel="Start Searching"
        actionHref={ROUTES.search}
      />
    );
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const showPager = Boolean(onPageChange && onPageSizeChange);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto px-2 pb-2">
        <Table>
          <caption className="sr-only">
            Search history with results, status and actions
          </caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Search name</TableHead>
              <TableHead className={HEAD}>Query</TableHead>
              <TableHead className={HEAD}>Related job</TableHead>
              <TableHead className={`${HEAD} text-right`}>Results</TableHead>
              <TableHead className={`${HEAD} text-right`}>In pool</TableHead>
              <TableHead className={HEAD}>Owner</TableHead>
              <TableHead className={HEAD}>Search date</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={`${HEAD} w-10 text-right`}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="max-w-56 py-2.5 text-sm font-medium text-foreground">
                  {entry.sessionId ? (
                    <Link
                      href={sessionDetailPath(entry.sessionId)}
                      title={entry.name}
                      className="line-clamp-2 underline-offset-4 hover:underline"
                    >
                      {entry.name}
                    </Link>
                  ) : (
                    <span title={entry.name} className="line-clamp-2">
                      {entry.name}
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-44 py-2.5">
                  <p className="truncate text-sm text-muted-foreground">
                    {entry.query}
                  </p>
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {entry.relatedJob ?? "—"}
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm tabular-nums">
                  {entry.results.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm tabular-nums">
                  {entry.saved.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {entry.owner}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {entry.date}
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-1.5">
                    {entry.state === "running" ? (
                      <Loader2
                        aria-hidden
                        className="size-3 animate-spin text-primary"
                      />
                    ) : null}
                    <StatusBadge status={STATE_STATUS[entry.state]} />
                    {entry.usage > 0 ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {entry.usage} cr
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="py-2.5 text-right">
                  <HistoryRowActions entry={entry} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPager ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {total === 0
              ? "No searches"
              : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString("en-IN")}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows
              <select
                value={pageSize}
                disabled={pagingDisabled}
                onChange={(event) =>
                  onPageSizeChange?.(Number(event.target.value))
                }
                className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs tabular-nums text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Previous page"
                disabled={pagingDisabled || page <= 1}
                onClick={() => onPageChange?.(Math.max(1, page - 1))}
              >
                <ChevronLeft aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Next page"
                disabled={pagingDisabled || page >= totalPages}
                onClick={() =>
                  onPageChange?.(Math.min(totalPages, page + 1))
                }
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
