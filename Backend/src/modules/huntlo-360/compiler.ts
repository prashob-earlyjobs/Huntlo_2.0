import type { Huntlo360WorkflowDocument } from './workflow.model.js';

/** Compile workflow outreach config into campaign sequence steps (no duplicate engine). */
export function compileCampaignSequence(workflow: Huntlo360WorkflowDocument) {
  const steps: Array<{
    id: string;
    order: number;
    type: 'email' | 'whatsapp' | 'wait' | 'ai_voice' | 'scheduling_link';
    delayDays: number;
    delayUnit: 'days' | 'hours' | 'minutes';
    subject: string | null;
    body: string | null;
    stopOnReply: boolean;
    note: string | null;
  }> = [];

  const emailFirst = workflow.outreachConfig.channelOrder !== 'whatsapp_first';
  let order = 0;

  const opening = workflow.outreachConfig.openingMessage || 'Hi {{first_name}}, interested in {{job_title}}?';
  const followUps = workflow.outreachConfig.followUps?.length
    ? workflow.outreachConfig.followUps
    : ['Just checking in on {{job_title}}, {{first_name}}.'];

  function pushChannel(type: 'email' | 'whatsapp', body: string, delayDays: number) {
    steps.push({
      id: `step-${order + 1}`,
      order,
      type,
      delayDays,
      delayUnit: 'days',
      subject: type === 'email' ? 'Quick question, {{first_name}}' : null,
      body,
      stopOnReply: workflow.outreachConfig.stopOnReply !== false,
      note: null,
    });
    order += 1;
  }

  if (emailFirst) {
    if (workflow.outreachConfig.emailEnabled) pushChannel('email', opening, 0);
    else if (workflow.outreachConfig.whatsappEnabled) pushChannel('whatsapp', opening, 0);
  } else {
    if (workflow.outreachConfig.whatsappEnabled) pushChannel('whatsapp', opening, 0);
    else if (workflow.outreachConfig.emailEnabled) pushChannel('email', opening, 0);
  }

  followUps.forEach((body, index) => {
    const delayDays = index === 0 ? 2 : 3;
    if (workflow.outreachConfig.emailEnabled && workflow.outreachConfig.whatsappEnabled) {
      const alternate =
        emailFirst
          ? index % 2 === 0
            ? 'whatsapp'
            : 'email'
          : index % 2 === 0
            ? 'email'
            : 'whatsapp';
      pushChannel(alternate, body, delayDays);
    } else if (workflow.outreachConfig.emailEnabled) {
      pushChannel('email', body, delayDays);
    } else if (workflow.outreachConfig.whatsappEnabled) {
      pushChannel('whatsapp', body, delayDays);
    }
  });

  // Screening + scheduling are orchestrated by Huntlo 360 transitions —
  // not duplicated as campaign worker sends.
  return steps;
}

export function compileCampaignPayload(workflow: Huntlo360WorkflowDocument) {
  return {
    name: workflow.name,
    jobId: workflow.jobId ? String(workflow.jobId) : null,
    ownerUserId: String(workflow.ownerUserId),
    sourceModule: 'huntlo360' as const,
    campaignType: 'multi_channel' as const,
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
      email: { enabled: Boolean(workflow.outreachConfig.emailEnabled) },
      whatsapp: { enabled: Boolean(workflow.outreachConfig.whatsappEnabled) },
      ai_voice: { enabled: false },
      timezone: 'Asia/Kolkata',
      sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
    },
    sequenceSteps: compileCampaignSequence(workflow),
    // Qualification, screening, and scheduling are orchestrated by Huntlo 360
    // transitions — keep the linked campaign focused on outreach delivery.
    qualificationConfig: {
      enabled: false,
      questions: [],
      aiReplyEnabled: false,
    },
    schedulingConfig: {
      enabled: false,
      provider: workflow.schedulingConfig.provider || 'calendly',
      eventTypeUri: workflow.schedulingConfig.eventTypeUri || null,
      messageTemplateId: workflow.schedulingConfig.messageTemplateId || null,
    },
  };
}
