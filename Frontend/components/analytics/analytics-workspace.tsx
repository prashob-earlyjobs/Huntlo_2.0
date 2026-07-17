"use client";

import { useEffect, useState } from "react";

import { ChannelComparisonChart } from "@/components/dashboard/channel-comparison-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { analyticsApi, getApiErrorMessage } from "@/lib/api";
import type {
  ChannelComparisonPoint,
  PipelineStage,
} from "@/lib/mock-dashboard";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

export function AnalyticsWorkspace() {
  const [conversions, setConversions] = useState<
    Array<{ id: string; label: string; value: string }>
  >([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [comparison, setComparison] = useState<ChannelComparisonPoint[]>([]);
  const [durations, setDurations] = useState<
    Array<{ label: string; medianDays: number | null; sampleSize: number }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [overview, channels] = await Promise.all([
          analyticsApi.getOverview({ preset: "30d" }),
          analyticsApi.getChannels({ preset: "30d" }),
        ]);
        if (cancelled) return;
        setConversions(overview.conversions);
        setStages(overview.pipeline);
        setDurations(overview.medianStageDuration);
        setComparison(channels.comparison);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Funnel performance across sourcing, outreach, screening and hiring."
        actions={
          <Button size="sm" variant="outline" render={<Link href={ROUTES.reports} />}>
            Open reports
          </Button>
        }
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {conversions.map((row) => (
          <article
            key={row.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {row.value}
            </p>
          </article>
        ))}
      </section>

      <section>
        <SectionHeader title="Pipeline" className="mb-2.5" />
        <PipelineFunnel stages={stages} />
      </section>

      <section>
        <SectionHeader title="Channel comparison" className="mb-2.5" />
        <ChannelComparisonChart data={comparison} />
      </section>

      {durations.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">
            Median stage duration
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {durations.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium tabular-nums text-foreground">
                  {row.medianDays == null
                    ? "—"
                    : `${row.medianDays.toFixed(1)} days`}
                  <span className="ml-2 text-xs text-muted-foreground">
                    n={row.sampleSize}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
