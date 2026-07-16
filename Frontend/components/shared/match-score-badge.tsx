import { cn } from "@/lib/utils"

export function MatchScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone = score >= 85 ? "text-success" : score >= 70 ? "text-primary" : score >= 50 ? "text-warning" : "text-destructive"
  return <span className={cn("inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums", tone, className)}>{score}</span>
}
