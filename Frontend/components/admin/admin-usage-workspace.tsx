"use client";

import { MoveDownRight, MoveRight, MoveUpRight } from "lucide-react";
import { useEffect, useState } from "react";

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
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { UsageByAction } from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const ACTION_LABELS: Record<string, string> = {
  candidate_search: "Candidate search",
  email_reveal: "Email reveal",
  mobile_reveal: "Mobile reveal",
  people_scout: "People Scout lookup",
  email_outreach: "Email send",
  whatsapp_outreach: "WhatsApp send",
  ai_voice_minutes: "AI voice call",
  assessment_invites: "Assessment invite",
  team_seats: "Team seats",
};

export function AdminUsageWorkspace() {
  const [byAction, setByAction] = useState<UsageByAction[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void adminApi
      .getUsage()
      .then((result) => {
        setByAction(
          result.byAction.map((row) => {
            const action = String(row.action || "");
            const used = Number(row.used || 0);
            return {
              action: ACTION_LABELS[action] || action,
              count: used.toLocaleString("en-IN"),
              change: "—",
              trend: "flat" as const,
            };
          })
        );
      })
      .catch((error) => {
        setByAction([]);
        setToast(getApiErrorMessage(error, "Unable to load usage analytics."));
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
        title="Usage analytics"
        description="Consumption by action, provider, plan and user — plus anomalies and failures."
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <FormSection
        title="Usage by action"
        description="Platform actions in the last 24 hours"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>Action</TableHead>
                <TableHead className={HEAD}>Count</TableHead>
                <TableHead className={HEAD}>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byAction.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No usage recorded in this period.
                  </TableCell>
                </TableRow>
              ) : null}
              {byAction.map((row) => {
                const TrendIcon =
                  row.trend === "up"
                    ? MoveUpRight
                    : row.trend === "down"
                      ? MoveDownRight
                      : MoveRight;
                return (
                  <TableRow key={row.action}>
                    <TableCell className="font-medium">{row.action}</TableCell>
                    <TableCell className="tabular-nums">{row.count}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-sm font-medium",
                          row.trend === "up" && "text-success",
                          row.trend === "down" && "text-destructive"
                        )}
                      >
                        <TrendIcon aria-hidden className="size-3" />
                        {row.change}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </FormSection>

    </div>
  );
}
