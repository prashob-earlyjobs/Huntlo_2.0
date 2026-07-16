"use client";

import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Link2Off,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { ChartCard } from "@/components/shared/chart-card";
import { EmptyState } from "@/components/shared/empty-state";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  WORKFLOW_ACTIVITY,
  WORKFLOW_CANDIDATES,
  WORKFLOW_EXCEPTIONS,
  WORKFLOW_INTERVIEWS,
  WORKFLOW_SCREENINGS,
  WORKFLOW_SETTINGS,
  WORKFLOW_STAGE_CHART,
  WORKFLOW_WEEKLY_CHART,
  workflowJourney,
  type Workflow360,
  type WorkflowCandidate,
  type WorkflowStatus,
} from "@/lib/mock-360";
import { CONVERSATIONS } from "@/lib/mock-conversations";
import { CHANNEL_ICONS } from "@/lib/mock-outreach";
import { candidateDetailPath, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

const OUTREACH_CLASSES: Record<WorkflowCandidate["outreachStatus"], string> = {
  Queued: "bg-muted text-muted-foreground",
  Contacted: "bg-info/10 text-info",
  Replied: "bg-success/10 text-success",
  Failed: "bg-destructive/10 text-destructive",
  "Opted out": "bg-destructive/10 text-destructive",
  "No contact": "bg-warning/10 text-warning",
};

const INTEREST_CLASSES: Record<WorkflowCandidate["interest"], string> = {
  Unknown: "bg-muted text-muted-foreground",
  Interested: "bg-success/10 text-success",
  "Not interested": "bg-destructive/10 text-destructive",
};

const QUAL_CLASSES: Record<WorkflowCandidate["qualification"], string> = {
  Pending: "bg-muted text-muted-foreground",
  "In progress": "bg-info/10 text-info",
  Qualified: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
};

const DECISION_CLASSES: Record<WorkflowCandidate["decision"], string> = {
  Pending: "bg-muted text-muted-foreground",
  Shortlisted: "bg-brand-subtle text-primary",
  Rejected: "bg-destructive/10 text-destructive",
};

const SCHEDULING_CLASSES: Record<WorkflowCandidate["scheduling"], string> = {
  "Not sent": "bg-muted text-muted-foreground",
  "Link sent": "bg-info/10 text-info",
  Booked: "bg-success/10 text-success",
  Expired: "bg-warning/10 text-warning",
  "—": "bg-transparent text-muted-foreground",
};

/* ------------------------------------------------------------------ */
/* Journey                                                              */
/* ------------------------------------------------------------------ */

function Journey({ workflow }: { workflow: Workflow360 }) {
  const stages = workflowJourney(workflow);
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">
        Candidate journey
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Live counts and conversion at every stage of the workflow
      </p>
      <ol className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {stages.map((stage, index) => {
          const previous = index > 0 ? stages[index - 1] : null;
          const conversion = previous
            ? Math.round((stage.count / Math.max(previous.count, 1)) * 100)
            : null;
          return (
            <li key={stage.id} className="flex min-w-0 flex-1 items-center gap-2">
              <div className="min-w-0 flex-1 rounded-lg border border-border p-3">
                <span className="flex items-center gap-1.5">
                  <stage.icon
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {stage.label}
                  </p>
                </span>
                <p className="mt-2 text-lg leading-none font-semibold tabular-nums text-foreground">
                  {stage.count.toLocaleString("en-IN")}
                </p>
                <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">
                  {conversion !== null
                    ? `${conversion}% from ${previous?.label}`
                    : "All enrolled candidates"}
                </p>
              </div>
              {index < stages.length - 1 ? (
                <ChevronRight
                  aria-hidden
                  className="hidden size-4 shrink-0 text-muted-foreground/60 lg:block"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                             */
/* ------------------------------------------------------------------ */

function OverviewTab({ workflow }: { workflow: Workflow360 }) {
  return (
    <div className="space-y-4">
      <Journey workflow={workflow} />

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <AlertTriangle aria-hidden className="size-3.5 text-warning" />
            Exceptions needing attention
          </h3>
          <p className="text-xs text-muted-foreground">
            Candidates stuck outside the happy path — resolve these to keep the
            workflow moving.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {WORKFLOW_EXCEPTIONS.map((exception) => (
            <li
              key={exception.kind}
              className="flex flex-wrap items-center gap-3 px-4 py-2.5"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                <exception.icon
                  aria-hidden
                  className="size-3.5 text-muted-foreground"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {exception.kind}
                  <span className="ml-1.5 rounded-md bg-warning/10 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-warning">
                    {exception.count}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {exception.description}
                </p>
              </div>
              <Button size="xs" variant="outline">
                {exception.action}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Candidates                                                           */
/* ------------------------------------------------------------------ */

function CandidatesTab() {
  return (
    <section className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <caption className="sr-only">
          Candidates enrolled in this workflow with stage status
        </caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={HEAD}>Outreach status</TableHead>
            <TableHead className={HEAD}>Interest</TableHead>
            <TableHead className={HEAD}>Qualification</TableHead>
            <TableHead className={`${HEAD} text-right`}>Screening score</TableHead>
            <TableHead className={HEAD}>Recruiter decision</TableHead>
            <TableHead className={HEAD}>Scheduling status</TableHead>
            <TableHead className={HEAD}>Last activity</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {WORKFLOW_CANDIDATES.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <CandidateAvatar name={candidate.name} className="size-7" />
                  <div className="min-w-0">
                    {candidate.candidateId ? (
                      <Link
                        href={candidateDetailPath(candidate.candidateId)}
                        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {candidate.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {candidate.name}
                      </span>
                    )}
                    {candidate.exception ? (
                      <p className="flex items-center gap-1 text-[11px] text-warning">
                        <AlertTriangle aria-hidden className="size-3" />
                        {candidate.exception}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={candidate.outreachStatus}
                  className={OUTREACH_CLASSES[candidate.outreachStatus]}
                />
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={candidate.interest}
                  className={INTEREST_CLASSES[candidate.interest]}
                />
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={candidate.qualification}
                  className={QUAL_CLASSES[candidate.qualification]}
                />
              </TableCell>
              <TableCell className="py-2.5 text-right">
                {candidate.screeningScore !== null ? (
                  <Tooltip>
                    <TooltipTrigger
                      aria-label={`Screening score ${candidate.screeningScore} out of 100`}
                      className="rounded-sm text-sm font-medium tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <span
                        className={
                          candidate.screeningScore >= 75
                            ? "text-success"
                            : "text-warning"
                        }
                      >
                        {candidate.screeningScore}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {candidate.screeningNote ?? "AI voice screening score"}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {candidate.screeningNote ?? "—"}
                  </span>
                )}
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={candidate.decision}
                  className={DECISION_CLASSES[candidate.decision]}
                />
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={candidate.scheduling}
                  className={SCHEDULING_CLASSES[candidate.scheduling]}
                />
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.lastActivity}
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Actions for ${candidate.name}`}
                      />
                    }
                  >
                    <MoreHorizontal aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {candidate.candidateId ? (
                      <DropdownMenuItem
                        render={
                          <Link
                            href={candidateDetailPath(candidate.candidateId)}
                          />
                        }
                      >
                        <Eye aria-hidden />
                        View profile
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem>
                      <Pause aria-hidden />
                      Pause for candidate
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <Trash2 aria-hidden />
                      Remove from workflow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Screening + interviews                                               */
/* ------------------------------------------------------------------ */

function ScreeningTab() {
  return (
    <section className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <caption className="sr-only">AI voice screening attempts</caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={HEAD}>Attempt</TableHead>
            <TableHead className={HEAD}>Duration</TableHead>
            <TableHead className={`${HEAD} text-right`}>Score</TableHead>
            <TableHead className={HEAD}>Outcome</TableHead>
            <TableHead className={HEAD}>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {WORKFLOW_SCREENINGS.map((screening) => (
            <TableRow key={screening.id}>
              <TableCell className="py-2.5 text-sm font-medium whitespace-nowrap text-foreground">
                {screening.candidate}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {screening.attempt}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap tabular-nums text-muted-foreground">
                {screening.duration ?? "—"}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums">
                {screening.score !== null ? (
                  <span
                    className={
                      screening.score >= 75 ? "text-success" : "text-warning"
                    }
                  >
                    {screening.score}/100
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {screening.outcome}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {screening.time}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

const INTERVIEW_CLASSES: Record<string, string> = {
  Confirmed: "bg-success/10 text-success",
  "Awaiting booking": "bg-info/10 text-info",
  Expired: "bg-warning/10 text-warning",
};

function InterviewsTab() {
  return (
    <section className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <caption className="sr-only">Interviews scheduled by this workflow</caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={HEAD}>Event type</TableHead>
            <TableHead className={HEAD}>Slot</TableHead>
            <TableHead className={HEAD}>Interviewer</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {WORKFLOW_INTERVIEWS.map((interview) => (
            <TableRow key={interview.id}>
              <TableCell className="py-2.5 text-sm font-medium whitespace-nowrap text-foreground">
                {interview.candidate}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {interview.eventType}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {interview.slot}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {interview.interviewer}
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={interview.status}
                  className={INTERVIEW_CLASSES[interview.status]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics, activity, settings                                        */
/* ------------------------------------------------------------------ */

function AnalyticsTab({ workflow }: { workflow: Workflow360 }) {
  const rates = [
    {
      id: "reply",
      label: "Reply rate",
      value: Math.round((workflow.replied / Math.max(workflow.candidates, 1)) * 100),
    },
    {
      id: "qual",
      label: "Qualification rate",
      value: Math.round((workflow.qualified / Math.max(workflow.replied, 1)) * 100),
    },
    {
      id: "screen",
      label: "Screening completion",
      value: Math.round((workflow.screened / Math.max(workflow.qualified, 1)) * 100),
    },
    {
      id: "shortlist",
      label: "Shortlist rate",
      value: Math.round((workflow.shortlisted / Math.max(workflow.screened, 1)) * 100),
    },
    {
      id: "booked",
      label: "Booking rate",
      value: Math.round((workflow.scheduled / Math.max(workflow.shortlisted, 1)) * 100),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rates.map((rate) => (
          <div key={rate.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{rate.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {rate.value}%
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard chart={WORKFLOW_STAGE_CHART} />
        <ChartCard chart={WORKFLOW_WEEKLY_CHART} />
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <ol className="space-y-0">
        {WORKFLOW_ACTIVITY.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < WORKFLOW_ACTIVITY.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-6 left-[11px] h-full w-px bg-border"
              />
            ) : null}
            <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <entry.icon aria-hidden className="size-3 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{entry.title}</p>
              <p className="text-xs text-muted-foreground">{entry.detail}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {entry.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SettingsTab() {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Workflow settings
        </h3>
        <p className="text-xs text-muted-foreground">
          Pause the workflow to edit outreach, qualification, screening or
          scheduling behaviour.
        </p>
      </div>
      <dl className="divide-y divide-border">
        {WORKFLOW_SETTINGS.map((setting) => (
          <div
            key={setting.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{setting.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {setting.value}
              </dd>
            </div>
            <Button size="xs" variant="ghost">
              <Pencil aria-hidden />
              Edit
            </Button>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Detail shell                                                         */
/* ------------------------------------------------------------------ */

export function WorkflowDetail({ workflow }: { workflow: Workflow360 }) {
  const [status, setStatus] = useState<WorkflowStatus>(workflow.status);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [providerBanner, setProviderBanner] = useState(true);

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  return (
    <div className="space-y-4">
      {providerBanner && status === "Running" ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3"
        >
          <Link2Off aria-hidden className="size-4 shrink-0 text-warning" />
          <p className="min-w-0 flex-1 text-sm text-foreground">
            <span className="font-medium">Provider disconnected:</span> AI Voice
            minutes are exhausted — screening calls are paused. Outreach and
            scheduling continue normally.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button size="xs" onClick={() => flash("Opens Integrations to top up AI Voice minutes.")}>
              Reconnect provider
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setProviderBanner(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {workflow.name}
              </h1>
              <CampaignStatusBadge status={status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {workflow.jobId && workflow.jobTitle ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase aria-hidden className="size-3" />
                  <Link
                    href={jobDetailPath(workflow.jobId)}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {workflow.jobTitle}
                  </Link>
                </span>
              ) : null}
              <span>Owner: {workflow.owner}</span>
              <span className="inline-flex items-center gap-1.5">
                Channels:
                {workflow.channels.map((channel) => {
                  const Icon = CHANNEL_ICONS[channel];
                  return (
                    <Icon key={channel} aria-label={channel} className="size-3.5" />
                  );
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden className="size-3" />
                {workflow.candidates.toLocaleString("en-IN")} candidates
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock aria-hidden className="size-3" />
                {workflow.scheduled} interviews scheduled
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {status === "Running" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatus("Paused");
                  flash("Workflow paused — outreach, calls and links stop immediately.");
                }}
              >
                <Pause aria-hidden />
                Pause
              </Button>
            ) : status === "Paused" ? (
              <Button
                size="sm"
                onClick={() => {
                  setStatus("Running");
                  flash("Workflow resumed.");
                }}
              >
                <Play aria-hidden />
                Resume
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash("Edit opens the workflow builder. (UI preview)")}
            >
              <Pencil aria-hidden />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash("Add candidates from the pool, a list, or a session.")}
            >
              <UserPlus aria-hidden />
              Add Candidates
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="icon-sm" variant="outline" aria-label="More actions" />
                }
              >
                <MoreHorizontal aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => flash("Duplicated workflow as a draft.")}
                >
                  <Copy aria-hidden />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => flash("Exported workflow report.")}>
                  <Download aria-hidden />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => flash("Workflow deleted. (UI preview)")}
                >
                  <Trash2 aria-hidden />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {feedback ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {feedback}
          </p>
        ) : null}
      </header>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="screening">Screening</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="pt-3">
          <OverviewTab workflow={workflow} />
        </TabsContent>
        <TabsContent value="candidates" className="pt-3">
          <CandidatesTab />
        </TabsContent>
        <TabsContent value="conversations" className="pt-3">
          {CONVERSATIONS.length > 0 ? (
            <ConversationInbox conversations={CONVERSATIONS} />
          ) : (
            <EmptyState
              icon={Users}
              title="No conversations yet"
              description="Replies from candidates in this workflow will appear here."
            />
          )}
        </TabsContent>
        <TabsContent value="screening" className="pt-3">
          <ScreeningTab />
        </TabsContent>
        <TabsContent value="interviews" className="pt-3">
          <InterviewsTab />
        </TabsContent>
        <TabsContent value="analytics" className="pt-3">
          <AnalyticsTab workflow={workflow} />
        </TabsContent>
        <TabsContent value="activity" className="pt-3">
          <ActivityTab />
        </TabsContent>
        <TabsContent value="settings" className="pt-3">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
