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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  completionRate,
  WORKFLOWS_360,
  type Workflow360,
} from "@/lib/mock-360";
import { CHANNEL_ICONS } from "@/lib/mock-outreach";
import { jobDetailPath, ROUTES, workflowDetailPath } from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_OPTIONS: FilterOption[] = ["Running", "Paused", "Completed", "Draft"].map(
  (status) => ({ id: status, label: status })
);

function WorkflowRowActions({
  workflow,
  onAction,
}: {
  workflow: Workflow360;
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
              aria-label={`Actions for ${workflow.name}`}
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
            <DropdownMenuItem onClick={() => onAction(`Paused “${workflow.name}”.`)}>
              <Pause aria-hidden />
              Pause
            </DropdownMenuItem>
          ) : workflow.status === "Paused" ? (
            <DropdownMenuItem onClick={() => onAction(`Resumed “${workflow.name}”.`)}>
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
                onAction(`Deleted “${workflow.name}”.`);
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return WORKFLOWS_360.filter((workflow) => {
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
  }, [query, statusFilter]);

  const hasFilters = Boolean(query) || statusFilter.length > 0;

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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
      </section>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      {/* Table */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length}
            </span>{" "}
            workflows
          </p>
        </div>

        {filtered.length > 0 ? (
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
                                  aria-label={channel}
                                  className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                >
                                  <span className="flex size-6 items-center justify-center rounded-md border border-border bg-muted/60">
                                    <Icon
                                      aria-hidden
                                      className="size-3.5 text-muted-foreground"
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{channel}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                        {workflow.qualified > 0 ? workflow.qualified : "—"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums">
                        {workflow.screened > 0 ? workflow.screened : "—"}
                      </TableCell>
                      <TableCell className="py-2.5 text-right text-sm tabular-nums text-success">
                        {workflow.scheduled > 0 ? workflow.scheduled : "—"}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="block h-1.5 w-16 overflow-hidden rounded-full bg-muted"
                          >
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{ width: `${Math.max(rate, 2)}%` }}
                            />
                          </span>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {rate}%
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <CampaignStatusBadge status={workflow.status} />
                      </TableCell>
                      <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                        {workflow.owner}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <WorkflowRowActions workflow={workflow} onAction={flash} />
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
            title="No workflows match these filters"
            description="Adjust your filters, or create a 360 workflow to automate outreach through scheduling."
            actionLabel="Create Workflow"
            actionHref={ROUTES.huntlo360New}
            className="m-4 border-0"
          />
        )}
      </section>
    </div>
  );
}
