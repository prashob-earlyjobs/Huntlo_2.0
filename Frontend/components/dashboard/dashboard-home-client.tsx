"use client";

import Link from "next/link";
import { Briefcase, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { ActiveJobsTable } from "@/components/dashboard/active-jobs-table";
import { AISearchPanel } from "@/components/dashboard/ai-search-panel";
import { CampaignPerformance } from "@/components/dashboard/campaign-performance";
import { DashboardBodySkeleton } from "@/components/dashboard/dashboard-skeleton";
import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { PlanUsageCard } from "@/components/dashboard/plan-usage-card";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { analyticsApi, getApiErrorMessage } from "@/lib/api";
import {
  OVERVIEW_METRICS,
  type ActiveJob,
  type CampaignSummaryStat,
  type ChannelComparisonPoint,
  type InlineStat,
  type OverviewMetric,
  type PipelineStage,
  type UpcomingInterview,
  type UsageGroup,
} from "@/lib/mock-dashboard";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { ApiFeedback } from "@/components/shared/api-feedback";

export function DashboardHomeClient() {
  const { user } = useAuth();
  const firstName =
    user?.firstName?.trim() ||
    user?.name?.split(" ")[0] ||
    "there";
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OverviewMetric[]>([]);
  const [secondary, setSecondary] = useState<InlineStat[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [interviews, setInterviews] = useState<UpcomingInterview[]>([]);
  const [summary, setSummary] = useState<CampaignSummaryStat[]>([]);
  const [comparison, setComparison] = useState<ChannelComparisonPoint[]>([]);
  const [usageGroups, setUsageGroups] = useState<UsageGroup[]>([]);
  const [planName, setPlanName] = useState("Growth");
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [
          summaryRes,
          pipelineRes,
          jobsRes,
          interviewsRes,
          campaignRes,
          usageRes,
        ] = await Promise.all([
          analyticsApi.getDashboardSummary({ preset: "30d" }),
          analyticsApi.getDashboardPipeline({ preset: "30d" }),
          analyticsApi.getDashboardJobs({ preset: "30d" }),
          analyticsApi.getDashboardInterviews({ preset: "30d" }),
          analyticsApi.getCampaignPerformance({ preset: "30d" }),
          analyticsApi.getDashboardUsage({ preset: "30d" }),
        ]);
        if (cancelled) return;
        setMetrics(
          summaryRes.metrics.map((metric) => {
            const mock = OVERVIEW_METRICS.find((row) => row.id === metric.id);
            return { ...metric, icon: mock?.icon ?? Briefcase } as OverviewMetric;
          })
        );
        setSecondary(summaryRes.secondary);
        setStages(pipelineRes.stages);
        setJobs(jobsRes.items);
        setInterviews(interviewsRes.items);
        setSummary(campaignRes.summary);
        setComparison(campaignRes.comparison);
        setUsageGroups(
          (usageRes.groups ?? []).map((group) => ({
            ...group,
            items: (group.items || []).map((item) => ({
              id: item.id,
              label: item.label,
              used: item.used,
              total:
                "total" in item && typeof item.total === "number"
                  ? item.total
                  : Number((item as { limit?: number }).limit ?? 0),
              unit: item.unit,
            })),
          }))
        );
        setPlanName(usageRes.planName || "Growth");
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
          setMetrics([]);
          setSecondary([]);
          setStages([]);
          setJobs([]);
          setInterviews([]);
          setSummary([]);
          setComparison([]);
          setUsageGroups([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useRealtimeRefresh(
    ["usage.updated", "campaign.updated", "interview.updated", "notification.created"],
    () => setReloadToken((value) => value + 1)
  );

  return (
    <>
      <PageHeader
        title={`Today · ${firstName}`}
        description="Open searches, replies, and interviews that need attention."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              render={<Link href={ROUTES.jobsNew} />}
            >
              <Briefcase aria-hidden />
              New job
            </Button>
            <Button size="sm" render={<Link href={ROUTES.search} />}>
              <Search aria-hidden />
              Search candidates
            </Button>
          </div>
        }
      />

      {error ? (
        <ApiFeedback
          state="error"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}

      {loading ? (
        <DashboardBodySkeleton />
      ) : (
        <>
          <AISearchPanel jobs={jobs} />

          <section className="space-y-2">
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                {metrics.map((metric) => (
                  <OverviewMetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </div>
            {secondary.length > 0 ? (
              <p className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
                {secondary.map((stat, index) => (
                  <span key={stat.id}>
                    {index > 0 ? (
                      <span className="mr-3 text-border">·</span>
                    ) : null}
                    <span className="font-medium tabular-nums text-foreground">
                      {stat.value}
                    </span>{" "}
                    {stat.label}
                  </span>
                ))}
              </p>
            ) : null}
          </section>

          <section>
            <SectionHeader title="Pipeline" className="mb-2.5" />
            <PipelineFunnel stages={stages} />
            <div className="mt-4 border-t border-border pt-4">
              <ActiveJobsTable jobs={jobs} />
            </div>
          </section>

          <UpcomingInterviews interviews={interviews} />

          <div className="grid items-start gap-6 border-t border-border pt-4 lg:grid-cols-12">
            <CampaignPerformance
              summary={summary}
              comparison={comparison}
              className="lg:col-span-7"
            />
            <PlanUsageCard
              groups={usageGroups}
              planName={planName}
              className="lg:col-span-5 lg:border-l lg:border-border lg:pl-6"
            />
          </div>
        </>
      )}
    </>
  );
}
