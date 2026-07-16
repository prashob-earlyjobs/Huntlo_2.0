"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
import { plansApi, type UsageMetricRow } from "@/lib/api/plans";
import { CREDIT_METRICS, CREDIT_SUMMARY, MOCK_USER } from "@/lib/mock-data";
import type { CreditMetric } from "@/lib/types";
import { ROUTES } from "@/lib/routes";

const METRIC_LABELS: Record<string, string> = {
  candidate_search: "Search credits",
  email_reveal: "Email reveals",
  mobile_reveal: "Mobile reveals",
  email_outreach: "Email outreach",
  whatsapp_outreach: "WhatsApp outreach",
  ai_voice_minutes: "AI voice minutes",
};

const HEADER_METRICS = [
  "candidate_search",
  "email_reveal",
  "mobile_reveal",
  "email_outreach",
  "whatsapp_outreach",
  "ai_voice_minutes",
] as const;

function toCreditMetrics(rows: UsageMetricRow[]): CreditMetric[] {
  return HEADER_METRICS.map((metric) => {
    const row = rows.find((item) => item.metric === metric);
    if (!row) {
      return (
        CREDIT_METRICS.find((item) => item.id.includes(metric.split("_")[0]!)) ?? {
          id: metric,
          label: METRIC_LABELS[metric] ?? metric,
          used: 0,
          total: 0,
        }
      );
    }
    return {
      id: metric,
      label: METRIC_LABELS[metric] ?? row.label,
      used: row.used,
      total: row.limit,
      unit: metric === "ai_voice_minutes" ? "min" : undefined,
    };
  });
}

export function UsageIndicator() {
  const [metrics, setMetrics] = useState<CreditMetric[]>(CREDIT_METRICS);
  const [planName, setPlanName] = useState(MOCK_USER.plan);
  const [searchesRemaining, setSearchesRemaining] = useState(
    CREDIT_SUMMARY.searchesRemaining
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [summary, current] = await Promise.all([
          plansApi.getUsageSummary(),
          plansApi.getCurrentPlan(),
        ]);
        if (cancelled) return;
        setMetrics(toCreditMetrics(summary.metrics));
        setPlanName(current.name);
        const search = summary.metrics.find((row) => row.metric === "candidate_search");
        if (search) setSearchesRemaining(search.remaining);
      } catch {
        // Keep mock snapshot when API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const remaining = searchesRemaining.toLocaleString("en-IN");

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
          <p className="text-sm font-medium text-foreground">{planName}</p>
          <p className="text-xs text-muted-foreground">{MOCK_USER.organisation}</p>
        </div>
        <div className="space-y-2.5 px-3 py-2.5">
          {metrics.map((metric) => (
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
