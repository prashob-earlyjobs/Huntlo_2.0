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
    <div aria-busy className={cn("bg-card px-3 py-2.5", className)}>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-5 w-12" />
      <Skeleton className="mt-1.5 h-3 w-20" />
    </div>
  );
}

/**
 * Compact metric cell for operational strips — no icon wells or card chrome.
 * Place inside a divided grid container on the dashboard.
 */
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
    <div className={cn("min-w-0 bg-card px-3 py-2.5", className)}>
      <div className="flex items-center gap-1">
        <p className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">
          {metric.label}
        </p>
        <Tooltip>
          <TooltipTrigger
            aria-label={`About ${metric.label}`}
            className="shrink-0 rounded-sm text-muted-foreground/50 outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Info aria-hidden className="size-3" />
          </TooltipTrigger>
          <TooltipContent>{metric.tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <p className="mt-1 text-metric text-xl leading-none font-semibold text-foreground">
        {metric.value}
      </p>
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-medium tabular-nums",
            metric.trend === "up" && "text-success",
            metric.trend === "down" && "text-destructive"
          )}
        >
          <TrendIcon aria-hidden className="size-2.5" />
          {metric.change}
        </span>
        <span className="truncate">{metric.comparison}</span>
      </p>
    </div>
  );
}
