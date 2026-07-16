"use client";

import Link from "next/link";
import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UsageProgress } from "@/components/shared/usage-progress";
import { CREDIT_METRICS, CREDIT_SUMMARY, MOCK_USER } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";

export function UsageIndicator() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="sm" aria-label="Usage and credits" />
        }
      >
        <Gauge aria-hidden />
        <span className="hidden tabular-nums lg:inline">
          {CREDIT_SUMMARY.searchesRemaining.toLocaleString("en-IN")}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{MOCK_USER.plan}</p>
          <p className="text-xs text-muted-foreground">
            Credit balances for {MOCK_USER.organisation}
          </p>
        </div>
        <div className="space-y-3 px-4 py-3">
          {CREDIT_METRICS.map((metric) => (
            <UsageProgress key={metric.id} metric={metric} />
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Button variant="outline" size="sm" className="w-full" render={<Link href={ROUTES.plans} />}>
            Manage plan & usage
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
