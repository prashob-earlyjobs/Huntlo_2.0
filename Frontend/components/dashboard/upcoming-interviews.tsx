import Link from "next/link";
import { CalendarClock, ExternalLink, Video } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { UpcomingInterview } from "@/lib/mock-dashboard";

type AgendaGroup = "Today" | "Tomorrow" | "Later this week";

function groupOf(interview: UpcomingInterview): AgendaGroup {
  if (interview.dateTime.startsWith("Today")) return "Today";
  if (interview.dateTime.startsWith("Tomorrow")) return "Tomorrow";
  return "Later this week";
}

/** Strip the leading "Today, " / "Tomorrow, " prefix, keeping just the time. */
function timeOnly(dateTime: string): string {
  const parts = dateTime.split(", ");
  return parts.length > 1 ? parts.slice(1).join(", ") : dateTime;
}

const GROUP_ORDER: AgendaGroup[] = ["Today", "Tomorrow", "Later this week"];

export function UpcomingInterviews({
  interviews,
  className,
}: {
  interviews: UpcomingInterview[];
  className?: string;
}) {
  if (interviews.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No interviews scheduled"
        description="Send scheduling links to qualified candidates to fill your calendar."
        actionLabel="Schedule Interview"
        className={className}
      />
    );
  }

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: interviews.filter((interview) => groupOf(interview) === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <section className={cn(className)}>
      <SectionHeader
        title="Interviews"
        actions={
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.interviews} />}>
            Schedule
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      <div className="mt-2.5 space-y-3.5">
        {grouped.map(({ group, items }) => (
          <div key={group}>
            <p
              className={cn(
                "text-[11px] font-medium",
                group === "Today" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {group}
            </p>
            <ul className="mt-1 divide-y divide-border">
              {items.map((interview) => (
                <li
                  key={interview.id}
                  className="flex items-start gap-3 py-2 first:pt-1.5 last:pb-0"
                >
                  <span className="w-16 shrink-0 pt-0.5 text-xs font-medium tabular-nums text-foreground">
                    {timeOnly(interview.dateTime)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {interview.candidate}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {interview.role} · {interview.type}
                    </p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 pt-0.5 text-xs text-muted-foreground sm:inline-flex">
                    <Video aria-hidden className="size-3.5" />
                    {interview.platform}
                  </span>
                  <StatusBadge status={interview.status} className="mt-0.5 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
