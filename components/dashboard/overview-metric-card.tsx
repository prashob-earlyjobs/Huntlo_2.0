import { Info, MoveDownRight, MoveRight, MoveUpRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { OverviewMetric } from "@/lib/mock-dashboard";

/** Skeleton shown while an overview metric is loading. */
export function OverviewMetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy
      className={cn("rounded-xl border border-border bg-card p-4", className)}
    >
      <div className="flex items-center gap-2">
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-2 h-3.5 w-28" />
    </div>
  );
}

export function OverviewMetricCard({
  metric,
  loading = false,
  className,
}: {
  metric: OverviewMetric;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return <OverviewMetricCardSkeleton className={className} />;
  }

  const TrendIcon =
    metric.trend === "up"
      ? MoveUpRight
      : metric.trend === "down"
        ? MoveDownRight
        : MoveRight;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
          <metric.icon aria-hidden className="size-4 text-muted-foreground" />
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
          {metric.label}
        </p>
        <Tooltip>
          <TooltipTrigger
            aria-label={`About ${metric.label}`}
            className="shrink-0 rounded-sm text-muted-foreground/60 outline-none hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Info aria-hidden className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>{metric.tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <p className="mt-3 text-metric text-[26px] leading-none font-semibold text-foreground">
        {metric.value}
      </p>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-medium tabular-nums",
            metric.trend === "up" && "text-success",
            metric.trend === "down" && "text-destructive"
          )}
        >
          <TrendIcon aria-hidden className="size-3" />
          {metric.change}
        </span>
        <span className="truncate">{metric.comparison}</span>
      </p>
    </div>
  );
}
