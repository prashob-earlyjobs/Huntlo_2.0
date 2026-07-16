import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import type { OverviewMetric } from "@/lib/mock-dashboard";
import { cn } from "@/lib/utils";

type MetricLike = Pick<
  OverviewMetric,
  "id" | "label" | "value" | "change" | "comparison" | "trend" | "tooltip"
>;

/**
 * Divided metric row for module pages — one border, no per-metric cards.
 */
export function MetricStrip({
  metrics,
  className,
  columns = "6",
}: {
  metrics: MetricLike[];
  className?: string;
  /** Column count at xl breakpoint: 3, 4, 5, or 6 (default). */
  columns?: "3" | "4" | "5" | "6";
}) {
  // Keep even row fills: avoid sm:grid-cols-3 when the target count is 4
  // (otherwise 3+1 leaves a gap on the second row).
  const gridCols =
    columns === "4"
      ? "grid-cols-2 sm:grid-cols-2 xl:grid-cols-4"
      : columns === "3"
        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-3"
        : columns === "5"
          ? "grid-cols-2 sm:grid-cols-2 xl:grid-cols-5"
          : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      <div className={cn("grid gap-px bg-border", gridCols)}>
        {metrics.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric as OverviewMetric} />
        ))}
      </div>
    </div>
  );
}
