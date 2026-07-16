"use client";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { ChartCard } from "@/components/shared/chart-card";
import { PageHeader } from "@/components/shared/page-header";
import { ADMIN_CHARTS, ADMIN_METRICS } from "@/lib/mock-admin";

export function AdminDashboardWorkspace() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Platform-wide health across users, usage and revenue. UI preview only."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ADMIN_CHARTS.map((chart) => (
          <ChartCard key={chart.title} chart={chart} />
        ))}
      </div>
    </div>
  );
}
