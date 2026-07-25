/**
 * Compiles a campaign's builder autosave state (`builderState`) plus legacy
 * fields (`emailTouchpoints`, single-channel `channel`/`message`) into the
 * executable shape the send/worker pipeline already understands
 * (sequenceSteps / channelConfig / qualificationConfig / schedulingConfig).
 *
 * Pure function — never mutates the campaign document. Callers (builder
 * service, launch flow) decide whether/how to apply the result.
 */
import {
  mapModeToCampaignType,
  type CampaignChannelConfig,
  type CampaignSequenceStep,
  type CampaignType,
  type OutreachCampaignDocument,
  type SequenceStepType,
} from './campaign.model.js';
import { validateMessageVariables } from './variables.js';

export type CompiledExecutable = {
  sequenceSteps: CampaignSequenceStep[];
  channelConfig: CampaignChannelConfig;
  qualificationConfig: OutreachCampaignDocument['qualificationConfig'];
  schedulingConfig: OutreachCampaignDocument['schedulingConfig'];
  campaignType: CampaignType;
};

export type CompileBuilderResult = {
  executable: CompiledExecutable;
  warnings: string[];
  blockers: string[];
};

const MESSAGE_STEP_TYPES: SequenceStepType[] = ['email', 'whatsapp', 'ai_voice', 'scheduling_link'];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function pickChannelType(...values: unknown[]): SequenceStepType | null {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const lower = value.toLowerCase();
    if (['email', 'whatsapp', 'ai_voice', 'wait', 'conditional', 'recruiter_task', 'scheduling_link'].includes(lower)) {
      return lower as SequenceStepType;
    }
    if (lower === 'voice' || lower === 'ai voice') return 'ai_voice';
    if (lower === 'sms') return 'whatsapp';
  }
  return null;
}

function normalizeDelay(raw: Record<string, unknown>): { delayDays: number; delayUnit: 'days' | 'hours' | 'minutes' } {
  const unitRaw = pickString(raw.delayUnit, raw.delay_unit, raw.unit) || 'days';
  const delayUnit: 'days' | 'hours' | 'minutes' =
    unitRaw === 'hours' || unitRaw === 'minutes' ? unitRaw : 'days';
  const amountRaw = raw.delayDays ?? raw.delay_days ?? raw.delay ?? raw.waitAmount ?? raw.amount ?? 0;
  const amount = Number(amountRaw);
  return { delayDays: Number.isFinite(amount) ? Math.max(0, amount) : 0, delayUnit };
}

/** Normalizes one builder "sequence" / "touchpoint" entry into a CampaignSequenceStep. */
function toStep(raw: unknown, index: number, warnings: string[]): CampaignSequenceStep | null {
  const row = asRecord(raw);
  const type = pickChannelType(row.type, row.channel, row.stepType) ?? 'email';
  const { delayDays, delayUnit } = normalizeDelay(row);
  const body = pickString(row.body, row.message, row.text, row.content);
  const subject = pickString(row.subject, row.title);

  if (!body && !pickString(row.templateId, row.template_id) && type !== 'wait' && type !== 'conditional') {
    warnings.push(`Step ${index + 1} (${type}) has no body or template — it will be skipped when the sequence runs.`);
  }

  return {
    id: pickString(row.id, row.stepId, row.step_id) || `step-${index + 1}`,
    order: typeof row.order === 'number' ? row.order : index,
    type,
    delayDays,
    delayUnit,
    templateId: pickString(row.templateId, row.template_id),
    subject,
    body,
    stopOnReply: row.stopOnReply === undefined ? true : Boolean(row.stopOnReply),
    note: pickString(row.note),
    sendWindow: null,
    config: asRecord(row.config),
  };
}

function stepsFromSequence(sequence: unknown[], warnings: string[]): CampaignSequenceStep[] {
  return sequence
    .map((row, index) => toStep(row, index, warnings))
    .filter((step): step is CampaignSequenceStep => Boolean(step));
}

function stepsFromEmailTouchpoints(
  touchpoints: Array<Record<string, unknown>>,
  warnings: string[]
): CampaignSequenceStep[] {
  return touchpoints.map((row, index) => {
    const { delayDays, delayUnit } = normalizeDelay(row);
    const body = pickString(row.body, row.message, row.text);
    if (!body && !pickString(row.templateId)) {
      warnings.push(`Email touchpoint ${index + 1} has no body or template.`);
    }
    return {
      id: pickString(row.id) || `touchpoint-${index + 1}`,
      order: index,
      type: 'email' as const,
      delayDays,
      delayUnit,
      templateId: pickString(row.templateId),
      subject: pickString(row.subject),
      body,
      stopOnReply: row.stopOnReply === undefined ? true : Boolean(row.stopOnReply),
      note: pickString(row.note),
      sendWindow: null,
      config: asRecord(row.config),
    };
  });
}

function stepFromChannelMessage(
  channel: unknown,
  message: Record<string, unknown>,
  warnings: string[]
): CampaignSequenceStep[] {
  const type = pickChannelType(channel) ?? 'email';
  const body = pickString(message.body, message.text, message.message);
  const subject = pickString(message.subject, message.title);
  if (!body && !pickString(message.templateId)) {
    warnings.push('Single-channel message has no body or template configured.');
  }
  return [
    {
      id: 'step-1',
      order: 0,
      type,
      delayDays: 0,
      delayUnit: 'days',
      templateId: pickString(message.templateId),
      subject,
      body,
      stopOnReply: true,
      note: null,
      sendWindow: null,
      config: {},
    },
  ];
}

function deriveChannelConfig(
  base: CampaignChannelConfig,
  builderState: Record<string, unknown>,
  sequenceSteps: CampaignSequenceStep[]
): CampaignChannelConfig {
  const channelStep = asRecord(builderState.channel);
  const next: CampaignChannelConfig = {
    email: { ...base.email },
    whatsapp: { ...base.whatsapp },
    ai_voice: { ...base.ai_voice },
    timezone: base.timezone,
    sendWindow: { ...base.sendWindow },
  };

  const singleChannel = pickChannelType(channelStep.channel, channelStep.selectedChannel);
  if (singleChannel === 'email') next.email.enabled = true;
  if (singleChannel === 'whatsapp') next.whatsapp.enabled = true;
  if (singleChannel === 'ai_voice') next.ai_voice.enabled = true;
  if (typeof channelStep.integrationId === 'string') {
    if (singleChannel === 'email' || sequenceSteps.some((s) => s.type === 'email')) {
      next.email.integrationId = channelStep.integrationId;
    }
    if (singleChannel === 'whatsapp' || sequenceSteps.some((s) => s.type === 'whatsapp')) {
      next.whatsapp.integrationId = channelStep.integrationId;
    }
    if (singleChannel === 'ai_voice' || sequenceSteps.some((s) => s.type === 'ai_voice')) {
      next.ai_voice.integrationId = channelStep.integrationId;
    }
  }
  if (typeof channelStep.senderEmail === 'string') next.email.senderEmail = channelStep.senderEmail;

  // Multi-channel: widen enabled channels to match whatever the compiled sequence uses.
  for (const step of sequenceSteps) {
    if (step.type === 'email' || step.type === 'scheduling_link') next.email.enabled = true;
    if (step.type === 'whatsapp') next.whatsapp.enabled = true;
    if (step.type === 'ai_voice') next.ai_voice.enabled = true;
  }

  return next;
}

/**
 * Compiles builderState (and any legacy single-email/touchpoint fields) into
 * the campaign's executable send config. Never mutates `campaign` — the
 * caller applies `.executable` onto the document (or discards it).
 */
export function compileBuilderToCampaign(campaign: OutreachCampaignDocument): CompileBuilderResult {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const builderState = asRecord(campaign.builderState);

  const modeRaw =
    pickString(builderState.mode, asRecord(builderState.details).mode) ||
    campaign.mode ||
    (campaign.campaignType === 'single_channel' ? 'single' : 'multi');
  const campaignType = mapModeToCampaignType(modeRaw);

  let sequenceSteps: CampaignSequenceStep[] = [];
  const sequenceStepPayload = asRecord(builderState.sequence);
  const sequenceRaw = asArray(builderState.sequence).length
    ? asArray(builderState.sequence)
    : asArray(sequenceStepPayload.sequence).length
      ? asArray(sequenceStepPayload.sequence)
      : asArray(sequenceStepPayload.steps);

  if (sequenceRaw.length) {
    sequenceSteps = stepsFromSequence(sequenceRaw, warnings);
  } else if (Array.isArray(campaign.emailTouchpoints) && campaign.emailTouchpoints.length) {
    sequenceSteps = stepsFromEmailTouchpoints(
      campaign.emailTouchpoints as Array<Record<string, unknown>>,
      warnings
    );
  } else if (builderState.message) {
    const channelStep = asRecord(builderState.channel);
    const messageStep = asRecord(builderState.message);
    sequenceSteps = stepFromChannelMessage(
      channelStep.channel ?? channelStep.selectedChannel ?? modeRaw,
      messageStep,
      warnings
    );
  } else if (campaign.sequenceSteps?.length) {
    // Nothing new in the builder — keep whatever was already compiled.
    sequenceSteps = campaign.sequenceSteps;
  } else {
    blockers.push('No sequence, email touchpoints, or channel message found in the builder state to compile.');
  }

  // Re-number and validate delays/variables.
  sequenceSteps = sequenceSteps.map((step, index) => ({ ...step, order: index }));
  for (const step of sequenceSteps) {
    if (step.delayDays < 0) {
      blockers.push(`Step ${step.order + 1} (${step.type}) has a negative delay.`);
    }
    if (MESSAGE_STEP_TYPES.includes(step.type) && step.body) {
      const result = validateMessageVariables({ subject: step.subject, body: step.body });
      if (!result.valid) {
        blockers.push(
          `Step ${step.order + 1} (${step.type}) uses unknown variable(s): ${result.unknown
            .map((v) => `{{${v}}}`)
            .join(', ')}.`
        );
      }
    }
  }

  const channelConfig = deriveChannelConfig(campaign.channelConfig, builderState, sequenceSteps);

  const qualRaw = asRecord(builderState.qualification);
  const qualificationConfig =
    qualRaw.enabled !== undefined || Array.isArray(qualRaw.questions)
      ? {
          // Always-on in the builder UI — missing flags must not become false via Boolean(undefined).
          enabled: qualRaw.enabled === undefined ? true : Boolean(qualRaw.enabled),
          questions: asArray(qualRaw.questions).map((raw, index) => {
            const q = asRecord(raw);
            return {
              id: pickString(q.id) || `q-${index + 1}`,
              title: pickString(q.title) || null,
              prompt: pickString(q.prompt, q.text) || '',
              answerType: pickString(q.answerType, q.type) || 'Short text',
              knockout: Boolean(q.knockout),
              knockoutCondition: pickString(q.knockoutCondition) || null,
            };
          }),
          aiReplyEnabled:
            qualRaw.aiReplyEnabled === undefined ? true : Boolean(qualRaw.aiReplyEnabled),
          takeoverCondition: pickString(qualRaw.takeoverCondition),
          autoScreening: Boolean(qualRaw.autoScreening),
        }
      : campaign.qualificationConfig;

  const schedulingConfig = asRecord(builderState.scheduling).enabled !== undefined
    ? {
        enabled: Boolean(asRecord(builderState.scheduling).enabled),
        provider: pickString(asRecord(builderState.scheduling).provider),
        eventTypeUri: pickString(asRecord(builderState.scheduling).eventTypeUri),
        messageTemplateId: pickString(asRecord(builderState.scheduling).messageTemplateId),
      }
    : campaign.schedulingConfig;

  return {
    executable: {
      sequenceSteps,
      channelConfig,
      qualificationConfig: qualificationConfig as OutreachCampaignDocument['qualificationConfig'],
      schedulingConfig: schedulingConfig as OutreachCampaignDocument['schedulingConfig'],
      campaignType,
    },
    warnings,
    blockers,
  };
}
