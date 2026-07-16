"use client";

import { MoveDownRight, MoveRight, MoveUpRight } from "lucide-react";

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
  FAILED_OPERATIONS,
  USAGE_ANOMALIES,
  USAGE_BY_ACTION,
  USAGE_BY_PLAN,
  USAGE_BY_PROVIDER,
  USAGE_BY_USER,
} from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const SEVERITY_CLASS = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-muted text-muted-foreground",
} as const;

export function AdminUsageWorkspace() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage analytics"
        description="Consumption by action, provider, plan and user — plus anomalies and failures."
      />

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
              {USAGE_BY_ACTION.map((row) => {
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

      <FormSection
        title="Usage by provider"
        description="Upstream API health today"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>Provider</TableHead>
                <TableHead className={HEAD}>Requests</TableHead>
                <TableHead className={HEAD}>Errors</TableHead>
                <TableHead className={HEAD}>Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USAGE_BY_PROVIDER.map((row) => (
                <TableRow key={row.provider}>
                  <TableCell className="font-medium">{row.provider}</TableCell>
                  <TableCell className="tabular-nums">{row.requests}</TableCell>
                  <TableCell className="tabular-nums text-sm">{row.errors}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.latency}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FormSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <FormSection
          title="Usage by plan"
          description="Aggregated consumption this billing cycle"
        >
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD}>Plan</TableHead>
                  <TableHead className={HEAD}>Workspaces</TableHead>
                  <TableHead className={HEAD}>Searches</TableHead>
                  <TableHead className={HEAD}>Reveals</TableHead>
                  <TableHead className={HEAD}>Outreach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USAGE_BY_PLAN.map((row) => (
                  <TableRow key={row.plan}>
                    <TableCell className="font-medium">{row.plan}</TableCell>
                    <TableCell className="tabular-nums">{row.workspaces}</TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {row.searches}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {row.reveals}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {row.outreach}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FormSection>

        <FormSection
          title="Usage by user"
          description="Top consumers today"
        >
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD}>User</TableHead>
                  <TableHead className={HEAD}>Action</TableHead>
                  <TableHead className={HEAD}>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USAGE_BY_USER.map((row) => (
                  <TableRow key={`${row.user}-${row.action}`}>
                    <TableCell>
                      <p className="font-medium">{row.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.organisation}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{row.action}</TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {row.volume}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FormSection>
      </div>

      <FormSection
        title="Usage anomalies"
        description="Automated detectors — placeholders for ops review"
      >
        <ul className="space-y-2">
          {USAGE_ANOMALIES.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
                      SEVERITY_CLASS[item.severity]
                    )}
                  >
                    {item.severity}
                  </span>
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <p className="shrink-0 text-xs text-muted-foreground">
                {item.detectedAt}
              </p>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection
        title="Failed operations"
        description="Recent provider and billing failures"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>Operation</TableHead>
                <TableHead className={HEAD}>Provider</TableHead>
                <TableHead className={HEAD}>Workspace</TableHead>
                <TableHead className={HEAD}>Error</TableHead>
                <TableHead className={HEAD}>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FAILED_OPERATIONS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.operation}</TableCell>
                  <TableCell className="text-sm">{row.provider}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.workspace}
                  </TableCell>
                  <TableCell className="max-w-[16rem] text-sm text-destructive">
                    {row.error}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {row.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FormSection>
    </div>
  );
}
