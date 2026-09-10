"use client";

import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Briefcase,
  CheckCircle2,
  ChevronDown,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getApiErrorMessage,
  jobsApi,
  screeningApi,
  teamApi,
  type ApiTeamMember,
  type ScreeningCreateInput,
} from "@/lib/api";
import type { JobDetail, JobListItem } from "@/lib/api/contracts";
import {
  ATTEMPT_OPTIONS,
  CALL_WINDOWS,
  DEFAULT_QUESTIONS,
  DELAY_OPTIONS,
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

interface VideoSkill {
  id: string;
  skillName: string;
  proficiency: string;
}

interface VideoTopicFocus {
  id: string;
  name: string;
  discussionMinutes: string;
  reason: string;
  sampleQuestions: string;
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
  videoMustHaveSkills: VideoSkill[];
  videoGoodToHaveSkills: VideoSkill[];
  videoBonusSkills: VideoSkill[];
  videoTopicsFocus: VideoTopicFocus[];
  videoTopicsAvoid: Array<{ id: string; text: string }>;
  videoInterviewStandard: boolean;
  videoInterviewConversation: boolean;
  questions: BuilderQuestion[];
  knockouts: string[];
  minShortlistScore: string;
  attempts: string;
  delay: string;
  callWindow: string;
  timezone: string;
  voicemail: string;
}

const SKILL_PROFICIENCY_OPTIONS = [
  {
    label: "Easy",
    short: "E",
    value: "L1",
    chipClass: "text-emerald-700 dark:text-emerald-400",
  },
  {
    label: "Medium",
    short: "M",
    value: "L3",
    chipClass: "text-amber-700 dark:text-amber-400",
  },
  {
    label: "Hard",
    short: "H",
    value: "L5",
    chipClass: "text-rose-700 dark:text-rose-400",
  },
] as const;

type SkillProficiencyApi = (typeof SKILL_PROFICIENCY_OPTIONS)[number]["value"];

/** Map any stored/API level onto Easy/Medium/Hard for the dropdown. */
function toUiSkillProficiency(value: string): SkillProficiencyApi {
  if (value === "L1" || value === "L2") return "L1";
  if (value === "L4" || value === "L5") return "L5";
  return "L3";
}

function skillProficiencyOption(value: string) {
  const normalized = toUiSkillProficiency(value);
  return (
    SKILL_PROFICIENCY_OPTIONS.find((option) => option.value === normalized) ??
    SKILL_PROFICIENCY_OPTIONS[1]
  );
}

function SkillProficiencyMark({ value }: { value: string }) {
  const option = skillProficiencyOption(value);
  return (
    <span
      className={cn("text-[11px] font-bold leading-none", option.chipClass)}
      title={option.label}
    >
      {option.short}
    </span>
  );
}

function newVideoSkill(): VideoSkill {
  return {
    id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    skillName: "",
    proficiency: "L3",
  };
}

function newVideoTopicFocus(): VideoTopicFocus {
  return {
    id: `topic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    discussionMinutes: "15",
    reason: "",
    sampleQuestions: "",
  };
}

function proficiencyFromSeniority(seniority: string | null | undefined): SkillProficiencyApi {
  const value = String(seniority || "").toLowerCase();
  if (
    value.includes("lead") ||
    value.includes("principal") ||
    value.includes("staff") ||
    value.includes("director") ||
    value.includes("senior")
  ) {
    return "L5";
  }
  if (value.includes("junior") || value.includes("entry") || value.includes("intern")) {
    return "L1";
  }
  return "L3";
}

function mapNamesToVideoSkills(
  names: string[] | null | undefined,
  proficiency: string,
  { keepEmptyRow }: { keepEmptyRow: boolean }
): VideoSkill[] {
  const cleaned = (names ?? [])
    .map((name) => String(name || "").trim())
    .filter(Boolean);
  if (!cleaned.length) {
    return keepEmptyRow ? [newVideoSkill()] : [];
  }
  return cleaned.map((skillName, index) => ({
    id: `skill-job-${index}-${skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
    skillName: skillName.slice(0, 60),
    proficiency,
  }));
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function videoDefaultsFromJob(job: JobDetail): Pick<
  BuilderState,
  | "videoMustHaveSkills"
  | "videoGoodToHaveSkills"
  | "videoBonusSkills"
  | "videoTopicsFocus"
  | "videoTopicsAvoid"
  | "videoInterviewStandard"
  | "videoInterviewConversation"
> {
  const proficiency = proficiencyFromSeniority(job.seniority);
  const topicLines = (
    job.requirements?.length
      ? job.requirements
      : job.responsibilities?.length
        ? job.responsibilities
        : []
  )
    .map((line) => stripHtml(String(line || "")))
    .filter(Boolean)
    .slice(0, 5);

  const videoTopicsFocus: VideoTopicFocus[] = topicLines.length
    ? topicLines.map((line, index) => ({
        id: `topic-job-${index}`,
        name: line.slice(0, 120),
        discussionMinutes: "10",
        reason: `From ${job.title} job requirements`,
        sampleQuestions: "",
      }))
    : [
        {
          id: `topic-job-title`,
          name: job.title,
          discussionMinutes: "15",
          reason: stripHtml(job.description || "").slice(0, 160) ||
            `Interview focus for ${job.title}`,
          sampleQuestions: "",
        },
      ];

  return {
    videoMustHaveSkills: mapNamesToVideoSkills(job.requiredSkills, proficiency, {
      keepEmptyRow: true,
    }),
    videoGoodToHaveSkills: mapNamesToVideoSkills(job.preferredSkills, "L3", {
      keepEmptyRow: false,
    }),
    videoBonusSkills: [],
    videoTopicsFocus,
    videoTopicsAvoid: [],
    videoInterviewStandard: true,
    videoInterviewConversation: false,
  };
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
    videoMustHaveSkills: [newVideoSkill()],
    videoGoodToHaveSkills: [],
    videoBonusSkills: [],
    videoTopicsFocus: [newVideoTopicFocus()],
    videoTopicsAvoid: [],
    videoInterviewStandard: true,
    videoInterviewConversation: false,
    questions: DEFAULT_QUESTIONS.map((question, index) => ({
      id: `q-${index + 1}`,
      type: question.type,
      text: question.text,
      required: question.type !== "Custom",
      followUp: "",
      expectedVariable: question.expectedVariable,
      evaluationEnabled: true,
    })),
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

const ALL_STEPS = [
  { id: "details", title: "Screening Details" },
  { id: "candidates", title: "Candidate Selection" },
  { id: "agent", title: "Agent Configuration" },
  { id: "questions", title: "Questions" },
  { id: "evaluation", title: "Evaluation" },
  { id: "call", title: "Call Settings" },
  { id: "review", title: "Review and Launch" },
] as const;

type StepId = (typeof ALL_STEPS)[number]["id"];

function stepsForMode(state: BuilderState) {
  if (state.screeningMode === "video") {
    return ALL_STEPS.filter(
      (step) =>
        step.id !== "questions" &&
        step.id !== "evaluation" &&
        step.id !== "call"
    );
  }
  return [...ALL_STEPS];
}

function stepErrorsById(stepId: StepId, state: BuilderState): string[] {
  const errors: string[] = [];
  if (stepId === "details") {
    if (!state.name.trim()) errors.push("Screening name is required.");
    if (!state.ownerUserId) errors.push("Select the campaign owner.");
    if (!state.jobId) errors.push("Select the related job.");
  }
  if (stepId === "candidates") {
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
    } else if (state.source === "CSV/Excel Import" && !state.sourceDetail) {
      errors.push("Import a CSV/Excel file before continuing.");
    } else if (
      state.audiencePreview &&
      state.audiencePreview.selected === 0 &&
      state.source !== "CSV/Excel Import"
    ) {
      errors.push("This audience has no candidates yet.");
    }
  }
  if (stepId === "agent") {
    if (state.screeningMode === "video") {
      if (
        !state.videoInterviewStandard &&
        !state.videoInterviewConversation
      ) {
        errors.push("Select standard or conversation interview mode.");
      }
      if (state.videoInterviewStandard && state.videoInterviewConversation) {
        errors.push("Choose only one interview mode.");
      }
      if (state.videoInterviewConversation) {
        if (
          state.videoMustHaveSkills.every((skill) => !skill.skillName.trim())
        ) {
          errors.push("Add at least one must-have skill.");
        }
        if (state.videoTopicsFocus.every((topic) => !topic.name.trim())) {
          errors.push(
            "Add at least one focus topic for Conversation mode."
          );
        }
      } else if (state.questions.every((question) => !question.text.trim())) {
        errors.push("Add at least one interview question.");
      }
    } else {
      if (!state.introduction.trim()) {
        errors.push("Introduction script is required.");
      }
      if (!state.agentPrompt.trim()) {
        errors.push("Agent prompt is required.");
      }
    }
  }
  if (stepId === "questions") {
    if (state.questions.every((question) => !question.text.trim())) {
      errors.push("Add at least one screening question.");
    }
  }
  if (stepId === "evaluation") {
    const score = Number(state.minShortlistScore);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      errors.push("Minimum shortlist score must be between 0 and 100.");
    }
  }
  return errors;
}

function allErrors(state: BuilderState): string[] {
  return stepsForMode(state).flatMap((step) =>
    stepErrorsById(step.id, state)
  );
}

/** Highest step index reachable: all prior steps must be valid. */
function maxReachableStep(state: BuilderState): number {
  const steps = stepsForMode(state);
  for (let index = 0; index < steps.length; index += 1) {
    if (stepErrorsById(steps[index].id, state).length > 0) return index;
  }
  return steps.length - 1;
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
                description:
                  "Async video interviews. Available now.",
                icon: Video,
                disabled: false,
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
                      ? "cursor-pointer border-primary/50 bg-brand-subtle/20"
                      : "cursor-pointer border-border hover:bg-muted/40"
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

function filledSkillCount(skills: VideoSkill[]): number {
  return skills.filter((skill) => skill.skillName.trim()).length;
}

function VideoSkillEditor({
  skills,
  onChange,
  required,
  showErrors,
  emptyLabel,
  addLabel,
}: {
  skills: VideoSkill[];
  onChange: (skills: VideoSkill[]) => void;
  required?: boolean;
  showErrors?: boolean;
  emptyLabel: string;
  addLabel: string;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftLevel, setDraftLevel] = useState<SkillProficiencyApi>("L3");
  const missingRequired =
    Boolean(required) &&
    Boolean(showErrors) &&
    filledSkillCount(skills) === 0;

  function commitDraft() {
    const name = draftName.trim().slice(0, 60);
    if (!name) return;
    onChange([
      ...skills.filter((skill) => skill.skillName.trim()),
      {
        id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        skillName: name,
        proficiency: draftLevel,
      },
    ]);
    setDraftName("");
    setDraftLevel("L3");
  }

  const visible = skills.filter((skill) => skill.skillName.trim());

  return (
    <div className="space-y-3">
      {visible.length === 0 ? (
        <p
          className={cn(
            "rounded-lg border border-dashed px-3 py-6 text-center text-xs",
            missingRequired
              ? "border-destructive/50 text-destructive"
              : "border-border text-muted-foreground"
          )}
        >
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {visible.map((skill) => (
            <li
              key={skill.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-2.5 pr-1 sm:max-w-[14rem]"
            >
              <span
                className="min-w-0 flex-1 truncate text-xs font-medium text-foreground"
                title={skill.skillName}
              >
                {skill.skillName}
              </span>
              <Select
                value={toUiSkillProficiency(skill.proficiency)}
                onValueChange={(value) =>
                  value &&
                  onChange(
                    skills.map((row) =>
                      row.id === skill.id
                        ? {
                            ...row,
                            proficiency: toUiSkillProficiency(value),
                          }
                        : row
                    )
                  )
                }
              >
                <SelectTrigger
                  size="sm"
                  className="h-auto w-auto min-w-0 gap-0 rounded-none border-0 bg-transparent p-0 shadow-none [&>svg]:hidden"
                  aria-label={`${skill.skillName} difficulty: ${skillProficiencyOption(skill.proficiency).label}`}
                >
                  <SelectValue>
                    <SkillProficiencyMark value={skill.proficiency} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SKILL_PROFICIENCY_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-foreground data-highlighted:text-foreground"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="size-6 rounded-full"
                aria-label={`Remove ${skill.skillName}`}
                onClick={() =>
                  onChange(skills.filter((row) => row.id !== skill.id))
                }
              >
                <Trash2 aria-hidden className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
            }
          }}
          placeholder={addLabel}
          className="min-w-40 flex-1 text-xs"
          maxLength={60}
          aria-invalid={missingRequired}
        />
        <Select
          value={draftLevel}
          onValueChange={(value) =>
            value && setDraftLevel(toUiSkillProficiency(value))
          }
        >
          <SelectTrigger
            size="sm"
            className="w-auto min-w-24 gap-1.5 px-2"
            aria-label={`New skill difficulty: ${skillProficiencyOption(draftLevel).label}`}
          >
            <SelectValue>
              <span className="text-xs font-medium text-foreground">
                {skillProficiencyOption(draftLevel).label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SKILL_PROFICIENCY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-foreground data-highlighted:text-foreground"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={commitDraft}
          disabled={!draftName.trim()}
        >
          <Plus aria-hidden />
          Add
        </Button>
      </div>
    </div>
  );
}

function VideoAgentStep({
  state,
  update,
  showErrors,
  jobTitle,
  defaultsLoading,
  defaultsError,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
  jobTitle: string | null;
  defaultsLoading: boolean;
  defaultsError: string | null;
}) {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [avoidDraft, setAvoidDraft] = useState("");
  const selectedMode = state.videoInterviewConversation
    ? "conversation"
    : "standard";
  const modeInvalid =
    showErrors &&
    ((!state.videoInterviewStandard && !state.videoInterviewConversation) ||
      (state.videoInterviewStandard && state.videoInterviewConversation));

  const mustCount = filledSkillCount(state.videoMustHaveSkills);
  const goodCount = filledSkillCount(state.videoGoodToHaveSkills);
  const bonusCount = filledSkillCount(state.videoBonusSkills);
  const focusCount = state.videoTopicsFocus.filter((topic) =>
    topic.name.trim()
  ).length;
  const avoidCount = state.videoTopicsAvoid.filter((topic) =>
    topic.text.trim()
  ).length;

  function addAvoidTopic() {
    const text = avoidDraft.trim();
    if (!text) return;
    update("videoTopicsAvoid", [
      ...state.videoTopicsAvoid.filter((topic) => topic.text.trim()),
      {
        id: `avoid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
      },
    ]);
    setAvoidDraft("");
  }

  return (
    <StepCard
      title="Agent Configuration"
      description={
        state.videoInterviewConversation
          ? "Configure Conversation mode with skills and topics for adaptive AI dialogue."
          : "Choose Standard mode and add the structured interview questions candidates will answer."
      }
    >
      <div className="space-y-4">
        {state.videoInterviewConversation ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {defaultsLoading ? (
                "Loading job defaults…"
              ) : defaultsError ? (
                <span className="text-destructive">{defaultsError}</span>
              ) : jobTitle ? (
                <>
                  Synced from{" "}
                  <span className="font-medium text-foreground">{jobTitle}</span>
                  <span className="text-muted-foreground"> · editable</span>
                </>
              ) : (
                "Pick a job in Screening Details to auto-fill skills and topics."
              )}
            </p>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {mustCount} must · {goodCount + bonusCount} optional · {focusCount}{" "}
              topics
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            "grid gap-2 sm:grid-cols-2",
            modeInvalid && "rounded-lg ring-1 ring-destructive/60"
          )}
          role="radiogroup"
          aria-label="Interview mode"
        >
          {(
            [
              {
                key: "standard" as const,
                title: "Standard",
                description: "Structured async prompts",
                disabled: false,
              },
              {
                key: "conversation" as const,
                title: "Conversation",
                description: "Adaptive AI dialogue",
                disabled: true,
              },
            ] as const
          ).map((mode) => {
            const checked = selectedMode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-disabled={mode.disabled || undefined}
                disabled={mode.disabled}
                onClick={() => {
                  if (mode.disabled) return;
                  if (mode.key === "standard") {
                    update("videoInterviewStandard", true);
                    update("videoInterviewConversation", false);
                  } else {
                    update("videoInterviewStandard", false);
                    update("videoInterviewConversation", true);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  mode.disabled
                    ? "cursor-not-allowed border-border opacity-50"
                    : "cursor-pointer",
                  !mode.disabled && checked
                    ? "border-primary/50 bg-brand-subtle/20"
                    : !mode.disabled
                      ? "border-border hover:bg-muted/40"
                      : null
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    checked && !mode.disabled
                      ? "border-primary"
                      : "border-border bg-card"
                  )}
                >
                  {checked && !mode.disabled ? (
                    <span className="size-2 rounded-full bg-primary" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {mode.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {mode.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {modeInvalid ? (
          <p className="text-xs text-destructive">
            Choose either Standard or Conversation.
          </p>
        ) : null}

        {state.videoInterviewConversation ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border p-3 sm:p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Skills</h3>
              <p className="text-[11px] text-muted-foreground">
                Press Enter to add
              </p>
            </div>
            <Tabs defaultValue="must" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="must" className="gap-1.5 px-2 text-xs">
                  Must
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {mustCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="good" className="gap-1.5 px-2 text-xs">
                  Nice
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {goodCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="bonus" className="gap-1.5 px-2 text-xs">
                  Bonus
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {bonusCount}
                  </span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="must" className="pt-3">
                <VideoSkillEditor
                  skills={state.videoMustHaveSkills}
                  onChange={(skills) => update("videoMustHaveSkills", skills)}
                  required
                  showErrors={showErrors}
                  emptyLabel="No must-have skills yet."
                  addLabel="Add must-have skill"
                />
              </TabsContent>
              <TabsContent value="good" className="pt-3">
                <VideoSkillEditor
                  skills={state.videoGoodToHaveSkills}
                  onChange={(skills) => update("videoGoodToHaveSkills", skills)}
                  emptyLabel="No nice-to-have skills yet."
                  addLabel="Add nice-to-have skill"
                />
              </TabsContent>
              <TabsContent value="bonus" className="pt-3">
                <VideoSkillEditor
                  skills={state.videoBonusSkills}
                  onChange={(skills) => update("videoBonusSkills", skills)}
                  emptyLabel="No bonus skills yet."
                  addLabel="Add bonus skill"
                />
              </TabsContent>
            </Tabs>
          </section>

          <section className="rounded-xl border border-border p-3 sm:p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Topics</h3>
              <p className="text-[11px] text-muted-foreground">
                {focusCount} focus · {avoidCount} avoid
              </p>
            </div>

            <div className="space-y-2">
              {state.videoTopicsFocus.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                  No focus topics yet.
                </p>
              ) : (
                state.videoTopicsFocus.map((topic, index) => {
                  const expanded = expandedTopicId === topic.id;
                  return (
                    <div
                      key={topic.id}
                      className="rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-1.5 p-2">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50"
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedTopicId(expanded ? null : topic.id)
                          }
                        >
                          <ChevronDown
                            aria-hidden
                            className={cn(
                              "size-3.5 shrink-0 text-muted-foreground transition-transform",
                              expanded && "rotate-180"
                            )}
                          />
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                            {topic.name.trim() || `Topic ${index + 1}`}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {topic.discussionMinutes || "—"}m
                          </span>
                        </button>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          className="size-7"
                          aria-label={`Remove topic ${index + 1}`}
                          onClick={() =>
                            update(
                              "videoTopicsFocus",
                              state.videoTopicsFocus.filter(
                                (row) => row.id !== topic.id
                              )
                            )
                          }
                        >
                          <Trash2 aria-hidden className="size-3.5" />
                        </Button>
                      </div>
                      {expanded ? (
                        <div className="space-y-2 border-t border-border p-2.5">
                          <Input
                            value={topic.name}
                            onChange={(event) =>
                              update(
                                "videoTopicsFocus",
                                state.videoTopicsFocus.map((row) =>
                                  row.id === topic.id
                                    ? { ...row, name: event.target.value }
                                    : row
                                )
                              )
                            }
                            placeholder="Topic name"
                            className="text-xs"
                          />
                          <div className="flex items-center gap-2">
                            <label className="shrink-0 text-[11px] text-muted-foreground">
                              Minutes
                            </label>
                            <Input
                              type="number"
                              min={1}
                              max={60}
                              value={topic.discussionMinutes}
                              onChange={(event) =>
                                update(
                                  "videoTopicsFocus",
                                  state.videoTopicsFocus.map((row) =>
                                    row.id === topic.id
                                      ? {
                                          ...row,
                                          discussionMinutes: event.target.value,
                                        }
                                      : row
                                  )
                                )
                              }
                              className="w-20 text-xs"
                            />
                          </div>
                          <Input
                            value={topic.reason}
                            onChange={(event) =>
                              update(
                                "videoTopicsFocus",
                                state.videoTopicsFocus.map((row) =>
                                  row.id === topic.id
                                    ? { ...row, reason: event.target.value }
                                    : row
                                )
                              )
                            }
                            placeholder="Why this topic matters"
                            className="text-xs"
                          />
                          <Textarea
                            value={topic.sampleQuestions}
                            onChange={(event) =>
                              update(
                                "videoTopicsFocus",
                                state.videoTopicsFocus.map((row) =>
                                  row.id === topic.id
                                    ? {
                                        ...row,
                                        sampleQuestions: event.target.value,
                                      }
                                    : row
                                )
                              )
                            }
                            placeholder="Sample questions (one per line)"
                            className="min-h-16 font-mono text-xs"
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const topic = newVideoTopicFocus();
                  update("videoTopicsFocus", [
                    ...state.videoTopicsFocus,
                    topic,
                  ]);
                  setExpandedTopicId(topic.id);
                }}
              >
                <Plus aria-hidden />
                Add focus topic
              </Button>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-foreground">Avoid</p>
              {avoidCount > 0 ? (
                <ul className="flex flex-wrap gap-1.5">
                  {state.videoTopicsAvoid
                    .filter((topic) => topic.text.trim())
                    .map((topic) => (
                      <li
                        key={topic.id}
                        className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/40 py-0.5 pl-2.5 pr-1"
                      >
                        <span className="truncate text-xs text-foreground">
                          {topic.text}
                        </span>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          className="size-5 rounded-full"
                          aria-label={`Remove avoid topic ${topic.text}`}
                          onClick={() =>
                            update(
                              "videoTopicsAvoid",
                              state.videoTopicsAvoid.filter(
                                (row) => row.id !== topic.id
                              )
                            )
                          }
                        >
                          <Trash2 aria-hidden className="size-3" />
                        </Button>
                      </li>
                    ))}
                </ul>
              ) : null}
              <div className="flex gap-2">
                <Input
                  value={avoidDraft}
                  onChange={(event) => setAvoidDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addAvoidTopic();
                    }
                  }}
                  placeholder="Topic to skip"
                  className="flex-1 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addAvoidTopic}
                  disabled={!avoidDraft.trim()}
                >
                  <Plus aria-hidden />
                  Add
                </Button>
              </div>
            </div>
          </section>
        </div>
        ) : (
          <VideoStandardQuestionsEditor
            state={state}
            update={update}
            showErrors={showErrors}
          />
        )}
      </div>
    </StepCard>
  );
}

function VideoStandardQuestionsEditor({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: Update;
  showErrors: boolean;
}) {
  const questionsInvalid =
    showErrors && state.questions.every((question) => !question.text.trim());

  function updateQuestion(id: string, patch: Partial<BuilderQuestion>) {
    update(
      "questions",
      state.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      )
    );
  }

  return (
    <section
      className={cn(
        "space-y-3 rounded-xl border border-border p-3 sm:p-4",
        questionsInvalid && "ring-1 ring-destructive/60"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Interview questions
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            These prompts are sent to Hyrefast when you launch.
          </p>
        </div>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {state.questions.filter((q) => q.text.trim()).length} added
        </p>
      </div>

      {state.questions.map((question, index) => (
        <div
          key={question.id}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              Q{index + 1}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              className="ml-auto"
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
            placeholder="e.g. Describe a project where you owned the outcome end to end"
            className="min-h-16 text-sm"
          />
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
        <p className="text-xs text-muted-foreground">Maximum 12 questions.</p>
      )}

      {questionsInvalid ? (
        <p className="text-xs text-destructive">
          Add at least one interview question.
        </p>
      ) : null}
    </section>
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
      description="Build the conversational script. Type, required, follow-ups, and expected variables are saved with the screening and used on launch."
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
                  value &&
                  updateQuestion(question.id, { type: value as QuestionType })
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
                Capture answer
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
                hint="Used by the voice agent when the answer is vague — not read as a scripted line."
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
                hint="Answer field key for the call result (e.g. notice_period → notice_period_answer)."
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

function questionAnswerVariable(question: BuilderQuestion): string {
  return question.expectedVariable
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function questionAnswerLabel(question: BuilderQuestion, index: number): string {
  const text = question.text.trim().replace(/\s+/g, " ");
  if (text) {
    return text.length > 72 ? `${text.slice(0, 69)}…` : text;
  }
  return `Question ${index + 1}`;
}

function answerCaptureQuestions(state: BuilderState): BuilderQuestion[] {
  return state.questions.filter(
    (question) =>
      question.evaluationEnabled &&
      question.text.trim() &&
      questionAnswerVariable(question)
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
  const answerQuestions = answerCaptureQuestions(state);

  return (
    <StepCard
      title="Evaluation"
      description="Capture each question answer as text. Only Communication is scored for shortlist decisions."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Communication score</p>
          <p className="text-xs text-muted-foreground">
            The voice agent returns a single 0–100 communication score. That score
            is the overall result used against the shortlist threshold below.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground">
            Scored category:{" "}
            <span className="font-medium">Communication</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Question answers</p>
          <p className="text-xs text-muted-foreground">
            Questions with “Capture answer” enabled and an expected variable store
            the candidate’s spoken answer as text — they are not point-scored.
          </p>
          {answerQuestions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
              No answer fields yet. In the Questions step, enable “Capture answer”
              and set an expected variable (e.g. notice_period).
            </p>
          ) : (
            <div className="space-y-2">
              {answerQuestions.map((question, index) => {
                const variable = questionAnswerVariable(question);
                const label = questionAnswerLabel(question, index);
                return (
                  <div
                    key={question.id}
                    className="rounded-lg border border-border px-3 py-2"
                  >
                    <p className="text-sm text-foreground">
                      <span className="mr-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                        Q
                        {state.questions.findIndex((q) => q.id === question.id) +
                          1}
                      </span>
                      {label}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {variable}_answer
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Knockout criteria</p>
          <p className="text-xs text-muted-foreground">
            A failed knockout forces a Reject recommendation regardless of
            communication score.
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
          label="Minimum communication score to shortlist"
          htmlFor="scr-min-score"
          hint="Candidates at or above this communication score get an AI Shortlist recommendation."
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
  const capturedAnswers = answerCaptureQuestions(state);
  const steps = stepsForMode(state);

  function goToStep(stepId: StepId) {
    const index = steps.findIndex((step) => step.id === stepId);
    if (index >= 0) goTo(index);
  }

  const sections: {
    stepId: StepId;
    icon: typeof AudioLines;
    title: string;
    lines: string[];
  }[] = [
    {
      stepId: "details",
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
      stepId: "candidates",
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
      stepId: "agent",
      icon: state.screeningMode === "video" ? Video : AudioLines,
      title: "Agent",
      lines:
        state.screeningMode === "video"
          ? state.videoInterviewConversation
            ? [
                "Conversation mode",
                `${state.videoMustHaveSkills.filter((s) => s.skillName.trim()).length} must-have · ${state.videoGoodToHaveSkills.filter((s) => s.skillName.trim()).length} good-to-have · ${state.videoBonusSkills.filter((s) => s.skillName.trim()).length} bonus skills`,
                `${state.videoTopicsFocus.filter((t) => t.name.trim()).length} focus topics · ${state.videoTopicsAvoid.filter((t) => t.text.trim()).length} avoid`,
              ]
            : [
                "Standard mode",
                `${activeQuestions.length} interview question${activeQuestions.length === 1 ? "" : "s"}`,
                ...activeQuestions.slice(0, 3).map(
                  (question, index) =>
                    `Q${index + 1}: ${questionAnswerLabel(question, index)}`
                ),
                activeQuestions.length > 3
                  ? `+${activeQuestions.length - 3} more`
                  : null,
              ].filter((line): line is string => Boolean(line))
          : [
              `${SCREENING_LANGUAGE_OPTIONS.find((o) => o.value === state.language)?.label || state.language} · ${SCREENING_VOICE_OPTIONS.find((o) => o.value === state.voice)?.label || state.voice} · ${SCREENING_TONE_OPTIONS.find((o) => o.value === state.tone)?.label || state.tone}`,
              isRoshniAgentPrompt(state.agentPrompt)
                ? "Roshni agent prompt configured"
                : "Custom agent prompt configured",
            ],
    },
    ...(state.screeningMode === "voice"
      ? [
          {
            stepId: "questions" as const,
            icon: ListChecks,
            title: "Questions",
            lines: [
              `${activeQuestions.length} questions`,
              `${activeQuestions.filter((q) => q.required).length} required · ${activeQuestions.filter((q) => q.evaluationEnabled).length} capture answers · ${activeQuestions.filter((q) => q.followUp.trim()).length} with follow-ups`,
              ...activeQuestions.slice(0, 3).map((question, index) => {
                const bits = [
                  `Q${index + 1} ${question.type}`,
                  question.expectedVariable.trim()
                    ? `→ ${question.expectedVariable.trim()}`
                    : null,
                  question.required ? "required" : null,
                ].filter(Boolean);
                return bits.join(" · ");
              }),
              activeQuestions.length > 3
                ? `+${activeQuestions.length - 3} more`
                : null,
            ].filter((line): line is string => Boolean(line)),
          },
        ]
      : []),
    ...(state.screeningMode === "voice"
      ? [
          {
            stepId: "evaluation" as const,
            icon: CheckCircle2,
            title: "Evaluation",
            lines: [
              `Shortlist at communication ≥ ${state.minShortlistScore}/100`,
              `${capturedAnswers.length} answer field${capturedAnswers.length === 1 ? "" : "s"} · ${state.knockouts.length} knockout${state.knockouts.length === 1 ? "" : "s"}`,
            ],
          },
        ]
      : []),
    ...(state.screeningMode === "voice"
      ? [
          {
            stepId: "call" as const,
            icon: AudioLines,
            title: "Call settings",
            lines: [
              `${state.attempts} attempts · ${state.delay} apart`,
              `${state.callWindow} · ${state.timezone}`,
              `Retry on no answer · ${state.voicemail}`,
            ],
          },
        ]
      : []),
  ];

  return (
    <StepCard
      title="Review and Launch"
      description={
        state.screeningMode === "video"
          ? "Review the video screening setup before launch."
          : "Everything the voice agent will do. No calls are placed from this UI preview."
      }
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
                  onClick={() => goToStep(section.stepId)}
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

const VIDEO_OUTCOME_COPY: Record<Outcome, { title: string; description: string }> = {
  draft: {
    title: "Draft saved",
    description:
      "Your video screening was saved as a draft. Finish and launch it any time from the AI Screening home.",
  },
  launched: {
    title: "Video screening launched",
    description:
      "Interview links were created for eligible candidates. Share or deliver those invites to start async video interviews.",
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
  const base: ScreeningCreateInput = {
    name: state.name.trim(),
    ownerUserId: state.ownerUserId || undefined,
    jobId: state.jobId || null,
    description: state.description.trim() || null,
    objective: state.objective || null,
    modality: state.screeningMode,
    language: state.language,
    voice: state.voice,
    tone: state.tone,
    introductionScript: state.introduction,
    agentPrompt: state.agentPrompt,
    questions: state.questions
      .filter((q) => q.text.trim())
      .map((q) => ({
        id: q.id,
        prompt: q.text.trim(),
        type: q.type,
        required: q.required,
        followUp: q.followUp.trim() || null,
        expectedVariable: q.expectedVariable.trim() || null,
        evaluationEnabled: q.evaluationEnabled,
      })),
    evaluationCriteria: [
      {
        id: "communication",
        label: "Communication score",
        weight: 1,
        description:
          "Score 0-100 for how clearly and professionally the candidate communicates during the call. Do not score individual screening questions.",
      },
    ],
    minShortlistScore: Number(state.minShortlistScore) || 70,
    knockouts: state.knockouts,
    callSettings: {
      maxAttempts: Number.parseInt(state.attempts, 10) || 2,
      attemptIntervalHours: Number.parseInt(state.delay, 10) || 24,
      maxRetryCount: 2,
      retryIntervalHours: 6,
      consentRequired: true,
      callWindow: state.callWindow,
      timezone: state.timezone,
      voicemailBehaviour: state.voicemail,
    },
    candidateIds,
  };

  if (state.screeningMode !== "video") return base;

  return {
    ...base,
    videoConfig: {
      mustHaveSkills: state.videoMustHaveSkills
        .filter((skill) => skill.skillName.trim())
        .map((skill) => ({
          skillName: skill.skillName.trim().slice(0, 60),
          proficiency: toUiSkillProficiency(skill.proficiency),
        })),
      goodToHaveSkills: state.videoGoodToHaveSkills
        .filter((skill) => skill.skillName.trim())
        .map((skill) => ({
          skillName: skill.skillName.trim().slice(0, 60),
          proficiency: toUiSkillProficiency(skill.proficiency),
        })),
      bonusSkills: state.videoBonusSkills
        .filter((skill) => skill.skillName.trim())
        .map((skill) => ({
          skillName: skill.skillName.trim().slice(0, 60),
          proficiency: toUiSkillProficiency(skill.proficiency),
        })),
      topicsFocus: state.videoTopicsFocus
        .filter((topic) => topic.name.trim())
        .map((topic) => ({
          name: topic.name.trim().slice(0, 200),
          discussionMinutes: Number(topic.discussionMinutes) || null,
          reason: topic.reason.trim() || null,
          sampleQuestions: topic.sampleQuestions
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        })),
      topicsAvoid: state.videoTopicsAvoid
        .map((topic) => topic.text.trim())
        .filter(Boolean),
      interviewStandard: state.videoInterviewStandard,
      interviewConversation: state.videoInterviewConversation,
    },
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
  const [videoDefaultsLoading, setVideoDefaultsLoading] = useState(false);
  const [videoDefaultsError, setVideoDefaultsError] = useState<string | null>(
    null
  );
  const [videoDefaultsJobTitle, setVideoDefaultsJobTitle] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (state.screeningMode !== "video" || !state.jobId) {
      setVideoDefaultsLoading(false);
      setVideoDefaultsError(null);
      if (!state.jobId) setVideoDefaultsJobTitle(null);
      return;
    }

    let cancelled = false;
    const jobId = state.jobId;
    setVideoDefaultsLoading(true);
    setVideoDefaultsError(null);

    void jobsApi
      .getById(jobId)
      .then((detail) => {
        if (cancelled) return;
        if (!detail) {
          setVideoDefaultsError("Could not load the selected job.");
          setVideoDefaultsJobTitle(null);
          return;
        }
        const defaults = videoDefaultsFromJob(detail);
        setVideoDefaultsJobTitle(detail.title);
        setState((previous) => {
          if (
            previous.jobId !== jobId ||
            previous.screeningMode !== "video"
          ) {
            return previous;
          }
          return { ...previous, ...defaults };
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setVideoDefaultsError(
          getApiErrorMessage(error, "Unable to load job defaults.")
        );
        setVideoDefaultsJobTitle(null);
      })
      .finally(() => {
        if (!cancelled) setVideoDefaultsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state.jobId, state.screeningMode]);

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

  const steps = stepsForMode(state);
  const currentStepId = steps[current]?.id ?? "details";
  const currentErrors = stepErrorsById(currentStepId, state);
  const showErrors = attempted.has(current);
  const launchErrors = allErrors(state);
  const reachable = maxReachableStep(state);

  useEffect(() => {
    if (current >= steps.length) {
      setCurrent(Math.max(0, steps.length - 1));
    }
  }, [current, steps.length]);

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
    goTo(Math.min(current + 1, steps.length - 1));
  }

  async function submit(mode: Outcome) {
    if (mode === "launched" && launchErrors.length > 0) {
      setAttempted(new Set(steps.map((_, index) => index)));
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
    const copy =
      state.screeningMode === "video"
        ? VIDEO_OUTCOME_COPY[outcome]
        : OUTCOME_COPY[outcome];
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
    <div className="flex min-h-[calc(100svh-5.5rem)] flex-col gap-4">
      <nav
        aria-label="Screening builder steps"
        className="rounded-xl border border-border bg-card p-4"
      >
        <Stepper
          steps={steps}
          currentStep={current}
          onStepSelect={goTo}
          maxEnabledStep={reachable}
          errorSteps={
            new Set(
              steps
                .map((step, index) => ({ step, index }))
                .filter(
                  ({ step, index }) =>
                    attempted.has(index) &&
                    stepErrorsById(step.id, state).length > 0
                )
                .map(({ index }) => index)
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

      {currentStepId === "details" ? (
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
      ) : currentStepId === "candidates" ? (
        <AudienceStep
          state={state}
          update={update}
          showErrors={showErrors}
          title="Candidate Selection"
          description={
            state.screeningMode === "video"
              ? "Choose who receives the video screening invite."
              : "Choose who receives the voice screening call. Candidates without a phone number are skipped."
          }
          sourceErrorLabel="Choose where screening candidates come from."
          importListNamePrefix="Screening import"
          importListDescription="Candidates imported for an AI screening batch"
          importListTags={["screening-import"]}
        />
      ) : currentStepId === "agent" ? (
        state.screeningMode === "video" ? (
          <VideoAgentStep
            state={state}
            update={update}
            showErrors={showErrors}
            jobTitle={videoDefaultsJobTitle}
            defaultsLoading={videoDefaultsLoading}
            defaultsError={videoDefaultsError}
          />
        ) : (
          <AgentStep
            state={state}
            update={update}
            showErrors={showErrors}
            voiceDefaults={voiceDefaults}
          />
        )
      ) : currentStepId === "questions" ? (
        <QuestionsStep state={state} update={update} />
      ) : currentStepId === "evaluation" ? (
        <EvaluationStep state={state} update={update} showErrors={showErrors} />
      ) : currentStepId === "call" ? (
        <CallSettingsStep state={state} update={update} />
      ) : (
        <ReviewStep state={state} errors={launchErrors} goTo={goTo} jobs={jobs} />
      )}

      <div className="sticky bottom-0 z-20 mt-auto flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/95 p-4 backdrop-blur supports-backdrop-filter:bg-card/90">
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

          {current < steps.length - 1 ? (
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

        {current === steps.length - 1 && launchErrors.length > 0 ? (
          <p className="w-full text-right text-xs text-destructive">
            Resolve the errors above to launch.
          </p>
        ) : null}
      </div>
    </div>
  );
}
