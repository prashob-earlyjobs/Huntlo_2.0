import {
  AUDIENCE_STATS,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_TYPES,
  CHANNEL_CONFIGS,
  CREDITS_AVAILABLE,
  DEFAULT_QUESTIONS,
  DEFAULT_SEQUENCE,
  reachableCount,
  STEP_CHANNELS,
  TAKEOVER_CONDITIONS,
  TIMEZONE_OPTIONS,
  type AudienceSource,
  type AudienceStats,
  type ChannelConnection,
  type OutreachChannel,
  type QualificationQuestion,
  type SequenceStep,
} from "@/lib/mock-outreach";

export interface BuilderState {
  /* Step 1 — setup */
  name: string;
  jobId: string | null;
  objective: string;
  owner: string;
  description: string;
  timezone: string;
  campaignType: string;

  /* Step 2 — audience */
  source: AudienceSource | null;
  sourceDetail: string;
  /** Explicit picks (Manual / Pool subset / CSV after import). */
  selectedCandidateIds: string[];
  poolSearch: string;
  audiencePreview: AudienceStats | null;

  /* Step 3 — channels */
  enabledChannels: OutreachChannel[];
  connections: Record<OutreachChannel, ChannelConnection>;

  /* Step 4 — sequence */
  steps: SequenceStep[];

  /* Step 5 — qualification */
  classificationEnabled: boolean;
  questions: QualificationQuestion[];
  aiReplyEnabled: boolean;
  takeoverCondition: string;
  autoScreening: boolean;
  autoCalendly: boolean;
}

export function initialBuilderState(): BuilderState {
  return {
    name: "",
    jobId: null,
    objective: CAMPAIGN_OBJECTIVES[0],
    owner: "Ananya Sharma",
    description: "",
    timezone: TIMEZONE_OPTIONS[0],
    campaignType: CAMPAIGN_TYPES[1],
    source: null,
    sourceDetail: "",
    selectedCandidateIds: [],
    poolSearch: "",
    audiencePreview: null,
    enabledChannels: ["Email"],
    connections: Object.fromEntries(
      CHANNEL_CONFIGS.map((config) => [config.channel, config.connection])
    ) as Record<OutreachChannel, ChannelConnection>,
    steps: DEFAULT_SEQUENCE.map((step) => ({ ...step })),
    classificationEnabled: true,
    questions: DEFAULT_QUESTIONS.map((question) => ({ ...question })),
    aiReplyEnabled: true,
    takeoverCondition: TAKEOVER_CONDITIONS[1],
    autoScreening: false,
    autoCalendly: true,
  };
}

export type UpdateBuilder = <K extends keyof BuilderState>(
  key: K,
  value: BuilderState[K]
) => void;

/* ------------------------------------------------------------------ */
/* Derived values                                                       */
/* ------------------------------------------------------------------ */

export function audienceStats(state: BuilderState): AudienceStats | null {
  if (state.audiencePreview) return state.audiencePreview;
  return state.source ? AUDIENCE_STATS[state.source] : null;
}

export function messageSteps(state: BuilderState): SequenceStep[] {
  return state.steps.filter((step) => STEP_CHANNELS[step.type] !== undefined);
}

/** Estimated credits for the whole campaign against the reachable audience. */
export function estimatedCredits(state: BuilderState): number {
  const stats = audienceStats(state);
  if (!stats) return 0;
  const audience = reachableCount(stats);
  return messageSteps(state).reduce((total, step) => {
    const channel = STEP_CHANNELS[step.type]!;
    const config = CHANNEL_CONFIGS.find((entry) => entry.channel === channel)!;
    return total + config.costPerMessage * audience;
  }, 0);
}

export interface LaunchWarning {
  id: string;
  severity: "error" | "warning";
  text: string;
}

export function stepErrors(step: number, state: BuilderState): string[] {
  const errors: string[] = [];
  switch (step) {
    case 0: {
      if (!state.name.trim()) errors.push("Campaign name is required.");
      if (!state.objective) errors.push("Pick a campaign objective.");
      if (!state.owner) errors.push("Assign a campaign owner.");
      break;
    }
    case 1: {
      if (!state.source) {
        errors.push("Choose where the campaign audience comes from.");
        break;
      }
      if (state.source === "Saved List" && !state.sourceDetail) {
        errors.push("Select a saved list.");
      }
      if (state.source === "Sourcing Session" && !state.sourceDetail) {
        errors.push("Select a sourcing session.");
      }
      if (
        state.source === "Manual Add" &&
        state.selectedCandidateIds.length === 0
      ) {
        errors.push("Pick at least one candidate to enroll.");
      }
      if (
        state.source === "CSV/Excel Import" &&
        state.selectedCandidateIds.length === 0
      ) {
        errors.push("Import a CSV/Excel file before continuing.");
      }
      if (
        state.audiencePreview &&
        state.audiencePreview.selected === 0 &&
        state.source !== "CSV/Excel Import"
      ) {
        errors.push("This audience has no candidates yet.");
      }
      break;
    }
    case 2: {
      if (state.enabledChannels.length === 0)
        errors.push("Enable at least one channel to send messages.");
      const disconnected = state.enabledChannels.filter(
        (channel) => state.connections[channel] === "Disconnected"
      );
      disconnected.forEach((channel) =>
        errors.push(`${channel} is enabled but the provider is disconnected.`)
      );
      break;
    }
    case 3: {
      if (messageSteps(state).length === 0)
        errors.push("Add at least one message step to the sequence.");
      const orphaned = messageSteps(state).filter(
        (step) => !state.enabledChannels.includes(STEP_CHANNELS[step.type]!)
      );
      orphaned.forEach((step) =>
        errors.push(
          `“${step.type}” uses a channel that isn't enabled in the Channels step.`
        )
      );
      break;
    }
    case 4: {
      state.questions.forEach((question, index) => {
        if (!question.text.trim())
          errors.push(`Qualification question ${index + 1} is empty.`);
      });
      break;
    }
  }
  return errors;
}

export function launchWarnings(state: BuilderState): LaunchWarning[] {
  const warnings: LaunchWarning[] = [];
  for (let step = 0; step <= 4; step += 1) {
    stepErrors(step, state).forEach((error, index) =>
      warnings.push({ id: `s${step}-${index}`, severity: "error", text: error })
    );
  }

  const stats = state.audiencePreview;
  if (stats) {
    const missingEmail = stats.selected - stats.withEmail;
    const missingPhone = stats.selected - stats.withPhone;
    if (state.enabledChannels.includes("Email") && missingEmail > 0) {
      warnings.push({
        id: "missing-email",
        severity: "warning",
        text: `${missingEmail} candidates have no email address and will skip email steps.`,
      });
    }
    if (
      (state.enabledChannels.includes("WhatsApp") ||
        state.enabledChannels.includes("AI Voice")) &&
      missingPhone > 0
    ) {
      warnings.push({
        id: "missing-phone",
        severity: "warning",
        text: `${missingPhone} candidates have no phone number and will skip WhatsApp / voice steps.`,
      });
    }
  }

  state.enabledChannels.forEach((channel) => {
    if (state.connections[channel] === "Needs attention") {
      const config = CHANNEL_CONFIGS.find((entry) => entry.channel === channel)!;
      warnings.push({
        id: `attention-${channel}`,
        severity: "warning",
        text: `${channel}: ${config.connectionNote}.`,
      });
    }
  });

  const credits = estimatedCredits(state);
  if (credits > CREDITS_AVAILABLE) {
    warnings.push({
      id: "quota",
      severity: "error",
      text: `Estimated usage of ${credits.toLocaleString("en-IN")} credits exceeds your available balance of ${CREDITS_AVAILABLE.toLocaleString("en-IN")}. Reduce the audience or remove steps.`,
    });
  } else if (credits > CREDITS_AVAILABLE * 0.8) {
    warnings.push({
      id: "quota",
      severity: "warning",
      text: `This campaign will use ${credits.toLocaleString("en-IN")} of your ${CREDITS_AVAILABLE.toLocaleString("en-IN")} available credits (over 80%).`,
    });
  }

  return warnings;
}
