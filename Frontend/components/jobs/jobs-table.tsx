"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

function PipelineCell({ job }: { job: JobListItem }) {
  const conversion =
    job.candidatesSourced > 0
      ? Math.min(100, Math.round((job.qualified / job.candidatesSourced) * 100))
      : 0;

  return (
    <div className="min-w-36">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-primary"
            style={{ width: `${Math.max(conversion, job.qualified > 0 ? 4 : 0)}%` }}
          />
        </span>
        <span className="text-xs tabular-nums whitespace-nowrap text-muted-foreground">
          {job.candidatesSourced.toLocaleString("en-IN")} sourced
        </span>
      </div>
      <p className="mt-1 text-xs whitespace-nowrap text-muted-foreground">
        {job.qualified.toLocaleString("en-IN")} qualified · {job.interviews.toLocaleString("en-IN")} interviews
      </p>
    </div>
  );
}

export function JobsTable({
  jobs,
  className,
}: {
  jobs: JobListItem[];
  className?: string;
}) {
  const router = useRouter();

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
            <TableHead className={HEAD}>Job</TableHead>
            <TableHead className={HEAD}>Pipeline</TableHead>
            <TableHead className={HEAD}>Owner</TableHead>
            <TableHead className={HEAD}>Posted</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const href = jobDetailPath(job.id);
            return (
              <TableRow
                key={job.id}
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => router.push(href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(href);
                  }
                }}
              >
                <TableCell className="py-2">
                  <span className="font-medium text-foreground">{job.title}</span>
                  <p className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                    {job.department} · {job.location} · {experienceLabel(job)}
                  </p>
                </TableCell>
                <TableCell className="py-2">
                  <PipelineCell job={job} />
                </TableCell>
                <TableCell className="py-2">
                  <p className="text-sm whitespace-nowrap text-foreground">{job.recruiter}</p>
                  <p className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                    Hiring manager: {job.hiringManager}
                  </p>
                </TableCell>
                <TableCell className="py-2 text-sm whitespace-nowrap text-muted-foreground">
                  {job.createdAt}
                </TableCell>
                <TableCell className="py-2">
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell
                  className="py-2 text-right"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <JobRowActions job={job} />
                </TableCell>
              </TableRow>
            );
          })}
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
