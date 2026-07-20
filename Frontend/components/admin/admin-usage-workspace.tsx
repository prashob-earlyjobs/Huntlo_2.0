"use client";

import { useCallback, useEffect, useState } from "react";

import { FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  AdminUsageAnalyticsSummary,
  AdminUsageHistoryEntry,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const EVENT_LABELS: Record<string, string> = {
  people_scout_lookup: "People Scout lookup",
  email_unveil: "Email unveil",
  phone_unveil: "Phone unveil",
};

const SOURCE_COLUMNS = [
  { key: "user_cache", label: "Same user (DB)" },
  { key: "shared_cache", label: "Shared DB" },
  { key: "futurejobs", label: "Future Jobs" },
  { key: "not_found", label: "Not found" },
] as const;

function formatNumber(value: number): string {
  return value.toLocaleString("en-IN");
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AdminUsageWorkspace() {
  const [summary, setSummary] = useState<AdminUsageAnalyticsSummary | null>(
    null
  );
  const [history, setHistory] = useState<AdminUsageHistoryEntry[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [filterUserId, setFilterUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showPlanLimits = Boolean(filterUserId);

  const loadData = useCallback(async (userId = "") => {
    setLoading(true);
    try {
      const params = userId ? { userId } : undefined;
      const [summaryResult, historyResult, usersResult] = await Promise.all([
        adminApi.getUsageAnalyticsSummary(params),
        adminApi.getUsageAnalyticsHistory({ ...(params ?? {}), limit: 50 }),
        adminApi.listUsers({ limit: 100 }),
      ]);
      setSummary(summaryResult);
      setHistory(historyResult.history);
      setUsers(
        usersResult.items.map((user) => ({
          id: user.id,
          name: user.name || user.email,
        }))
      );
      setToast(null);
    } catch (error) {
      setSummary(null);
      setHistory([]);
      setToast(getApiErrorMessage(error, "Unable to load usage analytics."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(filterUserId);
  }, [filterUserId, loadData]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const periodLabel = (() => {
    if (!summary?.periodKey) return "Current period";
    const [year, month] = summary.periodKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage analytics"
        description="Platform consumption by lookup source, outreach activity, and committed quota history."
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">User filter</p>
          <Select
            value={filterUserId || "all"}
            onValueChange={(value) =>
              setFilterUserId(value === "all" ? "" : value)
            }
          >
            <SelectTrigger aria-label="Filter analytics by user">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">{periodLabel}</p>
      </div>

      <FormSection
        title="Usage breakdown"
        description="Lookup and unveil activity split by source path"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>Activity</TableHead>
                {SOURCE_COLUMNS.map((column) => (
                  <TableHead key={column.key} className={cn(HEAD, "text-right")}>
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className={cn(HEAD, "text-right")}>Total</TableHead>
                <TableHead className={cn(HEAD, "text-right")}>
                  {showPlanLimits ? "Credits / quota" : "Credits"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading analytics…
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && summary?.breakdown.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No usage recorded in this period.
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? summary?.breakdown.map((row) => (
                    <TableRow key={row.eventType}>
                      <TableCell className="font-medium">
                        {EVENT_LABELS[row.eventType] || row.eventType}
                      </TableCell>
                      {SOURCE_COLUMNS.map((column) => (
                        <TableCell
                          key={column.key}
                          className="text-right tabular-nums text-sm"
                        >
                          {formatNumber(
                            row.sources[column.key]?.count ?? 0
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatNumber(row.total.count)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(row.total.credits)}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {!loading && summary?.outreachCredits.length
                ? summary.outreachCredits.map((row) => (
                    <TableRow key={row.metric}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {SOURCE_COLUMNS.map((column) => (
                        <TableCell
                          key={column.key}
                          className="text-right text-sm text-muted-foreground"
                        >
                          —
                        </TableCell>
                      ))}
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatNumber(row.used)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {showPlanLimits && row.limit != null
                          ? `${formatNumber(row.remaining ?? 0)} / ${formatNumber(row.limit)}`
                          : formatNumber(row.used)}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      </FormSection>

      <FormSection
        title="Quota usage history"
        description="Committed usage ledger entries across the platform"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>When</TableHead>
                <TableHead className={HEAD}>User</TableHead>
                <TableHead className={HEAD}>Activity</TableHead>
                <TableHead className={cn(HEAD, "text-right")}>Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading history…
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No committed usage history yet.
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatWhen(entry.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {entry.userName || "Unknown user"}
                        </div>
                        {entry.userEmail ? (
                          <div className="text-xs text-muted-foreground">
                            {entry.userEmail}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm">{entry.activity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(entry.units)}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      </FormSection>
    </div>
  );
}
