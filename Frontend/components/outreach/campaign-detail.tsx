"use client";

import {
  Activity,
  Archive,
  AudioLines,
  Bookmark,
  Briefcase,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  GitBranch,
  Mail,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Send,
  ThumbsUp,
  Trash2,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { ConversationsPanel } from "@/components/conversations/conversations-panel";
import { ApiFeedback } from "@/components/shared/api-feedback";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getApiErrorMessage,
  mapApiErrorToUiState,
  outreachApi,
  type ApiCampaignEnrollment,
  type ApiCampaignSequenceStep,
  type ApiOutreachCampaign,
  type ApiUiState,
} from "@/lib/api";
import {
  CHANNEL_ICONS,
  formatStepDelay,
  type CampaignStatus,
  type OutreachCampaign,
} from "@/lib/mock-outreach";
import { candidateDetailPath, campaignDetailPath, campaignEditPath, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

/* ------------------------------------------------------------------ */
/* Display helpers                                                      */
/* ------------------------------------------------------------------ */

function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const SUCCESS_STATES = new Set([
  "qualified",
  "interested",
  "booked",
  "completed",
  "replied",
  "read",
  "delivered",
]);
const NEGATIVE_STATES = new Set([
  "failed",
  "rejected",
  "opted_out",
  "bounced",
  "stopped",
  "expired",
  "not_interested",
]);
const ACTIVE_STATES = new Set([
  "in_progress",
  "active",
  "link_sent",
  "scheduled",
  "sent",
  "contacted",
  "waiting",
]);

function stateBadgeClass(value: string): string {
  const v = value.toLowerCase();
  if (SUCCESS_STATES.has(v)) return "bg-success/10 text-success";
  if (NEGATIVE_STATES.has(v)) return "bg-destructive/10 text-destructive";
  if (ACTIVE_STATES.has(v)) return "bg-info/10 text-info";
  return "bg-muted text-muted-foreground";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "—";
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const STEP_ICONS: Record<string, LucideIcon> = {
  email: Mail,
  whatsapp: MessageCircle,
  ai_voice: AudioLines,
  wait: Pause,
  conditional: GitBranch,
  recruiter_task: UserPlus,
  scheduling_link: CalendarClock,
};

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

/* ------------------------------------------------------------------ */
/* Overview                                                             */
/* ------------------------------------------------------------------ */

function OverviewTab({ campaign }: { campaign: OutreachCampaign }) {
  const kpis: { id: string; label: string; value: number; icon: LucideIcon }[] = [
    { id: "enrolled", label: "Enrolled", value: campaign.candidates, icon: Users },
    { id: "contacted", label: "Contacted", value: campaign.sent, icon: Send },
    { id: "delivered", label: "Delivered", value: campaign.delivered, icon: CheckCircle2 },
    { id: "replied", label: "Replied", value: campaign.replies, icon: MessagesSquare },
    { id: "interested", label: "Interested", value: campaign.interested, icon: ThumbsUp },
    { id: "qualified", label: "Qualified", value: campaign.qualified, icon: Bookmark },
  ];

  const funnel = [
    { id: "enrolled", label: "Enrolled", count: campaign.candidates },
    {
      id: "delivered",
      label: "Delivered",
      count: Math.min(campaign.delivered, campaign.candidates),
    },
    { id: "replied", label: "Replied", count: campaign.replies },
    { id: "interested", label: "Interested", count: campaign.interested },
    { id: "qualified", label: "Qualified", count: campaign.qualified },
  ];
  const top = funnel[0]?.count || 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-muted">
                <kpi.icon aria-hidden className="size-4 text-muted-foreground" />
              </span>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {kpi.label}
              </p>
            </div>
            <p className="mt-3 text-[26px] leading-none font-semibold tabular-nums text-foreground">
              {kpi.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          Campaign funnel
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Conversion from enrolment to qualified candidates
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 xl:grid-cols-5">
          {funnel.map((stage, index) => {
            const previous = index > 0 ? funnel[index - 1] : null;
            const share = Math.round((stage.count / top) * 100);
            const conversion = previous
              ? Math.round((stage.count / Math.max(previous.count, 1)) * 100)
              : 100;
            return (
              <li key={stage.id} className="bg-card p-3">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {stage.label}
                </p>
                <p className="mt-1.5 text-lg leading-none font-semibold tabular-nums text-foreground">
                  {stage.count.toLocaleString("en-IN")}
                </p>
                <Tooltip>
                  <TooltipTrigger
                    aria-label={`${stage.label}: ${stage.count} candidates, ${share}% of enrolled`}
                    className="mt-2.5 block w-full rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span
                      aria-hidden
                      className="block h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(share, 2)}%` }}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {previous
                      ? `${conversion}% converted from ${previous.label}`
                      : "Top of funnel — all enrolled candidates"}
                  </TooltipContent>
                </Tooltip>
                <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                  {share}% of enrolled
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Candidates                                                           */
/* ------------------------------------------------------------------ */

function CandidatesTab({
  enrollments,
  state,
  message,
  onRetry,
}: {
  enrollments: ApiCampaignEnrollment[];
  state: ApiUiState;
  message: string | null;
  onRetry: () => void;
}) {
  if (state !== "success") {
    return (
      <ApiFeedback
        state={state}
        message={message}
        onRetry={onRetry}
        emptyTitle="No candidates enrolled"
        emptyDescription="Add candidates to this campaign to start outreach."
      />
    );
  }

  return (
    <section className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <caption className="sr-only">
          Candidates enrolled in this campaign
        </caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={HEAD}>Current company</TableHead>
            <TableHead className={HEAD}>Email</TableHead>
            <TableHead className={HEAD}>Mobile</TableHead>
            <TableHead className={HEAD}>Sequence step</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={HEAD}>Reply</TableHead>
            <TableHead className={HEAD}>Qualification</TableHead>
            <TableHead className={HEAD}>Screening</TableHead>
            <TableHead className={HEAD}>Interview</TableHead>
            <TableHead className={HEAD}>Last activity</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((candidate) => {
            const replyLabel = candidate.replyState?.disposition
              ? titleCase(candidate.replyState.disposition)
              : candidate.replyState?.hasReply
                ? "Replied"
                : "Awaiting reply";
            const qualification = candidate.qualificationState?.status ?? "pending";
            const screening = candidate.screeningState?.status ?? "not_started";
            const scheduling = candidate.schedulingState?.status ?? "not_started";
            return (
              <TableRow key={candidate.id}>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <CandidateAvatar name={candidate.name} className="size-7" />
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
                  </div>
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.company ?? "—"}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.email ? (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {candidate.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.phone ? (
                    <a
                      href={`tel:${candidate.phone}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {candidate.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  Step {candidate.currentStepIndex + 1}
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    text={titleCase(candidate.status)}
                    className={stateBadgeClass(candidate.status)}
                  />
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge text={replyLabel} className={stateBadgeClass(replyLabel)} />
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    text={titleCase(qualification)}
                    className={stateBadgeClass(qualification)}
                  />
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {titleCase(screening)}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {titleCase(scheduling)}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {relativeTime(candidate.lastActionAt)}
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
                    <DropdownMenuContent align="end" className="w-48">
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
                        Remove from campaign
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sequence, analytics, activity, settings                              */
/* ------------------------------------------------------------------ */

function SequenceTab({
  steps,
  state,
  message,
  onRetry,
}: {
  steps: ApiCampaignSequenceStep[];
  state: ApiUiState;
  message: string | null;
  onRetry: () => void;
}) {
  if (state !== "success" || steps.length === 0) {
    return (
      <ApiFeedback
        state={state === "success" ? "empty" : state}
        message={message}
        onRetry={onRetry}
        emptyTitle="No sequence steps"
        emptyDescription="This campaign has no configured sequence steps yet."
      />
    );
  }

  const ordered = [...steps].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Live sequence</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Read-only view — pause the campaign to edit steps.
      </p>
      <ol className="mt-4 space-y-0">
        {ordered.map((step, index) => {
          const Icon = STEP_ICONS[step.type] ?? Activity;
          const delay =
            step.delayDays === 0
              ? "Immediately"
              : `${formatStepDelay(step.delayDays, step.delayUnit ?? "days").replace(/^After /, "")} later`;
          const summary =
            step.subject || step.note || step.body || titleCase(step.type);
          return (
            <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {index < ordered.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-10 left-[15px] h-full w-px bg-border"
                />
              ) : null}
              <span className="relative mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                <Icon aria-hidden className="size-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {index + 1}. {titleCase(step.type)}
                  </p>
                  <span className="text-xs text-muted-foreground">{delay}</span>
                  {step.stopOnReply ? (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Stops on reply
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AnalyticsTab({ campaign }: { campaign: OutreachCampaign }) {
  const rate = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
  const rates = [
    { id: "delivery", label: "Delivery rate", value: rate(campaign.delivered, campaign.sent) },
    { id: "reply", label: "Reply rate", value: rate(campaign.replies, campaign.delivered) },
    {
      id: "positive",
      label: "Positive reply rate",
      value: rate(campaign.interested, campaign.delivered),
    },
    {
      id: "qualification",
      label: "Qualification rate",
      value: rate(campaign.qualified, campaign.replies),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rates.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{r.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {r.value}%
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Channel comparison
          </h3>
          <EmptyState
            className="mt-4"
            icon={Activity}
            title="Channel analytics unavailable"
            description="Per-channel breakdown charts are not available for this campaign yet."
          />
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Sequence-step performance
          </h3>
          <EmptyState
            className="mt-4"
            icon={Activity}
            title="Step analytics unavailable"
            description="Per-step performance charts are not available for this campaign yet."
          />
        </section>
      </div>
    </div>
  );
}

function ActivityTab({
  activity,
  state,
  message,
  onRetry,
}: {
  activity: Array<{
    id: string;
    type: string;
    title: string;
    detail: string | null;
    createdAt: string;
  }>;
  state: ApiUiState;
  message: string | null;
  onRetry: () => void;
}) {
  if (state !== "success") {
    return (
      <ApiFeedback
        state={state}
        message={message}
        onRetry={onRetry}
        emptyTitle="No activity yet"
        emptyDescription="Campaign events will appear here as outreach runs."
      />
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <ol className="space-y-0">
        {activity.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < activity.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-6 left-[11px] h-full w-px bg-border"
              />
            ) : null}
            <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <Activity aria-hidden className="size-3 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{entry.title}</p>
              {entry.detail ? (
                <p className="text-xs text-muted-foreground">{entry.detail}</p>
              ) : null}
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {relativeTime(entry.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SettingsTab({
  raw,
  state,
  message,
  onRetry,
}: {
  raw: ApiOutreachCampaign | null;
  state: ApiUiState;
  message: string | null;
  onRetry: () => void;
}) {
  if (state !== "success" || !raw) {
    return (
      <ApiFeedback
        state={state === "success" ? "empty" : state}
        message={message}
        onRetry={onRetry}
        emptyTitle="No settings available"
        emptyDescription="Campaign settings will appear once the campaign is configured."
      />
    );
  }

  const cfg = raw.channelConfig;
  const sendWindow = cfg?.sendWindow;
  const settings: { id: string; label: string; value: string }[] = [
    { id: "timezone", label: "Timezone", value: cfg?.timezone || "—" },
    {
      id: "window",
      label: "Send window",
      value: sendWindow
        ? `${sendWindow.startHour}:00 – ${sendWindow.endHour}:00`
        : "—",
    },
    {
      id: "stop",
      label: "Stop on reply",
      value: raw.sequenceSteps?.some((step) => step.stopOnReply)
        ? "Enabled on message steps"
        : "Disabled",
    },
    {
      id: "ai-reply",
      label: "AI reply",
      value: raw.qualificationConfig?.aiReplyEnabled ? "Enabled" : "Disabled",
    },
    {
      id: "scheduling",
      label: "Scheduling",
      value: raw.schedulingConfig?.enabled ? "Enabled" : "Disabled",
    },
    {
      id: "sender-email",
      label: "Email sender",
      value: cfg?.email?.senderEmail || "Managed in Integrations",
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Campaign settings
        </h3>
        <p className="text-xs text-muted-foreground">
          Sender connections are managed in workspace integrations.
        </p>
      </div>
      <dl className="divide-y divide-border">
        {settings.map((setting) => (
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
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Detail shell                                                         */
/* ------------------------------------------------------------------ */

export function CampaignDetail({ campaign }: { campaign: OutreachCampaign }) {
  const router = useRouter();
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [enrollments, setEnrollments] = useState<ApiCampaignEnrollment[]>([]);
  const [enrollmentsState, setEnrollmentsState] = useState<ApiUiState>("loading");
  const [enrollmentsMessage, setEnrollmentsMessage] = useState<string | null>(null);

  const [activity, setActivity] = useState<
    Array<{ id: string; type: string; title: string; detail: string | null; createdAt: string }>
  >([]);
  const [activityState, setActivityState] = useState<ApiUiState>("loading");
  const [activityMessage, setActivityMessage] = useState<string | null>(null);

  const [raw, setRaw] = useState<ApiOutreachCampaign | null>(null);
  const [rawState, setRawState] = useState<ApiUiState>("loading");
  const [rawMessage, setRawMessage] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useRealtimeRefresh(["campaign.updated", "campaign.thread.updated"], () => {
    setReloadKey((key) => key + 1);
  });

  useEffect(() => {
    let cancelled = false;

    setEnrollmentsState("loading");
    setActivityState("loading");
    setRawState("loading");

    void (async () => {
      try {
        const rows = await outreachApi.listEnrollments(campaign.id, { limit: 100 });
        if (cancelled) return;
        setEnrollments(rows);
        setEnrollmentsState(rows.length === 0 ? "empty" : "success");
      } catch (err) {
        if (cancelled) return;
        setEnrollmentsState(mapApiErrorToUiState(err));
        setEnrollmentsMessage(getApiErrorMessage(err));
      }
    })();

    void (async () => {
      try {
        const rows = await outreachApi.getActivity(campaign.id);
        if (cancelled) return;
        setActivity(rows);
        setActivityState(rows.length === 0 ? "empty" : "success");
      } catch (err) {
        if (cancelled) return;
        setActivityState(mapApiErrorToUiState(err));
        setActivityMessage(getApiErrorMessage(err));
      }
    })();

    void (async () => {
      try {
        const next = await outreachApi.getCampaignRaw(campaign.id);
        if (cancelled) return;
        if (!next) {
          setRawState("empty");
          return;
        }
        setRaw(next);
        setRawState("success");
      } catch (err) {
        if (cancelled) return;
        setRawState(mapApiErrorToUiState(err));
        setRawMessage(getApiErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaign.id, reloadKey]);

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  async function runLifecycle(
    action: () => Promise<OutreachCampaign>,
    successMessage: string
  ) {
    setBusy(true);
    try {
      const next = await action();
      setStatus(next.status);
      flash(successMessage);
    } catch (err) {
      flash(getApiErrorMessage(err, "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {campaign.name}
              </h1>
              <CampaignStatusBadge status={status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {campaign.relatedJobId && campaign.relatedJobTitle ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase aria-hidden className="size-3" />
                  <Link
                    href={jobDetailPath(campaign.relatedJobId)}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {campaign.relatedJobTitle}
                  </Link>
                </span>
              ) : null}
              <span>Owner: {campaign.owner}</span>
              <span className="inline-flex items-center gap-1.5">
                Channels:
                {campaign.channels.map((channel) => {
                  const Icon = CHANNEL_ICONS[channel];
                  return (
                    <Icon
                      key={channel}
                      aria-label={channel}
                      className="size-3.5"
                    />
                  );
                })}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays aria-hidden className="size-3" />
                Started {campaign.createdDaysAgo} days ago
              </span>
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden className="size-3" />
                {campaign.candidates.toLocaleString("en-IN")} candidates
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
                    () => outreachApi.pauseCampaign(campaign.id),
                    "Campaign paused — messages stop immediately."
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
                  void runLifecycle(
                    () => outreachApi.resumeCampaign(campaign.id),
                    "Campaign resumed."
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
                  flash("Pause the campaign before editing the sequence.")
                }
              >
                <Pencil aria-hidden />
                Edit
              </Button>
            ) : status === "Completed" || status === "Cancelled" ? (
              <Button size="sm" variant="outline" disabled>
                <Pencil aria-hidden />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href={campaignEditPath(campaign.id)} />}
              >
                <Pencil aria-hidden />
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void runLifecycle(async () => {
                  const copy = await outreachApi.duplicateCampaign(campaign.id);
                  router.push(campaignDetailPath(copy.id));
                  return copy;
                }, "Campaign duplicated as a draft.")
              }
            >
              <Copy aria-hidden />
              Duplicate
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
                <DropdownMenuItem onClick={() => flash("Exported campaign report.")}>
                  <Download aria-hidden />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => flash("Campaign archived.")}>
                  <Archive aria-hidden />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => flash("Campaign deleted. (UI preview)")}
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
            <TabsTrigger value="sequence">Sequence</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="pt-3">
          <OverviewTab campaign={campaign} />
        </TabsContent>
        <TabsContent value="candidates" className="pt-3">
          <CandidatesTab
            enrollments={enrollments}
            state={enrollmentsState}
            message={enrollmentsMessage}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </TabsContent>
        <TabsContent value="conversations" className="pt-3">
          <ConversationsPanel
            campaignId={campaign.id}
            emptyDescription="Outbound messages (sent or failed) and candidate replies for this campaign will appear here."
          />
        </TabsContent>
        <TabsContent value="sequence" className="pt-3">
          <SequenceTab
            steps={raw?.sequenceSteps ?? []}
            state={rawState}
            message={rawMessage}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </TabsContent>
        <TabsContent value="analytics" className="pt-3">
          <AnalyticsTab campaign={campaign} />
        </TabsContent>
        <TabsContent value="activity" className="pt-3">
          <ActivityTab
            activity={activity}
            state={activityState}
            message={activityMessage}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </TabsContent>
        <TabsContent value="settings" className="pt-3">
          <SettingsTab
            raw={raw}
            state={rawState}
            message={rawMessage}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
