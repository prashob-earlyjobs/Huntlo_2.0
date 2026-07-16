import { Filter } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/lib/mock-dashboard";

const formatCount = (value: number) => value.toLocaleString("en-IN");

/**
 * Horizontal funnel across the recruiting stages. Conversion, drop-off
 * and share of total are derived from the ordered stage counts.
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

  const total = stages[0].count;

  return (
    <section className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <SectionHeader
        title="Recruiting pipeline"
        description="Stage-by-stage conversion across all active jobs"
      />
      <ol className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 xl:grid-cols-7">
        {stages.map((stage, index) => {
          const previous = index > 0 ? stages[index - 1] : null;
          const shareOfTotal = Math.round((stage.count / total) * 100);
          const conversion = previous
            ? Math.round((stage.count / previous.count) * 100)
            : 100;
          const dropOff = previous ? previous.count - stage.count : 0;

          return (
            <li key={stage.id} className="bg-card p-3">
              <p className="truncate text-xs font-medium text-muted-foreground">
                {stage.label}
              </p>
              <p className="mt-1.5 text-metric text-lg leading-none font-semibold text-foreground">
                {formatCount(stage.count)}
              </p>
              <Tooltip>
                <TooltipTrigger
                  aria-label={`${stage.label}: ${formatCount(stage.count)} candidates, ${shareOfTotal}% of sourced${
                    previous
                      ? `, ${conversion}% conversion from ${previous.label}, ${formatCount(dropOff)} dropped off`
                      : ""
                  }`}
                  className="mt-2.5 block w-full rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    aria-hidden
                    className="block h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(shareOfTotal, 2)}%` }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {previous
                    ? `${conversion}% converted from ${previous.label} · ${formatCount(dropOff)} dropped off`
                    : "Top of funnel — all sourced candidates"}
                </TooltipContent>
              </Tooltip>
              <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
                <span className="tabular-nums text-muted-foreground">
                  {shareOfTotal}% of total
                </span>
                {previous ? (
                  <span className="tabular-nums font-medium text-foreground">
                    {conversion}%
                  </span>
                ) : (
                  <span className="text-muted-foreground">All</span>
                )}
              </div>
              {previous ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  −{formatCount(dropOff)} drop-off
                </p>
              ) : (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Top of funnel
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
