"use client";

import {
  Archive,
  Briefcase,
  CalendarDays,
  Copy,
  Download,
  Eye,
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

import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { ConversationInbox } from "@/components/conversations/conversation-inbox";
import { ChannelComparisonChart } from "@/components/dashboard/channel-comparison-chart";
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
  CAMPAIGN_ACTIVITY,
  CAMPAIGN_CHANNEL_COMPARISON,
  CAMPAIGN_SEQUENCE,
  CAMPAIGN_SETTINGS,
  campaignFunnel,
  campaignKpis,
  campaignRates,
  CONVERSION_CHART,
  ENROLLED_CANDIDATES,
  REPLY_TIME_CHART,
  STEP_PERFORMANCE_CHART,
  type EnrolledCandidate,
} from "@/lib/mock-campaign-detail";
import { CONVERSATIONS } from "@/lib/mock-conversations";
import {
  CHANNEL_ICONS,
  type CampaignStatus,
  type OutreachCampaign,
} from "@/lib/mock-outreach";
import { candidateDetailPath, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const DELIVERY_CLASSES: Record<EnrolledCandidate["delivery"], string> = {
  Sent: "bg-muted text-muted-foreground",
  Delivered: "bg-info/10 text-info",
  Read: "bg-success/10 text-success",
  Bounced: "bg-destructive/10 text-destructive",
  Queued: "bg-muted text-muted-foreground",
};

const REPLY_CLASSES: Record<EnrolledCandidate["replyStatus"], string> = {
  "Awaiting reply": "bg-muted text-muted-foreground",
  Replied: "bg-info/10 text-info",
  Interested: "bg-success/10 text-success",
  "Not interested": "bg-destructive/10 text-destructive",
};

const QUAL_CLASSES: Record<EnrolledCandidate["qualification"], string> = {
  Pending: "bg-muted text-muted-foreground",
  "In progress": "bg-info/10 text-info",
  Qualified: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
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
  const kpis = campaignKpis(campaign);
  const funnel = campaignFunnel(campaign);
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
          Conversion from enrolment to scheduled interviews
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
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

function CandidatesTab() {
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
            <TableHead className={HEAD}>Channel</TableHead>
            <TableHead className={HEAD}>Sequence step</TableHead>
            <TableHead className={HEAD}>Delivery</TableHead>
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
          {ENROLLED_CANDIDATES.map((candidate) => {
            const ChannelIcon = CHANNEL_ICONS[candidate.channel];
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
                  {candidate.company}
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
                    <ChannelIcon aria-hidden className="size-3.5" />
                    {candidate.channel}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.sequenceStep}
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    text={candidate.delivery}
                    className={DELIVERY_CLASSES[candidate.delivery]}
                  />
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    text={candidate.replyStatus}
                    className={REPLY_CLASSES[candidate.replyStatus]}
                  />
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    text={candidate.qualification}
                    className={QUAL_CLASSES[candidate.qualification]}
                  />
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.screening}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.interview}
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

function SequenceTab() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Live sequence</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Read-only view — pause the campaign to edit steps.
      </p>
      <ol className="mt-4 space-y-0">
        {CAMPAIGN_SEQUENCE.map((step, index) => (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {index < CAMPAIGN_SEQUENCE.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-10 left-[15px] h-full w-px bg-border"
              />
            ) : null}
            <span className="relative mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <step.icon aria-hidden className="size-4 text-muted-foreground" />
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {index + 1}. {step.type}
                </p>
                {step.channel ? (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {step.channel}
                  </span>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {step.delay}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{step.summary}</p>
              {step.performance ? (
                <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {step.performance.sent.toLocaleString("en-IN")}
                  </span>{" "}
                  sent ·{" "}
                  <span className="font-medium text-success">
                    {step.performance.replies}
                  </span>{" "}
                  replies (
                  {Math.round(
                    (step.performance.replies / Math.max(step.performance.sent, 1)) * 100
                  )}
                  %)
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AnalyticsTab({ campaign }: { campaign: OutreachCampaign }) {
  const rates = campaignRates(campaign);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rates.map((rate) => (
          <div key={rate.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">
              {rate.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {rate.value}%
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Channel comparison
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Delivery, reply and positive-reply rates per channel
          </p>
          <div className="mt-4">
            <ChannelComparisonChart data={CAMPAIGN_CHANNEL_COMPARISON} />
          </div>
        </section>
        <ChartCard chart={STEP_PERFORMANCE_CHART} />
        <ChartCard chart={REPLY_TIME_CHART} />
        <ChartCard chart={CONVERSION_CHART} />
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <ol className="space-y-0">
        {CAMPAIGN_ACTIVITY.map((entry, index) => (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < CAMPAIGN_ACTIVITY.length - 1 ? (
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
          Campaign settings
        </h3>
        <p className="text-xs text-muted-foreground">
          Sender connections are managed in workspace integrations.
        </p>
      </div>
      <dl className="divide-y divide-border">
        {CAMPAIGN_SETTINGS.map((setting) => (
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
            {setting.editable ? (
              <Button size="xs" variant="ghost">
                <Pencil aria-hidden />
                Edit
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                Managed in Integrations
              </span>
            )}
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
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [feedback, setFeedback] = useState<string | null>(null);

  const campaignConversations = CONVERSATIONS.filter(
    (conversation) => conversation.campaignId === campaign.id
  );

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
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
                onClick={() => {
                  setStatus("Paused");
                  flash("Campaign paused — messages stop immediately.");
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
                  flash("Campaign resumed.");
                }}
              >
                <Play aria-hidden />
                Resume
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => flash("Edit opens the campaign builder. (UI preview)")}>
              <Pencil aria-hidden />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash("Campaign duplicated as a draft.")}
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
          <CandidatesTab />
        </TabsContent>
        <TabsContent value="conversations" className="pt-3">
          {campaignConversations.length > 0 ? (
            <ConversationInbox conversations={campaignConversations} />
          ) : (
            <EmptyState
              icon={Users}
              title="No conversations yet"
              description="Replies from candidates in this campaign will appear here."
            />
          )}
        </TabsContent>
        <TabsContent value="sequence" className="pt-3">
          <SequenceTab />
        </TabsContent>
        <TabsContent value="analytics" className="pt-3">
          <AnalyticsTab campaign={campaign} />
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
