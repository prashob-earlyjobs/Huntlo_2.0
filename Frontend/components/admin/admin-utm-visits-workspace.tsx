"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Megaphone, MousePointerClick } from "lucide-react";

import {
  getDefaultUtmDateRange,
  UtmDateRangeControls,
} from "@/components/admin/utm-date-range-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import type { AdminAttributedVisitsBreakdown } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-3)",
];

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

function sharePct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function ShareCell({ value, total }: { value: number; total: number }) {
  const pct = sharePct(value, total);
  return (
    <div className="min-w-[120px] space-y-1">
      <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums text-muted-foreground">
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/80"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function AdminUtmVisitsWorkspace() {
  const [range, setRange] = useState(getDefaultUtmDateRange);
  const [breakdown, setBreakdown] =
    useState<AdminAttributedVisitsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void adminApi
      .getAttributedVisitsBreakdown({ from: range.from, to: range.to })
      .then((data) => {
        if (cancelled) return;
        setBreakdown(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setBreakdown(null);
        setError(getApiErrorMessage(err, "Unable to load attributed visits."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const total = breakdown?.total ?? 0;
  const windowDays = breakdown?.windowDays ?? 0;

  const sourceChart = useMemo(
    () =>
      (breakdown?.bySource ?? []).slice(0, 8).map((row, index) => ({
        name: row.source,
        visits: row.visits,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [breakdown?.bySource]
  );

  const mediumChart = useMemo(
    () =>
      (breakdown?.byMedium ?? []).slice(0, 8).map((row, index) => ({
        name: row.medium,
        visits: row.visits,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [breakdown?.byMedium]
  );

  const campaignBars = useMemo(
    () =>
      (breakdown?.byCampaign ?? []).slice(0, 10).map((row) => ({
        name:
          row.campaign.length > 16
            ? `${row.campaign.slice(0, 16)}…`
            : row.campaign,
        fullName: `${row.source} / ${row.medium} / ${row.campaign}`,
        visits: row.visits,
      })),
    [breakdown?.byCampaign]
  );

  const sourceConfig = useMemo(
    () =>
      Object.fromEntries(
        sourceChart.map((row) => [row.name, { label: row.name, color: row.fill }])
      ) as ChartConfig,
    [sourceChart]
  );

  const mediumConfig = useMemo(
    () =>
      Object.fromEntries(
        mediumChart.map((row) => [row.name, { label: row.name, color: row.fill }])
      ) as ChartConfig,
    [mediumChart]
  );

  const campaignConfig = {
    visits: { label: "Visits", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attributed visits"
        description={
          loading
            ? "Loading visit attribution…"
            : `${formatNumber(total)} sessions with UTM tags from ${range.from} to ${range.to}${windowDays ? ` (${windowDays} days)` : ""}.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <UtmDateRangeControls
              from={range.from}
              to={range.to}
              onChange={setRange}
              disabled={loading}
            />
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={ADMIN_ROUTES.utmCampaigns} />}
            >
              <Megaphone aria-hidden />
              Campaigns
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={ADMIN_ROUTES.utm} />}
            >
              <ArrowLeft aria-hidden />
              Back
            </Button>
          </div>
        }
      />

      {error ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-destructive shadow-sm"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error && total === 0 ? (
        <EmptyState
          icon={MousePointerClick}
          title="No attributed visits yet"
          description="Open a marketing page with utm_source (or other UTM params) to record the first visit."
        />
      ) : null}

      {loading || total > 0 ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <FormSection
              title="Visits by source"
              description="Share of attributed sessions by utm_source."
            >
              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Loading sources…
                </div>
              ) : sourceChart.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  No source data yet.
                </div>
              ) : (
                <ChartContainer
                  config={sourceConfig}
                  className="mx-auto h-64 w-full max-w-md aspect-auto"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                      data={sourceChart}
                      dataKey="visits"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {sourceChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </FormSection>

            <FormSection
              title="Visits by medium"
              description="Share of attributed sessions by utm_medium."
            >
              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  Loading mediums…
                </div>
              ) : mediumChart.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                  No medium data yet.
                </div>
              ) : (
                <ChartContainer
                  config={mediumConfig}
                  className="mx-auto h-64 w-full max-w-md aspect-auto"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                      data={mediumChart}
                      dataKey="visits"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {mediumChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </FormSection>
          </div>

          <FormSection
            title="Top campaigns"
            description="Highest-volume source / medium / campaign combinations."
          >
            {loading ? (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                Loading campaigns…
              </div>
            ) : campaignBars.length === 0 ? (
              <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                No campaign data yet.
              </div>
            ) : (
              <ChartContainer
                config={campaignConfig}
                className="h-72 w-full aspect-auto"
              >
                <BarChart
                  data={campaignBars}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) => {
                          const full = payload?.[0]?.payload?.fullName;
                          return typeof full === "string" ? full : "";
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="visits"
                    fill="var(--color-visits)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </FormSection>

          <FormSection
            title="Source breakdown"
            description="Visits grouped by utm_source"
          >
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={HEAD}>Source</TableHead>
                    <TableHead className={cn(HEAD, "text-right")}>
                      Visits
                    </TableHead>
                    <TableHead className={HEAD}>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Loading sources…
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!loading
                    ? breakdown?.bySource.map((row) => (
                        <TableRow key={row.source}>
                          <TableCell className="font-medium">
                            {row.source}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatNumber(row.visits)}
                          </TableCell>
                          <TableCell>
                            <ShareCell value={row.visits} total={total} />
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </div>
          </FormSection>

          <FormSection
            title="Campaign breakdown"
            description="Visits by utm_source / utm_medium / utm_campaign"
          >
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={HEAD}>Source</TableHead>
                    <TableHead className={HEAD}>Medium</TableHead>
                    <TableHead className={HEAD}>Campaign</TableHead>
                    <TableHead className={cn(HEAD, "text-right")}>
                      Visits
                    </TableHead>
                    <TableHead className={HEAD}>Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Loading campaigns…
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!loading
                    ? breakdown?.byCampaign.map((row) => (
                        <TableRow
                          key={`${row.source}|${row.medium}|${row.campaign}`}
                        >
                          <TableCell className="font-medium">
                            {row.source}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.medium}
                          </TableCell>
                          <TableCell>{row.campaign}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatNumber(row.visits)}
                          </TableCell>
                          <TableCell>
                            <ShareCell value={row.visits} total={total} />
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </div>
          </FormSection>

          <FormSection
            title="Recent visits"
            description="Latest attributed landing sessions"
          >
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={HEAD}>When</TableHead>
                    <TableHead className={HEAD}>Source</TableHead>
                    <TableHead className={HEAD}>Medium</TableHead>
                    <TableHead className={HEAD}>Campaign</TableHead>
                    <TableHead className={HEAD}>Landing page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Loading recent visits…
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {!loading
                    ? breakdown?.recent.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatWhen(row.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {row.source}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.medium}
                          </TableCell>
                          <TableCell>{row.campaign}</TableCell>
                          <TableCell>
                            <div
                              className="max-w-[360px] truncate font-mono text-xs text-muted-foreground"
                              title={row.landingPage || undefined}
                            >
                              {row.landingPage || "—"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </div>
          </FormSection>
        </>
      ) : null}
    </div>
  );
}
