"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UsageProgress } from "@/components/shared/usage-progress";
import { CREDIT_METRICS, CREDIT_SUMMARY, MOCK_USER } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";

export function UsageIndicator() {
  const remaining = CREDIT_SUMMARY.searchesRemaining.toLocaleString("en-IN");

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${remaining} searches remaining`}
                  className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                />
              }
            />
          }
        >
          <span className="text-xs tabular-nums">{remaining}</span>
          <span className="hidden text-xs text-muted-foreground xl:inline">
            searches
          </span>
        </TooltipTrigger>
        <TooltipContent>Plan usage</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">{MOCK_USER.plan}</p>
          <p className="text-xs text-muted-foreground">{MOCK_USER.organisation}</p>
        </div>
        <div className="space-y-2.5 px-3 py-2.5">
          {CREDIT_METRICS.map((metric) => (
            <UsageProgress key={metric.id} metric={metric} />
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full"
            render={<Link href={ROUTES.plans} />}
          >
            View usage
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
