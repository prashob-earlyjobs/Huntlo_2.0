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
  done: "bg-success/10 text-success",
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
  if (type === "launch_voice" || type === "send:ai_voice") return "AI Voice dial";
  if (type === "send_email" || type === "send:email") return "Send email";
  if (type === "send_whatsapp" || type === "send:whatsapp") return "Send WhatsApp";
  if (type === "followup:email") return "Email follow-up";
  if (type === "followup:whatsapp") return "WhatsApp follow-up";
  if (type === "followup:ai_voice") return "Voice follow-up";
  if (type === "sync_replies") return "Sync replies";
  if (type === "launch_screening") return "Launch screening";
  return type;
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-left">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminWorkerTasksWorkspace() {
  const [includeScheduled, setIncludeScheduled] = useState("true");
  const [data, setData] = useState<AdminPendingTasksResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listPendingWorkerTasks({
        queue: "outreach",
        includeScheduled: includeScheduled === "true",
        limit: 100,
        offset: 0,
      });
      setData(result);
    } catch (error) {
      setData(null);
      setToast(getApiErrorMessage(error, "Unable to load BullMQ outreach jobs."));
    } finally {
      setLoading(false);
    }
  }, [includeScheduled]);

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
  const items = (data?.items ?? []).filter((task) => task.queue === "outreach");
  const inFlight = items.filter((task) =>
    ["queued", "running"].includes(task.status)
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker tasks"
        description="BullMQ outreach jobs — email, WhatsApp, AI Voice, follow-ups, and reply sync."
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Due"
          value={summary?.outreachDue ?? summary?.campaignDue ?? 0}
          hint="Ready to run"
        />
        <SummaryCard
          label="Scheduled"
          value={summary?.outreachScheduled ?? summary?.campaignScheduled ?? 0}
          hint="Future dials/sends"
        />
        <SummaryCard
          label="In flight"
          value={summary?.outreachInFlight ?? inFlight}
          hint="Queued / running"
        />
        <SummaryCard
          label="Failed (24h)"
          value={summary?.outreachFailed24h ?? 0}
          hint="BullMQ only"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
          {loading ? "Loading…" : `${data?.total ?? 0} BullMQ job(s)`}
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
                    ? "Loading BullMQ jobs…"
                    : "No open BullMQ outreach jobs. If you just launched a campaign, confirm enrollments have the right channel details, then refresh."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((task) => (
                <TableRow key={`${task.queue}-${task.id}`}>
                  <TableCell className="text-xs font-medium text-foreground">
                    BullMQ
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
