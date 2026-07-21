"use client";

import Link from "next/link";
import {
  Archive,
  CalendarClock,
  Copy,
  Inbox,
  ListChecks,
  MapPin,
  PenLine,
  Send,
  UserSearch,
  Users,
} from "lucide-react";

import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { CandidateSummaryCard } from "@/components/shared/candidate-summary-card";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTabs } from "@/components/shared/page-tabs";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JobAssessmentsTab } from "@/components/jobs/job-assessments-tab";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobDetail } from "@/lib/mock-jobs";
import { ROUTES, searchPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

function formatSalary(job: JobDetail) {
  const { minSalary, maxSalary, currency, visibility } = job.compensation;
  if (visibility === "Hidden") return "Salary hidden";
  const format = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  return `${format(minSalary)} – ${format(maxSalary)}`;
}

function ExperienceChip({ job }: { job: JobDetail }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {job.experienceMin}–{job.experienceMax} yrs · {job.seniority}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Main content                                                        */
/* ------------------------------------------------------------------ */

function RoleOverview({ job }: { job: JobDetail }) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <SectionHeader title="Role overview" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        {job.description}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Responsibilities
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            {job.responsibilities.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Requirements
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            {job.requirements.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Benefits
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            {job.benefits.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Skills
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {job.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-brand-subtle px-2 py-1 text-xs font-medium text-primary"
            >
              {skill}
            </span>
          ))}
          {job.preferredSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HiringProgress({ job }: { job: JobDetail }) {
  const hireProgress = Math.min(
    100,
    Math.round((job.hiringTarget.openingsFilled / job.hiringTarget.targetHires) * 100)
  );
  const timeProgress = Math.min(
    100,
    Math.round((job.hiringTarget.daysOpen / job.hiringTarget.targetDays) * 100)
  );
  const filled = job.hiringTarget.openingsFilled >= job.hiringTarget.targetHires;
  const onTrack = filled || hireProgress >= timeProgress;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <SectionHeader
        title="Hiring progress"
        description={`${job.hiringTarget.openingsFilled} of ${job.hiringTarget.targetHires} hires made`}
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              filled
                ? "text-muted-foreground"
                : onTrack
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                filled ? "bg-muted-foreground" : onTrack ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
            {filled ? "Filled" : onTrack ? "On track" : "Behind schedule"}
          </span>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Openings filled</span>
            <span className="font-medium tabular-nums text-foreground">{hireProgress}%</span>
          </div>
          <Progress value={hireProgress} aria-label="Openings filled" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Days open ({job.hiringTarget.daysOpen}/{job.hiringTarget.targetDays})
            </span>
            <span className="font-medium tabular-nums text-foreground">{timeProgress}%</span>
          </div>
          <Progress value={timeProgress} aria-label="Time-to-fill progress" />
        </div>
      </div>
    </section>
  );
}

function CandidatePipelineSection({ job }: { job: JobDetail }) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4">
      <SectionHeader
        title="Candidate pipeline"
        description="Conversion across sourcing and screening stages"
      />
      <PipelineFunnel stages={job.pipeline} />
    </section>
  );
}

function RecentCandidatesSection({ job }: { job: JobDetail }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <SectionHeader
        title="Recent candidates"
        description="Latest profiles attached to this job"
        actions={
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<Link href={ROUTES.candidates} />}
          >
            View pool
          </Button>
        }
      />
      {job.recentCandidates.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {job.recentCandidates.map((candidate) => (
            <CandidateSummaryCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="Source candidates for this job to populate the pipeline."
          actionLabel="Source Candidates"
          actionHref={searchPath({ jobId: job.id })}
          className="mt-4"
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Side context                                                        */
/* ------------------------------------------------------------------ */

function HiringTeamPanel({ job }: { job: JobDetail }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <SectionHeader title="Hiring team" />
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <CandidateAvatar name={job.recruiter} className="size-7" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Recruiter</p>
            <p className="truncate text-sm font-medium text-foreground">{job.recruiter}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <CandidateAvatar name={job.hiringManager} className="size-7" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Hiring manager</p>
            <p className="truncate text-sm font-medium text-foreground">{job.hiringManager}</p>
          </div>
        </div>
      </div>
      {job.interviewPanel.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground">Interview panel</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {job.interviewPanel.map((name) => (
              <span
                key={name}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ImportantDatesPanel({ job }: { job: JobDetail }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <SectionHeader title="Important dates" />
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Posted</dt>
          <dd className="font-medium text-foreground">{job.createdAt}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Target close</dt>
          <dd className="font-medium text-foreground">{job.targetClosingDate}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Days open</dt>
          <dd className="font-medium text-foreground">{job.hiringTarget.daysOpen} days</dd>
        </div>
      </dl>
    </section>
  );
}

function JobConfigurationPanel({ job }: { job: JobDetail }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <SectionHeader title="Job configuration" />
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Employment type</dt>
          <dd className="font-medium text-foreground">{job.employmentType}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Workplace</dt>
          <dd className="font-medium text-foreground">{job.workplaceType}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Seniority</dt>
          <dd className="font-medium text-foreground">{job.seniority}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Compensation</dt>
          <dd className="text-right font-medium text-foreground">{formatSalary(job)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Priority</dt>
          <dd className="font-medium text-foreground">{job.priority}</dd>
        </div>
      </dl>
      {job.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function QuickActionsPanel({ jobId }: { jobId: string }) {
  const actions = [
    {
      label: "Source candidates",
      icon: UserSearch,
      href: searchPath({ jobId }),
    },
    { label: "Create outreach", icon: Send, href: ROUTES.outreach },
    { label: "Start screening", icon: ListChecks, href: ROUTES.screening },
    { label: "Send assessment", icon: ListChecks, href: ROUTES.assessments },
    { label: "Schedule interview", icon: CalendarClock, href: ROUTES.interviews },
  ];

  return (
    <section className="rounded-lg border border-border bg-card p-2">
      <SectionHeader title="Quick actions" className="px-2 pt-1.5 pb-1" />
      <div className="mt-1 space-y-0.5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <action.icon aria-hidden className="size-4 text-muted-foreground" />
            {action.label}
          </Link>
        ))}
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Copy aria-hidden className="size-4 text-muted-foreground" />
          Duplicate job
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Archive aria-hidden className="size-4" />
          Archive job
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tab content — substantial record sets only                          */
/* ------------------------------------------------------------------ */

function SimpleTable({
  caption,
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  emptyHref,
  emptyAction,
}: {
  caption: string;
  columns: { key: string; label: string; align?: "right" }[];
  rows: Record<string, React.ReactNode>[];
  emptyTitle: string;
  emptyDescription: string;
  emptyHref?: string;
  emptyAction?: string;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyAction}
        actionHref={emptyHref}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-9 text-xs font-medium text-muted-foreground",
                  column.align === "right" && "text-right"
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, columnIndex) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    "py-2.5 text-sm",
                    columnIndex === 0 && "font-medium text-foreground",
                    column.align === "right" && "text-right"
                  )}
                >
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function JobDetailView({ job }: { job: JobDetail }) {
  return (
    <>
      <PageHeader
        title={job.title}
        description={`${job.department} · ${job.workplaceType} · ${formatSalary(job)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.jobsNew} />}
            >
              <PenLine aria-hidden />
              Edit
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={searchPath({ jobId: job.id })} />}
            >
              <UserSearch aria-hidden />
              Source Candidates
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin aria-hidden className="size-3.5" />
          {job.location}
        </span>
        <ExperienceChip job={job} />
        <StatusBadge status={job.status} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <RoleOverview job={job} />
          <HiringProgress job={job} />
          <CandidatePipelineSection job={job} />
          <RecentCandidatesSection job={job} />
        </div>

        <div className="space-y-4 lg:col-span-4">
          <HiringTeamPanel job={job} />
          <ImportantDatesPanel job={job} />
          <JobConfigurationPanel job={job} />
          <QuickActionsPanel jobId={job.id} />
        </div>
      </div>

      <PageTabs
        defaultValue="sourcing"
        tabs={[
          {
            value: "sourcing",
            label: "Sourcing Sessions",
            content: (
              <SimpleTable
                caption="Sourcing sessions for this job"
                columns={[
                  { key: "name", label: "Session" },
                  { key: "found", label: "Found", align: "right" },
                  { key: "shortlisted", label: "Shortlisted", align: "right" },
                  { key: "when", label: "When" },
                  { key: "status", label: "Status" },
                ]}
                rows={job.sourcingSessions.map((session) => ({
                  name: session.name,
                  found: session.found.toLocaleString("en-IN"),
                  shortlisted: session.shortlisted.toLocaleString("en-IN"),
                  when: session.when,
                  status: <StatusBadge status={session.status} />,
                }))}
                emptyTitle="No sourcing sessions"
                emptyDescription="Run an AI search or People Scout to attach sessions to this job."
                emptyAction="Start search"
                emptyHref={searchPath({ jobId: job.id })}
              />
            ),
          },
          {
            value: "outreach",
            label: "Outreach",
            content: (
              <SimpleTable
                caption="Outreach campaigns for this job"
                columns={[
                  { key: "name", label: "Campaign" },
                  { key: "channel", label: "Channel" },
                  { key: "sent", label: "Sent", align: "right" },
                  { key: "replies", label: "Replies", align: "right" },
                  { key: "status", label: "Status" },
                ]}
                rows={job.outreachCampaigns.map((campaign) => ({
                  name: campaign.name,
                  channel: <ChannelBadge channel={campaign.channel} />,
                  sent: campaign.sent.toLocaleString("en-IN"),
                  replies: campaign.replies.toLocaleString("en-IN"),
                  status: <StatusBadge status={campaign.status} />,
                }))}
                emptyTitle="No outreach yet"
                emptyDescription="Create a campaign to engage candidates for this hiring requirement."
                emptyAction="Create Outreach"
                emptyHref={ROUTES.outreach}
              />
            ),
          },
          {
            value: "screening",
            label: "Screening",
            content: (
              <SimpleTable
                caption="Screening batches for this job"
                columns={[
                  { key: "name", label: "Batch" },
                  { key: "progress", label: "Completed", align: "right" },
                  { key: "qualified", label: "Qualified", align: "right" },
                  { key: "status", label: "Status" },
                ]}
                rows={job.screeningBatches.map((batch) => ({
                  name: batch.name,
                  progress: `${batch.completed} / ${batch.total}`,
                  qualified: batch.qualified,
                  status: <StatusBadge status={batch.status} />,
                }))}
                emptyTitle="No screening batches"
                emptyDescription="Launch an AI screening batch once candidates are ready for qualification."
                emptyAction="Start Screening"
                emptyHref={ROUTES.screening}
              />
            ),
          },
          {
            value: "assessments",
            label: "Assessments",
            content: <JobAssessmentsTab jobId={job.id} />,
          },
          {
            value: "interviews",
            label: "Interviews",
            content: (
              <SimpleTable
                caption="Interviews for this job"
                columns={[
                  { key: "candidate", label: "Candidate" },
                  { key: "type", label: "Type" },
                  { key: "when", label: "When" },
                  { key: "interviewer", label: "Interviewer" },
                  { key: "status", label: "Status" },
                ]}
                rows={job.upcomingInterviews.map((interview) => ({
                  candidate: interview.candidate,
                  type: interview.type,
                  when: interview.dateTime,
                  interviewer: interview.interviewer,
                  status: <StatusBadge status={interview.status} />,
                }))}
                emptyTitle="No interviews scheduled"
                emptyDescription="Send scheduling links to qualified candidates for this job."
                emptyAction="Open schedule"
                emptyHref={ROUTES.interviews}
              />
            ),
          },
          {
            value: "activity",
            label: "Activity",
            content: (
              <section className="rounded-lg border border-border bg-card p-4">
                <SectionHeader
                  title="Job activity"
                  description="Lifecycle events across sourcing, outreach and interviews"
                />
                <div className="mt-4">
                  {job.activity.length > 0 ? (
                    <ActivityTimeline items={job.activity} />
                  ) : (
                    <EmptyState
                      icon={Inbox}
                      title="No activity yet"
                      description="Actions on this job will appear in the timeline."
                    />
                  )}
                </div>
              </section>
            ),
          },
        ]}
      />
    </>
  );
}
