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
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-[26px] leading-none font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {(change || hint) && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          {change ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive"
              )}
            >
              <TrendIcon aria-hidden className="size-3" />
              {change}
            </span>
          ) : null}
          {hint ? <span className="truncate">{hint}</span> : null}
        </p>
      )}
    </div>
  );
}
