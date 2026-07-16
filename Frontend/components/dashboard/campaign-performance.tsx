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

function inlineSummary(stats: CampaignSummaryStat[]): string {
  const byId = Object.fromEntries(stats.map((stat) => [stat.id, stat.value]));
  return [
    `${byId.active ?? "0"} active`,
    `${byId.sent ?? "0"} sent`,
    `${byId.reply ?? "—"} reply`,
    `${byId.positive ?? "—"} positive`,
  ].join(" · ");
}

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
    <section className={cn("min-w-0", className)}>
      <SectionHeader
        title="Outreach"
        actions={
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.outreach} />}>
            Campaigns
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      <p className="mt-2 text-sm text-foreground">{inlineSummary(summary)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {summary.find((stat) => stat.id === "delivery")?.value ?? "—"} delivery
        {" · "}
        {summary.find((stat) => stat.id === "qualified")?.value ?? "—"} qualified
      </p>

      <div className="mt-4 border-t border-border pt-3.5">
        <h3 className="text-xs font-medium text-foreground">Reply rate by channel</h3>
        <div className="mt-2.5">
          <ChannelComparisonChart data={comparison} />
        </div>
      </div>
    </section>
  );
}
