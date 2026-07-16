import Link from "next/link";
import { CircleCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PriorityItem, PriorityLevel } from "@/lib/mock-dashboard";

const PRIORITY_ROW: Record<PriorityLevel, string> = {
  High: "border-l-destructive/70 bg-destructive/[0.03]",
  Medium: "border-l-warning/60",
  Low: "border-l-transparent",
};

export function PrioritiesList({
  items,
  className,
}: {
  items: PriorityItem[];
  className?: string;
}) {
  return (
    <section className={cn(className)}>
      <SectionHeader title="Today's priorities" />
      {items.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          title="Nothing pending"
          description="New action items will appear here."
          className="mt-3 border-0 py-6"
        />
      ) : (
        <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 border-l-2 py-2.5 pl-3 pr-3.5",
                PRIORITY_ROW[item.priority]
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {item.time}
                  </time>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {item.context}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                render={<Link href={item.href} />}
              >
                {item.actionLabel}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
