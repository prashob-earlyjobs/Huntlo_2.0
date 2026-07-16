import { MetricStrip } from "@/components/shared/metric-strip";
import type { JobMetric } from "@/lib/mock-jobs";

export function JobsMetrics({ metrics }: { metrics: JobMetric[] }) {
  return <MetricStrip metrics={metrics} columns="4" />;
}
