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
  ADMIN_CAMPAIGNS,
  type AdminCampaign,
  type AdminCampaignStatus,
} from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_CLASS: Record<AdminCampaignStatus, string> = {
  Running: "bg-success/10 text-success",
  Paused: "bg-warning/10 text-warning",
  Queued: "bg-info/10 text-info",
  Completed: "bg-muted text-muted-foreground",
  Failed: "bg-destructive/10 text-destructive",
};

export function AdminCampaignsWorkspace() {
  const [campaigns, setCampaigns] = useState(ADMIN_CAMPAIGNS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function patch(id: string, patch: Partial<AdminCampaign>) {
    setCampaigns((previous) =>
      previous.map((campaign) =>
        campaign.id === id ? { ...campaign, ...patch } : campaign
      )
    );
  }

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
                        onClick={() => {
                          patch(campaign.id, {
                            status: "Paused",
                            queueState: "Paused by admin",
                          });
                          setToast(`Paused ${campaign.name}.`);
                        }}
                      >
                        <Pause aria-hidden />
                        Pause
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          patch(campaign.id, {
                            status: "Running",
                            queueState: "Resumed",
                            lastTrigger: "Just now",
                          });
                          setToast(`Resumed ${campaign.name}.`);
                        }}
                      >
                        <Play aria-hidden />
                        Resume
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          patch(campaign.id, {
                            errors: 0,
                            queueState: "Retrying failed items",
                            lastTrigger: "Just now",
                          });
                          setToast(`Retry queued for ${campaign.name}.`);
                        }}
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
