"use client";

import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Briefcase,
  CheckCircle2,
  FileSpreadsheet,
  ListChecks,
  Pencil,
  Plus,
  Rocket,
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  ErrorList,
  Field,
  StepCard,
  ToggleRow,
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
  candidatePoolApi,
  getApiErrorMessage,
  screeningApi,
  type ScreeningCreateInput,
} from "@/lib/api";
import { JOBS } from "@/lib/mock-jobs";
import {
  ATTEMPT_OPTIONS,
  CALL_WINDOWS,
  DEFAULT_QUESTIONS,
  DELAY_OPTIONS,
  EVALUATION_CATEGORIES,
  KNOCKOUT_CRITERIA,
  QUESTION_TYPES,
  SCREENING_LANGUAGES,
  SCREENING_OBJECTIVES,
  SCREENING_OWNERS,
  SCREENING_TONES,
  SCREENING_VOICES,
  TIMEZONE_OPTIONS_SCREENING,
  VOICEMAIL_BEHAVIOURS,
  type QuestionType,
} from "@/lib/mock-screening";
import {
  AUDIENCE_SOURCES,
  AUDIENCE_STATS,
  reachableCount,
  type AudienceSource,
} from "@/lib/mock-outreach";
import { ROUTES, screeningDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
  jobId: string;
  objective: string;
  description: string;
  owner: string;
  source: AudienceSource | null;
  language: string;
  voice: string;
  tone: string;
  introduction: string;
  closing: string;
  disclosure: string;
  consent: string;
  questions: BuilderQuestion[];
  categoryWeights: Record<string, number>;
  knockouts: string[];
  minShortlistScore: string;
  attempts: string;
  delay: string;
  callWindow: string;
  timezone: string;
  retryOnNoAnswer: boolean;
  voicemail: string;
}

function initialState(): BuilderState {
  return {
    name: "",
    jobId: "",
    objective: SCREENING_OBJECTIVES[0],
    description: "",
    owner: SCREENING_OWNERS[0],
    source: null,
    language: SCREENING_LANGUAGES[0],
    voice: SCREENING_VOICES[0],
    tone: SCREENING_TONES[0],
    introduction:
      "Hi {{first_name}}, this is {{agent_name}} calling from Huntlo about the {{job_title}} role. Do you have a few minutes?",
    closing:
      "Thanks for your time, {{first_name}}. The recruiting team will review this conversation and share next steps shortly. Have a great day.",
    disclosure:
      "Just so you know — I'm an AI assistant helping the recruiting team with this screening call.",
    consent:
      "This call is recorded for evaluation purposes. Is it okay if we continue?",
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
    retryOnNoAnswer: true,
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
    if (!state.jobId) errors.push("Select the related job.");
  }
  if (step === 1 && !state.source) {
    errors.push("Choose where screening candidates come from.");
  }
  if (step === 2) {
    if (!state.introduction.trim()) errors.push("Introduction script is required.");
    if (!state.consent.trim()) errors.push("Recording consent text is required.");
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

/* ------------------------------------------------------------------ */
/* Steps                                                                */
/* ------------------------------------------------------------------ */

function DetailsStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
}) {
  return (
    <StepCard
      title="Screening Details"
      description="Name the batch, connect it to a job, and decide who owns the calls."
    >
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

        <Field label="Campaign owner" htmlFor="scr-owner">
          <Select
            value={state.owner}
            onValueChange={(value) => value && update("owner", value)}
          >
            <SelectTrigger id="scr-owner" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCREENING_OWNERS.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Related job" htmlFor="scr-job" required>
          <Select
            value={state.jobId || null}
            onValueChange={(value) => update("jobId", value ?? "")}
          >
            <SelectTrigger
              id="scr-job"
              className="w-full"
              aria-invalid={showErrors && !state.jobId}
            >
              <SelectValue placeholder="Select a job" />
            </SelectTrigger>
            <SelectContent>
              {JOBS.filter(
                (job) => job.status === "Active" || job.status === "Paused"
              ).map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

const SOURCE_META: Record<
  AudienceSource,
  { icon: typeof Users; description: string }
> = {
  "Candidate Pool": {
    icon: Users,
    description: "Filtered candidates from your pool",
  },
  "Saved List": {
    icon: ListChecks,
    description: "Everyone in a saved list",
  },
  "Sourcing Session": {
    icon: Search,
    description: "Results from an AI search",
  },
  "CSV/Excel Import": {
    icon: FileSpreadsheet,
    description: "Upload a candidate file",
  },
  "Manual Add": {
    icon: UserPlus,
    description: "Hand-pick a few candidates",
  },
};

function CandidatesStep({
  state,
  update,
}: {
  state: BuilderState;
  update: Update;
}) {
  const stats = state.source ? AUDIENCE_STATS[state.source] : null;

  return (
    <StepCard
      title="Candidate Selection"
      description="Choose who receives the voice screening call. Candidates without a phone number are skipped."
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
                onClick={() => update("source", source)}
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

        {stats ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Selected", stats.selected, "text-foreground"],
                ["With phone", stats.withPhone, "text-foreground"],
                ["With email", stats.withEmail, "text-muted-foreground"],
                [
                  "Callable",
                  Math.min(stats.withPhone, reachableCount(stats)),
                  "text-success",
                ],
              ] as const
            ).map(([label, value, tone]) => (
              <div
                key={label}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className={cn("text-lg font-semibold tabular-nums", tone)}>
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

function AgentStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
}) {
  return (
    <StepCard
      title="Agent Configuration"
      description="Pick the voice persona and the scripts that open and close every call. Requires a connected Hunar integration."
    >
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Voice calls run through{" "}
          <a
            href="/dashboard/integrations"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Hunar
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCREENING_LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCREENING_VOICES.map((voice) => (
                  <SelectItem key={voice} value={voice}>
                    {voice}
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCREENING_TONES.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
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
          hint="Placeholders: {{first_name}}, {{job_title}}, {{agent_name}}"
        >
          <Textarea
            id="scr-intro"
            value={state.introduction}
            onChange={(event) => update("introduction", event.target.value)}
            className="min-h-20 font-mono text-xs"
            aria-invalid={showErrors && !state.introduction.trim()}
          />
        </Field>

        <Field label="Closing script" htmlFor="scr-closing">
          <Textarea
            id="scr-closing"
            value={state.closing}
            onChange={(event) => update("closing", event.target.value)}
            className="min-h-16 font-mono text-xs"
          />
        </Field>

        <Field
          label="AI disclosure message"
          htmlFor="scr-disclosure"
          hint="Required in most regions — spoken early in the call."
        >
          <Textarea
            id="scr-disclosure"
            value={state.disclosure}
            onChange={(event) => update("disclosure", event.target.value)}
            className="min-h-16 font-mono text-xs"
          />
        </Field>

        <Field
          label="Recording consent text"
          htmlFor="scr-consent"
          required
          hint="The call continues only after the candidate agrees."
        >
          <Textarea
            id="scr-consent"
            value={state.consent}
            onChange={(event) => update("consent", event.target.value)}
            className="min-h-16 font-mono text-xs"
            aria-invalid={showErrors && !state.consent.trim()}
          />
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

  return (
    <StepCard
      title="Evaluation"
      description="Weight the scorecard categories, set knockout rules, and define the shortlist threshold."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Category scores</p>
          <p className="text-xs text-muted-foreground">
            Weights are relative — the overall score is a weighted average of
            enabled categories.
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
                    update("categoryWeights", {
                      ...state.categoryWeights,
                      [category.id]: Number(event.target.value) || 0,
                    })
                  }
                  className="w-20 text-right tabular-nums"
                  aria-label={`${category.label} weight`}
                />
              </div>
            ))}
          </div>
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

        <ToggleRow
          id="scr-retry"
          label="Retry on no answer"
          description="Schedule the next attempt automatically when the candidate does not pick up."
          checked={state.retryOnNoAnswer}
          onChange={(checked) => update("retryOnNoAnswer", checked)}
        />

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
}: {
  state: BuilderState;
  errors: string[];
  goTo: (step: number) => void;
}) {
  const job = JOBS.find((j) => j.id === state.jobId);
  const stats = state.source ? AUDIENCE_STATS[state.source] : null;
  const activeQuestions = state.questions.filter((q) => q.text.trim());

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
            `${Math.min(stats.withPhone, reachableCount(stats)).toLocaleString("en-IN")} callable`,
          ]
        : ["No source selected"],
    },
    {
      step: 2,
      icon: AudioLines,
      title: "Agent",
      lines: [
        `${state.language} · ${state.voice} · ${state.tone}`,
        "Introduction, disclosure and consent configured",
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
        `${state.knockouts.length} knockout${state.knockouts.length === 1 ? "" : "s"}`,
      ],
    },
    {
      step: 5,
      icon: AudioLines,
      title: "Call settings",
      lines: [
        `${state.attempts} attempts · ${state.delay} apart`,
        `${state.callWindow} · ${state.timezone}`,
        state.retryOnNoAnswer
          ? `Retry on no answer · ${state.voicemail}`
          : `No retry · ${state.voicemail}`,
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
  if (state.source === "Candidate Pool" || state.source === "Saved List") {
    const pool = await candidatePoolApi.list({ limit: 200 });
    return pool.map((c) => c.id);
  }
  return [];
}

function toCreateInput(
  state: BuilderState,
  candidateIds: string[]
): ScreeningCreateInput {
  return {
    name: state.name.trim(),
    jobId: state.jobId || null,
    objective: state.objective || state.description || null,
    language: state.language,
    voice: state.voice,
    tone: state.tone,
    introductionScript: state.introduction,
    closingScript: state.closing,
    consentText: state.consent,
    questions: state.questions
      .filter((q) => q.text.trim())
      .map((q) => ({ id: q.id, prompt: q.text.trim() })),
    evaluationCriteria: EVALUATION_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      weight: state.categoryWeights[category.id] ?? category.defaultWeight,
    })),
    callSettings: {
      maxAttempts: Number.parseInt(state.attempts, 10) || 2,
      attemptIntervalHours: Number.parseInt(state.delay, 10) || 24,
      maxRetryCount: state.retryOnNoAnswer ? 2 : 0,
      retryIntervalHours: 6,
      consentRequired: Boolean(state.consent.trim()),
    },
    candidateIds,
  };
}

export function ScreeningBuilder() {
  const [state, setState] = useState<BuilderState>(initialState);
  const [current, setCurrent] = useState(0);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update: Update = (key, value) =>
    setState((previous) => ({ ...previous, [key]: value }));

  const currentErrors = stepErrors(current, state);
  const showErrors = attempted.has(current);
  const launchErrors = allErrors(state);

  function goTo(step: number) {
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
              setState(initialState());
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
        <Stepper steps={STEPS} currentStep={current} />
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
          {STEPS.map((step, index) => {
            const hasError =
              attempted.has(index) && stepErrors(index, state).length > 0;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === current ? "step" : undefined}
                className={cn(
                  "rounded-md px-2 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  index === current
                    ? "bg-brand-subtle font-medium text-primary"
                    : hasError
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
                      : "text-muted-foreground hover:bg-muted"
                )}
              >
                {index + 1}. {step.title}
                {hasError ? " ⚠" : ""}
              </button>
            );
          })}
        </div>
      </nav>

      {showErrors ? <ErrorList errors={currentErrors} /> : null}
      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      {current === 0 ? (
        <DetailsStep state={state} update={update} showErrors={showErrors} />
      ) : current === 1 ? (
        <CandidatesStep state={state} update={update} />
      ) : current === 2 ? (
        <AgentStep state={state} update={update} showErrors={showErrors} />
      ) : current === 3 ? (
        <QuestionsStep state={state} update={update} />
      ) : current === 4 ? (
        <EvaluationStep state={state} update={update} showErrors={showErrors} />
      ) : current === 5 ? (
        <CallSettingsStep state={state} update={update} />
      ) : (
        <ReviewStep state={state} errors={launchErrors} goTo={goTo} />
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
            disabled={submitting || !state.name.trim()}
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
