import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CreditMetric } from "@/lib/types";

export function UsageProgress({
  metric,
  className,
}: {
  metric: CreditMetric;
  className?: string;
}) {
  const remaining = metric.total - metric.used;
  const usedPercent = Math.round((metric.used / metric.total) * 100);
  const isLow = remaining / metric.total < 0.25;
  const unit = metric.unit ? ` ${metric.unit}` : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{metric.label}</span>
        <span
          className={cn(
            "tabular-nums",
            isLow ? "font-medium text-warning" : "text-muted-foreground"
          )}
        >
          {remaining.toLocaleString("en-IN")}
          {unit} left
        </span>
      </div>
      <Progress
        value={usedPercent}
        aria-label={`${metric.label}: ${usedPercent}% used`}
        className={cn("h-1.5", isLow && "[&_[data-slot=progress-indicator]]:bg-warning")}
      />
    </div>
  );
}
