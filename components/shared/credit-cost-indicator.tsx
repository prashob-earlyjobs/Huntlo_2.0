import { Coins } from "lucide-react";

import { cn } from "@/lib/utils";

export function CreditCostIndicator({
  cost,
  unit = "credits",
  className,
}: {
  cost: number;
  unit?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground",
        className
      )}
      aria-label={`Costs ${cost} ${unit}`}
    >
      <Coins aria-hidden className="size-3" />
      {cost.toLocaleString("en-IN")} {unit}
    </span>
  );
}
