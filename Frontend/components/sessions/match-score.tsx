"use client";

import { cn } from "@/lib/utils";

function scoreToneClass(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

/** Restrained quality label — directional score from Future Jobs, not a precise metric. */
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
