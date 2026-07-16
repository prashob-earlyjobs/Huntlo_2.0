import { cn } from "@/lib/utils";

function scoreClasses(score: number): string {
  if (score >= 80) return "bg-success/10 text-success";
  if (score >= 60) return "bg-brand-subtle text-primary";
  if (score >= 40) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
}

export function MatchScoreBadge({
  score,
  className,
}: {
  /** Match score from 0 to 100. */
  score: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-md px-2 text-xs font-semibold tabular-nums whitespace-nowrap",
        scoreClasses(score),
        className
      )}
      aria-label={`Match score ${score} out of 100`}
    >
      {score}
    </span>
  );
}
