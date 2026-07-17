"use client";

import {
  Ban,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminApi,
  type AdminPendingTask,
  type AdminPendingTasksResult,
} from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  retrying: "bg-warning/10 text-warning",
  queued: "bg-info/10 text-info",
  queued_v2: "bg-info/10 text-info",
  leased: "bg-brand-subtle text-primary",
  running: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  dead: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function formatDue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(type: string) {
  if (type === "launch_voice") return "AI Voice dial";
  if (type === "send_email") return "Send email";
  if (type === "send_whatsapp") return "Send WhatsApp";
  return type;
}

function SummaryCard({
  label,
  value,
  hint,
  active,
  onClick,
}: {
  label: string;
  value: number;
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card px-4 py-3 text-left transition-colors",
        active ? "border-primary/50 bg-brand-subtle/20" : "border-border",
        onClick && "hover:border-primary/40"
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </button>
  );
}

export function AdminWorkerTasksWorkspace() {
  const [queue, setQueue] = useState<"all" | "background" | "campaign">(
    "campaign"
  );
  const [includeScheduled, setIncludeScheduled] = useState("true");
  const [data, setData] = useState<AdminPendingTasksResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listPendingWorkerTasks({
        queue,
        includeScheduled: includeScheduled === "true",
        limit: 100,
        offset: 0,
      });
      setData(result);
    } catch (error) {
      setData(null);
      setToast(getApiErrorMessage(error, "Unable to load pending worker tasks."));
    } finally {
      setLoading(false);
    }
  }, [queue, includeScheduled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void load();
    }, 8000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function cancelTask(task: AdminPendingTask) {
    setBusyId(task.id);
    try {
      await adminApi.cancelWorkerTask(task.id);
      setToast(`Cancelled ${formatType(task.type)}`);
      await load();
    } catch (error) {
      setToast(getApiErrorMessage(error, "Unable to cancel task."));
    } finally {
      setBusyId(null);
    }
  }

  async function retryTask(task: AdminPendingTask) {
    setBusyId(task.id);
    try {
      await adminApi.retryWorkerTask(task.id);
      setToast(`Re-queued ${formatType(task.type)}`);
      await load();
    } catch (error) {
      setToast(getApiErrorMessage(error, "Unable to retry task."));
    } finally {
      setBusyId(null);
    }
  }

  const summary = data?.summary;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker tasks"
        description="Pending background queue jobs and outreach campaign delivery steps waiting on the worker. AI Voice dials show as campaign → launch_voice."
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw aria-hidden className={cn(loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          label="Background due"
          value={summary?.backgroundDue ?? 0}
          hint="Ready to run"
          active={queue === "background"}
          onClick={() => setQueue("background")}
        />
        <SummaryCard
          label="Background scheduled"
          value={summary?.backgroundScheduled ?? 0}
          hint="Future runAt"
          active={queue === "background"}
          onClick={() => setQueue("background")}
        />
        <SummaryCard
          label="Campaign due"
          value={summary?.campaignDue ?? 0}
          hint="Voice / email / WA steps"
          active={queue === "campaign"}
          onClick={() => setQueue("campaign")}
        />
        <SummaryCard
          label="Campaign scheduled"
          value={summary?.campaignScheduled ?? 0}
          hint="Future dials/sends"
          active={queue === "campaign"}
          onClick={() => setQueue("campaign")}
        />
        <SummaryCard
          label="In flight"
          value={summary?.inFlight ?? 0}
          hint="Leased / running"
          onClick={() => setQueue("all")}
        />
        <SummaryCard
          label="Failed (24h)"
          value={summary?.failed24h ?? 0}
          hint="Background only"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={queue}
          onValueChange={(value) => {
            if (value === "all" || value === "background" || value === "campaign") {
              setQueue(value);
            }
          }}
        >
          <SelectTrigger className="w-44" aria-label="Queue filter">
            <SelectValue placeholder="Queue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All queues</SelectItem>
            <SelectItem value="background">Background</SelectItem>
            <SelectItem value="campaign">Campaign (AI Voice)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={includeScheduled}
          onValueChange={(value) => {
            if (value) setIncludeScheduled(value);
          }}
        >
          <SelectTrigger className="w-52" aria-label="Schedule filter">
            <SelectValue placeholder="Due filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Due + scheduled</SelectItem>
            <SelectItem value="false">Due / in-flight only</SelectItem>
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground">
          {loading ? "Loading…" : `${data?.total ?? 0} open task(s)`}
          {" · "}
          auto-refresh 8s
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Queue</TableHead>
              <TableHead className={HEAD}>Type</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Due</TableHead>
              <TableHead className={HEAD}>Campaign / entity</TableHead>
              <TableHead className={HEAD}>Attempts</TableHead>
              <TableHead className={HEAD}>Error</TableHead>
              <TableHead className={HEAD}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {loading
                    ? "Loading worker tasks…"
                    : queue === "campaign"
                      ? "No open campaign jobs. If you just launched AI Voice, confirm the campaign enrolled candidates with phone numbers, then refresh."
                      : "No pending worker tasks match these filters."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((task) => (
                <TableRow key={`${task.queue}-${task.id}`}>
                  <TableCell className="text-xs font-medium capitalize text-foreground">
                    {task.queue}
                  </TableCell>
                  <TableCell className="text-xs text-foreground">
                    <span className="font-medium">{formatType(task.type)}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                      {task.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                        STATUS_CLASS[task.status] ??
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDue(task.dueAt)}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs text-foreground">
                    {task.entityLabel || "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-xs text-muted-foreground">
                    {task.attempts}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-destructive">
                    {task.lastError || "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            disabled={busyId === task.id}
                            aria-label={`Actions for ${task.type}`}
                          />
                        }
                      >
                        <MoreHorizontal aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {task.canCancel ? (
                          <DropdownMenuItem
                            onClick={() => void cancelTask(task)}
                          >
                            <Ban aria-hidden />
                            Cancel
                          </DropdownMenuItem>
                        ) : null}
                        {task.canRetry ? (
                          <DropdownMenuItem
                            onClick={() => void retryTask(task)}
                          >
                            <RefreshCw aria-hidden />
                            Retry
                          </DropdownMenuItem>
                        ) : null}
                        {!task.canCancel && !task.canRetry ? (
                          <DropdownMenuItem disabled>
                            No actions
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
