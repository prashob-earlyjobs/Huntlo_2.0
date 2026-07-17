"use client";

import { useEffect, useState } from "react";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { ChartCard } from "@/components/shared/chart-card";
import { PageHeader } from "@/components/shared/page-header";
import { adminApi, type AdminMetric } from "@/lib/api/admin";
import type { OverviewMetric } from "@/lib/mock-dashboard";
import type { PlaceholderChart } from "@/lib/types";
import { Building2, CreditCard, IndianRupee, Megaphone, Search, Users, AudioLines, Eye } from "lucide-react";

const ICON_MAP: Record<string, typeof Users> = {
  users: Users,
  workspaces: Building2,
  paid: CreditCard,
  searches: Search,
  reveals: Eye,
  campaigns: Megaphone,
  voice: AudioLines,
  revenue: IndianRupee,
};

export function AdminDashboardWorkspace() {
  const [metrics, setMetrics] = useState<OverviewMetric[]>([]);
  const [charts, setCharts] = useState<PlaceholderChart[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminApi
      .getDashboard()
      .then((data) => {
        setError(null);
        const mapped = (data.metrics as AdminMetric[]).map((metric) => ({
          ...metric,
          icon: ICON_MAP[metric.id] ?? Users,
          change: metric.change || "",
          trend: metric.trend || "flat",
          comparison: metric.comparison || "",
          tooltip: metric.tooltip || metric.label,
        }));
        setMetrics(mapped as OverviewMetric[]);
        setCharts(data.charts ?? []);
      })
      .catch((err) => {
        setMetrics([]);
        setCharts([]);
        setError(err instanceof Error ? err.message : "Unable to load admin dashboard");
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Platform-wide health across users, usage and revenue."
      />
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {charts.map((chart) => (
          <ChartCard key={chart.title} chart={chart} />
        ))}
      </div>
    </div>
  );
}
