"use client";

import { Plug, PlugZap } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorList, StepCard } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
import {
  isSingleChannelCampaign,
  stepErrors,
} from "@/components/outreach/builder-types";
import { UsageProgress } from "@/components/shared/usage-progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { integrationsApi, plansApi } from "@/lib/api";
import type { UsageQuota } from "@/lib/api/contracts";
import {
  CHANNEL_CONFIGS,
  CHANNEL_ICONS,
  type ChannelConnection,
  type OutreachChannel,
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

const CONNECTION_CLASSES: Record<ChannelConnection, string> = {
  Connected: "bg-success/10 text-success",
  "Needs attention": "bg-warning/10 text-warning",
  Disconnected: "bg-destructive/10 text-destructive",
};

const CHANNEL_PROVIDERS: Record<OutreachChannel, string[]> = {
  Email: ["gmail", "outlook", "zoho-mail", "smtp"],
  WhatsApp: ["huntlo-whatsapp", "meta-whatsapp", "gupshup"],
  "AI Voice": ["hunar"],
};

/** Matches `plansApi.getUsage()` / `UsageQuota.id` (mock + live). */
const CHANNEL_USAGE_ID: Record<OutreachChannel, string> = {
  Email: "email-outreach",
  WhatsApp: "whatsapp",
  "AI Voice": "voice",
};

const CHANNEL_COST: Record<OutreachChannel, { per: number; unit: string }> = {
  Email: { per: 1, unit: "credit / email" },
  WhatsApp: { per: 2, unit: "credits / message" },
  "AI Voice": { per: 1, unit: "credit / minute" },
};

const CHANNEL_QUOTA_UNIT: Record<OutreachChannel, string> = {
  Email: "emails / mo",
  WhatsApp: "messages / mo",
  "AI Voice": "minutes / mo",
};

const UNLIMITED_LIMIT = 999_999_999;

type ChannelQuota = {
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
};

type ChannelDisplay = {
  provider: string;
  sender: string;
  connectionNote: string;
};

function statusToConnection(status: string | undefined): ChannelConnection {
  if (status === "Connected") return "Connected";
  if (status === "Needs Attention" || status === "Expired") {
    return "Needs attention";
  }
  return "Disconnected";
}

function resolveConnection(
  channel: OutreachChannel,
  provider:
    | {
        status: string;
        serverConfigured?: boolean;
      }
    | undefined
): ChannelConnection {
  if (!provider) return "Disconnected";
  const status = statusToConnection(provider.status);
  // Platform-managed Huntlo Voice AI: server-ready counts as Connected.
  if (
    channel === "AI Voice" &&
    provider.serverConfigured &&
    status === "Disconnected"
  ) {
    return "Connected";
  }
  return status;
}

function channelProviderLabel(
  channel: OutreachChannel,
  providerName: string | undefined,
  fallback: string
): string {
  if (channel === "AI Voice") return "Huntlo Voice AI";
  return providerName?.trim() || fallback;
}

function defaultDisplays(): Record<OutreachChannel, ChannelDisplay> {
  return Object.fromEntries(
    CHANNEL_CONFIGS.map((config) => [
      config.channel,
      {
        provider: config.provider,
        sender: config.sender,
        connectionNote: config.connectionNote,
      },
    ])
  ) as Record<OutreachChannel, ChannelDisplay>;
}

function quotaFromUsage(row: UsageQuota | undefined): ChannelQuota | null {
  if (!row) return null;
  if (row.limit == null || row.limit >= UNLIMITED_LIMIT) {
    return {
      used: Math.max(0, row.used),
      total: row.limit ?? UNLIMITED_LIMIT,
      remaining: Number.POSITIVE_INFINITY,
      unlimited: true,
    };
  }
  const total = Math.max(0, row.limit);
  const used = Math.max(0, row.used);
  return {
    used: Math.min(total, used),
    total,
    remaining: Math.max(0, total - used),
    unlimited: false,
  };
}

function ChannelQuotaBar({
  channel,
  quota,
  loading,
}: {
  channel: OutreachChannel;
  quota: ChannelQuota | null;
  loading: boolean;
}) {
  const label = CHANNEL_QUOTA_UNIT[channel];

  if (loading) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </div>
    );
  }

  if (!quota) {
    return (
      <p className="text-xs text-muted-foreground">Usage unavailable</p>
    );
  }

  if (quota.unlimited) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium text-foreground">{label}</span>
          <span className="tabular-nums text-muted-foreground">Unlimited</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted" />
      </div>
    );
  }

  if (quota.total <= 0) {
    return (
      <p className="text-xs text-muted-foreground">No quota on current plan</p>
    );
  }

  return (
    <UsageProgress
      metric={{
        id: CHANNEL_USAGE_ID[channel],
        label,
        used: quota.used,
        total: quota.total,
      }}
    />
  );
}

export function ChannelsStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
}) {
  const errors = showErrors ? stepErrors(2, state) : [];
  const singleChannel = isSingleChannelCampaign(state);
  const [quotaByChannel, setQuotaByChannel] = useState<
    Partial<Record<OutreachChannel, ChannelQuota | null>>
  >({});
  const [displays, setDisplays] = useState(defaultDisplays);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [providers, usage] = await Promise.all([
          integrationsApi.listProviders(),
          plansApi.getUsage(),
        ]);
        if (cancelled) return;

        const nextConnections = { ...state.connections };
        const nextDisplays = { ...defaultDisplays() };

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
            nextConnections[channel] = resolveConnection(channel, best);

            if (best) {
              const errorNote = best.connectionDetails.find(
                (detail) => detail.label === "Error"
              )?.value;
              const providerLabel = channelProviderLabel(
                channel,
                best.name,
                nextDisplays[channel].provider
              );
              const connected =
                resolveConnection(channel, best) === "Connected";
              nextDisplays[channel] = {
                provider: providerLabel,
                sender:
                  best.connectedIdentity?.trim() ||
                  nextDisplays[channel].sender,
                connectionNote: errorNote
                  ? errorNote
                  : connected
                    ? `${providerLabel} connected`
                    : nextDisplays[channel].connectionNote,
              };
            } else if (channel === "AI Voice") {
              nextDisplays[channel] = {
                ...nextDisplays[channel],
                provider: "Huntlo Voice AI",
              };
            }
          }
        );

        const nextQuota: Partial<
          Record<OutreachChannel, ChannelQuota | null>
        > = {};
        (Object.keys(CHANNEL_USAGE_ID) as OutreachChannel[]).forEach(
          (channel) => {
            const row = usage.find(
              (item) => item.id === CHANNEL_USAGE_ID[channel]
            );
            nextQuota[channel] = quotaFromUsage(row);

            const quota = nextQuota[channel];
            if (
              quota &&
              !quota.unlimited &&
              quota.total > 0 &&
              quota.remaining / quota.total <= 0.1
            ) {
              const unit =
                channel === "AI Voice"
                  ? "min"
                  : channel === "Email"
                    ? "emails"
                    : "messages";
              nextDisplays[channel] = {
                ...nextDisplays[channel],
                connectionNote: `${quota.remaining.toLocaleString("en-IN")} ${unit} left this period`,
              };
            }
          }
        );

        update("connections", nextConnections);
        setDisplays(nextDisplays);
        setQuotaByChannel(nextQuota);
      } catch {
        // Keep static display defaults when APIs are unavailable.
      } finally {
        if (!cancelled) setUsageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function toggleChannel(channel: OutreachChannel) {
    if (singleChannel) {
      update("enabledChannels", [channel]);
      return;
    }
    update(
      "enabledChannels",
      state.enabledChannels.includes(channel)
        ? state.enabledChannels.filter((entry) => entry !== channel)
        : [...state.enabledChannels, channel]
    );
  }

  return (
    <StepCard
      title="Channels"
      description={
        singleChannel
          ? "Pick the one channel this campaign will use. Switching channels updates the sequence."
          : "Enable the channels this campaign can use. At least one configured channel is required."
      }
    >
      <div className="space-y-3">
        <ErrorList errors={errors} />

        <div className="grid gap-3 lg:grid-cols-3">
          {CHANNEL_CONFIGS.map((config) => {
            const Icon = CHANNEL_ICONS[config.channel];
            const enabled = state.enabledChannels.includes(config.channel);
            const connection = state.connections[config.channel];
            const disconnected = connection === "Disconnected";
            const display = displays[config.channel];
            const cost = CHANNEL_COST[config.channel];

            return (
              <div
                key={config.channel}
                onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("button, a, input, select, textarea")) return;
                  toggleChannel(config.channel);
                }}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/20",
                  enabled
                    ? "border-primary/50 bg-brand-subtle/20"
                    : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                      enabled
                        ? "border-primary/30 bg-brand-subtle text-primary"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon aria-hidden className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {config.channel}
                      </p>
                      <input
                        type={singleChannel ? "radio" : "checkbox"}
                        name={
                          singleChannel ? "outreach-single-channel" : undefined
                        }
                        checked={enabled}
                        onChange={() => toggleChannel(config.channel)}
                        aria-label={
                          singleChannel
                            ? `Use ${config.channel}`
                            : `Enable ${config.channel}`
                        }
                        className="size-3.5 cursor-pointer accent-primary"
                      />
                    </div>
                    {usageLoading ? (
                      <Skeleton className="mt-0.5 h-3 w-24" />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {display.provider}
                      </p>
                    )}
                  </div>
                </div>

                <dl className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Sender</dt>
                    <dd className="truncate font-medium text-foreground">
                      {usageLoading ? (
                        <Skeleton className="ml-auto h-3 w-28" />
                      ) : (
                        display.sender
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Cost</dt>
                    <dd className="font-medium tabular-nums text-foreground">
                      {cost.per} {cost.unit}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <ChannelQuotaBar
                    channel={config.channel}
                    quota={quotaByChannel[config.channel] ?? null}
                    loading={usageLoading}
                  />
                </div>

                {usageLoading ? (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <Skeleton className="h-7 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-full max-w-[90%]" />
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span
                        className={cn(
                          "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium",
                          CONNECTION_CLASSES[connection]
                        )}
                      >
                        {connection}
                      </span>
                      <Button
                        type="button"
                        size="xs"
                        variant={disconnected ? "default" : "ghost"}
                        className={
                          disconnected ? undefined : "text-muted-foreground"
                        }
                        onClick={() =>
                          window.open("/dashboard/integrations", "_blank")
                        }
                      >
                        {disconnected ? (
                          <PlugZap aria-hidden />
                        ) : (
                          <Plug aria-hidden />
                        )}
                        {disconnected ? "Connect" : "Manage"}
                      </Button>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {disconnected
                        ? "Provider disconnected — reconnect before launching."
                        : display.connectionNote}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </StepCard>
  );
}
