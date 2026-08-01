"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  MousePointerClick,
  Target,
  UserPlus,
} from "lucide-react";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import {
  getDefaultUtmDateRange,
  UtmDateRangeControls,
} from "@/components/admin/utm-date-range-controls";
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
import { adminApi } from "@/lib/api";
import type { AdminUtmOverview } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import type { OverviewMetric } from "@/lib/mock-dashboard";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const TREND_CONFIG = {
  visits: { label: "Visits", color: "var(--chart-1)" },
  signups: { label: "Signups", color: "var(--chart-4)" },
  demos: { label: "Demo clicks", color: "var(--chart-2)" },
  conversions: { label: "Conversions", color: "var(--chart-5)" },
} satisfies ChartConfig;

const CAMPAIGN_CONFIG = {
  visits: { label: "Visits", color: "var(--chart-1)" },
  signups: { label: "Signups", color: "var(--chart-4)" },
  demos: { label: "Demos", color: "var(--chart-2)" },
} satisfies ChartConfig;

const SOURCE_COLORS = [
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
    hour: "numeric",
    minute: "2-digit",
  });
}

function rate(part: number, whole: number): string {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function outcomeTone(eventType: string): string {
  if (eventType === "signup") return "bg-success/15 text-success";
  if (eventType === "demo_clicked") return "bg-info/15 text-info";
  if (eventType === "conversion") return "bg-primary/15 text-primary";
  return "bg-muted text-muted-foreground";
}

function FunnelStep({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const width = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 8;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatNumber(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width]", tone)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function AdminUtmWorkspace() {
  const [range, setRange] = useState(getDefaultUtmDateRange);
  const [query, setQuery] = useState("");
  const [medium, setMedium] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [overview, setOverview] = useState<AdminUtmOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void adminApi
      .getUtmOverview({ from: range.from, to: range.to })
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setOverview(null);
        setError(getApiErrorMessage(err, "Unable to load UTM attribution."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const metrics = useMemo<OverviewMetric[]>(() => {
    const visits = overview?.visits;
    const signups = overview?.signups;
    const demos = overview?.demos;
    const conversions = overview?.conversions;

    return [
      {
        id: "visits",
        label: "Attributed visits",
        value: visits ? formatNumber(visits.value) : loading ? "…" : "0",
        change: visits?.change ?? "—",
        trend: visits?.trend ?? "flat",
        comparison: visits?.comparison ?? `${range.from} → ${range.to}`,
        tooltip:
          "Unique browser sessions (per day) that arrived with UTM parameters. Click for breakdown.",
        icon: MousePointerClick,
      },
      {
        id: "signups",
        label: "Signups",
        value: signups ? formatNumber(signups.value) : loading ? "…" : "0",
        change: signups?.change ?? "—",
        trend: signups?.trend ?? "flat",
        comparison: signups?.comparison ?? "attributed signups",
        tooltip: "Accounts created with stored UTM attribution.",
        icon: UserPlus,
      },
      {
        id: "demos",
        label: "Demo clicks",
        value: demos ? formatNumber(demos.value) : loading ? "…" : "0",
        change: demos?.change ?? "—",
        trend: demos?.trend ?? "flat",
        comparison: demos?.comparison ?? "Book Demo clicks",
        tooltip:
          "Book Demo CTA clicks that carried UTM attribution (proxy until Calendly booking webhook).",
        icon: CalendarCheck2,
      },
      {
        id: "conversions",
        label: "Downstream conversions",
        value: conversions
          ? formatNumber(conversions.value)
          : loading
            ? "…"
            : "0",
        change: conversions?.change ?? "—",
        trend: conversions?.trend ?? "flat",
        comparison: conversions?.comparison ?? "signup conversions",
        tooltip: "Attributed signup conversions from UTM traffic.",
        icon: Target,
      },
    ];
  }, [loading, overview, range.from, range.to]);

  const filteredRows = useMemo(() => {
    const rows = overview?.campaigns ?? [];
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (medium !== "all" && row.medium !== medium) return false;
      if (!q) return true;
      return [row.source, row.medium, row.campaign, row.content, row.term]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [medium, overview?.campaigns, query]);

  useEffect(() => {
    setPage(1);
  }, [query, medium, pageSize, range.from, range.to]);

  const totalCampaignRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCampaignRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const rangeStart =
    totalCampaignRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCampaignRows);
  const pagedRows = useMemo(
    () => filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredRows, pageSize, safePage]
  );

  const mediumOptions = useMemo(
    () =>
      Array.from(
        new Set((overview?.campaigns ?? []).map((row) => row.medium))
      ).sort(),
    [overview?.campaigns]
  );

  const daily = overview?.daily ?? [];
  const hasTrend = daily.some(
    (d) => d.visits + d.signups + d.demos + d.conversions > 0
  );

  const sourceShare = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of overview?.campaigns ?? []) {
      map.set(row.source, (map.get(row.source) ?? 0) + row.visits);
    }
    return [...map.entries()]
      .map(([source, visits]) => ({ source, visits, fill: "" }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 6)
      .map((row, index) => ({
        ...row,
        fill: SOURCE_COLORS[index % SOURCE_COLORS.length],
      }));
  }, [overview?.campaigns]);

  const topCampaigns = useMemo(
    () =>
      (overview?.campaigns ?? [])
        .slice(0, 8)
        .map((row) => ({
          name:
            row.campaign.length > 18
              ? `${row.campaign.slice(0, 18)}…`
              : row.campaign,
          fullName: `${row.source} / ${row.medium} / ${row.campaign}`,
          visits: row.visits,
          signups: row.signups,
          demos: row.demos,
        })),
    [overview?.campaigns]
  );

  const funnelMax = Math.max(
    overview?.visits.value ?? 0,
    overview?.demos.value ?? 0,
    overview?.signups.value ?? 0,
    overview?.conversions.value ?? 0,
    1
  );

  const recentEvents = overview?.recentEvents ?? [];
  const sourceConfig = useMemo(
    () =>
      Object.fromEntries(
        sourceShare.map((row) => [
          row.source,
          { label: row.source, color: row.fill },
        ])
      ) as ChartConfig,
    [sourceShare]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="UTM attribution"
        description="Track which sources, mediums, and campaigns drive visits, signups, demos, and conversions."
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

      <div className="grid gap-3 overflow-hidden rounded-lg border border-border sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          if (metric.id !== "visits") {
            return (
              <OverviewMetricCard
                key={metric.id}
                metric={metric}
                loading={loading}
                className="border-b border-border sm:border-r sm:odd:border-r xl:border-b-0 xl:last:border-r-0"
              />
            );
          }

          return (
            <Link
              key={metric.id}
              href={ADMIN_ROUTES.utmVisits}
              className="relative min-w-0 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="Open attributed visits page"
            >
              <OverviewMetricCard
                metric={metric}
                loading={loading}
                className="border-b border-border sm:border-r sm:odd:border-r xl:border-b-0"
              />
              <ArrowUpRight
                aria-hidden
                className="pointer-events-none absolute right-3 top-3 size-3.5 text-muted-foreground"
              />
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <FormSection
          title="Attribution trend"
          description={`Daily visits, signups, demos, and conversions from ${range.from} to ${range.to}.`}
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Loading trend…
            </div>
          ) : !hasTrend ? (
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
              No attributed activity yet in this range. Open a marketing URL with
              UTM params to start the trend.
            </div>
          ) : (
            <ChartContainer config={TREND_CONFIG} className="h-64 w-full aspect-auto">
              <AreaChart data={daily} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="visits"
                  type="monotone"
                  fill="var(--color-visits)"
                  fillOpacity={0.12}
                  stroke="var(--color-visits)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="signups"
                  type="monotone"
                  fill="var(--color-signups)"
                  fillOpacity={0.1}
                  stroke="var(--color-signups)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="demos"
                  type="monotone"
                  fill="var(--color-demos)"
                  fillOpacity={0.08}
                  stroke="var(--color-demos)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="conversions"
                  type="monotone"
                  fill="var(--color-conversions)"
                  fillOpacity={0.08}
                  stroke="var(--color-conversions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </FormSection>

        <FormSection
          title="Conversion funnel"
          description="How UTM traffic moves from visit → demo → signup."
        >
          <div className="space-y-4 pt-1">
            <FunnelStep
              label="Attributed visits"
              value={overview?.visits.value ?? 0}
              max={funnelMax}
              tone="bg-chart-1"
            />
            <FunnelStep
              label="Demo clicks"
              value={overview?.demos.value ?? 0}
              max={funnelMax}
              tone="bg-chart-2"
            />
            <FunnelStep
              label="Signups"
              value={overview?.signups.value ?? 0}
              max={funnelMax}
              tone="bg-chart-4"
            />
            <FunnelStep
              label="Conversions"
              value={overview?.conversions.value ?? 0}
              max={funnelMax}
              tone="bg-chart-5"
            />
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs">
              <div>
                <p className="text-muted-foreground">Visit → signup</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {rate(overview?.signups.value ?? 0, overview?.visits.value ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Visit → demo</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">
                  {rate(overview?.demos.value ?? 0, overview?.visits.value ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FormSection
          title="Top sources"
          description="Visit share by utm_source."
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Loading sources…
            </div>
          ) : sourceShare.length === 0 ? (
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
                  content={<ChartTooltipContent nameKey="source" hideLabel />}
                />
                <Pie
                  data={sourceShare}
                  dataKey="visits"
                  nameKey="source"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {sourceShare.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="source" />}
                  className="-translate-y-1 flex-wrap gap-2"
                />
              </PieChart>
            </ChartContainer>
          )}
        </FormSection>

        <FormSection
          title="Campaign comparison"
          description="Visits, signups, and demos for top campaigns."
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Loading campaigns…
            </div>
          ) : topCampaigns.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              No campaign data yet.
            </div>
          ) : (
            <ChartContainer
              config={CAMPAIGN_CONFIG}
              className="h-64 w-full aspect-auto"
            >
              <BarChart
                data={topCampaigns}
                margin={{ left: 4, right: 8, top: 8 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  angle={topCampaigns.length > 5 ? -20 : 0}
                  textAnchor={topCampaigns.length > 5 ? "end" : "middle"}
                  height={topCampaigns.length > 5 ? 48 : 28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  allowDecimals={false}
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
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="visits"
                  fill="var(--color-visits)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="signups"
                  fill="var(--color-signups)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="demos"
                  fill="var(--color-demos)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ChartContainer>
          )}
        </FormSection>
      </div>

      <FormSection
        title="Campaign performance"
        description="Breakdown by utm_source / utm_medium / utm_campaign."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter source, campaign, content…"
            className="sm:max-w-sm"
          />
          <Select
            value={medium}
            onValueChange={(value) => setMedium(value ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Medium" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All mediums</SelectItem>
              {mediumOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>Source</TableHead>
                <TableHead className={HEAD}>Medium</TableHead>
                <TableHead className={HEAD}>Campaign</TableHead>
                <TableHead className={cn(HEAD, "text-right")}>Visits</TableHead>
                <TableHead className={cn(HEAD, "text-right")}>Signups</TableHead>
                <TableHead className={cn(HEAD, "text-right")}>Demos</TableHead>
                <TableHead className={cn(HEAD, "text-right")}>
                  Conv. rate
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-16 text-center text-sm text-muted-foreground"
                  >
                    Loading campaigns…
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-20 text-center text-sm text-muted-foreground"
                  >
                    <p>
                      No attributed campaigns yet. Create a tracked campaign or
                      open a marketing URL with UTM params.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      nativeButton={false}
                      render={<Link href={ADMIN_ROUTES.utmCampaigns} />}
                    >
                      <Megaphone aria-hidden />
                      Create UTM campaign
                    </Button>
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? pagedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.source}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.medium}
                      </TableCell>
                      <TableCell>{row.campaign}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(row.visits)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(row.signups)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(row.demos)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {rate(row.conversions, row.visits)}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>

        {!loading && totalCampaignRows > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Showing {rangeStart}–{rangeEnd} of{" "}
              {totalCampaignRows.toLocaleString("en-IN")}
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
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Previous page"
                  disabled={safePage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Next page"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </FormSection>

      <FormSection
        title="Recent attributed events"
        description="Latest signup, demo click, and conversion events from UTM traffic."
      >
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>When</TableHead>
                <TableHead className={HEAD}>Source / medium</TableHead>
                <TableHead className={HEAD}>Campaign</TableHead>
                <TableHead className={HEAD}>Landing page</TableHead>
                <TableHead className={HEAD}>Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-16 text-center text-sm text-muted-foreground"
                  >
                    Loading events…
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading && recentEvents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-16 text-center text-sm text-muted-foreground"
                  >
                    No attributed events yet. Signup or click Book Demo after a
                    UTM landing to record one.
                  </TableCell>
                </TableRow>
              ) : null}
              {!loading
                ? recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatWhen(event.when)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{event.source}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {event.medium}
                        </span>
                      </TableCell>
                      <TableCell>{event.campaign}</TableCell>
                      <TableCell className="max-w-[240px] truncate font-mono text-[12px] text-muted-foreground">
                        {event.landingPage}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
                            outcomeTone(event.eventType)
                          )}
                        >
                          {event.outcome}
                        </span>
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
