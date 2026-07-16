import Link from "next/link";
import { ExternalLink, Send } from "lucide-react";

import { ChannelComparisonChart } from "@/components/dashboard/channel-comparison-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type {
  CampaignSummaryStat,
  ChannelComparisonPoint,
} from "@/lib/mock-dashboard";

export function CampaignPerformance({
  summary,
  comparison,
  className,
}: {
  summary: CampaignSummaryStat[];
  comparison: ChannelComparisonPoint[];
  className?: string;
}) {
  if (summary.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No campaigns running"
        description="Create an outreach campaign to see channel performance here."
        actionLabel="Create Campaign"
        className={className}
      />
    );
  }

  return (
    <section className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <SectionHeader
        title="Campaign performance"
        description="Outreach effectiveness across channels, last 30 days"
        actions={
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.outreach} />}>
            View campaigns
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {summary.map((stat) => (
          <div key={stat.id} className="bg-card p-3">
            <dt className="truncate text-xs font-medium text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-1.5 text-metric text-lg leading-none font-semibold text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-foreground">Channel comparison</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Delivery, reply and positive-reply rates by channel
        </p>
        <div className="mt-3">
          <ChannelComparisonChart data={comparison} />
        </div>
      </div>
    </section>
  );
}
