"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AudienceStep } from "@/components/outreach/builder-audience-step";
import { ChannelsStep } from "@/components/outreach/builder-channels-step";
import { QualificationStep } from "@/components/outreach/builder-qualification-step";
import { ReviewStep } from "@/components/outreach/builder-review-step";
import { SequenceStepBuilder } from "@/components/outreach/builder-sequence-step";
import { SetupStep } from "@/components/outreach/builder-setup-step";
import {
  applyCampaignType,
  applyEnabledChannels,
  initialBuilderState,
  launchWarnings,
  stepErrors,
  type BuilderState,
} from "@/components/outreach/builder-types";
import { builderStateFromCampaign } from "@/components/outreach/campaign-builder-hydrate";
import { CampaignDetailSkeleton } from "@/components/outreach/campaign-detail-skeleton";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import {
  getApiErrorMessage,
  jobsApi,
  outreachApi,
  plansApi,
  type ApiSequenceStepType,
  type CampaignCreateInput,
} from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";
import type { SequenceStepType } from "@/lib/mock-outreach";
import { campaignDetailPath, ROUTES } from "@/lib/routes";
import {
  candidateSourceType,
  resolveAudienceCandidateIds,
} from "@/components/outreach/audience-resolve";

const BUILDER_STEPS = [
  { id: "setup", title: "Campaign Setup" },
  { id: "audience", title: "Audience" },
  { id: "channels", title: "Channels" },
  { id: "sequence", title: "Sequence" },
  { id: "qualification", title: "Qualification" },
  { id: "review", title: "Review & Launch" },
];

/** Highest step index reachable: all prior steps must be valid. */
function maxReachableStep(state: BuilderState): number {
  for (let index = 0; index < BUILDER_STEPS.length; index += 1) {
    if (stepErrors(index, state).length > 0) return index;
  }
  return BUILDER_STEPS.length - 1;
}

type Outcome = "draft" | "scheduled" | "launched";
type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 900;

const OUTCOME_COPY: Record<Outcome, { title: string; description: string }> = {
  draft: {
    title: "Draft saved",
    description:
      "Your campaign was saved as a draft. You can finish and launch it any time from the Outreach home.",
  },
  scheduled: {
    title: "Campaign scheduled",
    description:
      "The campaign is scheduled. You can pause or edit it before it starts.",
  },
  launched: {
    title: "Campaign launched",
    description:
      "Candidates will start receiving the first step within the configured send window.",
  },
};

const STEP_TYPE_MAP: Record<SequenceStepType, ApiSequenceStepType> = {
  "Send Email": "email",
  "Send WhatsApp": "whatsapp",
  "Start AI Voice Call": "ai_voice",
  Wait: "wait",
  "Conditional Branch": "conditional",
  "Create Recruiter Task": "recruiter_task",
  "Send Scheduling Link": "scheduling_link",
};

function toCreateInput(state: BuilderState): CampaignCreateInput {
  return {
    name: state.name.trim(),
    description: state.description.trim() || null,
    objective: state.objective.trim() || null,
    ownerUserId: state.ownerUserId,
    jobId: state.jobId,
    sourceModule: "outreach",
    campaignType:
      state.campaignType === "Single Channel" ? "single_channel" : "multi_channel",
    candidateSource: {
      type: candidateSourceType(state.source),
      listId:
        state.source === "Saved List" || state.source === "CSV/Excel Import"
          ? state.sourceDetail || null
          : null,
      candidateIds: state.selectedCandidateIds,
      label: state.sourceDetail || state.source || null,
    },
    channelConfig: {
      email: { enabled: state.enabledChannels.includes("Email") },
      whatsapp: { enabled: state.enabledChannels.includes("WhatsApp") },
      ai_voice: { enabled: state.enabledChannels.includes("AI Voice") },
      timezone: state.timezone || "Asia/Kolkata",
      sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
    },
    sequenceSteps: state.steps.map((step, index) => ({
      id: step.id,
      order: index,
      type: STEP_TYPE_MAP[step.type],
      delayDays: step.delayDays,
      delayUnit: step.delayUnit ?? "days",
      templateId: step.templateId ?? null,
      subject: step.subject || null,
      body: step.body || null,
      stopOnReply: step.stopOnReply,
      note: step.note || null,
    })),
    qualificationConfig: {
      enabled: true,
      questions: state.questions.map((question) => ({
        id: question.id,
        prompt: question.text,
        answerType: question.answerType,
        knockout: question.knockout,
        knockoutCondition: question.knockoutCondition || null,
      })),
      aiReplyEnabled: true,
      takeoverCondition: state.takeoverCondition || null,
      autoScreening: state.autoScreening,
    },
    schedulingConfig: {
      enabled: state.autoCalendly,
      provider: state.autoCalendly ? "calendly" : null,
    },
  };
}

export function CampaignBuilder({
  campaignId: editCampaignId,
  initialStep,
}: {
  campaignId?: string;
  /** Jump to a builder step (0-based) after load — e.g. from Launch validation. */
  initialStep?: number;
} = {}) {
  const [state, setState] = useState<BuilderState>(initialBuilderState);
  const [current, setCurrent] = useState(() => {
    if (initialStep == null || !Number.isFinite(initialStep)) return 0;
    return Math.min(Math.max(0, Math.floor(initialStep)), BUILDER_STEPS.length - 1);
  });
  const [attempted, setAttempted] = useState<Set<number>>(() => {
    if (initialStep == null || !Number.isFinite(initialStep)) return new Set();
    const step = Math.min(Math.max(0, Math.floor(initialStep)), BUILDER_STEPS.length - 1);
    return new Set([step]);
  });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(
    editCampaignId ?? null
  );
  const [loadingCampaign, setLoadingCampaign] = useState(Boolean(editCampaignId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingMode, setSubmittingMode] = useState<Outcome | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [creditsAvailable, setCreditsAvailable] = useState<number | null>(null);
  const campaignIdRef = useRef<string | null>(editCampaignId ?? null);
  const autosaveVersionRef = useRef(0);
  const autosaveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void jobsApi
      .list({ limit: 100 })
      .then((rows) => {
        if (!cancelled) setJobs(rows);
      })
      .catch(() => {
        // Leave the job picker empty when the jobs API is unavailable.
      });
    void plansApi
      .getUsage()
      .then((usage) => {
        if (cancelled) return;
        const outreachRow = usage.find(
          (row) =>
            row.id === "outreach-credits" ||
            row.id === "outreach" ||
            row.id === "credits" ||
            row.label?.toLowerCase().includes("outreach")
        );
        if (outreachRow && outreachRow.limit != null) {
          setCreditsAvailable(Math.max(0, outreachRow.limit - outreachRow.used));
        }
      })
      .catch(() => {
        // Leave credits unknown when usage is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editCampaignId) return;
    let cancelled = false;
    void (async () => {
      setLoadingCampaign(true);
      setLoadError(null);
      try {
        const [raw, enrollments] = await Promise.all([
          outreachApi.getCampaignRaw(editCampaignId),
          outreachApi.listEnrollments(editCampaignId, { limit: 100 }),
        ]);
        if (cancelled) return;
        if (!raw) {
          setLoadError("Campaign not found.");
          return;
        }
        const enrolledIds = [
          ...new Set([
            ...enrollments.map((row) => row.candidateId),
            ...(raw.candidateSource?.candidateIds || []),
          ]),
        ];
        setState(builderStateFromCampaign(raw, enrolledIds));
        setCampaignId(raw.id);
        campaignIdRef.current = raw.id;
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err, "Unable to load campaign."));
        }
      } finally {
        if (!cancelled) setLoadingCampaign(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editCampaignId]);

  const queueAutosave = useCallback(
    (snapshot: BuilderState, version: number) => {
      if (!snapshot.name.trim()) return Promise.resolve();

      const operation = autosaveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (version !== autosaveVersionRef.current) return;

          setAutosaveStatus("saving");
          setAutosaveError(null);
          try {
            const input = toCreateInput(snapshot);
            let id = campaignIdRef.current;
            if (id) {
              await outreachApi.updateCampaign(id, input);
            } else {
              const created = await outreachApi.createCampaign(input);
              id = created.id;
              campaignIdRef.current = id;
              setCampaignId(id);
            }
            if (version === autosaveVersionRef.current) {
              setAutosaveStatus("saved");
            }
          } catch (err) {
            if (version === autosaveVersionRef.current) {
              setAutosaveStatus("error");
              setAutosaveError(
                getApiErrorMessage(err, "Unable to autosave campaign.")
              );
            }
          }
        });

      autosaveQueueRef.current = operation;
      return operation;
    },
    []
  );

  useEffect(() => {
    if (loadingCampaign || outcome || submitting) return;
    const version = ++autosaveVersionRef.current;
    if (!state.name.trim()) {
      setAutosaveStatus("idle");
      setAutosaveError(null);
      return;
    }

    setAutosaveStatus("pending");
    const timer = window.setTimeout(() => {
      void queueAutosave(state, version);
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [loadingCampaign, outcome, queueAutosave, state, submitting]);

  function update<K extends keyof BuilderState>(key: K, value: BuilderState[K]) {
    setState((previous) => {
      if (key === "campaignType") {
        return applyCampaignType(previous, value as string);
      }
      if (key === "enabledChannels") {
        return applyEnabledChannels(
          previous,
          value as BuilderState["enabledChannels"]
        );
      }
      return { ...previous, [key]: value };
    });
  }

  const warnings = useMemo(
    () => launchWarnings(state, creditsAvailable),
    [state, creditsAvailable]
  );
  const blockingErrors = warnings.filter((w) => w.severity === "error");

  const currentErrors = stepErrors(current, state);
  const showErrors = attempted.has(current);
  const reachable = maxReachableStep(state);

  function goTo(step: number) {
    if (step > reachable) {
      setAttempted((previous) => new Set(previous).add(reachable));
      setCurrent(reachable);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (state.name.trim() && !submitting) {
      const version = ++autosaveVersionRef.current;
      void queueAutosave(state, version);
    }
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

  async function submit(mode: Outcome) {
    setSubmitting(true);
    setSubmittingMode(mode);
    setSubmitError(null);
    autosaveVersionRef.current += 1;
    try {
      await autosaveQueueRef.current.catch(() => undefined);
      const input = toCreateInput(state);
      let id = campaignIdRef.current;
      if (id) {
        await outreachApi.updateCampaign(id, input);
      } else {
        const created = await outreachApi.createCampaign(input);
        id = created.id;
        campaignIdRef.current = id;
      }

      const audienceIds = await resolveAudienceCandidateIds({
        source: state.source,
        sourceDetail: state.sourceDetail,
        selectedCandidateIds: state.selectedCandidateIds,
        poolSearch: state.poolSearch,
      });
      if (audienceIds.length > 0) {
        await outreachApi.addAudience(id, {
          candidateIds: audienceIds,
          listId:
            state.source === "Saved List" || state.source === "CSV/Excel Import"
              ? state.sourceDetail || undefined
              : undefined,
          replace: true,
        });
      }

      if (mode === "launched") {
        const validation = await outreachApi.validateCampaign(id);
        if (!validation.ok) {
          const blockers = (validation.issues || [])
            .filter((issue) => issue.severity === "error")
            .map((issue) => issue.message);
          throw new Error(
            blockers.length
              ? `Cannot launch: ${blockers.join(" · ")}`
              : "Campaign failed server validation."
          );
        }
        await outreachApi.launchCampaign(id);
      } else if (mode === "scheduled") {
        const scheduledAt = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        await outreachApi.scheduleCampaign(id, scheduledAt);
      }

      setCampaignId(id);
      campaignIdRef.current = id;
      setOutcome(mode);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Unable to save campaign."));
    } finally {
      setSubmitting(false);
      setSubmittingMode(null);
    }
  }

  if (loadingCampaign) {
    return <CampaignDetailSkeleton />;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          nativeButton={false}
          render={<Link href={ROUTES.outreach} />}
        >
          Back to Outreach
        </Button>
      </div>
    );
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
          {campaignId ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={campaignDetailPath(campaignId)} />}
            >
              View Campaign
            </Button>
          ) : null}
          {!editCampaignId ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setState(initialBuilderState());
                setCurrent(0);
                setAttempted(new Set());
                setOutcome(null);
                setCampaignId(null);
                campaignIdRef.current = null;
                setSubmitError(null);
                setAutosaveStatus("idle");
                setAutosaveError(null);
              }}
            >
              Create Another Campaign
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav
        aria-label="Campaign builder steps"
        className="rounded-xl border border-border bg-card p-4"
      >
        <Stepper
          steps={BUILDER_STEPS}
          currentStep={current}
          onStepSelect={goTo}
          maxEnabledStep={reachable}
          errorSteps={
            new Set(
              BUILDER_STEPS.map((_, index) => index).filter(
                (index) =>
                  attempted.has(index) && stepErrors(index, state).length > 0
              )
            )
          }
        />
      </nav>

      {current === 0 ? (
        <SetupStep state={state} update={update} showErrors={showErrors} jobs={jobs} />
      ) : current === 1 ? (
        <AudienceStep state={state} update={update} showErrors={showErrors} />
      ) : current === 2 ? (
        <ChannelsStep state={state} update={update} showErrors={showErrors} />
      ) : current === 3 ? (
        <SequenceStepBuilder state={state} update={update} showErrors={showErrors} />
      ) : current === 4 ? (
        <QualificationStep state={state} update={update} showErrors={showErrors} />
      ) : (
        <ReviewStep
          state={state}
          warnings={warnings}
          jobs={jobs}
          creditsAvailable={creditsAvailable}
        />
      )}

      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => goTo(Math.max(0, current - 1))}
          disabled={current === 0 || submitting}
        >
          <ArrowLeft aria-hidden />
          Back
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span
            role={autosaveStatus === "error" ? "alert" : "status"}
            title={autosaveError ?? undefined}
            className={`inline-flex items-center gap-1.5 text-xs ${
              autosaveStatus === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {autosaveStatus === "saving" ? (
              <>
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
                Saving draft…
              </>
            ) : autosaveStatus === "saved" ? (
              <>
                <CheckCircle2 aria-hidden className="size-3.5 text-success" />
                Draft saved automatically
              </>
            ) : autosaveStatus === "pending" ? (
              <>Changes pending…</>
            ) : autosaveStatus === "error" ? (
              <>Autosave failed</>
            ) : (
              <>Enter a campaign name to enable autosave</>
            )}
          </span>

          {current < BUILDER_STEPS.length - 1 ? (
            <Button type="button" size="sm" onClick={next} disabled={submitting}>
              Continue
              <ArrowRight aria-hidden />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={blockingErrors.length > 0 || submitting}
                onClick={() => void submit("scheduled")}
              >
                {submittingMode === "scheduled" ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <CalendarClock aria-hidden />
                )}
                {submittingMode === "scheduled" ? "Scheduling…" : "Schedule"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={blockingErrors.length > 0 || submitting}
                onClick={() => void submit("launched")}
              >
                {submittingMode === "launched" ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <Rocket aria-hidden />
                )}
                {submittingMode === "launched"
                  ? editCampaignId
                    ? "Saving & Launching…"
                    : "Launching…"
                  : editCampaignId
                    ? "Save & Launch"
                    : "Launch Campaign"}
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
