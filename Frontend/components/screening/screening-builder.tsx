"use client";

import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Briefcase,
  CheckCircle2,
  ListChecks,
  Pencil,
  Plus,
  Rocket,
  Save,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { resolveAudienceCandidateIds } from "@/components/outreach/audience-resolve";
import { AudienceStep } from "@/components/outreach/builder-audience-step";
import {
  ErrorList,
  Field,
  StepCard,
} from "@/components/outreach/builder-ui";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getApiErrorMessage,
  jobsApi,
  screeningApi,
  teamApi,
  type ApiTeamMember,
  type ScreeningCreateInput,
} from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";
import {
  ATTEMPT_OPTIONS,
  CALL_WINDOWS,
  DEFAULT_QUESTIONS,
  DELAY_OPTIONS,
  EVALUATION_CATEGORIES,
  KNOCKOUT_CRITERIA,
  QUESTION_TYPES,
  SCREENING_LANGUAGE_OPTIONS,
  SCREENING_OBJECTIVES,
  SCREENING_TONE_OPTIONS,
  SCREENING_VOICE_OPTIONS,
  TIMEZONE_OPTIONS_SCREENING,
  VOICEMAIL_BEHAVIOURS,
  type QuestionType,
} from "@/lib/mock-screening";
import {
  reachableCount,
  type AudienceSource,
  type AudienceStats,
} from "@/lib/mock-outreach";
import {
  defaultAiVoiceStepBody,
  isRoshniAgentPrompt,
  ROSHNI_INTRODUCTION,
  shouldApplyRemoteVoiceDefault,
} from "@/lib/roshni-agent-prompt";
import { loadVoiceDefaultsSafe } from "@/lib/api/voice-defaults";
import { ROUTES, screeningDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */

interface BuilderQuestion {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  followUp: string;
  expectedVariable: string;
  evaluationEnabled: boolean;
}

interface BuilderState {
  name: string;
  screeningMode: "voice" | "video";
  jobId: string;
  objective: string;
  description: string;
  ownerUserId: string;
  owner: string;
  source: AudienceSource | null;
  sourceDetail: string;
  selectedCandidateIds: string[];
  poolSearch: string;
  audiencePreview: AudienceStats | null;
  language: string;
  voice: string;
  tone: string;
  introduction: string;
  agentPrompt: string;
  questions: BuilderQuestion[];
  categoryWeights: Record<string, number>;
  knockouts: string[];
  minShortlistScore: string;
  attempts: string;
  delay: string;
  callWindow: string;
  timezone: string;
  voicemail: string;
}

function initialState(): BuilderState {
  return {
    name: "",
    screeningMode: "voice",
    jobId: "",
    objective: SCREENING_OBJECTIVES[0],
    description: "",
    ownerUserId: "",
    owner: "",
    source: null,
    sourceDetail: "",
    selectedCandidateIds: [],
    poolSearch: "",
    audiencePreview: null,
    language: SCREENING_LANGUAGE_OPTIONS[0].value,
    voice: SCREENING_VOICE_OPTIONS[0].value,
    tone: SCREENING_TONE_OPTIONS[0].value,
    introduction: ROSHNI_INTRODUCTION,
    agentPrompt: defaultAiVoiceStepBody(),
    questions: DEFAULT_QUESTIONS.map((question, index) => ({
      id: `q-${index + 1}`,
      type: question.type,
      text: question.text,
      required: question.type !== "Custom",
      followUp: "",
      expectedVariable: question.expectedVariable,
      evaluationEnabled: true,
    })),
    categoryWeights: Object.fromEntries(
      EVALUATION_CATEGORIES.map((category) => [
        category.id,
        category.defaultWeight,
      ])
    ),
    knockouts: [KNOCKOUT_CRITERIA[0], KNOCKOUT_CRITERIA[1]],
    minShortlistScore: "75",
    attempts: "3",
    delay: "24 hours",
    callWindow: CALL_WINDOWS[0],
    timezone: TIMEZONE_OPTIONS_SCREENING[0],
    voicemail: VOICEMAIL_BEHAVIOURS[0],
  };
}

type Update = <K extends keyof BuilderState>(
  key: K,
  value: BuilderState[K]
) => void;

const STEPS = [
  { id: "details", title: "Screening Details" },
  { id: "candidates", title: "Candidate Selection" },
  { id: "agent", title: "Agent Configuration" },
  { id: "questions", title: "Questions" },
  { id: "evaluation", title: "Evaluation" },
  { id: "call", title: "Call Settings" },
  { id: "review", title: "Review and Launch" },
];

function stepErrors(step: number, state: BuilderState): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!state.name.trim()) errors.push("Screening name is required.");
    if (!state.ownerUserId) errors.push("Select the campaign owner.");
    if (!state.jobId) errors.push("Select the related job.");
  }
  if (step === 1) {
    if (!state.source) {
      errors.push("Choose where screening candidates come from.");
    } else if (state.source === "Saved List" && !state.sourceDetail) {
      errors.push("Select a saved list.");
    } else if (state.source === "Sourcing Session" && !state.sourceDetail) {
      errors.push("Select a sourcing session.");
    } else if (
      state.source === "Manual Add" &&
      state.selectedCandidateIds.length === 0
    ) {
      errors.push("Pick at least one candidate to screen.");
    } else if (
      state.source === "CSV/Excel Import" &&
      state.selectedCandidateIds.length === 0
    ) {
      errors.push("Import a CSV/Excel file before continuing.");
    } else if (
      state.audiencePreview &&
      state.audiencePreview.selected === 0 &&
      state.source !== "CSV/Excel Import"
    ) {
      errors.push("This audience has no candidates yet.");
    }
  }
  if (step === 2) {
    if (!state.introduction.trim()) errors.push("Introduction script is required.");
    if (!state.agentPrompt.trim()) errors.push("Agent prompt is required.");
  }
  if (step === 3) {
    if (state.questions.every((question) => !question.text.trim())) {
      errors.push("Add at least one screening question.");
    }
  }
  if (step === 4) {
    const score = Number(state.minShortlistScore);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      errors.push("Minimum shortlist score must be between 0 and 100.");
    }
  }
  return errors;
}

function allErrors(state: BuilderState): string[] {
  return [0, 1, 2, 3, 4, 5].flatMap((step) => stepErrors(step, state));
}

/** Highest step index reachable: all prior steps must be valid. */
function maxReachableStep(state: BuilderState): number {
  for (let index = 0; index < STEPS.length; index += 1) {
    if (stepErrors(index, state).length > 0) return index;
  }
  return STEPS.length - 1;
}

/* ------------------------------------------------------------------ */
/* Steps                                                                */
/* ------------------------------------------------------------------ */

function DetailsStep({
  state,
  update,
  showErrors,
  jobs,
  jobsLoading,
  jobsError,
  owners,
  ownersLoading,
  ownersError,
  retryLoading,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
  jobs: JobListItem[];
  jobsLoading: boolean;
  jobsError: string | null;
  owners: Array<Pick<ApiTeamMember, "userId" | "name">>;
  ownersLoading: boolean;
  ownersError: string | null;
  retryLoading: () => void;
}) {
  const activeJobs = jobs.filter(
    (job) => job.status === "Active" || job.status === "Paused"
  );
  const ownerLabel =
    owners.find((owner) => owner.userId === state.ownerUserId)?.name ||
    state.owner.trim() ||
    null;
  const jobLabel =
    activeJobs.find((job) => job.id === state.jobId)?.title ||
    jobs.find((job) => job.id === state.jobId)?.title ||
    null;

  return (
    <StepCard
      title="Screening Details"
      description="Name the batch, connect it to a job, and decide who owns the calls."
    >
      <Field label="Screening type" required className="pt-2 pb-3">
        <div
          role="radiogroup"
          aria-label="Screening type"
          className="grid gap-3 pt-1 sm:grid-cols-2"
        >
          {(
            [
              {
                value: "voice" as const,
                title: "Voice screening",
                description:
                  "AI phone calls via Huntlo Voice AI. Available now.",
                icon: AudioLines,
                disabled: false,
              },
              {
                value: "video" as const,
                title: "Video screening",
                description: "Async video interviews. Coming soon.",
                icon: Video,
                disabled: true,
              },
            ] as const
          ).map((option) => {
            const Icon = option.icon;
            const selected = state.screeningMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) update("screeningMode", option.value);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  option.disabled
                    ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                    : selected
                      ? "border-primary/50 bg-brand-subtle/20"
                      : "border-border hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    option.disabled
                      ? "border-border bg-muted text-muted-foreground"
                      : selected
                        ? "border-primary/30 bg-brand-subtle text-primary"
                        : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  <Icon aria-hidden className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    {option.disabled ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Soon
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 rounded-full border",
                          selected
                            ? "border-primary bg-primary shadow-[inset_0_0_0_2px_var(--card)]"
                            : "border-border bg-card"
                        )}
                      />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Screening name" htmlFor="scr-name" required>
          <Input
            id="scr-name"
            value={state.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Backend Engineer — Round 1"
            aria-invalid={showErrors && !state.name.trim()}
          />
        </Field>

        <Field label="Campaign owner" htmlFor="scr-owner" required>
          <Select
            value={state.ownerUserId || null}
            onValueChange={(value) => {
              if (!value) return;
              update("ownerUserId", value);
              update(
                "owner",
                owners.find((owner) => owner.userId === value)?.name || "Team member"
              );
            }}
          >
            <SelectTrigger
              id="scr-owner"
              className="w-full"
              disabled={ownersLoading || owners.length === 0}
              aria-invalid={showErrors && !state.ownerUserId}
            >
              <SelectValue
                placeholder={ownersLoading ? "Loading team members…" : "Select an owner"}
              >
                {ownerLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {owners.map((owner) => (
                <SelectItem key={owner.userId} value={owner.userId}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ownersError ? (
            <p role="alert" className="text-xs text-destructive">
              {ownersError}
            </p>
          ) : null}
        </Field>

        <Field label="Related job" htmlFor="scr-job" required>
          <Select
            value={state.jobId || null}
            onValueChange={(value) => update("jobId", value ?? "")}
          >
            <SelectTrigger
              id="scr-job"
              className="w-full"
              disabled={jobsLoading || activeJobs.length === 0}
              aria-invalid={showErrors && !state.jobId}
            >
              <SelectValue
                placeholder={jobsLoading ? "Loading jobs…" : "Select a job"}
              >
                {jobLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {activeJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {jobsError ? (
            <p role="alert" className="text-xs text-destructive">
              {jobsError}{" "}
              <button
                type="button"
                className="font-medium underline underline-offset-2"
                onClick={retryLoading}
              >
                Retry
              </button>
            </p>
          ) : !jobsLoading && activeJobs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No active or paused jobs are available.
            </p>
          ) : null}
        </Field>

        <Field label="Objective" htmlFor="scr-objective">
          <Select
            value={state.objective}
            onValueChange={(value) => value && update("objective", value)}
          >
            <SelectTrigger id="scr-objective" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCREENING_OBJECTIVES.map((objective) => (
                <SelectItem key={objective} value={objective}>
                  {objective}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Description"
          htmlFor="scr-description"
          className="lg:col-span-2"
        >
          <Textarea
            id="scr-description"
            value={state.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Visible to your team only — what should this batch evaluate?"
            className="min-h-20"
          />
        </Field>
      </div>
    </StepCard>
  );
}

function AgentStep({
  state,
  update,
  showErrors,
  voiceDefaults,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
  voiceDefaults: { introduction: string; agentPrompt: string };
}) {
  const languageLabel =
    SCREENING_LANGUAGE_OPTIONS.find((option) => option.value === state.language)
      ?.label || state.language;
  const voiceLabel =
    SCREENING_VOICE_OPTIONS.find((option) => option.value === state.voice)
      ?.label || state.voice;
  const toneLabel =
    SCREENING_TONE_OPTIONS.find((option) => option.value === state.tone)
      ?.label || state.tone;

  return (
    <StepCard
      title="Agent Configuration"
      description="Same Roshni voice prompt used by Outreach AI Voice. Requires a connected Huntlo Voice AI integration."
    >
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Voice calls run through{" "}
          <a
            href="/dashboard/integrations"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Huntlo Voice AI
          </a>{" "}
          when connected.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Language" htmlFor="scr-language">
            <Select
              value={state.language}
              onValueChange={(value) => value && update("language", value)}
            >
              <SelectTrigger id="scr-language" className="w-full">
                <SelectValue>{languageLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SCREENING_LANGUAGE_OPTIONS.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Voice" htmlFor="scr-voice">
            <Select
              value={state.voice}
              onValueChange={(value) => value && update("voice", value)}
            >
              <SelectTrigger id="scr-voice" className="w-full">
                <SelectValue>{voiceLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SCREENING_VOICE_OPTIONS.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tone" htmlFor="scr-tone">
            <Select
              value={state.tone}
              onValueChange={(value) => value && update("tone", value)}
            >
              <SelectTrigger id="scr-tone" className="w-full">
                <SelectValue>{toneLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SCREENING_TONE_OPTIONS.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field
          label="Introduction script"
          htmlFor="scr-intro"
          required
          hint={`Leave {callee_name} for the dialer — same opening line as Outreach.`}
        >
          <Textarea
            id="scr-intro"
            value={state.introduction}
            onChange={(event) => update("introduction", event.target.value)}
            className="min-h-20 font-mono text-xs"
            aria-invalid={showErrors && !state.introduction.trim()}
          />
        </Field>

        <Field label="Agent prompt" htmlFor="scr-agent-prompt" required>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Roshni screening prompt from Outreach AI Voice. Screening questions
              fill into {"{jd_screening_questions_list}"} at launch. Edit freely,
              or reset to the default.
            </p>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => {
                update("introduction", voiceDefaults.introduction);
                update("agentPrompt", voiceDefaults.agentPrompt);
              }}
            >
              Reset to Roshni default
            </Button>
          </div>
          <Textarea
            id="scr-agent-prompt"
            value={state.agentPrompt}
            onChange={(event) => update("agentPrompt", event.target.value)}
            className="h-64 max-h-80 min-h-48 resize-y overflow-y-auto font-mono text-xs leading-relaxed field-sizing-fixed"
            style={{ fieldSizing: "fixed" }}
            aria-invalid={showErrors && !state.agentPrompt.trim()}
          />
          <p className="pt-1 text-xs text-muted-foreground">
            Opening line stays{" "}
            <span className="font-mono">{voiceDefaults.introduction}</span> unless
            you change the introduction above. Leave{" "}
            <span className="font-mono">{"{callee_name}"}</span> for the dialer.
            {isRoshniAgentPrompt(state.agentPrompt)
              ? " Using Roshni agent prompt."
              : " Custom agent prompt."}
          </p>
        </Field>
      </div>
    </StepCard>
  );
}

function QuestionsStep({
  state,
  update,
}: {
  state: BuilderState;
  update: Update;
}) {
  function updateQuestion(id: string, patch: Partial<BuilderQuestion>) {
    update(
      "questions",
      state.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      )
    );
  }

  return (
    <StepCard
      title="Questions"
      description="Build the conversational script. Each question can extract a variable and feed the scorecard."
    >
      <div className="space-y-3">
        {state.questions.map((question, index) => (
          <div
            key={question.id}
            className="space-y-3 rounded-lg border border-border p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                Q{index + 1}
              </span>
              <Select
                value={question.type}
                onValueChange={(value) =>
                  value && updateQuestion(question.id, { type: value as QuestionType })
                }
              >
                <SelectTrigger
                  size="sm"
                  className="w-40"
                  aria-label={`Type for question ${index + 1}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      required: event.target.checked,
                    })
                  }
                  className="size-3.5 accent-primary"
                />
                Required
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={question.evaluationEnabled}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      evaluationEnabled: event.target.checked,
                    })
                  }
                  className="size-3.5 accent-primary"
                />
                Evaluation enabled
              </label>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove question ${index + 1}`}
                onClick={() =>
                  update(
                    "questions",
                    state.questions.filter((q) => q.id !== question.id)
                  )
                }
              >
                <Trash2 aria-hidden />
              </Button>
            </div>

            <Textarea
              value={question.text}
              onChange={(event) =>
                updateQuestion(question.id, { text: event.target.value })
              }
              aria-label={`Question ${index + 1} text`}
              placeholder="Question text"
              className="min-h-16 font-mono text-xs"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Follow-up instruction"
                htmlFor={`${question.id}-followup`}
              >
                <Input
                  id={`${question.id}-followup`}
                  value={question.followUp}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      followUp: event.target.value,
                    })
                  }
                  placeholder="e.g. Probe for scale numbers if vague"
                  className="text-xs"
                />
              </Field>
              <Field
                label="Expected variable"
                htmlFor={`${question.id}-var`}
              >
                <Input
                  id={`${question.id}-var`}
                  value={question.expectedVariable}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      expectedVariable: event.target.value,
                    })
                  }
                  placeholder="e.g. notice_period"
                  className="font-mono text-xs"
                />
              </Field>
            </div>
          </div>
        ))}

        {state.questions.length < 12 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update("questions", [
                ...state.questions,
                {
                  id: `q-${Date.now()}`,
                  type: "Custom",
                  text: "",
                  required: false,
                  followUp: "",
                  expectedVariable: "",
                  evaluationEnabled: true,
                },
              ])
            }
          >
            <Plus aria-hidden />
            Add question
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Maximum 12 questions to keep calls under 10 minutes.
          </p>
        )}
      </div>
    </StepCard>
  );
}

function questionCriterionId(question: BuilderQuestion): string {
  const fromVariable = question.expectedVariable
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (fromVariable) return fromVariable;
  return question.id;
}

function questionCriterionLabel(question: BuilderQuestion, index: number): string {
  const text = question.text.trim().replace(/\s+/g, " ");
  if (text) {
    return text.length > 72 ? `${text.slice(0, 69)}…` : text;
  }
  return `Question ${index + 1} score`;
}

function evaluatedQuestions(state: BuilderState): BuilderQuestion[] {
  return state.questions.filter(
    (question) => question.evaluationEnabled && question.text.trim()
  );
}

function EvaluationStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
}) {
  const score = Number(state.minShortlistScore);
  const scoreInvalid =
    showErrors && (Number.isNaN(score) || score < 0 || score > 100);
  const questionCriteria = evaluatedQuestions(state);

  function updateWeight(id: string, value: number) {
    update("categoryWeights", {
      ...state.categoryWeights,
      [id]: value,
    });
  }

  return (
    <StepCard
      title="Evaluation"
      description="Weight category and question scores, set knockout rules, and define the shortlist threshold."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Category scores</p>
          <p className="text-xs text-muted-foreground">
            Weights are relative — the overall score is a weighted average of
            enabled categories and evaluated questions.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EVALUATION_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <label
                  htmlFor={`weight-${category.id}`}
                  className="min-w-0 flex-1 text-sm text-foreground"
                >
                  {category.label}
                </label>
                <Input
                  id={`weight-${category.id}`}
                  type="number"
                  min={0}
                  max={100}
                  value={state.categoryWeights[category.id] ?? 0}
                  onChange={(event) =>
                    updateWeight(category.id, Number(event.target.value) || 0)
                  }
                  className="w-20 text-right tabular-nums"
                  aria-label={`${category.label} weight`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Question scores</p>
          <p className="text-xs text-muted-foreground">
            Questions marked “Evaluation enabled” in the previous step are scored
            from the candidate’s answers and included in the overall result.
          </p>
          {questionCriteria.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
              No evaluated questions yet. Enable evaluation on one or more
              questions to score their answers here.
            </p>
          ) : (
            <div className="space-y-2">
              {questionCriteria.map((question, index) => {
                const criterionId = questionCriterionId(question);
                const label = questionCriterionLabel(question, index);
                return (
                  <div
                    key={question.id}
                    className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={`weight-${criterionId}`}
                        className="block text-sm text-foreground"
                      >
                        <span className="mr-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                          Q
                          {state.questions.findIndex((q) => q.id === question.id) +
                            1}
                        </span>
                        {label}
                      </label>
                      {question.expectedVariable.trim() ? (
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {question.expectedVariable.trim()}
                        </p>
                      ) : null}
                    </div>
                    <Input
                      id={`weight-${criterionId}`}
                      type="number"
                      min={0}
                      max={100}
                      value={state.categoryWeights[criterionId] ?? 10}
                      onChange={(event) =>
                        updateWeight(criterionId, Number(event.target.value) || 0)
                      }
                      className="w-20 shrink-0 text-right tabular-nums sm:self-center"
                      aria-label={`Weight for ${label}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Knockout criteria</p>
          <p className="text-xs text-muted-foreground">
            A failed knockout forces a Reject recommendation regardless of score.
          </p>
          <div className="space-y-1.5">
            {KNOCKOUT_CRITERIA.map((criterion) => (
              <label
                key={criterion}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="checkbox"
                  checked={state.knockouts.includes(criterion)}
                  onChange={(event) =>
                    update(
                      "knockouts",
                      event.target.checked
                        ? [...state.knockouts, criterion]
                        : state.knockouts.filter((c) => c !== criterion)
                    )
                  }
                  className="size-3.5 accent-primary"
                />
                {criterion}
              </label>
            ))}
          </div>
        </div>

        <Field
          label="Minimum shortlist score"
          htmlFor="scr-min-score"
          hint="Candidates at or above this score get an AI Shortlist recommendation."
        >
          <Input
            id="scr-min-score"
            type="number"
            min={0}
            max={100}
            value={state.minShortlistScore}
            onChange={(event) => update("minShortlistScore", event.target.value)}
            className="w-32"
            aria-invalid={scoreInvalid}
          />
          {scoreInvalid ? (
            <p role="alert" className="text-xs text-destructive">
              Enter a number between 0 and 100.
            </p>
          ) : null}
        </Field>
      </div>
    </StepCard>
  );
}

function CallSettingsStep({
  state,
  update,
}: {
  state: BuilderState;
  update: Update;
}) {
  return (
    <StepCard
      title="Call Settings"
      description="Control retry behaviour, calling windows and what happens on voicemail."
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Number of attempts" htmlFor="scr-attempts">
            <Select
              value={state.attempts}
              onValueChange={(value) => value && update("attempts", value)}
            >
              <SelectTrigger id="scr-attempts" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ATTEMPT_OPTIONS.map((count) => (
                  <SelectItem key={count} value={count}>
                    {count} attempt{count === "1" ? "" : "s"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Delay between attempts" htmlFor="scr-delay">
            <Select
              value={state.delay}
              onValueChange={(value) => value && update("delay", value)}
            >
              <SelectTrigger id="scr-delay" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_OPTIONS.map((delay) => (
                  <SelectItem key={delay} value={delay}>
                    {delay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Call window" htmlFor="scr-window">
            <Select
              value={state.callWindow}
              onValueChange={(value) => value && update("callWindow", value)}
            >
              <SelectTrigger id="scr-window" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALL_WINDOWS.map((window) => (
                  <SelectItem key={window} value={window}>
                    {window}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Candidate timezone" htmlFor="scr-tz">
            <Select
              value={state.timezone}
              onValueChange={(value) => value && update("timezone", value)}
            >
              <SelectTrigger id="scr-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS_SCREENING.map((timezone) => (
                  <SelectItem key={timezone} value={timezone}>
                    {timezone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Voicemail behaviour" htmlFor="scr-voicemail">
          <Select
            value={state.voicemail}
            onValueChange={(value) => value && update("voicemail", value)}
          >
            <SelectTrigger id="scr-voicemail" className="w-full sm:w-96">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICEMAIL_BEHAVIOURS.map((behaviour) => (
                <SelectItem key={behaviour} value={behaviour}>
                  {behaviour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </StepCard>
  );
}

function ReviewStep({
  state,
  errors,
  goTo,
  jobs,
}: {
  state: BuilderState;
  errors: string[];
  goTo: (step: number) => void;
  jobs: JobListItem[];
}) {
  const job = jobs.find((j) => j.id === state.jobId);
  const stats = state.audiencePreview;
  const activeQuestions = state.questions.filter((q) => q.text.trim());
  const scoredQuestions = evaluatedQuestions(state);

  const sections: {
    step: number;
    icon: typeof AudioLines;
    title: string;
    lines: string[];
  }[] = [
    {
      step: 0,
      icon: Briefcase,
      title: "Details",
      lines: [
        state.screeningMode === "voice" ? "Voice screening" : "Video screening",
        state.name.trim() || "Unnamed screening",
        job ? job.title : "No job selected",
        `Owner: ${state.owner} · ${state.objective}`,
      ],
    },
    {
      step: 1,
      icon: Users,
      title: "Candidates",
      lines: stats
        ? [
            `Source: ${state.source}`,
            `${stats.withPhone.toLocaleString("en-IN")} with phone · ${reachableCount(stats).toLocaleString("en-IN")} reachable`,
          ]
        : state.source
          ? [`Source: ${state.source}`, "Audience still loading"]
          : ["No source selected"],
    },
    {
      step: 2,
      icon: AudioLines,
      title: "Agent",
      lines: [
        `${SCREENING_LANGUAGE_OPTIONS.find((o) => o.value === state.language)?.label || state.language} · ${SCREENING_VOICE_OPTIONS.find((o) => o.value === state.voice)?.label || state.voice} · ${SCREENING_TONE_OPTIONS.find((o) => o.value === state.tone)?.label || state.tone}`,
        isRoshniAgentPrompt(state.agentPrompt)
          ? "Roshni agent prompt configured"
          : "Custom agent prompt configured",
      ],
    },
    {
      step: 3,
      icon: ListChecks,
      title: "Questions",
      lines: [
        `${activeQuestions.length} questions`,
        `${activeQuestions.filter((q) => q.required).length} required · ${activeQuestions.filter((q) => q.evaluationEnabled).length} evaluated`,
      ],
    },
    {
      step: 4,
      icon: CheckCircle2,
      title: "Evaluation",
      lines: [
        `Shortlist at ≥ ${state.minShortlistScore}/100`,
        `${scoredQuestions.length} question score${scoredQuestions.length === 1 ? "" : "s"} · ${state.knockouts.length} knockout${state.knockouts.length === 1 ? "" : "s"}`,
      ],
    },
    {
      step: 5,
      icon: AudioLines,
      title: "Call settings",
      lines: [
        `${state.attempts} attempts · ${state.delay} apart`,
        `${state.callWindow} · ${state.timezone}`,
        `Retry on no answer · ${state.voicemail}`,
      ],
    },
  ];

  return (
    <StepCard
      title="Review and Launch"
      description="Everything the voice agent will do. No calls are placed from this UI preview."
    >
      <div className="space-y-4">
        <ErrorList errors={errors} />
        <div className="grid gap-3 lg:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <section.icon
                    aria-hidden
                    className="size-3.5 text-muted-foreground"
                  />
                  {section.title}
                </h3>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => goTo(section.step)}
                >
                  <Pencil aria-hidden />
                  Edit
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {section.lines.map((line) => (
                  <li key={line} className="text-xs text-muted-foreground">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Builder shell                                                        */
/* ------------------------------------------------------------------ */

type Outcome = "draft" | "launched";

const OUTCOME_COPY: Record<Outcome, { title: string; description: string }> = {
  draft: {
    title: "Draft saved",
    description:
      "Your screening was saved as a draft. Finish and launch it any time from the AI Screening home.",
  },
  launched: {
    title: "Screening launched",
    description:
      "Callable candidates will start receiving voice screening calls within the configured window.",
  },
};

async function resolveAudienceIds(state: BuilderState): Promise<string[]> {
  return resolveAudienceCandidateIds({
    source: state.source,
    sourceDetail: state.sourceDetail,
    selectedCandidateIds: state.selectedCandidateIds,
    poolSearch: state.poolSearch,
  });
}

function toCreateInput(
  state: BuilderState,
  candidateIds: string[]
): ScreeningCreateInput {
  const questionCriteria = evaluatedQuestions(state).map((question, index) => {
    const id = questionCriterionId(question);
    return {
      id,
      label: questionCriterionLabel(question, index),
      weight: state.categoryWeights[id] ?? 10,
      description: `Score 0-100 based on the candidate's answer to: ${question.text.trim()}`,
    };
  });

  const categoryCriteria = EVALUATION_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    weight: state.categoryWeights[category.id] ?? category.defaultWeight,
  }));

  // Prefer question criteria ids when they collide with category ids.
  const byId = new Map<string, (typeof categoryCriteria)[number]>();
  for (const criterion of categoryCriteria) byId.set(criterion.id, criterion);
  for (const criterion of questionCriteria) byId.set(criterion.id, criterion);

  return {
    name: state.name.trim(),
    ownerUserId: state.ownerUserId || undefined,
    jobId: state.jobId || null,
    description: state.description.trim() || null,
    objective: state.objective || null,
    language: state.language,
    voice: state.voice,
    tone: state.tone,
    introductionScript: state.introduction,
    agentPrompt: state.agentPrompt,
    questions: state.questions
      .filter((q) => q.text.trim())
      .map((q) => ({ id: q.id, prompt: q.text.trim() })),
    evaluationCriteria: Array.from(byId.values()),
    minShortlistScore: Number(state.minShortlistScore) || 70,
    knockouts: state.knockouts,
    callSettings: {
      maxAttempts: Number.parseInt(state.attempts, 10) || 2,
      attemptIntervalHours: Number.parseInt(state.delay, 10) || 24,
      maxRetryCount: 2,
      retryIntervalHours: 6,
      consentRequired: true,
    },
    candidateIds,
  };
}

export function ScreeningBuilder() {
  const { user } = useAuth();
  const [state, setState] = useState<BuilderState>(initialState);
  const [current, setCurrent] = useState(0);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [owners, setOwners] = useState<
    Array<Pick<ApiTeamMember, "userId" | "name">>
  >([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState<string | null>(null);
  const [loadVersion, setLoadVersion] = useState(0);
  const [voiceDefaults, setVoiceDefaults] = useState({
    introduction: ROSHNI_INTRODUCTION,
    agentPrompt: defaultAiVoiceStepBody(),
  });

  useEffect(() => {
    let cancelled = false;
    void loadVoiceDefaultsSafe().then((defaults) => {
      if (cancelled) return;
      setVoiceDefaults({
        introduction: defaults.introduction,
        agentPrompt: defaults.agentPrompt,
      });
      setState((previous) => {
        const next = { ...previous };
        let changed = false;
        if (
          shouldApplyRemoteVoiceDefault(previous.introduction, defaults.introduction, {
            bundled: ROSHNI_INTRODUCTION,
          })
        ) {
          next.introduction = defaults.introduction;
          changed = true;
        }
        if (
          shouldApplyRemoteVoiceDefault(previous.agentPrompt, defaults.agentPrompt, {
            bundled: defaultAiVoiceStepBody(),
          })
        ) {
          next.agentPrompt = defaults.agentPrompt;
          changed = true;
        }
        return changed ? next : previous;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setJobsLoading(true);
    setJobsError(null);
    setOwnersLoading(true);
    setOwnersError(null);

    void jobsApi.list({ limit: 100 }).then(
      (rows) => {
        if (!cancelled) setJobs(rows);
      },
      (error: unknown) => {
        if (!cancelled) {
          setJobsError(getApiErrorMessage(error, "Unable to load jobs."));
        }
      }
    ).finally(() => {
      if (!cancelled) setJobsLoading(false);
    });

    void teamApi.listMembers().then(
      (members) => {
        if (cancelled) return;
        const active = members.filter(
          (member) =>
            member.status.toLowerCase() === "active" ||
            member.status.toLowerCase() === "invited"
        );
        const options = (active.length > 0 ? active : members).map((member) => ({
          userId: member.userId,
          name: member.name,
        }));
        setOwners(options);
        setState((previous) => {
          if (previous.ownerUserId) return previous;
          const selected =
            options.find((owner) => owner.userId === user?.id) || options[0];
          return selected
            ? {
                ...previous,
                ownerUserId: selected.userId,
                owner: selected.name,
              }
            : previous;
        });
      },
      (error: unknown) => {
        if (cancelled) return;
        if (user?.id) {
          const fallback = { userId: user.id, name: user.name || "You" };
          setOwners([fallback]);
          setState((previous) =>
            previous.ownerUserId
              ? previous
              : {
                  ...previous,
                  ownerUserId: fallback.userId,
                  owner: fallback.name,
                }
          );
        } else {
          setOwnersError(
            getApiErrorMessage(error, "Unable to load team members.")
          );
        }
      }
    ).finally(() => {
      if (!cancelled) setOwnersLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loadVersion, user?.id, user?.name]);

  const update: Update = (key, value) =>
    setState((previous) => ({ ...previous, [key]: value }));

  const currentErrors = stepErrors(current, state);
  const showErrors = attempted.has(current);
  const launchErrors = allErrors(state);
  const reachable = maxReachableStep(state);

  function goTo(step: number) {
    if (step > reachable) {
      setAttempted((previous) => new Set(previous).add(reachable));
      setCurrent(reachable);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrent(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    if (currentErrors.length > 0) {
      setAttempted((previous) => new Set(previous).add(current));
      return;
    }
    goTo(Math.min(current + 1, STEPS.length - 1));
  }

  async function submit(mode: Outcome) {
    if (mode === "launched" && launchErrors.length > 0) {
      setAttempted(new Set([0, 1, 2, 3, 4]));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const candidateIds = await resolveAudienceIds(state);
      const created = await screeningApi.createBatch(
        toCreateInput(state, candidateIds)
      );
      if (mode === "launched") {
        await screeningApi.launchBatch(created.id);
      }
      setScreeningId(created.id);
      setOutcome(mode);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Unable to save screening."));
    } finally {
      setSubmitting(false);
    }
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
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.screening} />}
          >
            Back to AI Screening
          </Button>
          {screeningId ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={screeningDetailPath(screeningId)} />}
            >
              View Screening
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const fresh = initialState();
              const defaultOwner =
                owners.find((owner) => owner.userId === user?.id) || owners[0];
              setState(
                defaultOwner
                  ? {
                      ...fresh,
                      ownerUserId: defaultOwner.userId,
                      owner: defaultOwner.name,
                    }
                  : fresh
              );
              setCurrent(0);
              setAttempted(new Set());
              setOutcome(null);
              setScreeningId(null);
              setSubmitError(null);
            }}
          >
            Create Another Screening
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav
        aria-label="Screening builder steps"
        className="rounded-xl border border-border bg-card p-4"
      >
        <Stepper
          steps={STEPS}
          currentStep={current}
          onStepSelect={goTo}
          maxEnabledStep={reachable}
          errorSteps={
            new Set(
              STEPS.map((_, index) => index).filter(
                (index) =>
                  attempted.has(index) && stepErrors(index, state).length > 0
              )
            )
          }
        />
      </nav>

      {showErrors ? <ErrorList errors={currentErrors} /> : null}
      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      {current === 0 ? (
        <DetailsStep
          state={state}
          update={update}
          showErrors={showErrors}
          jobs={jobs}
          jobsLoading={jobsLoading}
          jobsError={jobsError}
          owners={owners}
          ownersLoading={ownersLoading}
          ownersError={ownersError}
          retryLoading={() => setLoadVersion((version) => version + 1)}
        />
      ) : current === 1 ? (
        <AudienceStep
          state={state}
          update={update}
          showErrors={showErrors}
          title="Candidate Selection"
          description="Choose who receives the voice screening call. Candidates without a phone number are skipped."
          sourceErrorLabel="Choose where screening candidates come from."
          importListNamePrefix="Screening import"
          importListDescription="Candidates imported for an AI screening batch"
          importListTags={["screening-import"]}
        />
      ) : current === 2 ? (
        <AgentStep
          state={state}
          update={update}
          showErrors={showErrors}
          voiceDefaults={voiceDefaults}
        />
      ) : current === 3 ? (
        <QuestionsStep state={state} update={update} />
      ) : current === 4 ? (
        <EvaluationStep state={state} update={update} showErrors={showErrors} />
      ) : current === 5 ? (
        <CallSettingsStep state={state} update={update} />
      ) : (
        <ReviewStep state={state} errors={launchErrors} goTo={goTo} jobs={jobs} />
      )}

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
            disabled={submitting || !state.name.trim() || !state.ownerUserId}
            onClick={() => void submit("draft")}
          >
            <Save aria-hidden />
            Save Draft
          </Button>

          {current < STEPS.length - 1 ? (
            <Button type="button" size="sm" onClick={next} disabled={submitting}>
              Continue
              <ArrowRight aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={submitting || launchErrors.length > 0}
              onClick={() => void submit("launched")}
            >
              <Rocket aria-hidden />
              Launch Screening
            </Button>
          )}
        </div>

        {current === STEPS.length - 1 && launchErrors.length > 0 ? (
          <p className="w-full text-right text-xs text-destructive">
            Resolve the errors above to launch.
          </p>
        ) : null}
      </div>
    </div>
  );
}
