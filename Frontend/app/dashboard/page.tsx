import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Search } from "lucide-react";

import { ActiveJobsTable } from "@/components/dashboard/active-jobs-table";
import { AISearchPanel } from "@/components/dashboard/ai-search-panel";
import { CampaignPerformance } from "@/components/dashboard/campaign-performance";
import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { PlanUsageCard } from "@/components/dashboard/plan-usage-card";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { MOCK_USER } from "@/lib/mock-data";
import {
  ACTIVE_JOBS,
  CAMPAIGN_SUMMARY,
  CHANNEL_COMPARISON,
  DASHBOARD_USAGE_GROUPS,
  OVERVIEW_METRICS,
  PIPELINE_STAGES,
  SECONDARY_STATS,
  UPCOMING_INTERVIEWS,
} from "@/lib/mock-dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  const firstName = MOCK_USER.name.split(" ")[0];

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

      <AISearchPanel />

      <section className="space-y-2">
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {OVERVIEW_METRICS.map((metric) => (
              <OverviewMetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
        <p className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
          {SECONDARY_STATS.map((stat, index) => (
            <span key={stat.id}>
              {index > 0 ? <span className="mr-3 text-border">·</span> : null}
              <span className="font-medium tabular-nums text-foreground">
                {stat.value}
              </span>{" "}
              {stat.label}
            </span>
          ))}
        </p>
      </section>

      <section>
        <SectionHeader title="Pipeline" className="mb-2.5" />
        <PipelineFunnel stages={PIPELINE_STAGES} />
        <div className="mt-4 border-t border-border pt-4">
          <ActiveJobsTable jobs={ACTIVE_JOBS} />
        </div>
      </section>

      <UpcomingInterviews interviews={UPCOMING_INTERVIEWS} />

      <div className="grid items-start gap-6 border-t border-border pt-4 lg:grid-cols-12">
        <CampaignPerformance
          summary={CAMPAIGN_SUMMARY}
          comparison={CHANNEL_COMPARISON}
          className="lg:col-span-7"
        />
        <PlanUsageCard
          groups={DASHBOARD_USAGE_GROUPS}
          planName={MOCK_USER.plan}
          className="lg:col-span-5 lg:border-l lg:border-border lg:pl-6"
        />
      </div>
    </>
  );
}
