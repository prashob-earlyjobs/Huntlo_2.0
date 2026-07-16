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
import type { ActiveJob } from "@/lib/mock-dashboard";

const NUMERIC_COLUMNS: { key: keyof ActiveJob; label: string }[] = [
  { key: "sourced", label: "Sourced" },
  { key: "interested", label: "Interested" },
  { key: "screened", label: "Screened" },
  { key: "interviews", label: "Interviews" },
];

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
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="p-4 pb-1">
        <SectionHeader
          title="Active jobs"
          description="Pipeline health for every open requirement"
          actions={
            <Button size="sm" variant="ghost" render={<Link href={ROUTES.jobs} />}>
              View all
              <ExternalLink aria-hidden />
            </Button>
          }
        />
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <Table>
          <caption className="sr-only">
            Active jobs with sourcing, screening and interview counts
          </caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                Job title
              </TableHead>
              <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                Location
              </TableHead>
              <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                Hiring manager
              </TableHead>
              {NUMERIC_COLUMNS.map((column) => (
                <TableHead
                  key={column.key}
                  className="h-9 text-right text-xs font-medium text-muted-foreground"
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="h-9 text-xs font-medium text-muted-foreground">
                Last activity
              </TableHead>
              <TableHead className="h-9 w-10 text-right text-xs font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="py-2.5 text-sm font-medium text-foreground">
                  <Link
                    href={jobDetailPath(job.id)}
                    className="underline-offset-4 hover:underline"
                  >
                    {job.title}
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {job.location}
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {job.hiringManager}
                </TableCell>
                {NUMERIC_COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className="py-2.5 text-right text-sm tabular-nums"
                  >
                    {(job[column.key] as number).toLocaleString("en-IN")}
                  </TableCell>
                ))}
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
                      <DropdownMenuItem
                        render={<Link href={jobDetailPath(job.id)} />}
                      >
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
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
