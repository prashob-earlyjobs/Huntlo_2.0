"use client";

import {
  CheckCircle2,
  CopyX,
  FileSpreadsheet,
  ListChecks,
  Mail,
  Phone,
  Search,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Field, StepCard } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
import { audienceStats } from "@/components/outreach/builder-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { candidatesApi, sourcingApi } from "@/lib/api";
import { SAVED_LISTS } from "@/lib/mock-candidates";
import {
  AUDIENCE_SOURCES,
  reachableCount,
  type AudienceSource,
} from "@/lib/mock-outreach";
import { SOURCING_SESSIONS } from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

const SOURCE_META: Record<
  AudienceSource,
  { icon: typeof Users; description: string }
> = {
  "Candidate Pool": {
    icon: Users,
    description: "Use filtered candidates from your pool",
  },
  "Saved List": {
    icon: ListChecks,
    description: "Enroll everyone in a saved list",
  },
  "Sourcing Session": {
    icon: Search,
    description: "Use results from an AI search",
  },
  "CSV/Excel Import": {
    icon: FileSpreadsheet,
    description: "Upload a file of candidates",
  },
  "Manual Add": {
    icon: UserPlus,
    description: "Hand-pick a few candidates",
  },
};

export function AudienceStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
}) {
  const stats = audienceStats(state);
  const [reachability, setReachability] = useState<{
    withEmail: number;
    withMobile: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (state.source !== "Sourcing Session" || !state.sourceDetail) {
      setReachability(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const candidates = await sourcingApi.getSessionCandidates(state.sourceDetail);
        const lookup = await candidatesApi.lookupRevealedContacts({
          candidateIds: candidates.map((c) => c.id),
        });
        if (cancelled) return;
        setReachability({
          total: candidates.length,
          withEmail: lookup.items.filter((item) => item.email.revealed).length,
          withMobile: lookup.items.filter((item) => item.mobile.revealed).length,
        });
      } catch {
        if (!cancelled) setReachability(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.source, state.sourceDetail]);

  return (
    <StepCard
      title="Audience"
      description="Choose where the campaign audience comes from. Duplicates and invalid contacts are excluded automatically."
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_SOURCES.map((source) => {
            const meta = SOURCE_META[source];
            const Icon = meta.icon;
            const selected = state.source === source;
            return (
              <button
                key={source}
                type="button"
                onClick={() => {
                  update("source", source);
                  update("sourceDetail", "");
                }}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-brand-subtle"
                    : "border-border bg-card hover:bg-muted/40"
                )}
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    selected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {source}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {showErrors && !state.source ? (
          <p role="alert" className="text-sm text-destructive">
            Choose where the campaign audience comes from.
          </p>
        ) : null}

        {state.source === "Saved List" ? (
          <Field label="Saved list" htmlFor="audience-list">
            <Select
              value={state.sourceDetail || undefined}
              onValueChange={(value) => update("sourceDetail", value)}
            >
              <SelectTrigger id="audience-list" className="w-full sm:w-80">
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {SAVED_LISTS.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {state.source === "Sourcing Session" ? (
          <Field label="Sourcing session" htmlFor="audience-session">
            <Select
              value={state.sourceDetail || undefined}
              onValueChange={(value) => update("sourceDetail", value)}
            >
              <SelectTrigger id="audience-session" className="w-full sm:w-80">
                <SelectValue placeholder="Select a search session" />
              </SelectTrigger>
              <SelectContent>
                {SOURCING_SESSIONS.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {stats ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["Selected", stats.selected, Users],
                ["Duplicates", stats.duplicates, CopyX],
                ["Invalid", stats.invalid, XCircle],
                ["Estimated reachable", reachableCount(stats), CheckCircle2],
              ] as const
            ).map(([label, value, Icon]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon aria-hidden className="size-3.5" />
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {value.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {reachability ? (
          <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
            <p className="font-medium text-foreground">Revealed contact check</p>
            <p className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Mail aria-hidden className="size-3.5" />
                {reachability.withEmail}/{reachability.total} email unlocked
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone aria-hidden className="size-3.5" />
                {reachability.withMobile}/{reachability.total} mobile unlocked
              </span>
            </p>
          </div>
        ) : null}
      </div>
    </StepCard>
  );
}
