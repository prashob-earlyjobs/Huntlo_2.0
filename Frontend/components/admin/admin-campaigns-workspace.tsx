"use client";

import {
  AlertTriangle,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  type AdminCampaign,
  type AdminCampaignStatus,
} from "@/lib/mock-admin";
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

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

export function AdminCampaignsWorkspace() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void adminApi
      .listCampaigns({ limit: 100 })
      .then((result) => {
        setCampaigns(
          result.items.map((item) => ({
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
          }))
        );
      })
      .catch((error) => {
        setCampaigns([]);
        setToast(getApiErrorMessage(error, "Unable to load campaigns."));
      });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign monitoring"
        description="Live outreach, Huntlo 360 and screening queues across the platform."
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
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="min-w-[12rem] font-medium">
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
                <TableCell className="max-w-[10rem] text-sm text-muted-foreground">
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
