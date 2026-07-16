import { MoveDownRight, MoveRight, MoveUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  change,
  trend,
  hint,
  className,
}: {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
  className?: string;
}) {
  const TrendIcon =
    trend === "up" ? MoveUpRight : trend === "down" ? MoveDownRight : MoveRight;

  return (
    <div className={cn("min-w-0 py-1", className)}>
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-metric text-xl leading-none font-semibold text-foreground">
        {value}
      </p>
      {(change || hint) && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          {change ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive"
              )}
            >
              <TrendIcon aria-hidden className="size-2.5" />
              {change}
            </span>
          ) : null}
          {hint ? <span className="truncate">{hint}</span> : null}
        </p>
      )}
    </div>
  );
}
