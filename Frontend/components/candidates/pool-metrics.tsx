"use client";

import {
  AudioLines,
  Bookmark,
  CalendarClock,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { MetricStrip } from "@/components/shared/metric-strip";
import { candidatePoolApi, type PoolOverview } from "@/lib/api";
import type { PoolMetric } from "@/lib/mock-candidates";

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function toPoolMetrics(overview: PoolOverview): PoolMetric[] {
  return [
    {
      id: "total",
      label: "Total Candidates",
      value: formatCount(overview.totalCandidates),
      change: "—",
      trend: "flat",
      comparison: "in your pool",
      tooltip: "All candidates in your workspace pool across every source.",
      icon: Users,
    },
    {
      id: "outreach",
      label: "In Outreach",
      value: formatCount(overview.inOutreach),
      change: "—",
      trend: "flat",
      comparison: "active sequences",
      tooltip: "Candidates currently enrolled in an active outreach sequence.",
      icon: Send,
    },
    {
      id: "screened",
      label: "Screening",
      value: formatCount(overview.screening),
      change: "—",
      trend: "flat",
      comparison: "in screening",
      tooltip: "Candidates currently in AI screening.",
      icon: AudioLines,
    },
    {
      id: "shortlisted",
      label: "Shortlisted",
      value: formatCount(overview.shortlisted),
      change: "—",
      trend: "flat",
      comparison: "ready to advance",
      tooltip: "Candidates shortlisted by recruiters or hiring managers.",
      icon: Bookmark,
    },
    {
      id: "interviews",
      label: "Interviews",
      value: formatCount(overview.interviews),
      change: "—",
      trend: "flat",
      comparison: "scheduled",
      tooltip: "Candidates with confirmed upcoming interviews.",
      icon: CalendarClock,
    },
  ];
}

function PoolMetricsSkeleton() {
  return (
    <div
      aria-busy
      className="overflow-hidden rounded-lg border border-border"
    >
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <OverviewMetricCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function PoolMetrics() {
  const [metrics, setMetrics] = useState<PoolMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const overview = await candidatePoolApi.getOverview();
        if (cancelled) return;
        setMetrics(toPoolMetrics(overview));
      } catch {
        if (!cancelled) setMetrics([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading && metrics.length === 0) {
    return <PoolMetricsSkeleton />;
  }

  if (metrics.length === 0) return null;

  return <MetricStrip metrics={metrics} columns="5" />;
}
