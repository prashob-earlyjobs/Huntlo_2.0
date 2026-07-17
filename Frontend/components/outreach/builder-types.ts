import {
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_TYPES,
  CHANNEL_CONFIGS,
  DEFAULT_QUESTIONS,
  DEFAULT_SEQUENCE,
  makeStep,
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
  type SequenceStepType,
} from "@/lib/mock-outreach";
import {
  getDefaultWhatsAppTemplate,
  isApprovedWhatsAppTemplateId,
  type WhatsAppTemplateSlot,
} from "@/lib/whatsapp-outreach";

export interface BuilderState {
  /* Step 1 — setup */
  name: string;
  jobId: string | null;
  objective: string;
  owner: string;
  ownerUserId: string | null;
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

const CHANNEL_STEP_TYPE: Record<OutreachChannel, SequenceStepType> = {
  Email: "Send Email",
  WhatsApp: "Send WhatsApp",
  "AI Voice": "Start AI Voice Call",
};

export function isSingleChannelCampaign(state: Pick<BuilderState, "campaignType">) {
  return state.campaignType === "Single Channel";
}

function pruneStepsToChannels(
  steps: SequenceStep[],
  enabledChannels: OutreachChannel[]
): SequenceStep[] {
  const allowed = new Set(enabledChannels);
  const pruned = steps.filter((step) => {
    const channel = STEP_CHANNELS[step.type];
    return !channel || allowed.has(channel);
  });
  return dropLeadingNonMessageSteps(pruned);
}

/** Wait / task / branch steps cannot lead the sequence — first step must send. */
function dropLeadingNonMessageSteps(steps: SequenceStep[]): SequenceStep[] {
  const firstMessage = steps.findIndex((step) => Boolean(STEP_CHANNELS[step.type]));
  if (firstMessage <= 0) return steps;
  return steps.slice(firstMessage);
}

function ensureMessageStep(
  steps: SequenceStep[],
  channel: OutreachChannel
): SequenceStep[] {
  if (steps.some((step) => STEP_CHANNELS[step.type] === channel)) {
    return dropLeadingNonMessageSteps(steps);
  }
  return dropLeadingNonMessageSteps([makeStep(CHANNEL_STEP_TYPE[channel]), ...steps]);
}

function whatsappStepFromSlot(
  slot: WhatsAppTemplateSlot,
  delayDays: number
): SequenceStep {
  const picked = getDefaultWhatsAppTemplate(slot);
  const base = makeStep("Send WhatsApp");
  return {
    ...base,
    delayDays,
    delayUnit: delayDays > 0 ? "days" : "days",
    templateId: picked?.id ?? null,
    template: picked?.name ?? "WhatsApp template",
    body: picked?.body ?? "",
    stopOnReply: true,
    note: "",
  };
}

/** Default Meta cold-outbound flow: opening → no-reply 1 → no-reply 2. */
export function makeWhatsAppColdOutboundSequence(): SequenceStep[] {
  return [
    whatsappStepFromSlot("opening", 0),
    whatsappStepFromSlot("no_reply_1", 2),
    whatsappStepFromSlot("no_reply_2", 2),
  ];
}

function ensureWhatsAppColdSequence(steps: SequenceStep[]): SequenceStep[] {
  const waSteps = steps.filter((step) => step.type === "Send WhatsApp");
  const approvedCount = waSteps.filter((step) =>
    isApprovedWhatsAppTemplateId(step.templateId)
  ).length;
  // Seed the product WhatsApp flow when the sequence has no approved templates yet.
  if (approvedCount === 0) {
    return makeWhatsAppColdOutboundSequence();
  }
  // Drop leading Wait / task steps so the first editable card is a template.
  const firstWa = steps.findIndex((step) => step.type === "Send WhatsApp");
  if (firstWa > 0) {
    return steps.slice(firstWa);
  }
  return steps;
}

/** Collapse to one channel and drop incompatible sequence steps. */
export function applyCampaignType(
  state: BuilderState,
  campaignType: string
): BuilderState {
  if (campaignType !== "Single Channel") {
    return { ...state, campaignType };
  }

  const channel = state.enabledChannels[0] ?? "Email";
  let steps = ensureMessageStep(
    pruneStepsToChannels(state.steps, [channel]),
    channel
  );
  if (channel === "WhatsApp") {
    steps = ensureWhatsAppColdSequence(steps);
  }
  return {
    ...state,
    campaignType,
    enabledChannels: [channel],
    steps,
  };
}

/** Seed at least one send step for the primary enabled channel when the sequence is empty. */
export function ensureDefaultSequenceSteps(
  steps: SequenceStep[],
  enabledChannels: OutreachChannel[]
): SequenceStep[] {
  const next = dropLeadingNonMessageSteps(steps);
  if (next.some((step) => Boolean(STEP_CHANNELS[step.type]))) return next;
  const channel = enabledChannels[0] ?? "Email";
  if (channel === "WhatsApp") return makeWhatsAppColdOutboundSequence();
  return [makeStep(CHANNEL_STEP_TYPE[channel])];
}

/** Keep single-channel campaigns on exactly one channel and sync the sequence. */
export function applyEnabledChannels(
  state: BuilderState,
  enabledChannels: OutreachChannel[]
): BuilderState {
  let nextChannels = enabledChannels;

  if (isSingleChannelCampaign(state)) {
    if (enabledChannels.length === 0) {
      nextChannels = state.enabledChannels[0]
        ? [state.enabledChannels[0]]
        : ["Email"];
    } else if (enabledChannels.length === 1) {
      nextChannels = enabledChannels;
    } else {
      const added = enabledChannels.find(
        (channel) => !state.enabledChannels.includes(channel)
      );
      nextChannels = [added ?? enabledChannels[enabledChannels.length - 1]];
    }
  }

  let steps = pruneStepsToChannels(state.steps, nextChannels);
  if (isSingleChannelCampaign(state) && nextChannels[0]) {
    steps = ensureMessageStep(steps, nextChannels[0]);
    if (nextChannels[0] === "WhatsApp") {
      steps = ensureWhatsAppColdSequence(steps);
    }
  } else if (nextChannels.length === 1 && nextChannels[0] === "WhatsApp") {
    // Use nextChannels (not prior state) so Email→WhatsApp switches seed correctly.
    steps = ensureWhatsAppColdSequence(ensureMessageStep(steps, "WhatsApp"));
  } else {
    steps = ensureDefaultSequenceSteps(steps, nextChannels);
  }

  return {
    ...state,
    enabledChannels: nextChannels,
    steps,
  };
}

export function initialBuilderState(): BuilderState {
  return {
    name: "",
    jobId: null,
    objective: CAMPAIGN_OBJECTIVES[0],
    owner: "",
    ownerUserId: null,
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
      CHANNEL_CONFIGS.map((config) => [
        config.channel,
        "Disconnected" as ChannelConnection,
      ])
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
  return null;
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
      if (!state.jobId) errors.push("Select a related job.");
      if (!state.objective) errors.push("Pick a campaign objective.");
      if (!state.ownerUserId) errors.push("Assign a campaign owner.");
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
      if (state.enabledChannels.length === 0) {
        errors.push("Enable at least one channel to send messages.");
      } else if (
        isSingleChannelCampaign(state) &&
        state.enabledChannels.length !== 1
      ) {
        errors.push("Single-channel campaigns must use exactly one channel.");
      }
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
      if (isSingleChannelCampaign(state) && state.enabledChannels[0]) {
        const only = state.enabledChannels[0];
        const mixed = messageSteps(state).filter(
          (step) => STEP_CHANNELS[step.type] !== only
        );
        mixed.forEach((step) =>
          errors.push(
            `Single-channel campaigns can only use ${only}. Remove “${step.type}”.`
          )
        );
      }
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

export function launchWarnings(
  state: BuilderState,
  creditsAvailable: number | null = null
): LaunchWarning[] {
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
  if (creditsAvailable != null && credits > creditsAvailable) {
    warnings.push({
      id: "quota",
      severity: "error",
      text: `Estimated usage of ${credits.toLocaleString("en-IN")} credits exceeds your available balance of ${creditsAvailable.toLocaleString("en-IN")}. Reduce the audience or remove steps.`,
    });
  } else if (
    creditsAvailable != null &&
    creditsAvailable > 0 &&
    credits > creditsAvailable * 0.8
  ) {
    warnings.push({
      id: "quota",
      severity: "warning",
      text: `This campaign will use ${credits.toLocaleString("en-IN")} of your ${creditsAvailable.toLocaleString("en-IN")} available credits (over 80%).`,
    });
  }

  return warnings;
}
