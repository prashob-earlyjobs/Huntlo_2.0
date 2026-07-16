import Link from "next/link";
import { ExternalLink, History } from "lucide-react";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

export function RecentActivity({
  items,
  className,
}: {
  items: ActivityItem[];
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <SectionHeader
        title="Recent activity"
        actions={
          <Button
            size="sm"
            variant="ghost"
            render={<Link href={ROUTES.candidates} />}
          >
            View all
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          icon={History}
          title="No recent activity"
          description="Reveals, replies and screenings will appear here."
          className="mt-3 border-0 py-6"
        />
      ) : (
        <ActivityTimeline items={items} className="mt-4" />
      )}
    </section>
  );
}
