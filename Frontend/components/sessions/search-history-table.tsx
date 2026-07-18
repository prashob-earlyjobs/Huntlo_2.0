"use client";

import Link from "next/link";
import {
  Copy,
  LayoutTemplate,
  Loader2,
  MoreHorizontal,
  Pencil,
  Play,
  Search,
  Trash2,
} from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
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
  return (
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
        <ConfirmDialog
          trigger={
            <DropdownMenuItem
              variant="destructive"
              onClick={(event) => event.preventDefault()}
            >
              <Trash2 aria-hidden />
              Delete
            </DropdownMenuItem>
          }
          title={`Delete “${entry.name}”?`}
          description="This removes the search from your history. Saved candidates are not affected."
          confirmLabel="Delete search"
          destructive
          onConfirm={() => onDelete?.(entry)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SearchHistoryTable({
  entries,
  loading = false,
  onDelete,
}: {
  entries: SearchHistoryEntry[];
  loading?: boolean;
  onDelete?: (entry: SearchHistoryEntry) => void;
}) {
  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-xl border border-border bg-muted/40" />
    );
  }

  if (entries.length === 0) {
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
              <TableHead className={`${HEAD} text-right`}>Saved</TableHead>
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
    </section>
  );
}
