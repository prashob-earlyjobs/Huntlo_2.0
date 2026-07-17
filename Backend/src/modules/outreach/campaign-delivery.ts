import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { sendGmailMessage } from '../../providers/gmail/gmail.send.js';
import { refreshGmailAccessToken } from '../../providers/gmail/gmail.oauth.js';
import { sendGupshupText } from '../../providers/gupshup/gupshup.send.js';
import {
  createHunarBulkCalls,
  createHunarVoiceAgent,
} from '../../providers/hunar/hunar.client.js';
import { getHunarVoiceLanguage, getHunarVoicePersona } from '../../providers/hunar/hunar.config.js';
import {
  getHuntloWhatsAppCredentials,
} from '../../providers/meta-whatsapp/meta.config.js';
import { sendMetaWhatsAppText } from '../../providers/meta-whatsapp/meta.send.js';
import { sendOutlookMail } from '../../providers/outlook/outlook.send.js';
import { refreshOutlookAccessToken } from '../../providers/outlook/outlook.oauth.js';
import {
  sendSmtpMail,
  type SmtpConfig,
  type SmtpSecurity,
} from '../../providers/smtp/smtp.js';
import { quotaService } from '../../shared/usage/index.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { UserModel } from '../auth/user.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { JobModel } from '../jobs/job.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { buildCandidateMergeContext, mergeMessageTemplate } from './variables.js';
import type {
  CampaignSequenceStep,
  OutreachCampaignDocument,
} from './campaign.model.js';
import type { OutreachEnrollmentDocument } from './enrollment.model.js';

export type DeliverySkipReason = 'missing_email' | 'missing_phone' | 'non_message';

export type DeliveryResult =
  | {
      outcome: 'sent';
      channel: 'email' | 'whatsapp' | 'ai_voice';
      providerMessageId?: string;
      provider?: string;
      /** Personalized text actually sent — used to store accurate conversation history. */
      renderedSubject?: string | null;
      renderedBody?: string;
    }
  | {
      outcome: 'skipped';
      reason: DeliverySkipReason;
      channel?: 'email' | 'whatsapp' | 'ai_voice';
    };

export type IntegrationSecrets = NonNullable<
  Awaited<ReturnType<typeof integrationsService.getDecryptedSecrets>>
>;

async function loadCandidate(organizationId: string, candidateId: mongoose.Types.ObjectId) {
  return SavedCandidateModel.findOne({
    _id: candidateId,
    organizationId,
  })
    .select('name email phone currentTitle currentCompany location')
    .lean();
}

/**
 * Build the personalization merge context for a campaign + candidate pair.
 * `job_title` reflects the role being pitched (campaign.jobId); `current_role` /
 * `current_company` reflect the candidate's own profile.
 */
async function buildMergeContext(
  campaign: OutreachCampaignDocument,
  candidate: Awaited<ReturnType<typeof loadCandidate>>
): Promise<Record<string, string>> {
  const [job, organization, owner] = await Promise.all([
    campaign.jobId ? JobModel.findById(campaign.jobId).select('title').lean() : null,
    OrganizationModel.findById(campaign.organizationId).select('name').lean(),
    UserModel.findById(campaign.ownerUserId).select('firstName').lean(),
  ]);

  return buildCandidateMergeContext(candidate, {
    jobTitle: job?.title || null,
    companyName: organization?.name || null,
    recruiterName: owner?.firstName || null,
    location: candidate?.location || null,
  });
}

async function resolveIntegration(
  organizationId: string,
  userId: string,
  category: 'email' | 'whatsapp' | 'voice',
  integrationId: string | null | undefined
): Promise<{ id: string; secrets: IntegrationSecrets } | null> {
  if (integrationId && mongoose.Types.ObjectId.isValid(integrationId)) {
    const secrets = await integrationsService.getDecryptedSecrets(
      organizationId,
      integrationId
    );
    if (secrets) return { id: integrationId, secrets };
  }
  const fallback = await integrationsService.getDefaultForCategory(
    organizationId,
    userId,
    category
  );
  if (!fallback) return null;
  const secrets = await integrationsService.getDecryptedSecrets(
    organizationId,
    fallback.id
  );
  return secrets ? { id: fallback.id, secrets } : null;
}

/** Exported for reuse by email-reply-sync — refreshes gmail/outlook access tokens on demand. */
export async function withFreshEmailToken(
  secrets: IntegrationSecrets
): Promise<string | null> {
  if (secrets.accessToken) return secrets.accessToken;
  if (!secrets.refreshToken) return null;

  if (secrets.provider === 'gmail') {
    const tokens = await refreshGmailAccessToken(secrets.refreshToken);
    return String(tokens.access_token || '') || null;
  }
  if (secrets.provider === 'outlook') {
    const tokens = await refreshOutlookAccessToken(secrets.refreshToken);
    return String(tokens.access_token || '') || null;
  }
  return null;
}

function smtpConfigFromSecrets(secrets: IntegrationSecrets): SmtpConfig {
  const config = (secrets.config || {}) as Record<string, unknown>;
  const security = String(config.smtpSecurity || config.security || 'tls') as SmtpSecurity;
  return {
    fromEmail: String(secrets.email || ''),
    smtpHost: String(config.smtpHost || config.host || ''),
    smtpPort: Number(config.smtpPort || config.port || 587),
    security: security === 'ssl' || security === 'none' ? security : 'tls',
    username: String(
      secrets.accessToken ||
        (secrets.credentials as { username?: string } | null)?.username ||
        secrets.email ||
        ''
    ),
    password: String(secrets.refreshToken || ''),
    senderName: String(secrets.displayName || ''),
  };
}

async function sendEmailViaIntegration(input: {
  secrets: IntegrationSecrets;
  to: string;
  subject: string;
  body: string;
  fromOverride?: string | null;
}): Promise<{ messageId?: string; provider: string }> {
  const { secrets } = input;
  const subject = input.subject || '(no subject)';
  const text = input.body || '';

  if (secrets.provider === 'smtp') {
    const config = smtpConfigFromSecrets(secrets);
    if (input.fromOverride) config.fromEmail = input.fromOverride;
    const result = await sendSmtpMail({
      config,
      to: input.to,
      subject,
      text,
    });
    return { messageId: result.messageId, provider: secrets.provider };
  }

  if (
    secrets.provider === 'zoho-mail' &&
    String((secrets.config as { zohoAuthMode?: string } | null)?.zohoAuthMode || '') ===
      'smtp'
  ) {
    const config = smtpConfigFromSecrets(secrets);
    if (input.fromOverride) config.fromEmail = input.fromOverride;
    const result = await sendSmtpMail({
      config,
      to: input.to,
      subject,
      text,
    });
    return { messageId: result.messageId, provider: 'zoho-mail' };
  }

  const accessToken = await withFreshEmailToken(secrets);
  if (!accessToken) {
    throw Object.assign(new Error(`No access token for ${secrets.provider} email send.`), {
      statusCode: 401,
    });
  }

  if (secrets.provider === 'gmail') {
    const result = await sendGmailMessage({
      accessToken,
      to: input.to,
      subject,
      text,
      from: input.fromOverride || secrets.email,
    });
    return { messageId: result.messageId, provider: 'gmail' };
  }

  if (secrets.provider === 'outlook') {
    const result = await sendOutlookMail({
      accessToken,
      to: input.to,
      subject,
      text,
    });
    return { messageId: result.messageId, provider: 'outlook' };
  }

  throw Object.assign(
    new Error(`Email provider "${secrets.provider}" cannot send yet.`),
    { statusCode: 501 }
  );
}

async function sendWhatsAppViaIntegration(input: {
  secrets: IntegrationSecrets;
  to: string;
  body: string;
}): Promise<{ messageId?: string; provider: string }> {
  const { secrets } = input;
  const body = input.body || '';

  if (secrets.provider === 'huntlo-whatsapp') {
    const creds = getHuntloWhatsAppCredentials();
    if (!creds) {
      throw Object.assign(new Error('Huntlo WhatsApp is not configured on the server.'), {
        statusCode: 503,
      });
    }
    const result = await sendMetaWhatsAppText({
      phoneNumberId: creds.phoneNumberId,
      accessToken: creds.accessToken,
      to: input.to,
      body,
    });
    return { messageId: result.messageId, provider: 'huntlo-whatsapp' };
  }

  if (secrets.provider === 'meta-whatsapp') {
    const phoneNumberId = String(
      secrets.providerAccountId ||
        (secrets.config as { phoneNumberId?: string; metaPhoneNumberId?: string } | null)
          ?.phoneNumberId ||
        (secrets.config as { metaPhoneNumberId?: string } | null)?.metaPhoneNumberId ||
        ''
    ).trim();
    const accessToken = secrets.accessToken;
    if (!phoneNumberId || !accessToken) {
      throw Object.assign(new Error('Meta WhatsApp credentials are incomplete.'), {
        statusCode: 400,
      });
    }
    const result = await sendMetaWhatsAppText({
      phoneNumberId,
      accessToken,
      to: input.to,
      body,
    });
    return { messageId: result.messageId, provider: 'meta-whatsapp' };
  }

  if (secrets.provider === 'gupshup') {
    const result = await sendGupshupText({ to: input.to, body, mode: 'reply' });
    return { messageId: result.messageId, provider: 'gupshup' };
  }

  throw Object.assign(
    new Error(`WhatsApp provider "${secrets.provider}" cannot send yet.`),
    { statusCode: 501 }
  );
}

async function launchVoiceCall(input: {
  campaign: OutreachCampaignDocument;
  candidateName: string;
  phone: string;
  step: CampaignSequenceStep;
  mergeContext: Record<string, string>;
}): Promise<{ messageId?: string; provider: string; script: string }> {
  const script = mergeMessageTemplate(
    String(input.step.body || input.step.note || '').trim(),
    input.mergeContext
  );
  const agent = await createHunarVoiceAgent({
    name: `${input.campaign.name} · voice`.slice(0, 80),
    agentPrompt: script || `Call the candidate about ${input.campaign.name}.`,
    objective: `Outreach for ${input.campaign.name}`,
    introduction:
      script.slice(0, 280) ||
      'Hello, this is a call from Huntlo recruiting.',
    resultPrompt: 'Summarize interest and next steps.',
    resultSchema: {
      type: 'object',
      properties: {
        interested: { type: 'boolean' },
        notes: { type: 'string' },
      },
    },
    voicePersona: getHunarVoicePersona(),
    language: getHunarVoiceLanguage(),
  });

  const mobile = normalizePhone(input.phone).replace(/^\+/, '');
  const bulk = await createHunarBulkCalls({
    agentId: agent.agentId,
    campaignId: String(input.campaign._id),
    callees: [
      {
        callee_name: input.candidateName || 'Candidate',
        mobile_number: mobile,
        custom_data: {
          key_0: input.campaign.name,
          key_1: String(input.campaign._id),
        },
      },
    ],
  });

  return { messageId: bulk.requestId, provider: 'hunar', script };
}

/**
 * Send a one-off message (outside the sequence job pipeline) through the
 * organization's connected email/WhatsApp integration — used by candidate
 * actions like "send scheduling link". Reuses the same provider adapters as
 * the sequence worker but does not reserve/commit outreach quota, since
 * these are manual recruiter-triggered sends rather than automated steps.
 */
export async function sendAdHocMessage(input: {
  organizationId: string;
  userId: string;
  channel: 'email' | 'whatsapp';
  to: string;
  subject?: string | null;
  body: string;
  senderEmail?: string | null;
  integrationId?: string | null;
}): Promise<{ providerMessageId?: string; provider: string }> {
  const integration = await resolveIntegration(
    input.organizationId,
    input.userId,
    input.channel === 'email' ? 'email' : 'whatsapp',
    input.integrationId
  );
  if (!integration) {
    throw Object.assign(
      new Error(`No connected ${input.channel} integration to send this message.`),
      { statusCode: 400 }
    );
  }

  if (input.channel === 'email') {
    const sent = await sendEmailViaIntegration({
      secrets: integration.secrets,
      to: input.to,
      subject: input.subject || '',
      body: input.body,
      fromOverride: input.senderEmail,
    });
    return { providerMessageId: sent.messageId, provider: sent.provider };
  }

  const sent = await sendWhatsAppViaIntegration({
    secrets: integration.secrets,
    to: input.to,
    body: input.body,
  });
  return { providerMessageId: sent.messageId, provider: sent.provider };
}

/**
 * Execute one campaign sequence message step against a live provider.
 * Skips (no quota) when the candidate lacks the required contact.
 */
export async function executeCampaignMessageStep(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
  step: CampaignSequenceStep;
  jobId: string;
}): Promise<DeliveryResult> {
  const logger = getLogger();
  const { campaign, enrollment, step, jobId } = input;
  const organizationId = String(campaign.organizationId);
  const userId = String(campaign.ownerUserId);

  const messageType =
    step.type === 'email' || step.type === 'scheduling_link'
      ? 'email'
      : step.type === 'whatsapp'
        ? 'whatsapp'
        : step.type === 'ai_voice'
          ? 'ai_voice'
          : null;

  if (!messageType) {
    return { outcome: 'skipped', reason: 'non_message' };
  }

  const candidate = await loadCandidate(organizationId, enrollment.candidateId);
  const email = String(candidate?.email || '').trim();
  const phone = String(candidate?.phone || '').trim();

  // Keep enrollment contact flags in sync with the live candidate record.
  enrollment.contactAvailability.email = Boolean(email);
  enrollment.contactAvailability.phone = Boolean(phone);

  if (messageType === 'email' && !email) {
    return { outcome: 'skipped', reason: 'missing_email', channel: 'email' };
  }
  if ((messageType === 'whatsapp' || messageType === 'ai_voice') && !phone) {
    return { outcome: 'skipped', reason: 'missing_phone', channel: messageType };
  }

  const mergeContext = await buildMergeContext(campaign, candidate);

  if (messageType === 'email') {
    const integration = await resolveIntegration(
      organizationId,
      userId,
      'email',
      campaign.channelConfig.email?.integrationId
    );
    if (!integration) {
      throw Object.assign(new Error('No connected email integration for this campaign.'), {
        statusCode: 400,
      });
    }

    const key = `campaign-job:${jobId}:email`;
    await quotaService.reserveUsage({
      organizationId,
      metric: 'email_outreach',
      quantity: 1,
      idempotencyKey: key,
      relatedEntityType: 'campaign_job',
      relatedEntityId: jobId,
    });

    const renderedSubject = mergeMessageTemplate(step.subject || campaign.name, mergeContext);
    const renderedBody = mergeMessageTemplate(step.body || step.note || '', mergeContext);

    try {
      const sent = await sendEmailViaIntegration({
        secrets: integration.secrets,
        to: email,
        subject: renderedSubject,
        body: renderedBody,
        fromOverride: campaign.channelConfig.email?.senderEmail,
      });
      await quotaService.commitUsage({
        organizationId,
        metric: 'email_outreach',
        idempotencyKey: key,
      });
      return {
        outcome: 'sent',
        channel: 'email',
        providerMessageId: sent.messageId,
        provider: sent.provider,
        renderedSubject,
        renderedBody,
      };
    } catch (error) {
      await quotaService
        .releaseUsage({
          organizationId,
          metric: 'email_outreach',
          idempotencyKey: key,
        })
        .catch(() => undefined);
      throw error;
    }
  }

  if (messageType === 'whatsapp') {
    const integration = await resolveIntegration(
      organizationId,
      userId,
      'whatsapp',
      campaign.channelConfig.whatsapp?.integrationId
    );
    if (!integration) {
      throw Object.assign(new Error('No connected WhatsApp integration for this campaign.'), {
        statusCode: 400,
      });
    }

    const key = `campaign-job:${jobId}:whatsapp`;
    await quotaService.reserveUsage({
      organizationId,
      metric: 'whatsapp_outreach',
      quantity: 1,
      idempotencyKey: key,
      relatedEntityType: 'campaign_job',
      relatedEntityId: jobId,
    });

    const renderedBody = mergeMessageTemplate(step.body || step.note || '', mergeContext);

    try {
      const sent = await sendWhatsAppViaIntegration({
        secrets: integration.secrets,
        to: phone,
        body: renderedBody,
      });
      await quotaService.commitUsage({
        organizationId,
        metric: 'whatsapp_outreach',
        idempotencyKey: key,
      });
      return {
        outcome: 'sent',
        channel: 'whatsapp',
        providerMessageId: sent.messageId,
        provider: sent.provider,
        renderedBody,
      };
    } catch (error) {
      await quotaService
        .releaseUsage({
          organizationId,
          metric: 'whatsapp_outreach',
          idempotencyKey: key,
        })
        .catch(() => undefined);
      throw error;
    }
  }

  // AI voice
  const key = `campaign-job:${jobId}:voice`;
  await quotaService.reserveUsage({
    organizationId,
    metric: 'ai_voice_minutes',
    quantity: 1,
    idempotencyKey: key,
    relatedEntityType: 'campaign_job',
    relatedEntityId: jobId,
  });

  try {
    const sent = await launchVoiceCall({
      campaign,
      candidateName: candidate?.name || 'Candidate',
      phone,
      step,
      mergeContext,
    });
    await quotaService.commitUsage({
      organizationId,
      metric: 'ai_voice_minutes',
      idempotencyKey: key,
    });
    return {
      outcome: 'sent',
      channel: 'ai_voice',
      providerMessageId: sent.messageId,
      provider: sent.provider,
      renderedBody: sent.script,
    };
  } catch (error) {
    logger.warn(
      { err: error, campaignId: String(campaign._id), jobId },
      'Campaign voice launch failed'
    );
    await quotaService
      .releaseUsage({
        organizationId,
        metric: 'ai_voice_minutes',
        idempotencyKey: key,
      })
      .catch(() => undefined);
    throw error;
  }
}
