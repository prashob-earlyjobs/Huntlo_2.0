"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Rocket,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AudienceStep } from "@/components/outreach/builder-audience-step";
import { ChannelsStep } from "@/components/outreach/builder-channels-step";
import { QualificationStep } from "@/components/outreach/builder-qualification-step";
import { ReviewStep } from "@/components/outreach/builder-review-step";
import { SequenceStepBuilder } from "@/components/outreach/builder-sequence-step";
import { SetupStep } from "@/components/outreach/builder-setup-step";
import {
  initialBuilderState,
  launchWarnings,
  stepErrors,
  type BuilderState,
} from "@/components/outreach/builder-types";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const BUILDER_STEPS = [
  { id: "setup", title: "Campaign Setup" },
  { id: "audience", title: "Audience" },
  { id: "channels", title: "Channels" },
  { id: "sequence", title: "Sequence" },
  { id: "qualification", title: "Qualification" },
  { id: "review", title: "Review & Launch" },
];

type Outcome = "draft" | "scheduled" | "launched";

const OUTCOME_COPY: Record<Outcome, { title: string; description: string }> = {
  draft: {
    title: "Draft saved",
    description:
      "Your campaign was saved as a draft. You can finish and launch it any time from the Outreach home.",
  },
  scheduled: {
    title: "Campaign scheduled",
    description:
      "The campaign is scheduled to start Monday at 9:00 AM IST. You can pause or edit it before it starts.",
  },
  launched: {
    title: "Campaign launched",
    description:
      "Candidates will start receiving the first step within the configured send window. Nothing was really sent — this is a UI preview.",
  },
};

export function CampaignBuilder() {
  const [state, setState] = useState<BuilderState>(initialBuilderState);
  const [current, setCurrent] = useState(0);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function update<K extends keyof BuilderState>(key: K, value: BuilderState[K]) {
    setState((previous) => ({ ...previous, [key]: value }));
  }

  const warnings = useMemo(() => launchWarnings(state), [state]);
  const blockingErrors = warnings.filter((w) => w.severity === "error");

  const currentErrors = stepErrors(current, state);
  const showErrors = attempted.has(current);

  function goTo(step: number) {
    setCurrent(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    if (currentErrors.length > 0) {
      setAttempted((previous) => new Set(previous).add(current));
      return;
    }
    goTo(Math.min(current + 1, BUILDER_STEPS.length - 1));
  }

  if (outcome) {
    const copy = OUTCOME_COPY[outcome];
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-20 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 aria-hidden className="size-7 text-success" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {copy.description}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button size="sm" nativeButton={false} render={<Link href={ROUTES.outreach} />}>
            Back to Outreach
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(initialBuilderState());
              setCurrent(0);
              setAttempted(new Set());
              setOutcome(null);
            }}
          >
            Create Another Campaign
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stepper — clickable for visited steps */}
      <nav
        aria-label="Campaign builder steps"
        className="rounded-xl border border-border bg-card p-4"
      >
        <Stepper steps={BUILDER_STEPS} currentStep={current} />
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
          {BUILDER_STEPS.map((step, index) => {
            const hasError = attempted.has(index) && stepErrors(index, state).length > 0;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === current ? "step" : undefined}
                className={`rounded-md px-2 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  index === current
                    ? "bg-brand-subtle font-medium text-primary"
                    : hasError
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
                      : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {index + 1}. {step.title}
                {hasError ? " ⚠" : ""}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Step content */}
      {current === 0 ? (
        <SetupStep state={state} update={update} showErrors={showErrors} />
      ) : current === 1 ? (
        <AudienceStep state={state} update={update} showErrors={showErrors} />
      ) : current === 2 ? (
        <ChannelsStep state={state} update={update} showErrors={showErrors} />
      ) : current === 3 ? (
        <SequenceStepBuilder state={state} update={update} showErrors={showErrors} />
      ) : current === 4 ? (
        <QualificationStep state={state} update={update} showErrors={showErrors} />
      ) : (
        <ReviewStep state={state} warnings={warnings} />
      )}

      {/* Footer navigation */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => goTo(Math.max(0, current - 1))}
          disabled={current === 0}
        >
          <ArrowLeft aria-hidden />
          Back
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOutcome("draft")}
          >
            <Save aria-hidden />
            Save Draft
          </Button>

          {current < BUILDER_STEPS.length - 1 ? (
            <Button type="button" size="sm" onClick={next}>
              Continue
              <ArrowRight aria-hidden />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={blockingErrors.length > 0}
                onClick={() => setOutcome("scheduled")}
              >
                <CalendarClock aria-hidden />
                Schedule
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={blockingErrors.length > 0}
                onClick={() => setOutcome("launched")}
              >
                <Rocket aria-hidden />
                Launch Campaign
              </Button>
            </>
          )}
        </div>

        {current === BUILDER_STEPS.length - 1 && blockingErrors.length > 0 ? (
          <p className="w-full text-right text-xs text-destructive">
            Resolve the errors above to schedule or launch.
          </p>
        ) : null}
      </div>
    </div>
  );
}
