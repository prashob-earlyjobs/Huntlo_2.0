"use client";

import {
  Activity,
  AlertTriangle,
  AudioLines,
  Bookmark,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Eye,
  Link2Off,
  MessagesSquare,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Send,
  Trash2,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConversationsPanel } from "@/components/conversations/conversations-panel";
import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
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
import { getApiErrorMessage, huntlo360Api } from "@/lib/api";
import {
  type Workflow360,
  type WorkflowCandidate,
  type WorkflowException,
  type WorkflowScreening,
  type WorkflowStatus,
} from "@/lib/mock-360";
import { CHANNEL_ICONS } from "@/lib/mock-outreach";
import { candidateDetailPath, jobDetailPath, screeningResultPath, workflowEditPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

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

function workflowJourney(
  workflow: Workflow360
): { id: string; label: string; count: number; icon: LucideIcon }[] {
  return [
    { id: "outreach", label: "Outreach", count: workflow.candidates, icon: Send },
    { id: "reply", label: "Reply", count: workflow.replied, icon: MessagesSquare },
    {
      id: "qualification",
      label: "Qualification",
      count: workflow.qualified,
      icon: CheckCircle2,
    },
    { id: "screening", label: "Screening", count: workflow.screened, icon: AudioLines },
    { id: "shortlist", label: "Shortlist", count: workflow.shortlisted, icon: Bookmark },
    {
      id: "scheduling",
      label: "Scheduling",
      count: workflow.scheduled,
      icon: CalendarClock,
    },
  ];
}

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

function OverviewTab({
  workflow,
  exceptions,
}: {
  workflow: Workflow360;
  exceptions: WorkflowException[];
}) {
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
        {exceptions.length > 0 ? (
          <ul className="divide-y divide-border">
            {exceptions.map((exception) => (
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
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No exceptions right now.
          </p>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Candidates                                                           */
/* ------------------------------------------------------------------ */

function CandidatesTab({ candidates }: { candidates: WorkflowCandidate[] }) {
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
            <TableHead className={HEAD}>Scheduling status</TableHead>
            <TableHead className={HEAD}>Last activity</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No candidates enrolled yet.
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((candidate) => (
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
          ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Screening (HCG voice attempts)                                       */
/* ------------------------------------------------------------------ */

const CALL_STATUS_CLASSES: Record<string, string> = {
  Queued: "bg-muted text-muted-foreground",
  Calling: "bg-info/10 text-info",
  Ringing: "bg-info/10 text-info",
  "In progress": "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  "No answer": "bg-warning/10 text-warning",
  Busy: "bg-warning/10 text-warning",
  Failed: "bg-destructive/10 text-destructive",
  Cancelled: "bg-muted text-muted-foreground",
};

function ScreeningTab({ workflowId }: { workflowId: string }) {
  const [rows, setRows] = useState<WorkflowScreening[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await huntlo360Api.listScreening(workflowId);
      setRows(next);
    } catch {
      setRows([]);
    }
  }, [workflowId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useRealtimeRefresh(
    ["hcg.hunar.updated", "hcg.zyvkay.updated", "screening.result.updated"],
    () => {
      void refresh();
    },
    { debounceMs: 800 }
  );

  if (loading) {
    return (
      <p className="px-1 py-6 text-sm text-muted-foreground">
        Loading screening attempts…
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={AudioLines}
        title="No screening data"
        description="AI voice screening attempts from HCG for this workflow will appear here."
      />
    );
  }

  return (
    <section className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <caption className="sr-only">
          AI voice screening attempts from HCG for this workflow
        </caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={HEAD}>Call status</TableHead>
            <TableHead className={HEAD}>AI status</TableHead>
            <TableHead className={HEAD}>Duration</TableHead>
            <TableHead className={`${HEAD} text-right`}>Score</TableHead>
            <TableHead className={HEAD}>Last activity</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <CandidateAvatar name={row.candidate} className="size-7" />
                  <div className="min-w-0">
                    {row.candidateId ? (
                      <Link
                        href={candidateDetailPath(row.candidateId)}
                        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {row.candidate}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {row.candidate}
                      </span>
                    )}
                    {row.summary ? (
                      <p
                        className="max-w-[14rem] truncate text-[11px] text-muted-foreground"
                        title={row.summary}
                      >
                        {row.summary}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={row.callStatus}
                  className={
                    CALL_STATUS_CLASSES[row.callStatus] ||
                    "bg-muted text-muted-foreground"
                  }
                />
              </TableCell>
              <TableCell className="py-2.5 text-sm text-muted-foreground">
                {row.aiStatus || "—"}
              </TableCell>
              <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                {row.duration || "—"}
              </TableCell>
              <TableCell className="py-2.5 text-right">
                {typeof row.score === "number" ? (
                  <Badge
                    text={String(row.score)}
                    className={
                      row.score >= 75
                        ? "bg-success/10 text-success"
                        : row.score >= 50
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                    }
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {row.time}
              </TableCell>
              <TableCell className="py-2.5 text-right">
                {row.screeningResultId ? (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`View screening result for ${row.candidate}`}
                    nativeButton={false}
                    render={<Link href={screeningResultPath(row.screeningResultId)} />}
                  >
                    <Eye aria-hidden />
                  </Button>
                ) : null}
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

function InterviewsTab() {
  return (
    <EmptyState
      icon={CalendarClock}
      title="No interviews yet"
      description="Interviews scheduled by this workflow will appear here."
    />
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
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Stage breakdown
          </h3>
          <EmptyState
            className="mt-4"
            icon={Activity}
            title="Stage analytics unavailable"
            description="Stage breakdown charts are not available for this workflow yet."
          />
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Weekly progress
          </h3>
          <EmptyState
            className="mt-4"
            icon={Activity}
            title="Trend analytics unavailable"
            description="Weekly progress charts are not available for this workflow yet."
          />
        </section>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <EmptyState
      icon={Activity}
      title="No activity yet"
      description="Workflow events will appear here as candidates progress."
    />
  );
}

function SettingsTab() {
  return (
    <EmptyState
      icon={Pencil}
      title="No settings available"
      description="Workflow configuration will appear here once available."
    />
  );
}

/* ------------------------------------------------------------------ */
/* Detail shell                                                         */
/* ------------------------------------------------------------------ */

export function WorkflowDetail({ workflow }: { workflow: Workflow360 }) {
  const [status, setStatus] = useState<WorkflowStatus>(workflow.status);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [providerBanner, setProviderBanner] = useState(false);
  const [candidates, setCandidates] = useState<WorkflowCandidate[]>([]);
  const [exceptions, setExceptions] = useState<WorkflowException[]>([]);
  const [candidatesLoaded, setCandidatesLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(workflow.status);
  }, [workflow.status]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [nextCandidates, nextExceptions] = await Promise.all([
          huntlo360Api.listCandidates(workflow.id, { limit: 100 }),
          huntlo360Api.listExceptions(workflow.id),
        ]);
        if (cancelled) return;
        setCandidates(nextCandidates);
        setExceptions(nextExceptions);
        setCandidatesLoaded(true);
        setProviderBanner(
          nextExceptions.some((item) => item.kind === "Provider disconnected")
        );
      } catch {
        if (!cancelled) {
          setCandidates([]);
          setExceptions([]);
          setCandidatesLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workflow.id, workflow.lastActivity, workflow.replied, workflow.qualified, workflow.screened, workflow.shortlisted]);

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  async function runLifecycle(
    nextStatus: WorkflowStatus,
    message: string,
    fn: () => Promise<unknown>
  ) {
    setBusy(true);
    try {
      await fn();
      setStatus(nextStatus);
      flash(message);
    } catch (err) {
      flash(getApiErrorMessage(err, "Unable to update workflow."));
    } finally {
      setBusy(false);
    }
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
                disabled={busy}
                onClick={() =>
                  void runLifecycle(
                    "Paused",
                    "Workflow paused — outreach, calls and links stop immediately.",
                    () => huntlo360Api.pauseWorkflow(workflow.id)
                  )
                }
              >
                <Pause aria-hidden />
                Pause
              </Button>
            ) : status === "Paused" ? (
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void runLifecycle("Running", "Workflow resumed.", () =>
                    huntlo360Api.resumeWorkflow(workflow.id)
                  )
                }
              >
                <Play aria-hidden />
                Resume
              </Button>
            ) : null}
            {status === "Running" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  flash("Pause the workflow before editing.")
                }
              >
                <Pencil aria-hidden />
                Edit
              </Button>
            ) : status === "Completed" ? (
              <Button size="sm" variant="outline" disabled>
                <Pencil aria-hidden />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href={workflowEditPath(workflow.id)} />}
              >
                <Pencil aria-hidden />
                Edit
              </Button>
            )}
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
                  disabled={busy}
                  onClick={() =>
                    void runLifecycle("Completed", "Workflow cancelled.", () =>
                      huntlo360Api.cancelWorkflow(workflow.id)
                    )
                  }
                >
                  <Trash2 aria-hidden />
                  Cancel workflow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {feedback ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {feedback}
        </p>
      ) : null}

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
          <OverviewTab workflow={workflow} exceptions={exceptions} />
        </TabsContent>
        <TabsContent value="candidates" className="pt-3">
          <CandidatesTab candidates={candidates} />
        </TabsContent>
        <TabsContent value="conversations" className="pt-3">
          {candidatesLoaded ? (
            <ConversationsPanel
              campaignId={workflow.campaignId ?? undefined}
              candidateIds={candidates
                .map((row) => row.candidateId)
                .filter((id): id is string => Boolean(id))}
              emptyDescription="Replies from candidates in this workflow will appear here."
            />
          ) : (
            <p className="px-1 py-6 text-sm text-muted-foreground">
              Loading conversations…
            </p>
          )}
        </TabsContent>
        <TabsContent value="screening" className="pt-3">
          <ScreeningTab workflowId={workflow.id} />
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
