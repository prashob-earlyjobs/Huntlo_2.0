import type { ApiOutreachCampaign, ApiCampaignSequenceStep } from "@/lib/api";
import {
  ANSWER_TYPES,
  CAMPAIGN_OBJECTIVES,
  CHANNEL_CONFIGS,
  MAX_QUALIFICATION_QUESTIONS,
  RETRY_OPTIONS,
  SEND_WINDOWS,
  TAKEOVER_CONDITIONS,
  TIMEZONE_OPTIONS,
  suggestQuestionTitle,
  type AnswerType,
  type AudienceSource,
  type ChannelConnection,
  type DelayUnit,
  type OutreachChannel,
  type SequenceStep,
  type SequenceStepType,
} from "@/lib/mock-outreach";
import { initialBuilderState, type BuilderState } from "@/components/outreach/builder-types";

const STEP_TYPE_FROM_API: Record<string, SequenceStepType> = {
  email: "Send Email",
  whatsapp: "Send WhatsApp",
  ai_voice: "Start AI Voice Call",
  wait: "Wait",
  conditional: "Conditional Branch",
  recruiter_task: "Create Recruiter Task",
  scheduling_link: "Send Scheduling Link",
};

const SOURCE_FROM_API: Record<string, AudienceSource> = {
  candidate_pool: "Candidate Pool",
  saved_list: "Saved List",
  import: "CSV/Excel Import",
  manual: "Manual Add",
  job: "Candidate Pool",
};

function asAnswerType(value: string): AnswerType {
  return (ANSWER_TYPES as readonly string[]).includes(value)
    ? (value as AnswerType)
    : "Short text";
}

function asDelayUnit(value: string | undefined | null): DelayUnit {
  if (value === "hours" || value === "minutes" || value === "days") return value;
  return "days";
}

function hydrateSteps(steps: ApiCampaignSequenceStep[]): SequenceStep[] {
  const mapped = [...steps]
    .sort((a, b) => a.order - b.order)
    .map((step) => ({
      id: step.id,
      type: STEP_TYPE_FROM_API[step.type] ?? "Wait",
      delayDays: step.delayDays ?? 0,
      delayUnit: asDelayUnit(step.delayUnit),
      template: step.templateId || "Blank message",
      templateId: step.templateId ?? null,
      subject: step.subject ?? "",
      body: step.body ?? "",
      sendWindow: SEND_WINDOWS[1],
      retry: RETRY_OPTIONS[0],
      stopOnReply: step.stopOnReply ?? true,
      note: step.note ?? "",
    }));
  // Never open the editor on a leading Wait — first step must be a send.
  const firstMessage = mapped.findIndex(
    (step) =>
      step.type === "Send Email" ||
      step.type === "Send WhatsApp" ||
      step.type === "Start AI Voice Call" ||
      step.type === "Send Scheduling Link"
  );
  return firstMessage > 0 ? mapped.slice(firstMessage) : mapped;
}

function sourceFromCampaign(campaign: ApiOutreachCampaign): {
  source: AudienceSource;
  sourceDetail: string;
  selectedCandidateIds: string[];
} {
  const type = campaign.candidateSource?.type || "manual";
  const source = SOURCE_FROM_API[type] ?? "Manual Add";
  const listId = campaign.candidateSource?.listId || "";
  const fromSource = campaign.candidateSource?.candidateIds || [];

  if (source === "Saved List" || source === "CSV/Excel Import") {
    return {
      source,
      sourceDetail: listId,
      selectedCandidateIds: fromSource,
    };
  }

  return {
    source: fromSource.length > 0 ? "Manual Add" : source,
    sourceDetail: campaign.candidateSource?.label || "",
    selectedCandidateIds: fromSource,
  };
}

/** Build builder state from a live campaign + optional enrolled candidate ids. */
export function builderStateFromCampaign(
  campaign: ApiOutreachCampaign,
  enrolledCandidateIds: string[] = []
): BuilderState {
  const base = initialBuilderState();
  const { source, sourceDetail, selectedCandidateIds } =
    sourceFromCampaign(campaign);

  const ids =
    enrolledCandidateIds.length > 0
      ? enrolledCandidateIds
      : selectedCandidateIds;

  const enabledChannels: OutreachChannel[] = [];
  if (campaign.channelConfig?.email?.enabled) enabledChannels.push("Email");
  if (campaign.channelConfig?.whatsapp?.enabled) enabledChannels.push("WhatsApp");
  if (campaign.channelConfig?.ai_voice?.enabled) enabledChannels.push("AI Voice");

  const timezoneRaw = campaign.channelConfig?.timezone || "";
  const timezone = (TIMEZONE_OPTIONS as readonly string[]).includes(timezoneRaw)
    ? timezoneRaw
    : TIMEZONE_OPTIONS[0];

  const steps = hydrateSteps(campaign.sequenceSteps || []);
  const questions =
    campaign.qualificationConfig?.questions?.map((question) => {
      const text = question.prompt;
      const title =
        ("title" in question && typeof question.title === "string"
          ? question.title
          : ""
        ).trim() || suggestQuestionTitle(text);
      return {
        id: question.id,
        title,
        text,
        answerType: asAnswerType(question.answerType),
        knockout: Boolean(question.knockout),
        knockoutCondition: question.knockoutCondition || "",
      };
    }) ?? base.questions;
  const cappedQuestions = questions.slice(0, MAX_QUALIFICATION_QUESTIONS);

  return {
    ...base,
    name: campaign.name || "",
    jobId: campaign.jobId,
    objective: campaign.objective?.trim() || CAMPAIGN_OBJECTIVES[0],
    owner: campaign.ownerName || base.owner,
    ownerUserId: campaign.ownerUserId || null,
    description: campaign.description || "",
    timezone,
    campaignType:
      campaign.campaignType === "single_channel"
        ? "Single Channel"
        : "Multi-Channel",
    source,
    sourceDetail,
    selectedCandidateIds: ids,
    audiencePreview:
      ids.length > 0
        ? {
            selected: ids.length,
            withEmail: ids.length,
            withPhone: ids.length,
            duplicates: 0,
            invalid: 0,
          }
        : null,
    enabledChannels:
      enabledChannels.length > 0 ? enabledChannels : base.enabledChannels,
    connections: Object.fromEntries(
      CHANNEL_CONFIGS.map((config) => [
        config.channel,
        "Disconnected" as ChannelConnection,
      ])
    ) as Record<OutreachChannel, ChannelConnection>,
    steps: steps.length > 0 ? steps : base.steps,
    classificationEnabled: true,
    questions: cappedQuestions,
    aiReplyEnabled: true,
    takeoverCondition:
      campaign.qualificationConfig?.takeoverCondition &&
      (TAKEOVER_CONDITIONS as readonly string[]).includes(
        campaign.qualificationConfig.takeoverCondition
      )
        ? campaign.qualificationConfig.takeoverCondition
        : TAKEOVER_CONDITIONS[2],
    autoScreening: Boolean(campaign.qualificationConfig?.autoScreening),
    autoCalendly: Boolean(campaign.schedulingConfig?.enabled),
  };
}
