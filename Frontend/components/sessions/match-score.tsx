"use client";

import { cn } from "@/lib/utils";

export function formatFitScore(score: number | null | undefined): string {
  if (typeof score !== "number" || !Number.isFinite(score)) return "—";
  return String(Number(score.toFixed(2)));
}

export function formatFitLabel(fit: string | null | undefined): string | null {
  if (typeof fit !== "string") return null;
  const text = fit.trim().replace(/[_-]+/g, " ");
  if (!text) return null;
  return text.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function formatFitDisplay(
  fit?: string | null,
  score?: number | null
): string {
  return formatFitLabel(fit) ?? formatFitScore(score);
}

/** Direct Future Jobs fit — string label (e.g. "strong") or numeric score. */
export function MatchScoreCompact({
  score,
  fit,
  className,
}: {
  score?: number | null;
  fit?: string | null;
  className?: string;
}) {
  const label = formatFitDisplay(fit, score);
  return (
    <span
      className={cn("text-sm font-semibold tabular-nums text-foreground", className)}
      aria-label={label === "—" ? "Fit unavailable" : `Fit ${label}`}
    >
      {label}
    </span>
  );
}
