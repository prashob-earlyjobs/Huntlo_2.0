"use client";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pause,
  Play,
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
  type AdminCampaign,
  type AdminCampaignStatus,
} from "@/lib/mock-admin";
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const STATUS_CLASS: Record<AdminCampaignStatus, string> = {
  Running: "bg-success/10 text-success",
  Paused: "bg-warning/10 text-warning",
  Queued: "bg-info/10 text-info",
  Completed: "bg-muted text-muted-foreground",
  Failed: "bg-destructive/10 text-destructive",
};

function mapCampaignStatus(status: string): AdminCampaignStatus {
  const normalized = status.toLowerCase();
  if (normalized.includes("pause")) return "Paused";
  if (normalized.includes("queue") || normalized.includes("draft")) return "Queued";
  if (normalized.includes("fail") || normalized.includes("error")) return "Failed";
  if (
    normalized.includes("complete") ||
    normalized.includes("done") ||
    normalized.includes("archiv")
  ) {
    return "Completed";
  }
  return "Running";
}

function mapCampaign(item: {
  id: string;
  name?: string;
  workspace: string;
  sourceModule: string;
  channels?: string[];
  candidates: number;
  status: string;
  queueState?: string;
  lastTrigger?: string | null;
  errors?: number;
}): AdminCampaign {
  return {
    id: item.id,
    name: item.name || "Untitled campaign",
    workspace: item.workspace,
    sourceModule: item.sourceModule,
    channels: item.channels?.length ? item.channels : ["—"],
    candidates: item.candidates,
    status: mapCampaignStatus(item.status),
    queueState: item.queueState || item.status,
    lastTrigger: item.lastTrigger
      ? new Date(item.lastTrigger).toLocaleString("en-IN")
      : "—",
    errors: item.errors || 0,
  };
}

export function AdminCampaignsWorkspace() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
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
  }, [debouncedQuery, pageSize]);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listCampaigns({
        page,
        limit: pageSize,
        q: debouncedQuery || undefined,
      });
      setCampaigns(result.items.map(mapCampaign));
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
      if (result.page !== page) setPage(result.page);
      setToast(null);
    } catch (error) {
      setCampaigns([]);
      setTotal(0);
      setTotalPages(1);
      setToast(getApiErrorMessage(error, "Unable to load campaigns."));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQuery]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

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
        title="Campaign monitoring"
        description="Live outreach, Huntlo 360 and screening queues across the platform."
        actions={
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search campaigns or workspaces…"
            className="w-56 sm:w-72"
          />
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
              <TableHead className={HEAD}>Campaign</TableHead>
              <TableHead className={HEAD}>Workspace</TableHead>
              <TableHead className={HEAD}>Source module</TableHead>
              <TableHead className={HEAD}>Channels</TableHead>
              <TableHead className={HEAD}>Candidates</TableHead>
              <TableHead className={HEAD}>Current status</TableHead>
              <TableHead className={HEAD}>Queue state</TableHead>
              <TableHead className={HEAD}>Last trigger</TableHead>
              <TableHead className={HEAD}>Errors</TableHead>
              <TableHead className={HEAD}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading campaigns…
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && campaigns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : null}
            {!loading
              ? campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="min-w-48 font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {campaign.workspace}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {campaign.sourceModule}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {campaign.channels.map((channel) => (
                          <span
                            key={channel}
                            className="inline-flex h-5 items-center rounded-md border border-border bg-card px-2 text-xs font-medium"
                          >
                            {channel}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {campaign.candidates}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                          STATUS_CLASS[campaign.status]
                        )}
                      >
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-40 text-sm text-muted-foreground">
                      {campaign.queueState}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {campaign.lastTrigger}
                    </TableCell>
                    <TableCell>
                      {campaign.errors > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
                          <AlertTriangle aria-hidden className="size-3.5" />
                          {campaign.errors}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label={`Actions for ${campaign.name}`}
                            />
                          }
                        >
                          <MoreHorizontal aria-hidden />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setToast(
                                "Campaign control from admin console is read-only."
                              )
                            }
                          >
                            <Pause aria-hidden />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setToast(
                                "Campaign control from admin console is read-only."
                              )
                            }
                          >
                            <Play aria-hidden />
                            Resume
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setToast(
                                "Campaign control from admin console is read-only."
                              )
                            }
                          >
                            <RefreshCw aria-hidden />
                            Retry errors
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              ? "No campaigns"
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
