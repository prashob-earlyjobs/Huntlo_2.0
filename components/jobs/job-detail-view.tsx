"use client";

import Link from "next/link";
import {
  CalendarClock,
  Inbox,
  MapPin,
  PenLine,
  Send,
  Target,
  UserSearch,
  Users,
} from "lucide-react";

import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { CandidateSummaryCard } from "@/components/shared/candidate-summary-card";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageTabs } from "@/components/shared/page-tabs";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobDetail } from "@/lib/mock-jobs";
import { ROUTES } from "@/lib/routes";
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

function JobOverview({ job }: { job: JobDetail }) {
  const hireProgress = Math.round(
    (job.hiringTarget.openingsFilled / job.hiringTarget.targetHires) * 100
  );
  const timeProgress = Math.min(
    100,
    Math.round((job.hiringTarget.daysOpen / job.hiringTarget.targetDays) * 100)
  );

  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 lg:grid-cols-3">
        <section className="space-y-4 rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <SectionHeader title="Job description" description={job.employmentType} />
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

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <SectionHeader
              title="Hiring target"
              description={`${job.hiringTarget.openingsFilled} of ${job.hiringTarget.targetHires} openings filled`}
            />
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Hires</span>
                  <span className="tabular-nums font-medium text-foreground">
                    {hireProgress}%
                  </span>
                </div>
                <Progress value={hireProgress} aria-label="Hire progress" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Days open ({job.hiringTarget.daysOpen}/{job.hiringTarget.targetDays})
                  </span>
                  <span className="tabular-nums font-medium text-foreground">
                    {timeProgress}%
                  </span>
                </div>
                <Progress value={timeProgress} aria-label="Time-to-fill progress" />
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd className="font-medium text-foreground">{job.priority}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Target close</dt>
                  <dd className="font-medium text-foreground">
                    {job.targetClosingDate}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Compensation</dt>
                  <dd className="text-right font-medium text-foreground">
                    {formatSalary(job)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <SectionHeader title="Recruiter activity" />
            <div className="mt-4">
              {job.recruiterActivity.length > 0 ? (
                <ActivityTimeline items={job.recruiterActivity} />
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No recruiter activity yet"
                  description="Activity from sourcing and outreach will appear here."
                  className="border-0 bg-transparent py-6"
                />
              )}
            </div>
          </section>
        </aside>
      </div>

      <PipelineFunnel stages={job.pipeline} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
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
              actionHref={ROUTES.search}
              className="mt-4"
            />
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <SectionHeader title="Upcoming interviews" />
          {job.upcomingInterviews.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {job.upcomingInterviews.map((interview) => (
                <li
                  key={interview.id}
                  className="rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {interview.candidate}
                    </p>
                    <StatusBadge status={interview.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {interview.type} · {interview.dateTime}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    With {interview.interviewer}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No interviews scheduled"
              description="Schedule qualified candidates from the Interviews module."
              actionLabel="Open schedule"
              actionHref={ROUTES.interviews}
              className="mt-4 border-0 bg-transparent py-6"
            />
          )}
        </section>
      </div>
    </div>
  );
}

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
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
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
          <div className="flex flex-wrap items-center gap-2">
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
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.search} />}
            >
              <UserSearch aria-hidden />
              Source Candidates
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={ROUTES.outreach} />}
            >
              <Send aria-hidden />
              Create Outreach
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
        <span className="inline-flex items-center gap-1">
          <Target aria-hidden className="size-3.5" />
          Recruiter · {job.recruiter}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users aria-hidden className="size-3.5" />
          Hiring manager · {job.hiringManager}
        </span>
      </div>

      <PageTabs
        defaultValue="overview"
        tabs={[
          {
            value: "overview",
            label: "Overview",
            content: <JobOverview job={job} />,
          },
          {
            value: "pipeline",
            label: "Candidate Pipeline",
            content: (
              <div className="space-y-4">
                <PipelineFunnel stages={job.pipeline} />
                <SimpleTable
                  caption="Candidate pipeline summary"
                  columns={[
                    { key: "stage", label: "Stage" },
                    { key: "count", label: "Candidates", align: "right" },
                  ]}
                  rows={job.pipeline.map((stage) => ({
                    stage: stage.label,
                    count: stage.count.toLocaleString("en-IN"),
                  }))}
                  emptyTitle="Pipeline is empty"
                  emptyDescription="Source candidates to begin building this job’s funnel."
                  emptyAction="Source Candidates"
                  emptyHref={ROUTES.search}
                />
              </div>
            ),
          },
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
                emptyHref={ROUTES.search}
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
              <section className="rounded-xl border border-border bg-card p-4">
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
