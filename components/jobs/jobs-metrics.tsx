import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import type { JobMetric } from "@/lib/mock-jobs";
import type { OverviewMetric } from "@/lib/mock-dashboard";

export function JobsMetrics({ metrics }: { metrics: JobMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => (
        <OverviewMetricCard key={metric.id} metric={metric as OverviewMetric} />
      ))}
    </div>
  );
}
