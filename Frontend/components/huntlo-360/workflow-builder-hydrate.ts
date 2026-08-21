import type { ApiHuntlo360Workflow } from "@/lib/api";
import {
  AI_RESPONSE_MODES,
  AUTO_SHORTLIST_CONDITIONS,
  BOOKING_EXPIRY_OPTIONS,
  CALENDLY_EVENT_TYPES,
  HANDOFF_CONDITIONS,
  REMINDER_OPTIONS,
  SCREENING_LANGUAGES,
  VOICE_TONES,
} from "@/lib/mock-360";
import type { AudienceSource, DelayUnit } from "@/lib/mock-outreach";

import {
  initialWorkflowBuilderState,
  type WorkflowBuilderState,
} from "@/components/huntlo-360/workflow-builder-state";

const SOURCE_FROM_API: Record<string, AudienceSource> = {
  candidate_pool: "Candidate Pool",
  saved_list: "Saved List",
  import: "CSV/Excel Import",
  ats: "Import from ATS",
  manual: "Manual Add",
  sourcing: "Sourcing Session",
  sourcing_session: "Sourcing Session",
  job: "Candidate Pool",
};

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

function asDelayUnit(value: string | undefined | null): DelayUnit {
  if (value === "hours" || value === "minutes" || value === "days") return value;
  return "days";
}

function pickOption<T extends string>(
  options: readonly T[],
  value: string | null | undefined,
  fallback: T
): T {
  if (value && (options as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

function sourceFromWorkflow(workflow: ApiHuntlo360Workflow): {
  source: AudienceSource;
  sourceDetail: string;
  selectedCandidateIds: string[];
} {
  const type = workflow.candidateSource?.type || "manual";
  const listId = workflow.candidateSource?.listId || "";
  const label = workflow.candidateSource?.label || "";
  const fromSource = workflow.candidateSource?.candidateIds || [];
  let source = SOURCE_FROM_API[type] ?? "Manual Add";

  // Autosave stores sourcing sessions as type=manual with the session id in label.
  if (
    source === "Manual Add" &&
    fromSource.length === 0 &&
    OBJECT_ID_RE.test(label)
  ) {
    source = "Sourcing Session";
  }

  if (source === "Saved List" || source === "CSV/Excel Import") {
    return {
      source,
      sourceDetail: listId,
      selectedCandidateIds: fromSource,
    };
  }

  if (source === "Sourcing Session") {
    return {
      source,
      sourceDetail: listId || label,
      selectedCandidateIds: fromSource,
    };
  }

  return {
    source: fromSource.length > 0 ? "Manual Add" : source,
    sourceDetail: label,
    selectedCandidateIds: fromSource,
  };
}

function bookingExpiryLabel(hours: number | undefined): string {
  if (hours === 168) return "7 days";
  if (hours === 336) return "14 days";
  if (hours === 72) return "3 days";
  return (
    BOOKING_EXPIRY_OPTIONS.find((option) => option.startsWith(String(hours))) ||
    BOOKING_EXPIRY_OPTIONS[1]
  );
}

function attemptIntervalLabel(hours: number | undefined): string {
  const options = ["4 hours", "12 hours", "24 hours", "48 hours"] as const;
  if (hours == null) return "24 hours";
  const match = options.find((option) => Number.parseInt(option, 10) === hours);
  return match || "24 hours";
}

/** Build builder state from a saved Huntlo 360 workflow. */
export function builderStateFromWorkflow(
  workflow: ApiHuntlo360Workflow
): WorkflowBuilderState {
  const base = initialWorkflowBuilderState();
  const { source, sourceDetail, selectedCandidateIds } =
    sourceFromWorkflow(workflow);
  const outreach = workflow.outreachConfig;
  const qualification = workflow.qualificationConfig;
  const screening = workflow.screeningConfig;
  const scheduling = workflow.schedulingConfig;

  const followUps =
    outreach?.followUps
      ?.map((entry) => {
        if (typeof entry === "string") {
          return {
            body: entry,
            delayDays: 2,
            delayUnit: "days" as DelayUnit,
            templateId: null as string | null,
          };
        }
        return {
          body: entry.body || "",
          delayDays: entry.delayDays ?? 2,
          delayUnit: asDelayUnit(entry.delayUnit),
          templateId: entry.templateId ?? null,
        };
      })
      .filter((entry) => entry.body.trim() || entry.templateId) ?? base.followUps;

  const questions =
    qualification?.questions
      ?.filter((question) => question.prompt?.trim())
      .map((question) => ({
        id: question.id,
        text: question.prompt,
        knockoutAnswer: question.knockoutCondition?.trim() || "",
      })) ?? base.questions;

  const channelOrder =
    outreach?.channelOrder === "whatsapp_first"
      ? "WhatsApp first"
      : outreach?.channelOrder === "voice_first"
        ? "AI Voice first"
        : "Email first";

  const schedulingChannel =
    scheduling?.channel === "whatsapp" ? "WhatsApp" : "Email";

  return {
    ...base,
    name: workflow.name || "",
    jobId: workflow.jobId || "",
    ownerUserId: workflow.ownerUserId || null,
    owner: workflow.owner || "",
    source,
    sourceDetail,
    selectedCandidateIds,
    audiencePreview:
      selectedCandidateIds.length > 0
        ? {
            selected: selectedCandidateIds.length,
            withEmail: selectedCandidateIds.length,
            withPhone: 0,
            duplicates: 0,
            invalid: 0,
          }
        : base.audiencePreview,
    emailEnabled: outreach?.emailEnabled ?? base.emailEnabled,
    whatsappEnabled: outreach?.whatsappEnabled ?? base.whatsappEnabled,
    aiVoiceEnabled: outreach?.aiVoiceEnabled ?? base.aiVoiceEnabled,
    campaignType:
      outreach?.campaignType === "multi_channel"
        ? "Multi-Channel"
        : "Single Channel",
    channelOrder,
    openingMessage: outreach?.openingMessage?.trim() || base.openingMessage,
    openingWhatsAppTemplateId: outreach?.openingWhatsAppTemplateId ?? null,
    followUps: followUps.length > 0 ? followUps : base.followUps,
    interestClassification:
      qualification?.interestClassification ?? base.interestClassification,
    questions: questions.length > 0 ? questions : base.questions,
    aiResponseMode: qualification?.aiReplyEnabled
      ? AI_RESPONSE_MODES[0]
      : AI_RESPONSE_MODES[2],
    handoffCondition: pickOption(
      HANDOFF_CONDITIONS,
      qualification?.handoffCondition,
      base.handoffCondition as (typeof HANDOFF_CONDITIONS)[number]
    ),
    autoShortlist: pickOption(
      AUTO_SHORTLIST_CONDITIONS,
      qualification?.autoShortlist,
      base.autoShortlist as (typeof AUTO_SHORTLIST_CONDITIONS)[number]
    ),
    screeningEnabled: screening?.enabled ?? base.screeningEnabled,
    language: pickOption(
      SCREENING_LANGUAGES,
      screening?.language,
      base.language as (typeof SCREENING_LANGUAGES)[number]
    ),
    voiceTone: pickOption(
      VOICE_TONES,
      screening?.voiceTone,
      base.voiceTone as (typeof VOICE_TONES)[number]
    ),
    screeningQuestions:
      screening?.questions?.filter((question) => question.trim()).length
        ? screening.questions.filter((question) => question.trim())
        : base.screeningQuestions,
    evaluationFields:
      screening?.evaluationFields?.length
        ? screening.evaluationFields
        : base.evaluationFields,
    attempts: String(screening?.attempts ?? Number.parseInt(base.attempts, 10)),
    attemptInterval: attemptIntervalLabel(screening?.attemptIntervalHours),
    minScore: String(screening?.minScore ?? Number.parseInt(base.minScore, 10)),
    autoReject: screening?.autoReject ?? base.autoReject,
    eventType: pickOption(
      CALENDLY_EVENT_TYPES,
      scheduling?.eventTypeUri,
      base.eventType as (typeof CALENDLY_EVENT_TYPES)[number]
    ),
    schedulingChannel,
    reminders: pickOption(
      REMINDER_OPTIONS,
      scheduling?.reminders,
      base.reminders as (typeof REMINDER_OPTIONS)[number]
    ),
    autoSendAfterQualification:
      scheduling?.autoSendAfterQualification ?? base.autoSendAfterQualification,
    autoSendAfterScreening:
      scheduling?.autoSendAfterScreening ??
      (screening?.onPass === "scheduling" || base.autoSendAfterScreening),
    bookingExpiry: bookingExpiryLabel(scheduling?.bookingExpiryHours),
  };
}
