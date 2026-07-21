"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
import type { CreditMetric } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

const METRIC_LABELS: Record<string, string> = {
  candidate_search: "Search credits",
  email_reveal: "Email reveals",
  mobile_reveal: "Mobile reveals",
  people_scout: "People Scout",
  email_outreach: "Email outreach",
  whatsapp_outreach: "WhatsApp outreach",
  ai_voice_minutes: "AI voice minutes",
};

const HEADER_METRICS = [
  "candidate_search",
  "email_reveal",
  "mobile_reveal",
  "people_scout",
  "email_outreach",
  "whatsapp_outreach",
  "ai_voice_minutes",
] as const;

function toCreditMetrics(rows: UsageMetricRow[]): CreditMetric[] {
  return HEADER_METRICS.map((metric) => {
    const row = rows.find((item) => item.metric === metric);
    if (!row) {
      return {
        id: metric,
        label: METRIC_LABELS[metric] ?? metric,
        used: 0,
        total: 0,
        unit: metric === "ai_voice_minutes" ? "min" : undefined,
      };
    }

    const total = Math.max(0, row.limit);
    // Prefer API remaining so reserved credits count as consumed for "left".
    const remaining = Math.max(0, row.remaining);
    const used = Math.min(total, Math.max(0, total - remaining));

    return {
      id: metric,
      label: METRIC_LABELS[metric] ?? row.label,
      used,
      total,
      unit: metric === "ai_voice_minutes" ? "min" : undefined,
    };
  }).filter((metric) => metric.total > 0);
}

export function UsageIndicator() {
  const { organization, user } = useAuth();
  const [metrics, setMetrics] = useState<CreditMetric[]>([]);
  const [planName, setPlanName] = useState(user?.plan || "Plan");
  const [searchesRemaining, setSearchesRemaining] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const [summary, current] = await Promise.all([
        plansApi.getUsageSummary(),
        plansApi.getCurrentPlan(),
      ]);
      setMetrics(toCreditMetrics(summary.metrics));
      setPlanName(current.name);
      const search = summary.metrics.find(
        (row) => row.metric === "candidate_search"
      );
      if (search) setSearchesRemaining(search.remaining);
    } catch {
      setMetrics([]);
      setSearchesRemaining(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRealtimeRefresh("usage.updated", () => {
    void refresh();
  });

  const remaining = searchesRemaining.toLocaleString("en-IN");
  const organisationName = organization?.name ?? "Workspace";

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
                  data-tour="usage-indicator"
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
          <p className="text-xs text-muted-foreground">{organisationName}</p>
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
