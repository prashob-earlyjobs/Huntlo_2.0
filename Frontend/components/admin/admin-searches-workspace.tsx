"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { adminApi, type AdminSourcingSession } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "polling", label: "Polling" },
  { value: "running", label: "Running" },
  { value: "pending", label: "Pending" },
  { value: "creating", label: "Creating" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "draft", label: "Draft" },
] as const;

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-success/10 text-success",
  polling: "bg-info/10 text-info",
  running: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  creating: "bg-warning/10 text-warning",
  queued: "bg-warning/10 text-warning",
  partial: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
};

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminSearchesWorkspace() {
  const [sessions, setSessions] = useState<AdminSourcingSession[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize, statusFilter]);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listSourcingSessions({
        page,
        limit: pageSize,
        q: debouncedQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setSessions(result.items);
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
      if (result.page !== page) setPage(result.page);
      setToast(null);
    } catch (error) {
      setSessions([]);
      setTotal(0);
      setTotalPages(1);
      setToast(getApiErrorMessage(error, "Unable to load searches."));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQuery, statusFilter]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Searches"
        description="All AI candidate search sessions across users and workspaces."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => value && setStatusFilter(value)}
            >
              <SelectTrigger className="w-40" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search query, user, org…"
              className="w-56 sm:w-72"
            />
          </div>
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

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Search</TableHead>
              <TableHead className={HEAD}>User</TableHead>
              <TableHead className={HEAD}>Organisation</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={cn(HEAD, "text-right")}>Results</TableHead>
              <TableHead className={cn(HEAD, "text-right")}>Credits</TableHead>
              <TableHead className={HEAD}>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading searches…
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && sessions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No searches found.
                </TableCell>
              </TableRow>
            ) : null}
            {!loading
              ? sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="min-w-56 max-w-sm">
                      <p className="font-medium">{session.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {session.query || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{session.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.userEmail}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {session.organisation}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                          STATUS_CLASS[session.status] ||
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {session.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {session.totalResults.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {session.quotaConsumed.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatWhen(session.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {loading
            ? "Loading…"
            : total === 0
              ? "No searches"
              : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString("en-IN")}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Rows
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Next page"
              disabled={loading || page >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
