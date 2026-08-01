import { Filter } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/lib/mock-dashboard";

const formatCount = (value: number) => value.toLocaleString("en-IN");

const SEGMENT_TONES = [
  "bg-primary",
  "bg-primary/85",
  "bg-primary/70",
  "bg-primary/55",
  "bg-primary/40",
  "bg-primary/30",
];

/**
 * Compact single-row pipeline summary — a proportional bar with a
 * stage legend underneath, instead of a grid of equal-sized cards.
 */
export function PipelineFunnel({
  stages,
  className,
}: {
  stages: PipelineStage[];
  className?: string;
}) {
  if (stages.length === 0) {
    return (
      <EmptyState
        icon={Filter}
        title="No pipeline activity yet"
        description="Source candidates for an active job to see your funnel here."
        className={className}
      />
    );
  }

  const total = Math.max(0, Number(stages[0]?.count) || 0);

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {stages.map((stage, index) => {
          const count = Math.max(0, Number(stage.count) || 0);
          const width =
            total > 0 ? Math.max((count / total) * 100, count > 0 ? 1.5 : 0) : 0;
          if (width <= 0) return null;
          return (
            <Tooltip key={stage.id}>
              <TooltipTrigger
                aria-label={`${stage.label}: ${formatCount(count)} candidates`}
                className="h-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                style={{ width: `${width}%` }}
              >
                <span
                  className={cn(
                    "block h-full",
                    SEGMENT_TONES[index % SEGMENT_TONES.length]
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                {stage.label}: {formatCount(count)}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <dl className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
        {stages.map((stage, index) => {
          const count = Math.max(0, Number(stage.count) || 0);
          const previousCount =
            index > 0 ? Math.max(0, Number(stages[index - 1]?.count) || 0) : null;
          const conversion =
            previousCount === null
              ? null
              : previousCount > 0
                ? Math.round((count / previousCount) * 100)
                : null;
          return (
            <div key={stage.id} className="flex items-baseline gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  SEGMENT_TONES[index % SEGMENT_TONES.length]
                )}
              />
              <dt className="text-xs text-muted-foreground">{stage.label}</dt>
              <dd className="text-xs font-medium tabular-nums text-foreground">
                {formatCount(count)}
              </dd>
              {conversion !== null ? (
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  ({conversion}%)
                </span>
              ) : index > 0 ? (
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  (—)
                </span>
              ) : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
