import Link from "next/link";
import { CircleCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PriorityItem, PriorityLevel } from "@/lib/mock-dashboard";

const PRIORITY_CLASSES: Record<PriorityLevel, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-muted text-muted-foreground",
};

export function PrioritiesList({
  items,
  className,
}: {
  items: PriorityItem[];
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <SectionHeader
        title="Today's priorities"
        description="Items that need your attention"
      />
      {items.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          title="All clear"
          description="Nothing needs your attention right now. New action items will show up here."
          className="mt-4 border-0 py-8"
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-2.5 first:pt-1 last:pb-0">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-5 w-14 shrink-0 items-center justify-center rounded-md text-xs font-medium",
                  PRIORITY_CLASSES[item.priority]
                )}
              >
                {item.priority}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.module} · {item.time}
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
