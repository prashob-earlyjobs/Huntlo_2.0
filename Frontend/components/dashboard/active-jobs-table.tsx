import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  MoreHorizontal,
  Pause,
  PenLine,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { jobProgress, type ActiveJob } from "@/lib/mock-dashboard";

const HEAD = "h-9 text-xs font-medium text-muted-foreground";

export function ActiveJobsTable({
  jobs,
  className,
}: {
  jobs: ActiveJob[];
  className?: string;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No active jobs"
        description="Create your first hiring requirement to start sourcing candidates."
        actionLabel="Create Job"
        actionHref={ROUTES.jobsNew}
        className={className}
      />
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <SectionHeader
        title="Active jobs"
        actions={
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.jobs} />}>
            All jobs
            <ExternalLink aria-hidden />
          </Button>
        }
      />
      <div className="mt-2 overflow-x-auto">
        <Table>
          <caption className="sr-only">
            Active jobs with hiring progress, interested candidates, screenings and interviews
          </caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Job</TableHead>
              <TableHead className={`${HEAD} w-36`}>Hiring progress</TableHead>
              <TableHead className={`${HEAD} text-right`}>Interested</TableHead>
              <TableHead className={`${HEAD} text-right`}>Screened</TableHead>
              <TableHead className={`${HEAD} text-right`}>Interviews</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Last activity</TableHead>
              <TableHead className={`${HEAD} w-10 text-right`}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const progress = jobProgress(job);
              return (
                <TableRow key={job.id}>
                  <TableCell className="py-2.5">
                    <Link
                      href={jobDetailPath(job.id)}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {job.location} · {job.hiringManager}
                    </p>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(progress, 2)}%` }}
                        />
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {job.sourced.toLocaleString("en-IN")} sourced
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-right text-sm tabular-nums">
                    {job.interested.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="py-2.5 text-right text-sm tabular-nums">
                    {job.screened.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="py-2.5 text-right text-sm tabular-nums">
                    {job.interviews.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                    {job.lastActivity}
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Actions for ${job.title}`}
                          />
                        }
                      >
                        <MoreHorizontal aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem render={<Link href={ROUTES.candidates} />}>
                          <Users aria-hidden />
                          View pipeline
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={jobDetailPath(job.id)} />}>
                          <PenLine aria-hidden />
                          Edit job
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pause aria-hidden />
                          Pause sourcing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
