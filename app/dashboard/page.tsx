import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Search } from "lucide-react";

import { ActiveJobsTable } from "@/components/dashboard/active-jobs-table";
import { AISearchPanel } from "@/components/dashboard/ai-search-panel";
import { CampaignPerformance } from "@/components/dashboard/campaign-performance";
import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { PlanUsageCard } from "@/components/dashboard/plan-usage-card";
import { PrioritiesList } from "@/components/dashboard/priorities-list";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { QuickCreateMenu } from "@/components/layout/quick-create-menu";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { MOCK_USER } from "@/lib/mock-data";
import {
  ACTIVE_JOBS,
  CAMPAIGN_SUMMARY,
  CANDIDATE_ACTIVITY,
  CHANNEL_COMPARISON,
  DASHBOARD_USAGE,
  OVERVIEW_METRICS,
  PIPELINE_STAGES,
  TODAY_PRIORITIES,
  UPCOMING_INTERVIEWS,
} from "@/lib/mock-dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  const firstName = MOCK_USER.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here is what is happening across your hiring workspace today."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" render={<Link href={ROUTES.search} />}>
              <Search aria-hidden />
              Search Candidates
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.jobsNew} />}
            >
              <Briefcase aria-hidden />
              Create Job
            </Button>
            <QuickCreateMenu />
          </div>
        }
      />

      <AISearchPanel />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {OVERVIEW_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <PipelineFunnel stages={PIPELINE_STAGES} />

      <ActiveJobsTable jobs={ACTIVE_JOBS} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <CampaignPerformance
          summary={CAMPAIGN_SUMMARY}
          comparison={CHANNEL_COMPARISON}
          className="lg:col-span-2"
        />
        <PrioritiesList items={TODAY_PRIORITIES} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <UpcomingInterviews
          interviews={UPCOMING_INTERVIEWS}
          className="lg:col-span-2"
        />
        <RecentActivity items={CANDIDATE_ACTIVITY} />
      </div>

      <PlanUsageCard metrics={DASHBOARD_USAGE} planName={MOCK_USER.plan} />
    </>
  );
}
