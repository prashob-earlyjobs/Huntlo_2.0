"use client";

import Link from "next/link";
import {
  Archive,
  Briefcase,
  Copy,
  MoreHorizontal,
  Pause,
  PenLine,
  Send,
  UserSearch,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { JobListItem } from "@/lib/mock-jobs";
import { ROUTES, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD =
  "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function experienceLabel(job: JobListItem) {
  return `${job.experienceMin}–${job.experienceMax} yrs`;
}

export function JobsTable({
  jobs,
  className,
}: {
  jobs: JobListItem[];
  className?: string;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No jobs match your filters"
        description="Try clearing filters or create a new hiring requirement to get started."
        actionLabel="Create Job"
        actionHref={ROUTES.jobsNew}
        className={className}
      />
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <caption className="sr-only">
          Jobs with pipeline counts, owners and status
        </caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Job title</TableHead>
            <TableHead className={HEAD}>Department</TableHead>
            <TableHead className={HEAD}>Location</TableHead>
            <TableHead className={HEAD}>Experience</TableHead>
            <TableHead className={`${HEAD} text-right`}>Openings</TableHead>
            <TableHead className={`${HEAD} text-right`}>Candidates sourced</TableHead>
            <TableHead className={`${HEAD} text-right`}>Qualified</TableHead>
            <TableHead className={`${HEAD} text-right`}>Interviews</TableHead>
            <TableHead className={HEAD}>Assigned recruiter</TableHead>
            <TableHead className={HEAD}>Hiring manager</TableHead>
            <TableHead className={HEAD}>Created date</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="py-2.5">
                <Link
                  href={jobDetailPath(job.id)}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {job.title}
                </Link>
              </TableCell>
              <TableCell className="py-2.5 text-sm text-muted-foreground">
                {job.department}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {job.location}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {experienceLabel(job)}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm tabular-nums">
                {job.openings}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm tabular-nums">
                {job.candidatesSourced.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm tabular-nums">
                {job.qualified.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm tabular-nums">
                {job.interviews.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {job.recruiter}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {job.hiringManager}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {job.createdAt}
              </TableCell>
              <TableCell className="py-2.5">
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <JobRowActions job={job} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function JobRowActions({ job }: { job: JobListItem }) {
  return (
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
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<Link href={jobDetailPath(job.id)} />}>
          <Briefcase aria-hidden />
          View job
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`${jobDetailPath(job.id)}?edit=1`} />}>
          <PenLine aria-hidden />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.search} />}>
          <UserSearch aria-hidden />
          Source candidates
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.outreach} />}>
          <Send aria-hidden />
          Create outreach
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Copy aria-hidden />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pause aria-hidden />
          Pause job
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          <Archive aria-hidden />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
