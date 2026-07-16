"use client";

import { Plug, PlugZap } from "lucide-react";

import { ErrorList, StepCard } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
import { stepErrors } from "@/components/outreach/builder-types";
import { UsageProgress } from "@/components/shared/usage-progress";
import { Button } from "@/components/ui/button";
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

  function toggleChannel(channel: OutreachChannel) {
    update(
      "enabledChannels",
      state.enabledChannels.includes(channel)
        ? state.enabledChannels.filter((entry) => entry !== channel)
        : [...state.enabledChannels, channel]
    );
  }

  function setConnection(channel: OutreachChannel, connection: ChannelConnection) {
    update("connections", { ...state.connections, [channel]: connection });
  }

  return (
    <StepCard
      title="Channels"
      description="Enable the channels this campaign can use. At least one configured channel is required."
    >
      <div className="space-y-3">
        <ErrorList errors={errors} />

        <div className="grid gap-3 lg:grid-cols-3">
          {CHANNEL_CONFIGS.map((config) => {
            const Icon = CHANNEL_ICONS[config.channel];
            const enabled = state.enabledChannels.includes(config.channel);
            const connection = state.connections[config.channel];
            const disconnected = connection === "Disconnected";

            return (
              <div
                key={config.channel}
                className={cn(
                  "flex flex-col rounded-xl border p-4 transition-colors",
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
                        type="checkbox"
                        checked={enabled}
                        onChange={() => toggleChannel(config.channel)}
                        aria-label={`Enable ${config.channel}`}
                        className="size-3.5 accent-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.provider}
                    </p>
                  </div>
                </div>

                <dl className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Sender</dt>
                    <dd className="truncate font-medium text-foreground">
                      {config.sender}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Cost</dt>
                    <dd className="font-medium tabular-nums text-foreground">
                      {config.costPerMessage} {config.costUnit}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <UsageProgress
                    metric={{
                      id: config.channel,
                      label: config.quotaUnit,
                      used: config.quotaUsed,
                      total: config.quotaTotal,
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium",
                      CONNECTION_CLASSES[connection]
                    )}
                  >
                    {connection}
                  </span>
                  {disconnected ? (
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => setConnection(config.channel, "Connected")}
                    >
                      <PlugZap aria-hidden />
                      Reconnect
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => setConnection(config.channel, "Disconnected")}
                    >
                      <Plug aria-hidden />
                      Simulate disconnect
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {disconnected
                    ? "Provider disconnected — reconnect before launching."
                    : config.connectionNote}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </StepCard>
  );
}
