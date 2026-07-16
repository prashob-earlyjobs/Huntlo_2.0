"use client";

import {
  Copy,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Trash2,
  AudioLines,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SCREENING_BATCHES,
  SCREENING_OWNERS,
  type ScreeningBatch,
} from "@/lib/mock-screening";
import { jobDetailPath, ROUTES, screeningDetailPath } from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_OPTIONS: FilterOption[] = [
  "Running",
  "Paused",
  "Completed",
  "Scheduled",
  "Draft",
].map((status) => ({ id: status, label: status }));

function ScreeningRowActions({
  batch,
  onAction,
}: {
  batch: ScreeningBatch;
  onAction: (message: string) => void;
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
              aria-label={`Actions for ${batch.name}`}
            />
          }
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem render={<Link href={screeningDetailPath(batch.id)} />}>
            <Eye aria-hidden />
            View screening
          </DropdownMenuItem>
          {batch.status === "Running" ? (
            <DropdownMenuItem onClick={() => onAction(`Paused “${batch.name}”.`)}>
              <Pause aria-hidden />
              Pause
            </DropdownMenuItem>
          ) : batch.status === "Paused" ? (
            <DropdownMenuItem onClick={() => onAction(`Resumed “${batch.name}”.`)}>
              <Play aria-hidden />
              Resume
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => onAction(`Duplicated “${batch.name}” as a draft.`)}
          >
            <Copy aria-hidden />
            Duplicate
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
            <AlertDialogTitle>Delete “{batch.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Queued and in-progress calls stop immediately. Completed results
              stay available under Screening Results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmDelete(false);
                onAction(`Deleted “${batch.name}”.`);
              }}
            >
              Delete screening
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ScreeningHome() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SCREENING_BATCHES.filter((batch) => {
      if (
        normalized &&
        !`${batch.name} ${batch.jobTitle ?? ""} ${batch.owner}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(batch.status))
        return false;
      if (ownerFilter.length > 0 && !ownerFilter.includes(batch.owner))
        return false;
      return true;
    });
  }, [query, statusFilter, ownerFilter]);

  const hasFilters =
    Boolean(query) || statusFilter.length > 0 || ownerFilter.length > 0;

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search screenings…"
              aria-label="Search screenings"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover
              label="Status"
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onToggle={(id) =>
                setStatusFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                )
              }
            />
            <FilterPopover
              label="Owner"
              options={SCREENING_OWNERS.map((owner) => ({
                id: owner,
                label: owner,
              }))}
              selected={ownerFilter}
              onToggle={(id) =>
                setOwnerFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                )
              }
            />
            {hasFilters ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setStatusFilter([]);
                  setOwnerFilter([]);
                }}
              >
                <X aria-hidden />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length}
            </span>{" "}
            screenings
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                AI voice screening batches with completion and score metrics
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Screening</TableHead>
                  <TableHead className={HEAD}>Related job</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Candidates</TableHead>
                  <TableHead className={HEAD}>Language</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Attempts</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Completed</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Average score</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Shortlisted</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={HEAD}>Owner</TableHead>
                  <TableHead className={`${HEAD} w-10 text-right`}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="py-2.5">
                      <Link
                        href={screeningDetailPath(batch.id)}
                        className="block max-w-56 truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {batch.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {batch.jobId && batch.jobTitle ? (
                        <Link
                          href={jobDetailPath(batch.jobId)}
                          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                          {batch.jobTitle}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums">
                      {batch.candidates > 0
                        ? batch.candidates.toLocaleString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {batch.language}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums text-muted-foreground">
                      {batch.attempts}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums">
                      {batch.candidates > 0
                        ? `${batch.completed}/${batch.candidates}`
                        : "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums">
                      {batch.averageScore !== null ? (
                        <span
                          className={
                            batch.averageScore >= 75
                              ? "text-success"
                              : "text-foreground"
                          }
                        >
                          {batch.averageScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                      {batch.shortlisted > 0 ? batch.shortlisted : "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <CampaignStatusBadge status={batch.status} />
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {batch.owner}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <ScreeningRowActions batch={batch} onAction={flash} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={AudioLines}
            title="No screenings match these filters"
            description="Adjust your filters, or create a voice screening batch to start calling candidates."
            actionLabel="Create Screening"
            actionHref={ROUTES.screeningNew}
            className="m-4 border-0"
          />
        )}
      </section>
    </div>
  );
}
