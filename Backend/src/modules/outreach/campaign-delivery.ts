import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { sendGmailMessage } from '../../providers/gmail/gmail.send.js';
import { getGmailThreadingMeta } from '../../providers/gmail/gmail.fetch.js';
import { refreshGmailAccessToken } from '../../providers/gmail/gmail.oauth.js';
import { sendGupshupTemplate, sendGupshupText } from '../../providers/gupshup/gupshup.send.js';
import {
  getHunarVoiceLanguage,
  getHunarVoicePersona,
} from '../../providers/hunar/hunar.config.js';
import {
  getHuntloWhatsAppCredentials,
} from '../../providers/meta-whatsapp/meta.config.js';
import {
  sendMetaWhatsAppTemplate,
  sendMetaWhatsAppText,
} from '../../providers/meta-whatsapp/meta.send.js';
import { sendOutlookMail } from '../../providers/outlook/outlook.send.js';
import { refreshOutlookAccessToken } from '../../providers/outlook/outlook.oauth.js';
import {
  sendSmtpMail,
  type SmtpConfig,
  type SmtpSecurity,
} from '../../providers/smtp/smtp.js';
import { sendZohoMail } from '../../providers/zoho/zoho.send.js';
import { resolveZohoAccountId } from '../../providers/zoho/zoho.fetch.js';
import { refreshZohoAccessToken } from '../../providers/zoho/zoho.oauth.js';
import { quotaService } from '../../shared/usage/index.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import {
  buildJdVoiceTokens,
  launchBulkVoiceCalls,
  normalizeVoiceRetryConfig,
  resolveIntroduction,
  resolveVoiceTokens,
  syncVoiceAgent,
} from '../voice/voice-dialer.service.js';
import { buildRoshniAgentPrompt, qualificationQuestionsForRoshni } from '../voice/roshni-prompt.js';
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
import {
  APPROVED_WHATSAPP_TEMPLATES,
  buildMetaBodyParameters,
  getApprovedTemplate,
  getMetaTemplateLanguage,
  getMetaTemplateName,
  isColdOutboundWhatsAppTemplate,
  isForceTestWhatsAppTemplate,
  renderWhatsAppTemplatePreview,
  resolveGupshupTemplateId,
} from './whatsapp-template-catalogue.js';

export type DeliverySkipReason = 'missing_email' | 'missing_phone' | 'non_message';

export type DeliveryResult =
  | {
      outcome: 'sent';
      channel: 'email' | 'whatsapp' | 'ai_voice';
      providerMessageId?: string;
      providerThreadId?: string;
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
  let resolvedId: string | null = null;
  if (integrationId && mongoose.Types.ObjectId.isValid(integrationId)) {
    const secrets = await integrationsService.getDecryptedSecrets(
      organizationId,
      integrationId
    );
    if (secrets) resolvedId = integrationId;
  }
  if (!resolvedId) {
    const fallback = await integrationsService.getDefaultForCategory(
      organizationId,
      userId,
      category
    );
    if (!fallback) return null;
    resolvedId = fallback.id;
  }

  const secrets = await integrationsService.getDecryptedSecrets(
    organizationId,
    resolvedId
  );
  if (!secrets) return null;

  // OAuth email providers: refresh expired access tokens before send/sync.
  if (
    category === 'email' &&
    (secrets.provider === 'gmail' ||
      secrets.provider === 'outlook' ||
      secrets.provider === 'zoho-mail')
  ) {
    const fresh = await integrationsService.ensureFreshAccessToken(
      organizationId,
      resolvedId
    );
    if (fresh) secrets.accessToken = fresh;
  }

  return { id: resolvedId, secrets };
}

/** Exported for reuse by email-reply-sync — refreshes gmail/outlook access tokens on demand. */
export async function withFreshEmailToken(
  secrets: IntegrationSecrets,
  organizationId?: string
): Promise<string | null> {
  const integrationId = secrets.integrationId;
  if (organizationId && integrationId) {
    const fresh = await integrationsService.ensureFreshAccessToken(
      organizationId,
      integrationId
    );
    if (fresh) return fresh;
  }

  const expiresAt =
    secrets.tokenExpiresAt instanceof Date
      ? secrets.tokenExpiresAt.getTime()
      : secrets.tokenExpiresAt
        ? new Date(secrets.tokenExpiresAt).getTime()
        : 0;
  if (secrets.accessToken && expiresAt > Date.now() + 60_000) {
    return secrets.accessToken;
  }

  if (!secrets.refreshToken) {
    return secrets.accessToken || null;
  }

  if (secrets.provider === 'gmail') {
    const tokens = await refreshGmailAccessToken(secrets.refreshToken);
    return String(tokens.access_token || '') || null;
  }
  if (secrets.provider === 'outlook') {
    const tokens = await refreshOutlookAccessToken(secrets.refreshToken);
    return String(tokens.access_token || '') || null;
  }
  if (secrets.provider === 'zoho-mail') {
    const dataCenter =
      typeof (secrets.config as { zohoDataCenter?: string } | null)?.zohoDataCenter === 'string'
        ? (secrets.config as { zohoDataCenter?: string }).zohoDataCenter
        : undefined;
    const tokens = await refreshZohoAccessToken(secrets.refreshToken, dataCenter);
    return String(tokens.access_token || '') || null;
  }
  return secrets.accessToken || null;
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
  /** Provider conversation / Gmail thread id for reply threading. */
  providerThreadId?: string | null;
  /** RFC Message-ID for In-Reply-To / References. */
  inReplyTo?: string | null;
  references?: string | null;
  /** Gmail API message id used to look up threadId when providerThreadId is unknown. */
  gmailMessageIdHint?: string | null;
}): Promise<{ messageId?: string; providerThreadId?: string; provider: string }> {
  const { secrets } = input;
  const subject = input.subject || '(no subject)';
  const text = input.body || '';
  const replyHeaders = {
    inReplyTo: input.inReplyTo || null,
    references: input.references || input.inReplyTo || null,
  };

  if (secrets.provider === 'smtp') {
    const config = smtpConfigFromSecrets(secrets);
    if (input.fromOverride) config.fromEmail = input.fromOverride;
    const result = await sendSmtpMail({
      config,
      to: input.to,
      subject,
      text,
      ...replyHeaders,
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
      ...replyHeaders,
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
    let threadId = input.providerThreadId || null;
    let inReplyTo = input.inReplyTo || null;
    let references = input.references || input.inReplyTo || null;

    // Always resolve RFC Message-ID (+ threadId) from a prior Gmail API message.
    // Subject "Re:" alone is not enough — Gmail splits threads without these headers.
    const hint = String(input.gmailMessageIdHint || '').trim();
    if (hint) {
      const meta = await getGmailThreadingMeta(accessToken, hint);
      if (!threadId && meta.threadId) threadId = meta.threadId;
      if (!inReplyTo && meta.rfcMessageId) {
        inReplyTo = meta.rfcMessageId;
        references = meta.rfcMessageId;
      }
    }

    if (!threadId || !inReplyTo) {
      getLogger().warn(
        {
          component: 'email-threading',
          hasThreadId: Boolean(threadId),
          hasInReplyTo: Boolean(inReplyTo),
          hint: hint || null,
        },
        'Gmail follow-up missing threadId or In-Reply-To — may create a new inbox thread'
      );
    }

    const result = await sendGmailMessage({
      accessToken,
      to: input.to,
      subject,
      text,
      from: input.fromOverride || secrets.email,
      threadId,
      inReplyTo,
      references,
    });

    if (
      threadId &&
      result.threadId &&
      result.threadId !== threadId
    ) {
      getLogger().warn(
        {
          component: 'email-threading',
          requestedThreadId: threadId,
          returnedThreadId: result.threadId,
          hasInReplyTo: Boolean(inReplyTo),
        },
        'Gmail created/returned a different threadId — reply headers may be incomplete'
      );
    }

    return {
      messageId: result.messageId,
      providerThreadId: result.threadId || threadId || undefined,
      provider: 'gmail',
    };
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

  if (secrets.provider === 'zoho-mail') {
    const config = (secrets.config || {}) as {
      zohoDataCenter?: string;
      zohoAccountId?: string;
    };
    let accountId = String(config.zohoAccountId || secrets.providerAccountId || '').trim();
    let fromEmail = String(input.fromOverride || secrets.email || '').trim();
    if (!accountId || !fromEmail) {
      const resolved = await resolveZohoAccountId(accessToken, config.zohoDataCenter, fromEmail);
      accountId = accountId || resolved.accountId;
      fromEmail = fromEmail || resolved.email || '';
    }
    if (!accountId || !fromEmail) {
      throw Object.assign(new Error('Zoho account id / from address missing for send.'), {
        statusCode: 400,
      });
    }
    const result = await sendZohoMail({
      accessToken,
      accountId,
      dataCenter: config.zohoDataCenter,
      from: fromEmail,
      to: input.to,
      subject,
      text,
    });
    return { messageId: result.messageId, provider: 'zoho-mail' };
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
  templateId?: string | null;
  mergeContext?: Record<string, string>;
}): Promise<{ messageId?: string; provider: string; mode: 'template' | 'text' }> {
  const { secrets } = input;
  const body = input.body || '';
  const mergeContext = input.mergeContext || {};

  // Resolve cold-outbound catalogue entry from explicit id, or from body text that
  // still contains Meta-style {{1}}/{{2}} placeholders (legacy free-text path).
  let catalogue =
    input.templateId && isColdOutboundWhatsAppTemplate(input.templateId)
      ? getApprovedTemplate(String(input.templateId))
      : null;
  if (!catalogue && /\{\{\s*\d+\s*\}\}/.test(body)) {
    catalogue =
      APPROVED_WHATSAPP_TEMPLATES.find((template) => {
        const normalizedBody = body.replace(/\s+/g, ' ').trim();
        const normalizedTemplate = template.body.replace(/\s+/g, ' ').trim();
        return (
          normalizedBody === normalizedTemplate ||
          normalizedBody.includes(normalizedTemplate.slice(0, 80))
        );
      }) || null;
  }

  const bodyParameters = catalogue
    ? buildMetaBodyParameters(catalogue.id, mergeContext)
    : [];

  const logger = getLogger().child({ component: 'whatsapp-send' });

  if (secrets.provider === 'huntlo-whatsapp' || secrets.provider === 'meta-whatsapp') {
    let phoneNumberId = '';
    let accessToken = '';

    if (secrets.provider === 'huntlo-whatsapp') {
      const creds = getHuntloWhatsAppCredentials();
      if (!creds) {
        throw Object.assign(new Error('Huntlo WhatsApp is not configured on the server.'), {
          statusCode: 503,
        });
      }
      phoneNumberId = creds.phoneNumberId;
      accessToken = creds.accessToken;
    } else {
      phoneNumberId = String(
        secrets.providerAccountId ||
          (secrets.config as { phoneNumberId?: string; metaPhoneNumberId?: string } | null)
            ?.phoneNumberId ||
          (secrets.config as { metaPhoneNumberId?: string } | null)?.metaPhoneNumberId ||
          ''
      ).trim();
      accessToken = String(secrets.accessToken || '').trim();
      if (!phoneNumberId || !accessToken) {
        throw Object.assign(new Error('Meta WhatsApp credentials are incomplete.'), {
          statusCode: 400,
        });
      }
    }

    if (catalogue) {
      const templateName = getMetaTemplateName(catalogue);
      const languageCode = getMetaTemplateLanguage(catalogue);
      if (!bodyParameters.length && !isForceTestWhatsAppTemplate()) {
        throw Object.assign(
          new Error(
            `WhatsApp template "${templateName}" requires body parameters but none were built.`
          ),
          { statusCode: 400, code: 'MISSING_WHATSAPP_TEMPLATE_PARAMS' }
        );
      }
      logger.info(
        {
          mode: 'template',
          templateName,
          languageCode,
          bodyParameters,
          to: input.to,
        },
        'Sending WhatsApp template'
      );
      const result = await sendMetaWhatsAppTemplate({
        phoneNumberId,
        accessToken,
        to: input.to,
        templateName,
        languageCode,
        bodyParameters,
      });
      return {
        messageId: result.messageId,
        provider: secrets.provider,
        mode: 'template',
      };
    }

    if (!body.trim()) {
      throw Object.assign(
        new Error(
          'WhatsApp free-text send requires a message body (or a cold-outbound templateId).'
        ),
        { statusCode: 400 }
      );
    }

    // Session free-text must never ship Meta placeholders — that is how {{1}}/{{2}}
    // were reaching candidates when template mode was skipped.
    if (/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(body)) {
      throw Object.assign(
        new Error(
          'Refusing to send WhatsApp free-text that still contains {{variables}}. ' +
            'Use an approved templateId so Meta receives body parameters.'
        ),
        { statusCode: 400, code: 'UNFILLED_WHATSAPP_VARIABLES' }
      );
    }

    logger.info({ mode: 'text', to: input.to, bodyPreview: body.slice(0, 80) }, 'Sending WhatsApp text');
    const result = await sendMetaWhatsAppText({
      phoneNumberId,
      accessToken,
      to: input.to,
      body,
    });
    return { messageId: result.messageId, provider: secrets.provider, mode: 'text' };
  }

  if (secrets.provider === 'gupshup') {
    if (catalogue) {
      const gupshupTemplateId = resolveGupshupTemplateId(catalogue.id);
      if (!gupshupTemplateId) {
        throw Object.assign(new Error('Gupshup template id could not be resolved.'), {
          statusCode: 400,
        });
      }
      const result = await sendGupshupTemplate({
        to: input.to,
        templateId: gupshupTemplateId,
        bodyParameters,
      });
      return { messageId: result.messageId, provider: 'gupshup', mode: 'template' };
    }

    if (/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(body)) {
      throw Object.assign(
        new Error('Refusing to send WhatsApp free-text that still contains {{variables}}.'),
        { statusCode: 400, code: 'UNFILLED_WHATSAPP_VARIABLES' }
      );
    }

    const result = await sendGupshupText({ to: input.to, body, mode: 'reply' });
    return { messageId: result.messageId, provider: 'gupshup', mode: 'text' };
  }

  throw Object.assign(
    new Error(`WhatsApp provider "${secrets.provider}" cannot send yet.`),
    { statusCode: 501 }
  );
}

async function launchVoiceCall(input: {
  campaign: OutreachCampaignDocument;
  enrollmentId: string;
  candidateId: string;
  candidateName: string;
  phone: string;
  step: CampaignSequenceStep;
  mergeContext: Record<string, string>;
  organizationId: string;
  userId: string;
}): Promise<{ messageId?: string; provider: string; script: string }> {
  const jdTokens = await buildJdVoiceTokens(
    input.campaign.jobId ? String(input.campaign.jobId) : null
  );
  const tokens = { ...jdTokens, ...input.mergeContext, campaign_name: input.campaign.name };
  const stepBody = String(input.step.body || input.step.note || '').trim();
  const stepUsesRoshniTemplate = stepBody.includes('You are Roshni');

  const existingAgentId =
    typeof input.campaign.voiceAgentConfig?.agentId === 'string'
      ? String(input.campaign.voiceAgentConfig.agentId)
      : null;

  const storedPrompt =
    typeof input.campaign.voiceAgentConfig?.agentPrompt === 'string'
      ? String(input.campaign.voiceAgentConfig.agentPrompt).trim()
      : '';
  const useStoredCustomPrompt =
    storedPrompt.length > 0 &&
    !storedPrompt.includes('You are Roshni') &&
    !stepUsesRoshniTemplate;

  const qualificationQuestions = qualificationQuestionsForRoshni(
    input.campaign.qualificationConfig
  );

  const roshni =
    useStoredCustomPrompt && !stepUsesRoshniTemplate
      ? null
      : await buildRoshniAgentPrompt({
          jobId: input.campaign.jobId ? String(input.campaign.jobId) : null,
          organizationId: input.organizationId,
          campaignName: input.campaign.name,
          questions: qualificationQuestions,
        });

  let agentPrompt: string;
  if (useStoredCustomPrompt) {
    agentPrompt = resolveVoiceTokens(storedPrompt, tokens);
  } else if (stepUsesRoshniTemplate) {
    // Builder-edited Roshni prompt: fill JD tokens from live job/org context.
    agentPrompt = resolveVoiceTokens(stepBody, {
      ...tokens,
      ...(roshni?.tokens || {}),
    });
  } else if (roshni) {
    const stepNotes = stepBody ? resolveVoiceTokens(stepBody, tokens) : '';
    agentPrompt = [roshni.agentPrompt, stepNotes ? `\n\n## Campaign call notes\n${stepNotes}` : '']
      .filter(Boolean)
      .join('');
  } else {
    agentPrompt = resolveVoiceTokens(
      stepBody || `Call the candidate about ${input.campaign.name}.`,
      tokens
    );
  }

  const objective = resolveVoiceTokens(
    String(input.campaign.voiceAgentConfig?.objective || input.campaign.objective || '').trim() ||
      roshni?.objective ||
      `Outreach for ${input.campaign.name}`,
    tokens
  );
  const introduction = resolveIntroduction(
    typeof input.campaign.voiceAgentConfig?.tone === 'string'
      ? String(input.campaign.voiceAgentConfig.tone)
      : 'professional',
    typeof input.campaign.voiceAgentConfig?.introduction === 'string'
      ? resolveVoiceTokens(String(input.campaign.voiceAgentConfig.introduction), tokens)
      : roshni?.introduction || null
  );

  const synced = await syncVoiceAgent({
    name: `${input.campaign.name} · voice`.slice(0, 80),
    agentPrompt,
    objective,
    introduction,
    resultPrompt:
      typeof input.campaign.voiceAgentConfig?.resultPrompt === 'string'
        ? String(input.campaign.voiceAgentConfig.resultPrompt)
        : roshni?.resultPrompt,
    resultSchema: roshni?.resultSchema,
    voicePersona: getHunarVoicePersona(),
    language: getHunarVoiceLanguage(),
    existingAgentId,
  });

  if (!existingAgentId || existingAgentId !== synced.agentId || stepUsesRoshniTemplate || !useStoredCustomPrompt) {
    input.campaign.voiceAgentConfig = {
      ...(input.campaign.voiceAgentConfig || {}),
      agentId: synced.agentId,
      objective,
      introduction,
      agentPrompt,
      resultPrompt: roshni?.resultPrompt || input.campaign.voiceAgentConfig?.resultPrompt,
      updatedAt: new Date().toISOString(),
    };
    input.campaign.markModified('voiceAgentConfig');
    await input.campaign.save().catch(() => undefined);
  }

  const retry = normalizeVoiceRetryConfig(
    (input.campaign.voiceAgentConfig?.retry as {
      maxRetryCount?: number;
      retryIntervalHours?: number;
    }) || { maxRetryCount: 2, retryIntervalHours: 6 }
  );

  const launched = await launchBulkVoiceCalls({
    organizationId: input.organizationId,
    userId: input.userId,
    source: 'outreach',
    campaignId: String(input.campaign._id),
    agentId: synced.agentId,
    contacts: [
      {
        candidateId: input.candidateId,
        enrollmentId: input.enrollmentId,
        name: input.candidateName || 'Candidate',
        phone: input.phone,
        customData: {
          key_0: jdTokens.job_description || input.campaign.name,
          key_1: `${jdTokens.job_title || input.campaign.name} | Huntlo`,
        },
      },
    ],
    retryConfig: retry,
  });

  return { messageId: launched.requestId, provider: 'hunar', script: agentPrompt };
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
  /** Keep follow-ups in the same Gmail/provider conversation. */
  providerThreadId?: string | null;
  inReplyTo?: string | null;
  references?: string | null;
  gmailMessageIdHint?: string | null;
}): Promise<{
  providerMessageId?: string;
  providerThreadId?: string;
  provider: string;
}> {
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
      providerThreadId: input.providerThreadId,
      inReplyTo: input.inReplyTo,
      references: input.references,
      gmailMessageIdHint: input.gmailMessageIdHint,
    });
    return {
      providerMessageId: sent.messageId,
      providerThreadId: sent.providerThreadId,
      provider: sent.provider,
    };
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
        providerThreadId: sent.providerThreadId,
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

    const templateId = String(step.templateId || '').trim() || null;
    const isColdTemplate = Boolean(templateId && isColdOutboundWhatsAppTemplate(templateId));

    // Cold WhatsApp steps: conversation text comes ONLY from catalogue + merge params.
    // Never fall back to raw step.body (that is how "{{1}}" leaked to Meta as free-text).
    let conversationBody = '';
    if (isColdTemplate && templateId) {
      conversationBody = renderWhatsAppTemplatePreview(templateId, mergeContext);
    } else {
      conversationBody = mergeMessageTemplate(step.body || step.note || '', mergeContext);
    }

    if (!conversationBody.trim() || /\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(conversationBody)) {
      await quotaService
        .releaseUsage({
          organizationId,
          metric: 'whatsapp_outreach',
          idempotencyKey: key,
        })
        .catch(() => undefined);
      throw Object.assign(
        new Error(
          'WhatsApp message still contains unfilled variables ({{…}}) or is empty. ' +
            'Check candidate name, campaign job title, and templateId.'
        ),
        { statusCode: 400, code: 'UNFILLED_WHATSAPP_VARIABLES' }
      );
    }

    try {
      const sent = await sendWhatsAppViaIntegration({
        secrets: integration.secrets,
        to: phone,
        // For cold templates this body is preview-only; Meta gets template + params.
        body: conversationBody,
        templateId: isColdTemplate ? templateId : null,
        mergeContext,
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
        renderedBody: conversationBody,
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

  // AI voice — quota reserved inside launchBulkVoiceCalls (pending stubs);
  // webhook commits when the call becomes terminal.
  try {
    const sent = await launchVoiceCall({
      campaign,
      enrollmentId: String(enrollment._id),
      candidateId: String(enrollment.candidateId),
      candidateName: candidate?.name || 'Candidate',
      phone,
      step,
      mergeContext,
      organizationId,
      userId,
    });
    return {
      outcome: 'sent',
      channel: 'ai_voice',
      providerMessageId: sent.messageId,
      provider: sent.provider,
      // Never store the agent prompt in the conversation thread — transcript arrives via webhook.
      renderedBody: 'AI voice call started',
    };
  } catch (error) {
    logger.warn(
      { err: error, campaignId: String(campaign._id), jobId },
      'Campaign voice launch failed'
    );
    throw error;
  }
}
