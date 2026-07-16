"use client";

import { ScoreBreakdown } from "@/components/shared/score-breakdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MATCH_CATEGORY_LABELS,
  type MatchBreakdown,
} from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

export function breakdownItems(breakdown: MatchBreakdown) {
  return (Object.keys(MATCH_CATEGORY_LABELS) as (keyof MatchBreakdown)[]).map(
    (key) => ({
      label: MATCH_CATEGORY_LABELS[key],
      score: breakdown[key],
    })
  );
}

function scoreToneClass(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

/** Restrained quality label — this is a directional mock score, not a precise metric. */
export function matchQualityLabel(score: number): string {
  if (score >= 85) return "Strong match";
  if (score >= 70) return "Good match";
  if (score >= 50) return "Fair match";
  return "Weak match";
}

/**
 * Compact numeric match score for the sessions feature — a colored number
 * plus a restrained text label. No ring, no gradient, no false precision.
 */
export function MatchScoreCompact({
  score,
  showLabel = true,
  className,
}: {
  score: number;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5", className)}
      aria-label={`Match score ${score} out of 100 — ${matchQualityLabel(score)}`}
    >
      <span className={cn("text-sm font-semibold tabular-nums", scoreToneClass(score))}>
        {score}
      </span>
      {showLabel ? (
        <span className="text-[11px] whitespace-nowrap text-muted-foreground">
          {matchQualityLabel(score)}
        </span>
      ) : null}
    </span>
  );
}

/** Match score that reveals a category breakdown on click/focus. */
export function MatchScoreDetail({
  score,
  breakdown,
  name,
  showLabel = true,
}: {
  score: number;
  breakdown: MatchBreakdown;
  name: string;
  showLabel?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Match score ${score} for ${name} — view breakdown`}
        className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MatchScoreCompact score={score} showLabel={showLabel} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <p className="text-xs font-semibold text-foreground">
          Match breakdown
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How {name.split(" ")[0]} scores against this search
        </p>
        <ScoreBreakdown items={breakdownItems(breakdown)} className="mt-3" />
      </PopoverContent>
    </Popover>
  );
}
