"use client";

import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileSpreadsheet,
  ListChecks,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Rocket,
  Save,
  Search,
  Send,
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
  AI_RESPONSE_MODES,
  AUTO_SHORTLIST_CONDITIONS,
  BOOKING_EXPIRY_OPTIONS,
  CALENDLY_EVENT_TYPES,
  DEFAULT_SCREENING_QUESTIONS,
  EVALUATION_FIELDS_360,
  HANDOFF_CONDITIONS,
  REMINDER_OPTIONS,
  SCREENING_LANGUAGES,
  STOP_CONDITIONS_360,
  VOICE_TONES,
} from "@/lib/mock-360";
import { JOBS } from "@/lib/mock-jobs";
import {
  AUDIENCE_SOURCES,
  AUDIENCE_STATS,
  CAMPAIGN_OWNERS,
  reachableCount,
  type AudienceSource,
} from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */

interface QualQuestion {
  id: string;
  text: string;
  /** Answers that immediately disqualify — empty means no knockout. */
  knockoutAnswer: string;
}

interface WorkflowBuilderState {
  // 1 — job
  name: string;
  jobId: string;
  owner: string;
  // 2 — candidates
  source: AudienceSource | null;
  // 3 — outreach
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  channelOrder: "Email first" | "WhatsApp first";
  openingMessage: string;
  followUps: string[];
  noReplyDelay: string;
  stopConditions: string[];
  // 4 — qualification
  interestClassification: boolean;
  questions: QualQuestion[];
  aiResponseMode: string;
  handoffCondition: string;
  autoShortlist: string;
  // 5 — screening
  screeningEnabled: boolean;
  language: string;
  voiceTone: string;
  screeningQuestions: string[];
  evaluationFields: string[];
  attempts: string;
  attemptInterval: string;
  minScore: string;
  autoReject: boolean;
  // 6 — scheduling
  eventType: string;
  schedulingChannel: "Email" | "WhatsApp";
  messageTemplate: string;
  reminders: string;
  autoSendAfterQualification: boolean;
  autoSendAfterScreening: boolean;
  bookingExpiry: string;
}

function initialState(): WorkflowBuilderState {
  return {
    name: "",
    jobId: "",
    owner: CAMPAIGN_OWNERS[0],
    source: null,
    emailEnabled: true,
    whatsappEnabled: false,
    channelOrder: "Email first",
    openingMessage:
      "Hi {{first_name}}, I came across your profile and think you'd be a strong fit for our {{job_title}} role. Open to a quick chat?",
    followUps: [
      "Hi {{first_name}}, just floating this back up — happy to share the full role details if useful.",
    ],
    noReplyDelay: "2 days",
    stopConditions: ["Candidate replies", "Candidate opts out"],
    interestClassification: true,
    questions: [
      {
        id: "q-1",
        text: "What is your current notice period?",
        knockoutAnswer: "More than 90 days",
      },
      {
        id: "q-2",
        text: "Are you open to working from Bengaluru (hybrid)?",
        knockoutAnswer: "No",
      },
      { id: "q-3", text: "What is your expected compensation?", knockoutAnswer: "" },
    ],
    aiResponseMode: AI_RESPONSE_MODES[0],
    handoffCondition: HANDOFF_CONDITIONS[1],
    autoShortlist: AUTO_SHORTLIST_CONDITIONS[1],
    screeningEnabled: true,
    language: SCREENING_LANGUAGES[0],
    voiceTone: VOICE_TONES[0],
    screeningQuestions: [...DEFAULT_SCREENING_QUESTIONS],
    evaluationFields: ["Communication", "Technical depth", "Role fit"],
    attempts: "3",
    attemptInterval: "24 hours",
    minScore: "75",
    autoReject: true,
    eventType: CALENDLY_EVENT_TYPES[1],
    schedulingChannel: "Email",
    messageTemplate:
      "Hi {{first_name}}, great news — you're through to the next round for {{job_title}}. Pick a slot that works for you: {{scheduling_link}}",
    reminders: REMINDER_OPTIONS[0],
    autoSendAfterQualification: false,
    autoSendAfterScreening: true,
    bookingExpiry: BOOKING_EXPIRY_OPTIONS[1],
  };
}

type Update = <K extends keyof WorkflowBuilderState>(
  key: K,
  value: WorkflowBuilderState[K]
) => void;

const STEPS = [
  { id: "job", title: "Select Job" },
  { id: "candidates", title: "Select Candidates" },
  { id: "outreach", title: "Configure Outreach" },
  { id: "qualification", title: "Configure Qualification" },
  { id: "screening", title: "Configure AI Screening" },
  { id: "scheduling", title: "Configure Scheduling" },
  { id: "review", title: "Review and Launch" },
];

function stepErrors(step: number, state: WorkflowBuilderState): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!state.name.trim()) errors.push("Workflow name is required.");
    if (!state.jobId) errors.push("Select the job this workflow hires for.");
  }
  if (step === 1 && !state.source) {
    errors.push("Choose where enrolled candidates come from.");
  }
  if (step === 2) {
    if (!state.emailEnabled && !state.whatsappEnabled)
      errors.push("Enable at least one outreach channel.");
    if (!state.openingMessage.trim())
      errors.push("The opening message cannot be empty.");
  }
  if (step === 3 && state.questions.every((question) => !question.text.trim())) {
    errors.push("Add at least one qualification question.");
  }
  if (step === 4 && state.screeningEnabled) {
    if (state.screeningQuestions.every((question) => !question.trim()))
      errors.push("Add at least one screening question.");
    if (state.evaluationFields.length === 0)
      errors.push("Pick at least one evaluation field.");
  }
  return errors;
}

function allErrors(state: WorkflowBuilderState): string[] {
  return [0, 1, 2, 3, 4, 5].flatMap((step) => stepErrors(step, state));
}

/* ------------------------------------------------------------------ */
/* Step 1 — Select Job                                                  */
/* ------------------------------------------------------------------ */

function JobStep({
  state,
  update,
  showErrors,
}: {
  state: WorkflowBuilderState;
  update: Update;
  showErrors: boolean;
}) {
  const openJobs = JOBS.filter(
    (job) => job.status === "Active" || job.status === "Paused"
  );

  return (
    <StepCard
      title="Select Job"
      description="The workflow hires for one job — qualification, screening and scheduling all personalise from it."
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Workflow name" htmlFor="wf-name" required>
            <Input
              id="wf-name"
              value={state.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="e.g. Backend Engineer — full pipeline"
              aria-invalid={showErrors && !state.name.trim()}
            />
          </Field>
          <Field label="Workflow owner" htmlFor="wf-owner">
            <Select
              value={state.owner}
              onValueChange={(value) => value && update("owner", value)}
            >
              <SelectTrigger id="wf-owner" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OWNERS.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div
          role="radiogroup"
          aria-label="Job"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {openJobs.map((job) => {
            const active = state.jobId === job.id;
            return (
              <button
                key={job.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update("jobId", job.id)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  active
                    ? "border-primary/50 bg-brand-subtle/40"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Briefcase
                    aria-hidden
                    className={cn(
                      "size-3.5",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-primary" : "text-foreground"
                    )}
                  >
                    {job.title}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {job.department} · {job.location} · {job.openings} opening
                  {job.openings === 1 ? "" : "s"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Select Candidates                                           */
/* ------------------------------------------------------------------ */

const SOURCE_META: Record<AudienceSource, { icon: typeof Users; description: string }> = {
  "Candidate Pool": { icon: Users, description: "Filtered candidates from your pool" },
  "Saved List": { icon: ListChecks, description: "Everyone in a saved list" },
  "Sourcing Session": { icon: Search, description: "Results from an AI search" },
  "CSV/Excel Import": { icon: FileSpreadsheet, description: "Upload a candidate file" },
  "Manual Add": { icon: UserPlus, description: "Hand-pick a few candidates" },
};

function CandidatesStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  const stats = state.source ? AUDIENCE_STATS[state.source] : null;

  return (
    <StepCard
      title="Select Candidates"
      description="Choose who enters the workflow. Duplicates and invalid contacts are excluded automatically."
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
                ["With email", stats.withEmail, "text-foreground"],
                ["With phone", stats.withPhone, "text-foreground"],
                ["Estimated reachable", reachableCount(stats), "text-success"],
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

        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          Candidates without any contact details stay enrolled but are flagged
          as “Contact unavailable” exceptions until contacts are revealed.
        </p>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Configure Outreach                                          */
/* ------------------------------------------------------------------ */

function OutreachStep({
  state,
  update,
  showErrors,
}: {
  state: WorkflowBuilderState;
  update: Update;
  showErrors: boolean;
}) {
  const bothChannels = state.emailEnabled && state.whatsappEnabled;

  function updateFollowUp(index: number, value: string) {
    update(
      "followUps",
      state.followUps.map((message, i) => (i === index ? value : message))
    );
  }

  return (
    <StepCard
      title="Configure Outreach"
      description="Pick channels, write the opening and follow-up messages, and decide when the sequence stops."
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleRow
            id="wf-email"
            label="Email"
            description="Send from your connected sender domain"
            checked={state.emailEnabled}
            onChange={(checked) => update("emailEnabled", checked)}
          />
          <ToggleRow
            id="wf-whatsapp"
            label="WhatsApp"
            description="Approved business templates only for first touch"
            checked={state.whatsappEnabled}
            onChange={(checked) => update("whatsappEnabled", checked)}
          />
        </div>

        <Field
          label="Channel order"
          hint={
            bothChannels
              ? "The second channel is tried when the first gets no reply."
              : "Enable both channels to control the order."
          }
        >
          <div role="radiogroup" aria-label="Channel order" className="flex gap-2">
            {(["Email first", "WhatsApp first"] as const).map((order) => {
              const active = state.channelOrder === order;
              const Icon = order === "Email first" ? Mail : MessageCircle;
              return (
                <button
                  key={order}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!bothChannels}
                  onClick={() => update("channelOrder", order)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                    active && bothChannels
                      ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                      : "border-border text-foreground hover:bg-muted/40"
                  )}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {order}
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="Opening message"
          htmlFor="wf-opening"
          required
          hint="Placeholders: {{first_name}}, {{job_title}}, {{company_name}}, {{recruiter_name}}"
        >
          <Textarea
            id="wf-opening"
            value={state.openingMessage}
            onChange={(event) => update("openingMessage", event.target.value)}
            className="min-h-24 font-mono text-xs"
            aria-invalid={showErrors && !state.openingMessage.trim()}
          />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Follow-up messages
          </p>
          {state.followUps.map((message, index) => (
            <div key={index} className="flex items-start gap-2">
              <Textarea
                value={message}
                onChange={(event) => updateFollowUp(index, event.target.value)}
                aria-label={`Follow-up ${index + 1}`}
                className="min-h-16 flex-1 font-mono text-xs"
              />
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove follow-up ${index + 1}`}
                onClick={() =>
                  update(
                    "followUps",
                    state.followUps.filter((_, i) => i !== index)
                  )
                }
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          ))}
          {state.followUps.length < 3 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                update("followUps", [
                  ...state.followUps,
                  "Hi {{first_name}}, one last nudge — should I close the loop on this?",
                ])
              }
            >
              <Plus aria-hidden />
              Add follow-up
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Maximum 3 follow-ups to protect sender reputation.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="No-reply delay"
            htmlFor="wf-delay"
            hint="Wait time before each follow-up or channel switch."
          >
            <Select
              value={state.noReplyDelay}
              onValueChange={(value) => value && update("noReplyDelay", value)}
            >
              <SelectTrigger id="wf-delay" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1 day", "2 days", "3 days", "5 days", "7 days"].map((delay) => (
                  <SelectItem key={delay} value={delay}>
                    {delay}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Stop conditions</p>
            <div className="space-y-1.5">
              {STOP_CONDITIONS_360.map((condition) => (
                <label
                  key={condition}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={state.stopConditions.includes(condition)}
                    onChange={(event) =>
                      update(
                        "stopConditions",
                        event.target.checked
                          ? [...state.stopConditions, condition]
                          : state.stopConditions.filter((c) => c !== condition)
                      )
                    }
                    className="size-3.5 accent-primary"
                  />
                  {condition}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Configure Qualification                                     */
/* ------------------------------------------------------------------ */

function QualificationStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  function updateQuestion(id: string, patch: Partial<QualQuestion>) {
    update(
      "questions",
      state.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      )
    );
  }

  return (
    <StepCard
      title="Configure Qualification"
      description="The AI classifies interest from replies, asks your questions, and applies knockout rules."
    >
      <div className="space-y-5">
        <ToggleRow
          id="wf-interest"
          label="Candidate-interest classification"
          description="Every reply is classified as Interested, Not interested, or Needs review before qualification starts."
          checked={state.interestClassification}
          onChange={(checked) => update("interestClassification", checked)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Qualification questions
          </p>
          <p className="text-xs text-muted-foreground">
            A knockout answer immediately disqualifies the candidate — leave it
            blank for informational questions.
          </p>
          {state.questions.map((question, index) => (
            <div
              key={question.id}
              className="space-y-2 rounded-lg border border-border p-3"
            >
              <div className="flex items-start gap-2">
                <Input
                  value={question.text}
                  onChange={(event) =>
                    updateQuestion(question.id, { text: event.target.value })
                  }
                  aria-label={`Question ${index + 1}`}
                  placeholder={`Question ${index + 1}`}
                  className="flex-1"
                />
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
              <Input
                value={question.knockoutAnswer}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    knockoutAnswer: event.target.value,
                  })
                }
                aria-label={`Knockout answer for question ${index + 1}`}
                placeholder="Knockout answer (optional) — e.g. “No”, “More than 90 days”"
                className="text-xs"
              />
            </div>
          ))}
          {state.questions.length < 5 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                update("questions", [
                  ...state.questions,
                  { id: `q-${Date.now()}`, text: "", knockoutAnswer: "" },
                ])
              }
            >
              <Plus aria-hidden />
              Add question
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="AI response handling" htmlFor="wf-ai-mode">
            <Select
              value={state.aiResponseMode}
              onValueChange={(value) => value && update("aiResponseMode", value)}
            >
              <SelectTrigger id="wf-ai-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_RESPONSE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Human handoff" htmlFor="wf-handoff">
            <Select
              value={state.handoffCondition}
              onValueChange={(value) => value && update("handoffCondition", value)}
            >
              <SelectTrigger id="wf-handoff" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HANDOFF_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Auto-shortlist" htmlFor="wf-shortlist">
            <Select
              value={state.autoShortlist}
              onValueChange={(value) => value && update("autoShortlist", value)}
            >
              <SelectTrigger id="wf-shortlist" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTO_SHORTLIST_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Configure AI Screening                                      */
/* ------------------------------------------------------------------ */

function ScreeningStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  function updateScreeningQuestion(index: number, value: string) {
    update(
      "screeningQuestions",
      state.screeningQuestions.map((question, i) =>
        i === index ? value : question
      )
    );
  }

  return (
    <StepCard
      title="Configure AI Screening"
      description="Qualified candidates get an AI voice screening call before they reach your shortlist."
    >
      <div className="space-y-5">
        <ToggleRow
          id="wf-screening"
          label="Voice screening enabled"
          description="Skip this step to shortlist straight from qualification."
          checked={state.screeningEnabled}
          onChange={(checked) => update("screeningEnabled", checked)}
        />

        {state.screeningEnabled ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Language" htmlFor="wf-language">
                <Select
                  value={state.language}
                  onValueChange={(value) => value && update("language", value)}
                >
                  <SelectTrigger id="wf-language" className="w-full">
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

              <Field label="Voice tone" htmlFor="wf-tone">
                <Select
                  value={state.voiceTone}
                  onValueChange={(value) => value && update("voiceTone", value)}
                >
                  <SelectTrigger id="wf-tone" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Screening questions
              </p>
              {state.screeningQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={question}
                    onChange={(event) =>
                      updateScreeningQuestion(index, event.target.value)
                    }
                    aria-label={`Screening question ${index + 1}`}
                    placeholder={`Question ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove screening question ${index + 1}`}
                    onClick={() =>
                      update(
                        "screeningQuestions",
                        state.screeningQuestions.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              ))}
              {state.screeningQuestions.length < 8 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update("screeningQuestions", [...state.screeningQuestions, ""])
                  }
                >
                  <Plus aria-hidden />
                  Add question
                </Button>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Evaluation fields
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EVALUATION_FIELDS_360.map((field) => {
                  const active = state.evaluationFields.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        update(
                          "evaluationFields",
                          active
                            ? state.evaluationFields.filter((f) => f !== field)
                            : [...state.evaluationFields, field]
                        )
                      }
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                        active
                          ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {field}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Number of attempts" htmlFor="wf-attempts">
                <Select
                  value={state.attempts}
                  onValueChange={(value) => value && update("attempts", value)}
                >
                  <SelectTrigger id="wf-attempts" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4"].map((count) => (
                      <SelectItem key={count} value={count}>
                        {count} attempt{count === "1" ? "" : "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Attempt interval" htmlFor="wf-interval">
                <Select
                  value={state.attemptInterval}
                  onValueChange={(value) => value && update("attemptInterval", value)}
                >
                  <SelectTrigger id="wf-interval" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["4 hours", "12 hours", "24 hours", "48 hours"].map(
                      (interval) => (
                        <SelectItem key={interval} value={interval}>
                          {interval}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label="Minimum score"
                htmlFor="wf-min-score"
                hint="Out of 100 — used by auto-shortlist."
              >
                <Input
                  id="wf-min-score"
                  type="number"
                  min={0}
                  max={100}
                  value={state.minScore}
                  onChange={(event) => update("minScore", event.target.value)}
                />
              </Field>
            </div>

            <ToggleRow
              id="wf-auto-reject"
              label="Auto-reject below 50"
              description="Candidates scoring under 50 are rejected without recruiter review. Scores in between wait for your decision."
              checked={state.autoReject}
              onChange={(checked) => update("autoReject", checked)}
            />
          </>
        ) : null}
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 6 — Configure Scheduling                                        */
/* ------------------------------------------------------------------ */

function SchedulingStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  return (
    <StepCard
      title="Configure Scheduling"
      description="Shortlisted candidates receive a booking link and reminders — no back-and-forth."
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Calendly event type" htmlFor="wf-event">
            <Select
              value={state.eventType}
              onValueChange={(value) => value && update("eventType", value)}
            >
              <SelectTrigger id="wf-event" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALENDLY_EVENT_TYPES.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Scheduling channel">
            <div
              role="radiogroup"
              aria-label="Scheduling channel"
              className="flex gap-2"
            >
              {(["Email", "WhatsApp"] as const).map((channel) => {
                const active = state.schedulingChannel === channel;
                const Icon = channel === "Email" ? Mail : MessageCircle;
                return (
                  <button
                    key={channel}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update("schedulingChannel", channel)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                      active
                        ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                        : "border-border text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" />
                    {channel}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <Field
          label="Message template"
          htmlFor="wf-schedule-message"
          hint="Placeholders: {{first_name}}, {{job_title}}, {{scheduling_link}}"
        >
          <Textarea
            id="wf-schedule-message"
            value={state.messageTemplate}
            onChange={(event) => update("messageTemplate", event.target.value)}
            className="min-h-20 font-mono text-xs"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Reminder settings" htmlFor="wf-reminders">
            <Select
              value={state.reminders}
              onValueChange={(value) => value && update("reminders", value)}
            >
              <SelectTrigger id="wf-reminders" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Booking expiry"
            htmlFor="wf-expiry"
            hint="Expired links raise a “Scheduling link expired” exception."
          >
            <Select
              value={state.bookingExpiry}
              onValueChange={(value) => value && update("bookingExpiry", value)}
            >
              <SelectTrigger id="wf-expiry" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_EXPIRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleRow
            id="wf-auto-qual"
            label="Auto-send after qualification"
            description="Send the booking link as soon as a candidate qualifies — skips screening."
            checked={state.autoSendAfterQualification}
            onChange={(checked) => update("autoSendAfterQualification", checked)}
          />
          <ToggleRow
            id="wf-auto-screen"
            label="Auto-send after screening"
            description="Send the booking link when the screening score meets the minimum."
            checked={state.autoSendAfterScreening}
            onChange={(checked) => update("autoSendAfterScreening", checked)}
          />
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 7 — Review and Launch                                           */
/* ------------------------------------------------------------------ */

function ReviewStep({
  state,
  errors,
  goTo,
}: {
  state: WorkflowBuilderState;
  errors: string[];
  goTo: (step: number) => void;
}) {
  const job = JOBS.find((j) => j.id === state.jobId);
  const stats = state.source ? AUDIENCE_STATS[state.source] : null;
  const channels = [
    state.emailEnabled ? "Email" : null,
    state.whatsappEnabled ? "WhatsApp" : null,
  ].filter(Boolean);
  const knockouts = state.questions.filter((q) => q.knockoutAnswer.trim()).length;

  const sections: {
    step: number;
    icon: typeof Send;
    title: string;
    lines: string[];
  }[] = [
    {
      step: 0,
      icon: Briefcase,
      title: "Job",
      lines: [
        state.name.trim() || "Unnamed workflow",
        job ? `${job.title} · ${job.location}` : "No job selected",
        `Owner: ${state.owner}`,
      ],
    },
    {
      step: 1,
      icon: Users,
      title: "Candidates",
      lines: stats
        ? [
            `Source: ${state.source}`,
            `${reachableCount(stats).toLocaleString("en-IN")} reachable of ${stats.selected.toLocaleString("en-IN")} selected`,
          ]
        : ["No source selected"],
    },
    {
      step: 2,
      icon: Send,
      title: "Outreach",
      lines: [
        channels.length > 0
          ? `${channels.join(" + ")}${channels.length === 2 ? ` — ${state.channelOrder}` : ""}`
          : "No channels enabled",
        `${state.followUps.length} follow-up${state.followUps.length === 1 ? "" : "s"} · ${state.noReplyDelay} no-reply delay`,
        `Stops: ${state.stopConditions.length > 0 ? state.stopConditions.join(", ") : "none"}`,
      ],
    },
    {
      step: 3,
      icon: CheckCircle2,
      title: "Qualification",
      lines: [
        state.interestClassification
          ? "Interest classification on"
          : "Interest classification off",
        `${state.questions.filter((q) => q.text.trim()).length} questions · ${knockouts} knockout${knockouts === 1 ? "" : "s"}`,
        `${state.aiResponseMode} · Handoff: ${state.handoffCondition}`,
        `Auto-shortlist: ${state.autoShortlist}`,
      ],
    },
    {
      step: 4,
      icon: AudioLines,
      title: "AI Screening",
      lines: state.screeningEnabled
        ? [
            `${state.language} · ${state.voiceTone} tone · ${state.screeningQuestions.filter((q) => q.trim()).length} questions`,
            `${state.attempts} attempts, ${state.attemptInterval} apart`,
            `Minimum score ${state.minScore}/100${state.autoReject ? " · auto-reject below 50" : ""}`,
          ]
        : ["Disabled — shortlist straight from qualification"],
    },
    {
      step: 5,
      icon: CalendarClock,
      title: "Scheduling",
      lines: [
        `${state.eventType} via ${state.schedulingChannel}`,
        `Reminders: ${state.reminders} · link expires after ${state.bookingExpiry}`,
        state.autoSendAfterScreening
          ? "Auto-send after screening"
          : state.autoSendAfterQualification
            ? "Auto-send after qualification"
            : "Sent manually by recruiter",
      ],
    },
  ];

  return (
    <StepCard
      title="Review and Launch"
      description="Everything the workflow will do, end to end. Nothing is sent from this UI preview."
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
      "Your workflow was saved as a draft. Finish and launch it any time from the Huntlo 360 home.",
  },
  launched: {
    title: "Workflow launched",
    description:
      "Candidates will start receiving outreach within the send window, then flow through qualification, screening and scheduling automatically. Nothing was really sent — this is a UI preview.",
  },
};

export function WorkflowBuilder() {
  const [state, setState] = useState<WorkflowBuilderState>(initialState);
  const [current, setCurrent] = useState(0);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [outcome, setOutcome] = useState<Outcome | null>(null);

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
            render={<Link href={ROUTES.huntlo360} />}
          >
            Back to Huntlo 360
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(initialState());
              setCurrent(0);
              setAttempted(new Set());
              setOutcome(null);
            }}
          >
            Create Another Workflow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <nav
        aria-label="Workflow builder steps"
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

      {/* Step content */}
      {current === 0 ? (
        <JobStep state={state} update={update} showErrors={showErrors} />
      ) : current === 1 ? (
        <CandidatesStep state={state} update={update} />
      ) : current === 2 ? (
        <OutreachStep state={state} update={update} showErrors={showErrors} />
      ) : current === 3 ? (
        <QualificationStep state={state} update={update} />
      ) : current === 4 ? (
        <ScreeningStep state={state} update={update} />
      ) : current === 5 ? (
        <SchedulingStep state={state} update={update} />
      ) : (
        <ReviewStep state={state} errors={launchErrors} goTo={goTo} />
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

          {current < STEPS.length - 1 ? (
            <Button type="button" size="sm" onClick={next}>
              Continue
              <ArrowRight aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={launchErrors.length > 0}
              onClick={() => setOutcome("launched")}
            >
              <Rocket aria-hidden />
              Launch Workflow
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
