"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { StepCard } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  LaunchWarning,
} from "@/components/outreach/builder-types";
import {
  audienceStats,
  estimatedCredits,
  estimatedUnlockCredits,
  messageSteps,
} from "@/components/outreach/builder-types";
import type { JobListItem } from "@/lib/api/contracts";
import { integrationsApi } from "@/lib/api";
import { REVEAL_COSTS } from "@/hooks/use-reveal-quota";
import {
  CHANNEL_CONFIGS,
  delayAmountToMinutes,
  formatStepDelay,
  reachableCount,
  STEP_CHANNELS,
  STEP_TYPE_ICONS,
  type OutreachChannel,
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm text-foreground">{value}</dd>
    </div>
  );
}

const CHANNEL_PROVIDERS: Record<OutreachChannel, string[]> = {
  Email: ["gmail", "outlook", "zoho-mail", "smtp"],
  WhatsApp: ["huntlo-whatsapp", "meta-whatsapp", "gupshup"],
  "AI Voice": ["hunar"],
};

export function ReviewStep({
  state,
  warnings,
  jobs,
  creditsAvailable = null,
  revealCredits = null,
}: {
  state: BuilderState;
  warnings: LaunchWarning[];
  jobs: JobListItem[];
  creditsAvailable?: number | null;
  revealCredits?: {
    emailRemaining: number;
    mobileRemaining: number;
  } | null;
}) {
  const stats = audienceStats(state);
  const reachable = stats ? reachableCount(stats) : 0;
  const credits = estimatedCredits(state);
  const unlock = estimatedUnlockCredits(state);
  const job = jobs.find((entry) => entry.id === state.jobId);
  const sends = messageSteps(state).length;
  const totalDelayMinutes = state.steps.reduce(
    (sum, step) =>
      sum + delayAmountToMinutes(step.delayDays, step.delayUnit ?? "days"),
    0
  );
  const totalDelayLabel =
    totalDelayMinutes === 0
      ? "0"
      : totalDelayMinutes < 60
        ? `${totalDelayMinutes}m`
        : totalDelayMinutes < 24 * 60
          ? `${Math.round((totalDelayMinutes / 60) * 10) / 10}h`
          : `${Math.round((totalDelayMinutes / (24 * 60)) * 10) / 10}d`;
  const errors = warnings.filter((warning) => warning.severity === "error");
  const softWarnings = warnings.filter(
    (warning) => warning.severity === "warning"
  );

  const [senderByChannel, setSenderByChannel] = useState<
    Partial<Record<OutreachChannel, string>>
  >({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const providers = await integrationsApi.listProviders();
        if (cancelled) return;
        const next: Partial<Record<OutreachChannel, string>> = {};
        (Object.keys(CHANNEL_PROVIDERS) as OutreachChannel[]).forEach(
          (channel) => {
            const ids = CHANNEL_PROVIDERS[channel];
            const matches = providers.filter((p) => ids.includes(p.id));
            const best =
              matches.find((p) => p.status === "Connected") ||
              matches.find(
                (p) =>
                  p.status === "Needs Attention" || p.status === "Expired"
              ) ||
              matches[0];
            if (channel === "AI Voice") {
              next[channel] =
                best?.connectedIdentity?.trim() || "Huntlo · AI caller";
            } else {
              next[channel] =
                best?.connectedIdentity?.trim() ||
                CHANNEL_CONFIGS.find((c) => c.channel === channel)?.sender ||
                "—";
            }
          }
        );
        setSenderByChannel(next);
      } catch {
        // Keep CHANNEL_CONFIGS fallbacks when integrations are unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StepCard
      title="Review & Launch"
      description="Check the campaign before launching. Launch creates the campaign and starts the sequence for enrolled candidates."
    >
      <div className="space-y-4">
        {/* Warnings */}
        {errors.length > 0 ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
          >
            <p className="text-xs font-semibold text-destructive">
              Fix before launching
            </p>
            <ul className="mt-1 space-y-1">
              {errors.map((warning) => (
                <li
                  key={warning.id}
                  className="flex items-start gap-1.5 text-sm text-destructive"
                >
                  <XCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  {warning.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {softWarnings.length > 0 ? (
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5">
            <p className="text-xs font-semibold text-warning">Launch warnings</p>
            <ul className="mt-1 space-y-1">
              {softWarnings.map((warning) => (
                <li
                  key={warning.id}
                  className="flex items-start gap-1.5 text-sm text-foreground"
                >
                  <AlertTriangle
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-warning"
                  />
                  {warning.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {errors.length === 0 && softWarnings.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
            <CheckCircle2 aria-hidden className="size-4 shrink-0" />
            Everything looks good — this campaign is ready to launch.
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Campaign summary */}
          <dl className="divide-y divide-border rounded-lg border border-border">
            <SummaryRow label="Campaign" value={state.name.trim() || "Untitled campaign"} />
            <SummaryRow label="Related job" value={job ? job.title : "None"} />
            <SummaryRow
              label="Owner"
              value={state.owner.trim() || "Unassigned"}
            />
            <SummaryRow label="Type" value={state.campaignType} />
            <SummaryRow label="Timezone handling" value={state.timezone} />
            <SummaryRow
              label="Audience"
              value={
                stats
                  ? `${reachable.toLocaleString("en-IN")} reachable of ${stats.selected.toLocaleString("en-IN")} selected (${state.source})`
                  : "Not configured"
              }
            />
            <SummaryRow
              label="Qualification"
              value={`${state.questions.length} questions · AI reply on`}
            />
          </dl>

          <div className="space-y-4">
            {/* Credits & duration */}
            <dl className="divide-y divide-border rounded-lg border border-border">
              <SummaryRow
                label="Expected credit usage"
                value={
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      creditsAvailable != null && credits > creditsAvailable
                        ? "text-destructive"
                        : "text-foreground"
                    )}
                  >
                    {credits.toLocaleString("en-IN")}
                    {creditsAvailable != null
                      ? ` of ${creditsAvailable.toLocaleString("en-IN")} available`
                      : " estimated"}
                  </span>
                }
              />
              <SummaryRow
                label="Contact unlock on launch"
                value={
                  unlock.totalCredits > 0 ? (
                    <span
                      className={cn(
                        "tabular-nums",
                        revealCredits &&
                          (unlock.emailCredits > revealCredits.emailRemaining ||
                            unlock.phoneCredits > revealCredits.mobileRemaining)
                          ? "font-semibold text-destructive"
                          : "text-foreground"
                      )}
                    >
                      {unlock.emailUnlocks > 0
                        ? `${unlock.emailUnlocks} email × ${REVEAL_COSTS.email}`
                        : null}
                      {unlock.emailUnlocks > 0 && unlock.phoneUnlocks > 0
                        ? " · "
                        : null}
                      {unlock.phoneUnlocks > 0
                        ? `${unlock.phoneUnlocks} mobile × ${REVEAL_COSTS.mobile}`
                        : null}
                      {` = ${unlock.totalCredits} reveal credits`}
                      {revealCredits
                        ? ` (${revealCredits.emailRemaining} email / ${revealCredits.mobileRemaining} mobile left)`
                        : ""}
                    </span>
                  ) : (
                    "No unlocks needed for selected channels"
                  )
                }
              />
              <SummaryRow
                label="Estimated duration"
                value={`~${totalDelayLabel} · ${sends} sends per candidate`}
              />
              {stats ? (
                <SummaryRow
                  label="Missing contacts"
                  value={`${stats.selected - stats.withEmail} without email · ${stats.selected - stats.withPhone} without phone`}
                />
              ) : null}
            </dl>

            {/* Sender connections */}
            <div className="rounded-lg border border-border">
              <p className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
                Sender connections
              </p>
              <ul className="divide-y divide-border">
                {state.enabledChannels.map((channel) => {
                  const connection = state.connections[channel];
                  const sender =
                    senderByChannel[channel] ||
                    CHANNEL_CONFIGS.find((entry) => entry.channel === channel)
                      ?.sender ||
                    "—";
                  return (
                    <li
                      key={channel}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 text-foreground">
                        {channel}
                        <span className="ml-1.5 truncate text-xs text-muted-foreground">
                          {sender}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "inline-flex h-5 shrink-0 items-center rounded-md px-2 text-xs font-medium",
                          connection === "Connected"
                            ? "bg-success/10 text-success"
                            : connection === "Needs attention"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {connection}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Channel sequence preview */}
        <div className="rounded-lg border border-border">
          <p className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
            Channel sequence
          </p>
          <ol className="flex flex-wrap items-center gap-2 p-3">
            {state.steps.map((step, index) => {
              const Icon = STEP_TYPE_ICONS[step.type];
              const channel = STEP_CHANNELS[step.type];
              return (
                <li key={step.id} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground">
                    <Icon aria-hidden className="size-3.5 text-muted-foreground" />
                    {step.type}
                    {channel ? null : step.delayDays > 0 ? (
                      <span className="text-muted-foreground">
                        · {formatStepDelay(step.delayDays, step.delayUnit ?? "days").replace(/^After /, "")}
                      </span>
                    ) : null}
                  </span>
                  {index < state.steps.length - 1 ? (
                    <span aria-hidden className="text-muted-foreground">
                      →
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </StepCard>
  );
}
