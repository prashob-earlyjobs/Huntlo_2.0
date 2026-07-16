"use client";

import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { UsageGroup } from "@/lib/mock-dashboard";

function GroupBar({ group }: { group: UsageGroup }) {
  const [expanded, setExpanded] = useState(false);
  const remaining = group.total - group.used;
  const usedPercent = Math.round((group.used / group.total) * 100);
  const isLow = remaining / group.total < 0.25;
  const unit = group.unit ? ` ${group.unit}` : "";
  const hasBreakdown = group.items.length > 1;

  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <button
        type="button"
        disabled={!hasBreakdown}
        onClick={() => setExpanded((previous) => !previous)}
        className={cn(
          "flex w-full items-center gap-2 text-left outline-none",
          hasBreakdown && "cursor-pointer"
        )}
        aria-expanded={hasBreakdown ? expanded : undefined}
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-foreground">{group.label}</span>
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
            aria-label={`${group.label}: ${usedPercent}% used`}
            className={cn("h-1.5", isLow && "[&_[data-slot=progress-indicator]]:bg-warning")}
          />
        </div>
        {hasBreakdown ? (
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        ) : null}
      </button>
      {hasBreakdown && expanded ? (
        <ul className="mt-2 space-y-1.5 border-l border-border pl-3">
          {group.items.map((item) => {
            const itemRemaining = item.total - item.used;
            const itemUnit = item.unit ? ` ${item.unit}` : "";
            return (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-2 text-xs"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {itemRemaining.toLocaleString("en-IN")}
                  {itemUnit} left
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function PlanUsageCard({
  groups,
  planName,
  className,
}: {
  groups: UsageGroup[];
  planName: string;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <SectionHeader
        title="Usage"
        description={planName}
        actions={
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.plans} />}>
            Manage
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      <div className="mt-2 divide-y divide-border">
        {groups.map((group) => (
          <GroupBar key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}
