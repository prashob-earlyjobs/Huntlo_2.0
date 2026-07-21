"use client";

import {
  Copy,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getApiErrorMessage, huntlo360Api } from "@/lib/api";
import { completionRate, type Workflow360 } from "@/lib/mock-360";
import { CHANNEL_ICONS } from "@/lib/mock-outreach";
import { jobDetailPath, ROUTES, workflowDetailPath } from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_OPTIONS: FilterOption[] = ["Running", "Paused", "Completed", "Draft"].map(
  (status) => ({ id: status, label: status })
);

function WorkflowRowActions({
  workflow,
  onAction,
  onDeleted,
}: {
  workflow: Workflow360;
  onAction: (message: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function runAction(message: string, fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      onAction(message);
    } catch (err) {
      onAction(getApiErrorMessage(err, "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Actions for ${workflow.name}`}
              disabled={busy}
            />
          }
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem render={<Link href={workflowDetailPath(workflow.id)} />}>
            <Eye aria-hidden />
            View workflow
          </DropdownMenuItem>
          {workflow.status === "Running" ? (
            <DropdownMenuItem
              onClick={() =>
                void runAction(`Paused “${workflow.name}”.`, () =>
                  huntlo360Api.pauseWorkflow(workflow.id)
                )
              }
            >
              <Pause aria-hidden />
              Pause
            </DropdownMenuItem>
          ) : workflow.status === "Paused" ? (
            <DropdownMenuItem
              onClick={() =>
                void runAction(`Resumed “${workflow.name}”.`, () =>
                  huntlo360Api.resumeWorkflow(workflow.id)
                )
              }
            >
              <Play aria-hidden />
              Resume
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => onAction(`Duplicated “${workflow.name}” as a draft.`)}
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
            <AlertDialogTitle>Delete “{workflow.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The workflow stops immediately — outreach, screening calls and
              scheduling links for enrolled candidates are cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmDelete(false);
                void runAction(`Deleted “${workflow.name}”.`, async () => {
                  await huntlo360Api.deleteWorkflow(workflow.id);
                  onDeleted(workflow.id);
                });
              }}
            >
              Delete workflow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function WorkflowsHome() {
  const [workflows, setWorkflows] = useState<Workflow360[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const next = await huntlo360Api.listWorkflows({ limit: 100 });
        if (cancelled) return;
        setWorkflows(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load workflows."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return workflows.filter((workflow) => {
      if (
        normalized &&
        !`${workflow.name} ${workflow.jobTitle ?? ""} ${workflow.owner}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(workflow.status))
        return false;
      return true;
    });
  }, [query, statusFilter, workflows]);

  const hasFilters = Boolean(query) || statusFilter.length > 0;

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  async function refreshAfterAction(text: string) {
    flash(text);
    try {
      const next = await huntlo360Api.listWorkflows({ limit: 100 });
      setWorkflows(next);
    } catch {
      // keep current list
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 pb-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workflows…"
              aria-label="Search workflows"
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
            {hasFilters ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setStatusFilter([]);
                }}
              >
                <X aria-hidden />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length}
            </span>{" "}
            workflows
          </p>
        </div>

        {loading ? (
          <div aria-busy aria-label="Loading workflows" className="overflow-x-auto">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-[1.4fr_1.1fr_0.7fr_1fr_0.6fr_0.6fr_0.7fr_0.9fr_0.7fr_0.9fr_40px] gap-3 border-b border-border px-4 py-2.5">
                {Array.from({ length: 11 }).map((_, index) => (
                  <Skeleton key={index} className="h-3 w-full max-w-20" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, row) => (
                <div
                  key={row}
                  className="grid grid-cols-[1.4fr_1.1fr_0.7fr_1fr_0.6fr_0.6fr_0.7fr_0.9fr_0.7fr_0.9fr_40px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <Skeleton className="h-3.5 w-44 max-w-full" />
                  <Skeleton className="h-3.5 w-28 max-w-full" />
                  <Skeleton className="ml-auto h-3.5 w-8" />
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="ml-auto h-3.5 w-8" />
                  <Skeleton className="ml-auto h-3.5 w-8" />
                  <Skeleton className="ml-auto h-3.5 w-8" />
                  <Skeleton className="h-3.5 w-10" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="ml-auto size-7 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                Huntlo 360 workflows with stage progress and completion rates
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Workflow</TableHead>
                  <TableHead className={HEAD}>Related job</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Candidates</TableHead>
                  <TableHead className={HEAD}>Outreach channels</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Qualified</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Screened</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Scheduled</TableHead>
                  <TableHead className={HEAD}>Completion rate</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={HEAD}>Owner</TableHead>
                  <TableHead className={`${HEAD} w-10 text-right`}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((workflow) => {
                  const rate = completionRate(workflow);
                  return (
                    <TableRow key={workflow.id}>
                      <TableCell className="py-2.5">
                        <Link
                          href={workflowDetailPath(workflow.id)}
                          className="block max-w-56 truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {workflow.name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">
                        {workflow.jobId && workflow.jobTitle ? (
                          <Link
                            href={jobDetailPath(workflow.jobId)}
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                          >
                            {workflow.jobTitle}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">
                        {workflow.candidates.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="flex items-center gap-1">
                          {workflow.channels.map((channel) => {
                            const Icon = CHANNEL_ICONS[channel];
                            return (
                              <Tooltip key={channel}>
                                <TooltipTrigger
                                  render={
                                    <span className="inline-flex text-muted-foreground" />
                                  }
                                >
                                  <Icon aria-label={channel} className="size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent>{channel}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">
                        {workflow.qualified.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">
                        {workflow.screened.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">
                        {workflow.scheduled.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                        {rate}%
                      </TableCell>
                      <TableCell className="py-2.5">
                        <CampaignStatusBadge status={workflow.status} />
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-muted-foreground">
                        {workflow.owner}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <WorkflowRowActions
                          workflow={workflow}
                          onAction={(text) => void refreshAfterAction(text)}
                          onDeleted={(id) =>
                            setWorkflows((previous) =>
                              previous.filter((row) => row.id !== id)
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Workflow}
            title={hasFilters ? "No matching workflows" : "No workflows yet"}
            description={
              hasFilters
                ? "Try clearing filters or searching a different name."
                : "Create an end-to-end workflow from outreach through scheduling."
            }
            actionLabel={hasFilters ? undefined : "Create Workflow"}
            actionHref={hasFilters ? undefined : ROUTES.huntlo360New}
          />
        )}
      </section>
    </div>
  );
}
