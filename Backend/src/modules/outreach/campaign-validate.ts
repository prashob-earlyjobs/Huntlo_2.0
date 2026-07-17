import mongoose from 'mongoose';

import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { quotaService } from '../../shared/usage/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { assertVariablesAllowed } from './variables.js';
import {
  type OutreachCampaignDocument,
  type CampaignSequenceStep,
} from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';

export type ValidationIssue = {
  id: string;
  severity: 'error' | 'warning';
  code: string;
  message: string;
};

function issue(
  id: string,
  severity: 'error' | 'warning',
  code: string,
  message: string
): ValidationIssue {
  return { id, severity, code, message };
}

function isOptedOut(candidate: {
  tags?: string[];
  customFields?: Record<string, unknown> | null;
}): boolean {
  const tags = (candidate.tags || []).map((t) => t.toLowerCase());
  if (tags.includes('opted_out') || tags.includes('do_not_contact') || tags.includes('dnd')) {
    return true;
  }
  const fields = candidate.customFields || {};
  return Boolean(fields.optedOut || fields.doNotContact || fields.dnd);
}

function messageSteps(steps: CampaignSequenceStep[]) {
  return steps.filter((s) =>
    ['email', 'whatsapp', 'ai_voice', 'scheduling_link'].includes(s.type)
  );
}

type ChannelKey = 'email' | 'whatsapp' | 'ai_voice';

function enabledChannelKeys(channels: OutreachCampaignDocument['channelConfig']): ChannelKey[] {
  const keys: ChannelKey[] = [];
  if (channels.email?.enabled) keys.push('email');
  if (channels.whatsapp?.enabled) keys.push('whatsapp');
  if (channels.ai_voice?.enabled) keys.push('ai_voice');
  return keys;
}

function stepChannel(type: CampaignSequenceStep['type']): ChannelKey | null {
  if (type === 'email' || type === 'scheduling_link') return 'email';
  if (type === 'whatsapp') return 'whatsapp';
  if (type === 'ai_voice') return 'ai_voice';
  return null;
}

/** Ensures campaignType matches enabled channels and sequence message steps. */
export function validateCampaignTypeConsistency(input: {
  campaignType?: string | null;
  channelConfig: OutreachCampaignDocument['channelConfig'];
  sequenceSteps: CampaignSequenceStep[];
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const campaignType = input.campaignType || 'multi_channel';
  const enabled = enabledChannelKeys(input.channelConfig);
  const msgSteps = messageSteps(input.sequenceSteps || []);

  if (enabled.length === 0 && msgSteps.length > 0) {
    issues.push(
      issue(
        'channels',
        'error',
        'CHANNELS_DISABLED',
        'Enable at least one channel that matches your sequence.'
      )
    );
  }

  if (campaignType === 'single_channel') {
    if (enabled.length === 0) {
      issues.push(
        issue(
          'channels',
          'error',
          'SINGLE_CHANNEL_REQUIRED',
          'Single-channel campaigns must enable exactly one channel.'
        )
      );
    } else if (enabled.length > 1) {
      issues.push(
        issue(
          'channels',
          'error',
          'SINGLE_CHANNEL_MULTIPLE',
          'Single-channel campaigns can only enable one channel (email, WhatsApp, or AI voice).'
        )
      );
    } else {
      const only = enabled[0];
      for (const step of msgSteps) {
        const channel = stepChannel(step.type);
        if (channel && channel !== only) {
          issues.push(
            issue(
              `step_channel_${step.id || step.order}`,
              'error',
              'SINGLE_CHANNEL_STEP_MISMATCH',
              `Step ${step.order + 1} (${step.type}) is not allowed on a single-channel ${only} campaign.`
            )
          );
        }
      }
    }
  }

  // Sequence steps must belong to an enabled channel (both modes).
  for (const step of msgSteps) {
    const channel = stepChannel(step.type);
    if (!channel) continue;
    if (!enabled.includes(channel)) {
      issues.push(
        issue(
          `step_disabled_${step.id || step.order}`,
          'error',
          'STEP_CHANNEL_DISABLED',
          `Step ${step.order + 1} (${step.type}) uses ${channel}, which is not enabled.`
        )
      );
    }
  }

  return issues;
}

export function assertCampaignTypeConsistency(input: {
  campaignType?: string | null;
  channelConfig: OutreachCampaignDocument['channelConfig'];
  sequenceSteps: CampaignSequenceStep[];
}) {
  const errors = validateCampaignTypeConsistency(input).filter(
    (row) => row.severity === 'error'
  );
  if (errors.length === 0) return;
  const first = errors[0]!;
  throw AppError.validation(
    first.message,
    errors.map((row) => ({
      path: row.code,
      message: row.message,
    }))
  );
}

export async function validateCampaignLaunch(
  campaign: OutreachCampaignDocument,
  userId: string
): Promise<{ ok: boolean; issues: ValidationIssue[] }> {
  const issues: ValidationIssue[] = [];
  const organizationId = String(campaign.organizationId);

  issues.push(
    ...validateCampaignTypeConsistency({
      campaignType: campaign.campaignType,
      channelConfig: campaign.channelConfig,
      sequenceSteps: campaign.sequenceSteps,
    })
  );

  // Feature access
  const hasFeature = await quotaService.checkFeatureAccess(organizationId, 'outreach');
  if (!hasFeature) {
    issues.push(issue('feature', 'error', 'FEATURE_DISABLED', 'Outreach is not enabled on this plan.'));
  }

  // Job
  if (campaign.jobId) {
    const job = await JobModel.findOne({
      _id: campaign.jobId,
      organizationId: campaign.organizationId,
      deletedAt: null,
    }).lean();
    if (!job) {
      issues.push(issue('job', 'error', 'JOB_NOT_FOUND', 'Linked job was not found.'));
    } else if (job.status === 'archived' || job.status === 'closed') {
      issues.push(
        issue('job', 'warning', 'JOB_INACTIVE', `Linked job is ${job.status}.`)
      );
    }
  } else {
    issues.push(issue('job', 'warning', 'JOB_MISSING', 'No job is linked to this campaign.'));
  }

  // Audience
  const enrollments = await OutreachEnrollmentModel.find({
    campaignId: campaign._id,
    organizationId: campaign.organizationId,
  }).lean();
  const candidateIds =
    enrollments.length > 0
      ? enrollments.map((e) => e.candidateId)
      : (campaign.candidateSource.candidateIds || [])
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));

  if (candidateIds.length === 0) {
    issues.push(issue('audience', 'error', 'AUDIENCE_EMPTY', 'Add at least one candidate before launch.'));
  }

  const candidates = candidateIds.length
    ? await SavedCandidateModel.find({
        _id: { $in: candidateIds },
        organizationId: campaign.organizationId,
        deletedAt: null,
      }).lean()
    : [];

  if (candidateIds.length > 0 && candidates.length === 0) {
    issues.push(issue('audience', 'error', 'AUDIENCE_INVALID', 'Audience candidates were not found in the pool.'));
  }

  // Duplicates in source list
  const uniqueIds = new Set(candidateIds.map(String));
  if (uniqueIds.size < candidateIds.length) {
    issues.push(
      issue('audience', 'warning', 'DUPLICATE_CANDIDATES', 'Duplicate candidates were removed from the audience.')
    );
  }

  // Contacts + opt-out
  const channels = campaign.channelConfig;
  let emailReady = 0;
  let phoneReady = 0;
  let optedOut = 0;
  for (const candidate of candidates) {
    if (isOptedOut(candidate)) {
      optedOut += 1;
      continue;
    }
    if (candidate.email) emailReady += 1;
    if (candidate.phone) phoneReady += 1;
  }
  if (optedOut > 0) {
    issues.push(
      issue(
        'opt_out',
        'warning',
        'OPT_OUT_PRESENT',
        `${optedOut} candidate(s) are opted out and will be skipped.`
      )
    );
  }

  const needsEmail =
    channels.email?.enabled ||
    messageSteps(campaign.sequenceSteps).some((s) => s.type === 'email' || s.type === 'scheduling_link');
  const needsWhatsApp =
    channels.whatsapp?.enabled ||
    messageSteps(campaign.sequenceSteps).some((s) => s.type === 'whatsapp');
  const needsVoice =
    channels.ai_voice?.enabled ||
    messageSteps(campaign.sequenceSteps).some((s) => s.type === 'ai_voice');

  if (needsEmail && emailReady === 0 && candidates.length > 0) {
    issues.push(issue('contacts', 'error', 'NO_EMAIL_CONTACTS', 'No candidates have an email address.'));
  }
  if (needsWhatsApp && phoneReady === 0 && candidates.length > 0) {
    issues.push(issue('contacts', 'error', 'NO_PHONE_CONTACTS', 'No candidates have a phone number for WhatsApp.'));
  }
  if (needsVoice && phoneReady === 0 && candidates.length > 0) {
    issues.push(issue('contacts', 'error', 'NO_VOICE_CONTACTS', 'No candidates have a phone number for AI voice.'));
  }

  // Connected providers + sender identities
  async function assertProvider(
    category: 'email' | 'whatsapp' | 'voice',
    enabled: boolean,
    integrationId: string | null | undefined,
    label: string
  ) {
    if (!enabled) return;
    let integration = null;
    if (integrationId && mongoose.Types.ObjectId.isValid(integrationId)) {
      integration = await UserIntegrationModel.findOne({
        _id: integrationId,
        organizationId: campaign.organizationId,
        status: { $in: ['connected', 'needs_attention'] },
      }).lean();
    } else {
      const def = await integrationsService.getDefaultForCategory(
        organizationId,
        userId,
        category
      );
      if (def) {
        integration = await UserIntegrationModel.findById(def.id).lean();
      }
    }
    if (!integration) {
      issues.push(
        issue(
          `provider_${category}`,
          'error',
          'PROVIDER_DISCONNECTED',
          `${label} provider is not connected.`
        )
      );
      return;
    }
    if (category === 'email' && !integration.email && !channels.email?.senderEmail) {
      issues.push(
        issue('sender', 'warning', 'SENDER_IDENTITY_MISSING', 'Email sender identity is missing.')
      );
    }
  }

  await assertProvider('email', Boolean(needsEmail), channels.email?.integrationId, 'Email');
  await assertProvider('whatsapp', Boolean(needsWhatsApp), channels.whatsapp?.integrationId, 'WhatsApp');
  await assertProvider('voice', Boolean(needsVoice), channels.ai_voice?.integrationId, 'AI Voice');

  // Sequence
  if (!campaign.sequenceSteps?.length) {
    issues.push(issue('sequence', 'error', 'SEQUENCE_EMPTY', 'Add at least one sequence step.'));
  } else {
    const msgSteps = messageSteps(campaign.sequenceSteps);
    if (msgSteps.length === 0) {
      issues.push(
        issue('sequence', 'error', 'SEQUENCE_NO_MESSAGES', 'Sequence has no message steps.')
      );
    }
    for (const step of msgSteps) {
      if (!step.body?.trim() && !step.templateId) {
        issues.push(
          issue(
            `step_${step.id}`,
            'error',
            'STEP_BODY_MISSING',
            `Step ${step.order + 1} (${step.type}) needs a body or template.`
          )
        );
      }
      if (step.body) {
        try {
          assertVariablesAllowed(step.subject, step.body, { channel: step.type });
        } catch (error) {
          issues.push(
            issue(
              `step_vars_${step.id}`,
              'error',
              'INVALID_VARIABLES',
              (error as Error).message
            )
          );
        }
      }
    }
  }

  // Qualification
  if (campaign.qualificationConfig?.enabled) {
    if (!campaign.qualificationConfig.questions?.length) {
      issues.push(
        issue(
          'qualification',
          'error',
          'QUALIFICATION_EMPTY',
          'Qualification is enabled but no questions are configured.'
        )
      );
    }
  }

  // Quotas (remaining capacity check — reserve happens at send time)
  if (needsEmail) {
    const usageRaw = await quotaService.getUsage(organizationId);
    const usage = Array.isArray(usageRaw) ? usageRaw : [usageRaw];
    const row = usage.find((u) => u.metric === 'email_outreach');
    if (row && row.remaining <= 0) {
      issues.push(issue('quota_email', 'error', 'QUOTA_EXCEEDED', 'Email outreach quota is exhausted.'));
    } else if (row && row.remaining < candidates.length) {
      issues.push(
        issue(
          'quota_email',
          'warning',
          'QUOTA_LOW',
          `Email quota remaining (${row.remaining}) is below audience size.`
        )
      );
    }
  }
  if (needsWhatsApp) {
    const usageRaw = await quotaService.getUsage(organizationId);
    const usage = Array.isArray(usageRaw) ? usageRaw : [usageRaw];
    const row = usage.find((u) => u.metric === 'whatsapp_outreach');
    if (row && row.remaining <= 0) {
      issues.push(
        issue('quota_whatsapp', 'error', 'QUOTA_EXCEEDED', 'WhatsApp outreach quota is exhausted.')
      );
    }
  }

  // Send windows / timezone
  const sw = campaign.channelConfig.sendWindow;
  if (!campaign.channelConfig.timezone) {
    issues.push(issue('timezone', 'error', 'TIMEZONE_MISSING', 'Campaign timezone is required.'));
  }
  if (sw && sw.startHour >= sw.endHour) {
    issues.push(
      issue('send_window', 'error', 'SEND_WINDOW_INVALID', 'Send window start must be before end.')
    );
  }
  if (sw && (!sw.daysOfWeek || sw.daysOfWeek.length === 0)) {
    issues.push(
      issue('send_window', 'error', 'SEND_DAYS_MISSING', 'Select at least one send day.')
    );
  }

  const ok = !issues.some((i) => i.severity === 'error');
  return { ok, issues };
}

export { isOptedOut };
