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

  return (
    <StepCard
      title="Audience"
      description="Choose where the campaign audience comes from. Duplicates and invalid contacts are excluded automatically."
    >
      <div className="space-y-4">
        <div
          role="radiogroup"
          aria-label="Candidate source"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
        >
          {AUDIENCE_SOURCES.map((source) => {
            const meta = SOURCE_META[source];
            const active = state.source === source;
            return (
              <button
                key={source}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  update("source", source);
                  update("sourceDetail", "");
                }}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "border-primary/50 bg-brand-subtle/40"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <meta.icon
                  aria-hidden
                  className={cn(
                    "size-4",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-primary" : "text-foreground"
                  )}
                >
                  {source}
                </span>
                <span className="text-xs text-muted-foreground">
                  {meta.description}
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
              value={state.sourceDetail || null}
              onValueChange={(value) => update("sourceDetail", value ?? "")}
            >
              <SelectTrigger id="audience-list" className="w-full sm:w-80">
                <SelectValue placeholder="Pick a list" />
              </SelectTrigger>
              <SelectContent>
                {SAVED_LISTS.filter((list) => !list.archived).map((list) => (
                  <SelectItem key={list.id} value={list.name}>
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
              value={state.sourceDetail || null}
              onValueChange={(value) => update("sourceDetail", value ?? "")}
            >
              <SelectTrigger id="audience-session" className="w-full sm:w-80">
                <SelectValue placeholder="Pick a session" />
              </SelectTrigger>
              <SelectContent>
                {SOURCING_SESSIONS.map((session) => (
                  <SelectItem key={session.id} value={session.name}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {state.source === "CSV/Excel Import" ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
            Uses the candidates from your last validated import
            (candidates-july.csv — 128 rows). Files stay in your browser in
            this UI preview.
          </p>
        ) : null}

        {state.source === "Manual Add" ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
            5 candidates hand-picked from the Candidate Pool are queued for
            this campaign.
          </p>
        ) : null}

        {stats ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {(
              [
                [Users, "Selected", stats.selected, "text-foreground"],
                [Mail, "With email", stats.withEmail, "text-foreground"],
                [Phone, "With phone", stats.withPhone, "text-foreground"],
                [CopyX, "Duplicates", stats.duplicates, "text-warning"],
                [XCircle, "Invalid contacts", stats.invalid, "text-destructive"],
                [
                  CheckCircle2,
                  "Estimated reachable",
                  reachableCount(stats),
                  "text-success",
                ],
              ] as const
            ).map(([Icon, label, value, tone]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <Icon aria-hidden className={cn("size-4", tone)} />
                <p
                  className={cn(
                    "mt-1.5 text-lg font-semibold tabular-nums",
                    tone
                  )}
                >
                  {value.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </StepCard>
  );
}
