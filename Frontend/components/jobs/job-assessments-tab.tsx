"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  assessmentsApi,
  type AssessmentCampaign,
} from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { Status } from "@/lib/types";

function toStatus(value: string): Status {
  const allowed: Status[] = [
    "Draft",
    "Active",
    "Paused",
    "On Hold",
    "Closed",
    "Archived",
    "Completed",
    "Scheduled",
    "Running",
    "Failed",
  ];
  if (allowed.includes(value as Status)) return value as Status;
  if (value === "Cancelled") return "Closed";
  return "Draft";
}

export function JobAssessmentsTab({ jobId }: { jobId: string }) {
  const [rows, setRows] = useState<AssessmentCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const campaigns = await assessmentsApi.listCampaigns({ jobId });
        if (!cancelled) setRows(campaigns);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (loading) {
    return (
      <p className="px-1 py-6 text-sm text-muted-foreground">Loading assessments…</p>
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No assessments yet"
        description="Launch a skills assessment campaign for candidates on this job."
        actionLabel="Open assessments"
        actionHref={ROUTES.assessments}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead className="text-right">Invited</TableHead>
            <TableHead className="text-right">Completed</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <Link href={ROUTES.assessments} className="text-primary hover:underline">
                  {campaign.name}
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums">{campaign.invited}</TableCell>
              <TableCell className="text-right tabular-nums">{campaign.completed}</TableCell>
              <TableCell>
                <StatusBadge status={toStatus(campaign.status)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
