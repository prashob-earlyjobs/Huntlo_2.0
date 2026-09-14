import type { Huntlo360WorkflowDocument } from './workflow.model.js';
import {
  getApprovedTemplate,
  getDefaultTemplateForSlot,
  type WhatsAppTemplateSlot,
} from '../outreach/whatsapp-template-catalogue.js';

type OutreachChannel = 'email' | 'whatsapp' | 'ai_voice';
type DelayUnit = 'days' | 'hours' | 'minutes';

type SequenceStep = {
  id: string;
  order: number;
  type: 'email' | 'whatsapp' | 'wait' | 'ai_voice' | 'scheduling_link';
  delayDays: number;
  delayUnit: DelayUnit;
  templateId: string | null;
  subject: string | null;
  body: string | null;
  stopOnReply: boolean;
  note: string | null;
};

type NormalizedFollowUp = {
  body: string;
  delayDays: number;
  delayUnit: DelayUnit;
  templateId: string | null;
};

function preferredChannel(
  order: Huntlo360WorkflowDocument['outreachConfig']['channelOrder']
): OutreachChannel {
  if (order === 'whatsapp_first') return 'whatsapp';
  if (order === 'voice_first') return 'ai_voice';
  return 'email';
}

function enabledChannels(workflow: Huntlo360WorkflowDocument): OutreachChannel[] {
  const flags: Record<OutreachChannel, boolean> = {
    email: Boolean(workflow.outreachConfig.emailEnabled),
    whatsapp: Boolean(workflow.outreachConfig.whatsappEnabled),
    ai_voice: Boolean(workflow.outreachConfig.aiVoiceEnabled),
  };
  const preferred = preferredChannel(workflow.outreachConfig.channelOrder);
  const ordered: OutreachChannel[] = [];
  if (flags[preferred]) ordered.push(preferred);
  for (const channel of ['email', 'whatsapp', 'ai_voice'] as const) {
    if (channel !== preferred && flags[channel]) ordered.push(channel);
  }
  return ordered;
}

function normalizeFollowUps(
  raw: Huntlo360WorkflowDocument['outreachConfig']['followUps'] | unknown
): NormalizedFollowUp[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((entry, index) => {
    if (typeof entry === 'string') {
      return {
        body: entry,
        delayDays: index === 0 ? 2 : 3,
        delayUnit: 'days' as const,
        templateId: null,
      };
    }
    const row = entry as {
      body?: string;
      delayDays?: number;
      delayUnit?: DelayUnit;
      templateId?: string | null;
    };
    const unit =
      row.delayUnit === 'hours' || row.delayUnit === 'minutes' ? row.delayUnit : 'days';
    return {
      body: String(row.body || ''),
      delayDays: Math.max(0, Number(row.delayDays ?? (index === 0 ? 2 : 3)) || 0),
      delayUnit: unit,
      templateId: row.templateId ? String(row.templateId) : null,
    };
  });
}

function slotForWhatsAppStep(whatsappStepIndex: number): WhatsAppTemplateSlot {
  if (whatsappStepIndex <= 0) return 'opening';
  if (whatsappStepIndex === 1) return 'no_reply_1';
  return 'no_reply_2';
}

/** Catalogue / Meta bodies use {{1}}/{{2}}. Campaign launch validation only allows named tokens on email/voice. */
export function rewriteWhatsAppPositionalTokens(body: string): string {
  return String(body || '').replace(/\{\{\s*(\d+)\s*\}\}/g, (full, raw) => {
    if (String(raw) === '1') return '{{first_name}}';
    if (String(raw) === '2') return '{{job_title}}';
    return full;
  });
}

function resolveWhatsAppStep(input: {
  templateId?: string | null;
  body?: string | null;
  whatsappStepIndex: number;
}): { templateId: string; body: string } {
  const slot = slotForWhatsAppStep(input.whatsappStepIndex);
  const fromId = input.templateId ? getApprovedTemplate(String(input.templateId)) : null;
  const picked = fromId || getDefaultTemplateForSlot(slot);
  if (picked) {
    return { templateId: picked.id, body: picked.body };
  }
  return {
    templateId: String(input.templateId || ''),
    body: String(input.body || ''),
  };
}

/** Compile workflow outreach config into campaign sequence steps (no duplicate engine). */
export function compileCampaignSequence(workflow: Huntlo360WorkflowDocument) {
  const steps: SequenceStep[] = [];
  const channels = enabledChannels(workflow);
  let order = 0;
  let whatsappStepIndex = 0;

  const opening =
    workflow.outreachConfig.openingMessage ||
    'Hi {{first_name}}, interested in {{job_title}}?';
  const followUps = normalizeFollowUps(workflow.outreachConfig.followUps);
  const effectiveFollowUps =
    followUps.length > 0
      ? followUps
      : channels.includes('email') || channels.includes('whatsapp')
        ? [
            {
              body: 'Just checking in on {{job_title}}, {{first_name}}.',
              delayDays: 2,
              delayUnit: 'days' as const,
              templateId: null,
            },
          ]
        : [];

  function pushChannel(
    type: OutreachChannel,
    body: string,
    delayDays: number,
    delayUnit: DelayUnit = 'days',
    templateId: string | null = null
  ) {
    let resolvedTemplateId = templateId;
    let resolvedBody = body;
    if (type === 'whatsapp') {
      const resolved = resolveWhatsAppStep({
        templateId:
          templateId ||
          (whatsappStepIndex === 0
            ? workflow.outreachConfig.openingWhatsAppTemplateId
            : null),
        body,
        whatsappStepIndex,
      });
      resolvedTemplateId = resolved.templateId || null;
      resolvedBody = resolved.body;
      whatsappStepIndex += 1;
    }

    const namedBody = rewriteWhatsAppPositionalTokens(resolvedBody);
    steps.push({
      id: `step-${order + 1}`,
      order,
      type,
      delayDays,
      delayUnit,
      templateId: resolvedTemplateId,
      subject: type === 'email' ? 'Quick question, {{first_name}}' : null,
      // AI Voice: empty body → delivery uses Roshni (Hunar/Zyastra). Non-empty = call notes.
      body: type === 'ai_voice' ? (namedBody.trim() ? namedBody : null) : namedBody,
      stopOnReply: workflow.outreachConfig.stopOnReply !== false,
      note: type === 'ai_voice' ? 'Huntlo Voice AI (Hunar / Zyastra)' : null,
    });
    order += 1;
  }

  if (channels.length === 0) return steps;

  pushChannel(
    channels[0]!,
    opening,
    0,
    'days',
    channels[0] === 'whatsapp'
      ? workflow.outreachConfig.openingWhatsAppTemplateId || null
      : null
  );

  effectiveFollowUps.forEach((followUp, index) => {
    const channel =
      channels.length === 1
        ? channels[0]!
        : channels[(index + 1) % channels.length]!;
    pushChannel(
      channel,
      followUp.body,
      followUp.delayDays,
      followUp.delayUnit,
      channel === 'whatsapp' ? followUp.templateId : null
    );
  });

  // Screening + scheduling are orchestrated by Huntlo 360 transitions —
  // not duplicated as campaign worker sends.
  return steps;
}

export function compileCampaignPayload(workflow: Huntlo360WorkflowDocument) {
  const emailOn = Boolean(workflow.outreachConfig.emailEnabled);
  const whatsappOn = Boolean(workflow.outreachConfig.whatsappEnabled);
  const voiceOn = Boolean(workflow.outreachConfig.aiVoiceEnabled);
  const enabledCount = [emailOn, whatsappOn, voiceOn].filter(Boolean).length;
  const explicitType = workflow.outreachConfig.campaignType;
  const campaignType =
    explicitType === 'single_channel' || explicitType === 'multi_channel'
      ? explicitType
      : enabledCount > 1
        ? 'multi_channel'
        : 'single_channel';

  return {
    name: workflow.name,
    jobId: workflow.jobId ? String(workflow.jobId) : null,
    ownerUserId: String(workflow.ownerUserId),
    sourceModule: 'huntlo360' as const,
    campaignType,
    candidateSource: {
      type: (workflow.candidateSource.type || 'manual') as
        | 'candidate_pool'
        | 'saved_list'
        | 'manual'
        | 'job'
        | 'import',
      listId: workflow.candidateSource.listId,
      jobId: workflow.jobId ? String(workflow.jobId) : null,
      candidateIds: workflow.candidateSource.candidateIds || [],
      label: workflow.candidateSource.label,
    },
    channelConfig: {
      email: { enabled: emailOn },
      whatsapp: { enabled: whatsappOn },
      ai_voice: { enabled: voiceOn },
      timezone: 'Asia/Kolkata',
      sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
    },
    sequenceSteps: compileCampaignSequence(workflow),
    // Qualification Q&A still runs on the linked campaign after reply
    // (inbound-sync → processQualificationAfterReply). Screening/scheduling
    // remain orchestrated by Huntlo 360 transitions.
    qualificationConfig: {
      enabled: workflow.qualificationConfig?.enabled !== false,
      questions: (workflow.qualificationConfig?.questions || [])
        .filter((q) => String(q?.prompt || '').trim())
        .map((q) => ({
          id: String(q.id),
          prompt: String(q.prompt).trim(),
          answerType: String(q.answerType || 'Text'),
          knockout: Boolean(q.knockout),
          knockoutCondition:
            typeof (q as { knockoutCondition?: string | null }).knockoutCondition === 'string'
              ? (q as { knockoutCondition?: string }).knockoutCondition || null
              : null,
        })),
      aiReplyEnabled: workflow.qualificationConfig?.aiReplyEnabled !== false,
      takeoverCondition: workflow.qualificationConfig?.handoffCondition || null,
      autoScreening: false,
    },
    schedulingConfig: {
      enabled: false,
      provider: workflow.schedulingConfig.provider || 'calendly',
      eventTypeUri: workflow.schedulingConfig.eventTypeUri || null,
      messageTemplateId: workflow.schedulingConfig.messageTemplateId || null,
    },
  };
}
