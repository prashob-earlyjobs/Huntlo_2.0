import type { CreditMetric } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

export function UsageProgress({ metric }: { metric: CreditMetric }) {
  const unit = metric.unit ? ` ${metric.unit}` : ""
  const remaining = Math.max(0, metric.total - metric.used)
  const value =
    metric.total > 0 ? Math.round((metric.used / metric.total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{metric.label}</span>
        <span className="tabular-nums text-muted-foreground">
          {remaining.toLocaleString("en-IN")}
          {unit} left
        </span>
      </div>
      <Progress value={value} aria-label={`${metric.label}: ${value}% used`} className="h-1.5" />
    </div>
  )
}
