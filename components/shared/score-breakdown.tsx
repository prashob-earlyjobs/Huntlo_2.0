import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ScoreBreakdownItem } from "@/lib/types";

export function ScoreBreakdown({
  items,
  className,
}: {
  items: ScoreBreakdownItem[];
  className?: string;
}) {
  return (
    <dl className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-sm text-foreground">
              {item.label}
              {item.weight ? (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {item.weight}
                </span>
              ) : null}
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {item.score}
            </dd>
          </div>
          <Progress
            value={item.score}
            aria-label={`${item.label}: ${item.score} out of 100`}
            className="mt-1.5 h-1.5"
          />
        </div>
      ))}
    </dl>
  );
}
