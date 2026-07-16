import Link from "next/link";
import { CalendarClock, ExternalLink, Video } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { UpcomingInterview } from "@/lib/mock-dashboard";

const HEAD_CLASS = "h-9 text-xs font-medium text-muted-foreground";

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

  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="p-4 pb-1">
        <SectionHeader
          title="Upcoming interviews"
          description="Next confirmed and pending interviews"
          actions={
            <Button
              size="sm"
              variant="ghost"
              render={<Link href={ROUTES.interviews} />}
            >
              View schedule
              <ExternalLink aria-hidden />
            </Button>
          }
        />
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <Table>
          <caption className="sr-only">
            Upcoming interviews with candidate, interviewer and platform details
          </caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD_CLASS}>Candidate</TableHead>
              <TableHead className={HEAD_CLASS}>Role</TableHead>
              <TableHead className={HEAD_CLASS}>Type</TableHead>
              <TableHead className={HEAD_CLASS}>Date &amp; time</TableHead>
              <TableHead className={HEAD_CLASS}>Interviewer</TableHead>
              <TableHead className={HEAD_CLASS}>Platform</TableHead>
              <TableHead className={HEAD_CLASS}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="py-2.5 text-sm font-medium text-foreground">
                  {interview.candidate}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {interview.role}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {interview.type}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap">
                  {interview.dateTime}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {interview.interviewer}
                </TableCell>
                <TableCell className="py-2.5 text-sm">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted-foreground">
                    <Video aria-hidden className="size-3.5" />
                    {interview.platform}
                  </span>
                </TableCell>
                <TableCell className="py-2.5">
                  <StatusBadge status={interview.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
