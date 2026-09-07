import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { sendGmailMessage, sendGmailViaGateway } from '../../providers/gmail/gmail.send.js';
import {
  sendWhatsAppViaGateway,
  type GatewayWhatsAppButton,
  type GatewayWhatsAppQuestion,
} from '../../providers/whatsapp/whatsapp.gateway.js';
import { buildSchedulingUrl } from '../../providers/calendly/calendly.client.js';
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
  sendMetaWhatsAppReplyButtons,
  sendMetaWhatsAppTemplate,
  sendMetaWhatsAppText,
  type MetaReplyButton,
} from '../../providers/meta-whatsapp/meta.send.js';
import {
  buildMetaTemplateBodyParameters,
  findApprovedMetaTemplate,
} from '../../providers/meta-whatsapp/meta.templates.js';
import { stampWhatsAppOutboundRoute } from '../webhooks/whatsapp-outbound-route.service.js';
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
  isIndianE164,
  launchBulkVoiceCalls,
  normalizeVoiceRetryConfig,
  resolveIntroduction,
  resolveVoiceTokens,
  syncVoiceAgent,
  withCampaignVoiceAgentLock,
} from '../voice/voice-dialer.service.js';
import { buildRoshniAgentPrompt, qualificationQuestionsForRoshni } from '../voice/roshni-prompt.js';
import {
  analysisVariablesFromResultSchema,
  extendResultSchemaForQualificationQuestions,
} from '../voice/voice-qualification-sync.js';
import { UserModel } from '../auth/user.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { integrationsService } from '../integrations/integration.service.js';
import { JobModel } from '../jobs/job.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { ConversationMessageModel } from '../conversations/conversation-message.model.js';
import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import {
  findHcgGmailConversation,
  hcgGmailApiMessageIdHint,
  hcgGmailShouldStopSequence,
  hcgGmailThreadIdOf,
  waitForHcgGmailConversation,
} from '../conversations/hcg-gmail-overlay.js';
import { HcgWhatsappConversationModel } from '../communication-gateway/models/hcg-whatsapp-conversation.model.js';
import {
  findHcgWhatsappConversation,
  hcgWhatsappShouldStopSequence,
  hcgWhatsappThreadIdOf,
  waitForHcgWhatsappConversation,
} from '../conversations/hcg-whatsapp-overlay.js';
import { getOrgCalendlyCredentials } from '../scheduling/calendly-credentials.js';
import { applyMergeFallbacks, buildCandidateMergeContext, mergeOutboundMessage } from './variables.js';
import { formatOutreachJobContextForPrompt, loadOutreachJobContext } from './job-context.js';
import {
  buildAutoCalendlyPrompt,
  buildScreeningClosePrompt,
  buildWhatsAppAutoCalendlyPrompt,
  buildWhatsAppScreeningClosePrompt,
  formatKnockoutPassCondition,
} from './prompt/index.js';
import {
  OutreachCampaignModel,
  type CampaignSequenceStep,
  type OutreachCampaignDocument,
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

/** Keep sequence follow-ups in the same Gmail thread as the first send. */
async function resolveSequenceEmailThreading(input: {
  organizationId: string;
  enrollmentId: string;
  fallbackSubject: string;
}): Promise<{
  subject: string;
  providerThreadId: string | null;
  inReplyTo: string | null;
  references: string | null;
  gmailMessageIdHint: string | null;
}> {
  const thread = await ConversationThreadModel.findOne({
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
  })
    .select('_id providerThreadIds')
    .lean();

  if (!thread) {
    return {
      subject: input.fallbackSubject,
      providerThreadId: null,
      inReplyTo: null,
      references: null,
      gmailMessageIdHint: null,
    };
  }

  const recentEmails = await ConversationMessageModel.find({
    threadId: thread._id,
    channel: 'email',
    deliveryStatus: { $ne: 'failed' },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('subject providerMessageId providerThreadId direction')
    .lean();

  const firstOutbound =
    [...recentEmails].reverse().find((m) => m.direction === 'outbound') || null;
  const lastAny = recentEmails[0] || null;

  const fromThread =
    thread.providerThreadIds?.find((p) => p.provider === 'gmail')?.threadId ||
    thread.providerThreadIds?.[0]?.threadId ||
    null;

  const providerThreadId =
    recentEmails.map((m) => m.providerThreadId).find((id) => Boolean(id)) ||
    fromThread ||
    null;

  const rfcId = String(lastAny?.providerMessageId || '');
  const inReplyTo = rfcId.startsWith('<') && rfcId.includes('@') ? rfcId : null;

  let gmailMessageIdHint: string | null = null;
  for (const msg of recentEmails) {
    const pid = String(msg.providerMessageId || '').trim();
    if (pid && !pid.startsWith('<') && !pid.includes(':') && !pid.startsWith('bull-job')) {
      gmailMessageIdHint = pid;
      break;
    }
  }

  const subjectBase = String(firstOutbound?.subject || input.fallbackSubject).trim();
  const subject = /^re\s*:/i.test(subjectBase) ? subjectBase : `Re: ${subjectBase}`;

  return {
    subject: recentEmails.length ? subject : input.fallbackSubject,
    providerThreadId: providerThreadId ? String(providerThreadId) : null,
    inReplyTo,
    references: inReplyTo,
    gmailMessageIdHint,
  };
}

function isFollowUpEmailSequenceStep(
  campaign: OutreachCampaignDocument,
  step: CampaignSequenceStep
): boolean {
  const emailSteps = [...(campaign.sequenceSteps || [])]
    .filter((item) => item.type === 'email' || item.type === 'scheduling_link')
    .sort((a, b) => a.order - b.order);
  return emailSteps.length > 0 && emailSteps[0]?.id !== step.id;
}

function isFollowUpWhatsAppSequenceStep(
  campaign: OutreachCampaignDocument,
  step: CampaignSequenceStep
): boolean {
  const waSteps = [...(campaign.sequenceSteps || [])]
    .filter((item) => item.type === 'whatsapp')
    .sort((a, b) => a.order - b.order);
  return waSteps.length > 0 && waSteps[0]?.id !== step.id;
}

function asReplySubject(original: string | null | undefined, fallback: string): string {
  const base = String(original || fallback || '').trim() || fallback;
  return /^re\s*:/i.test(base) ? base : `Re: ${base}`;
}

async function resolveGatewaySequenceThreading(input: {
  organizationId: string;
  enrollmentId: string;
  campaignId: string;
  email: string;
  fallbackSubject: string;
  accessToken: string;
  waitForThread: boolean;
}): Promise<{
  subject: string;
  threadId: string | null;
  inReplyTo: string | null;
  references: string | null;
}> {
  const huntlo = await resolveSequenceEmailThreading({
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    fallbackSubject: input.fallbackSubject,
  });

  let hcg = await findHcgGmailConversation(input.campaignId, input.email);
  if (input.waitForThread && !hcgGmailThreadIdOf(hcg) && !huntlo.providerThreadId) {
    hcg = await waitForHcgGmailConversation(input.campaignId, input.email);
  }

  let threadId = huntlo.providerThreadId || hcgGmailThreadIdOf(hcg);
  let inReplyTo = huntlo.inReplyTo;
  let references = huntlo.references || inReplyTo;
  const hint = huntlo.gmailMessageIdHint || hcgGmailApiMessageIdHint(hcg);

  if (hint && input.accessToken) {
    const meta = await getGmailThreadingMeta(input.accessToken, hint);
    if (!threadId && meta.threadId) threadId = meta.threadId;
    if (!inReplyTo && meta.rfcMessageId) {
      inReplyTo = meta.rfcMessageId;
      references = meta.rfcMessageId;
    }
  }

  return {
    subject: asReplySubject(hcg?.subject || huntlo.subject, input.fallbackSubject),
    threadId,
    inReplyTo,
    references: references || inReplyTo,
  };
}

export type DeliverySkipReason =
  | 'missing_email'
  | 'missing_phone'
  | 'non_message'
  | 'candidate_replied';

export async function enrollmentHasLiveGatewayReply(input: {
  campaignId: string;
  email?: string | null;
  phone?: string | null;
}): Promise<boolean> {
  const email = String(input.email || '').trim();
  const phone = String(input.phone || '').trim();
  if (email) {
    const gmail = await findHcgGmailConversation(input.campaignId, email);
    if (hcgGmailShouldStopSequence(gmail)) return true;
  }
  if (phone) {
    const wa = await findHcgWhatsappConversation(input.campaignId, phone);
    if (hcgWhatsappShouldStopSequence(wa)) return true;
  }
  return false;
}

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
    .select('name email phone currentTitle currentCompany location headline experienceYears skills')
    .lean();
}

/**
 * Build the personalization merge context for a campaign + candidate pair.
 * `job_title` / `location` / `company_name` come from the linked job + org;
 * `current_role` / `current_company` reflect the candidate's own profile.
 */
async function buildMergeContext(
  campaign: OutreachCampaignDocument,
  candidate: Awaited<ReturnType<typeof loadCandidate>>
): Promise<Record<string, string>> {
  const [job, organization, owner] = await Promise.all([
    campaign.jobId
      ? JobModel.findById(campaign.jobId).select('title locations workplaceType').lean()
      : null,
    OrganizationModel.findById(campaign.organizationId).select('name').lean(),
    UserModel.findById(campaign.ownerUserId).select('firstName lastName companyName').lean(),
  ]);

  const jobLocations = Array.isArray(job?.locations)
    ? job.locations.map((value) => String(value || '').trim()).filter(Boolean)
    : [];
  const recruiterName = [owner?.firstName, owner?.lastName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ');

  return applyMergeFallbacks(
    buildCandidateMergeContext(candidate, {
      jobTitle: job?.title || campaign.name || null,
      companyName: organization?.name || owner?.companyName || null,
      recruiterName: recruiterName || null,
      location:
        jobLocations.join(', ') ||
        (typeof job?.workplaceType === 'string' && job.workplaceType.trim()) ||
        candidate?.location ||
        null,
    })
  );
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
  organizationId?: string | null;
  campaignId?: string | null;
  enrollmentId?: string | null;
  replyButtons?: MetaReplyButton[] | null;
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

  const finish = async (result: {
    messageId?: string;
    provider: string;
    mode: 'template' | 'text';
  }) => {
    await stampWhatsAppOutboundRoute({
      providerMessageId: result.messageId,
      toPhone: input.to,
      provider: result.provider,
      organizationId: input.organizationId,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
    }).catch((error) => {
      logger.warn({ err: error, to: input.to }, 'Failed to stamp WhatsApp outbound route');
    });
    return result;
  };

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
      return finish({
        messageId: result.messageId,
        provider: secrets.provider,
        mode: 'template',
      });
    }

    if (input.templateId) {
      const metaTemplate = await findApprovedMetaTemplate(String(input.templateId));
      if (metaTemplate) {
        const bodyParameters = isForceTestWhatsAppTemplate()
          ? []
          : buildMetaTemplateBodyParameters(metaTemplate.variableCount, mergeContext);
        logger.info(
          {
            mode: 'template',
            templateName: metaTemplate.name,
            languageCode: metaTemplate.language,
            bodyParameters,
            to: input.to,
          },
          'Sending Meta WhatsApp template'
        );
        const result = await sendMetaWhatsAppTemplate({
          phoneNumberId,
          accessToken,
          to: input.to,
          templateName: isForceTestWhatsAppTemplate() ? 'hello_world' : metaTemplate.name,
          languageCode: metaTemplate.language,
          bodyParameters,
        });
        return finish({
          messageId: result.messageId,
          provider: secrets.provider,
          mode: 'template',
        });
      }
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

    const replyButtons = (input.replyButtons || []).filter(
      (button) => String(button.title || '').trim()
    );
    if (replyButtons.length >= 1) {
      try {
        logger.info(
          {
            mode: 'interactive',
            to: input.to,
            bodyPreview: body.slice(0, 80),
            buttons: replyButtons.map((button) => button.title),
          },
          'Sending WhatsApp reply buttons'
        );
        const result = await sendMetaWhatsAppReplyButtons({
          phoneNumberId,
          accessToken,
          to: input.to,
          body,
          buttons: replyButtons,
        });
        return finish({ messageId: result.messageId, provider: secrets.provider, mode: 'text' });
      } catch (error) {
        logger.warn(
          { err: error, to: input.to },
          'WhatsApp reply buttons failed — falling back to free-text'
        );
      }
    }

    logger.info({ mode: 'text', to: input.to, bodyPreview: body.slice(0, 80) }, 'Sending WhatsApp text');
    const result = await sendMetaWhatsAppText({
      phoneNumberId,
      accessToken,
      to: input.to,
      body,
    });
    return finish({ messageId: result.messageId, provider: secrets.provider, mode: 'text' });
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
      return finish({ messageId: result.messageId, provider: 'gupshup', mode: 'template' });
    }

    if (/\{\{\s*[0-9a-zA-Z_]+\s*\}\}/.test(body)) {
      throw Object.assign(
        new Error('Refusing to send WhatsApp free-text that still contains {{variables}}.'),
        { statusCode: 400, code: 'UNFILLED_WHATSAPP_VARIABLES' }
      );
    }

    const gupshupBody =
      (input.replyButtons || []).length >= 2
        ? `${body}\n\nReply ${input.replyButtons!.map((button) => button.title).join(' or ')}.`
        : body;
    const result = await sendGupshupText({ to: input.to, body: gupshupBody, mode: 'reply' });
    return finish({ messageId: result.messageId, provider: 'gupshup', mode: 'text' });
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
  const campaignId = String(input.campaign._id);

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

  const qualificationExtras = extendResultSchemaForQualificationQuestions(
    roshni?.resultSchema,
    typeof input.campaign.voiceAgentConfig?.resultPrompt === 'string'
      ? String(input.campaign.voiceAgentConfig.resultPrompt)
      : roshni?.resultPrompt,
    input.campaign.qualificationConfig?.questions || []
  );

  // Parallel enrollment jobs all load a stale campaign without agentId and race
  // on Hunar create (500). Ensure agent once under a per-campaign lock, then dial.
  // Non-Indian numbers use Zyastra and do not need a Hunar agent.
  const needsHunar = isIndianE164(input.phone);
  getLogger().info(
    {
      campaignId,
      enrollmentId: input.enrollmentId,
      phone: input.phone,
      needsHunar,
      isIndianE164: needsHunar,
    },
    'Campaign voice dial routing decision'
  );
  let agentId: string | null = null;

  if (needsHunar) {
    agentId = await withCampaignVoiceAgentLock(campaignId, async () => {
      const fresh = await OutreachCampaignModel.findById(campaignId)
        .select('voiceAgentConfig')
        .lean();
      const existingAgentId =
        typeof fresh?.voiceAgentConfig?.agentId === 'string'
          ? String(fresh.voiceAgentConfig.agentId).trim()
          : typeof input.campaign.voiceAgentConfig?.agentId === 'string'
            ? String(input.campaign.voiceAgentConfig.agentId).trim()
            : '';

      if (existingAgentId) {
        if (!input.campaign.voiceAgentConfig) input.campaign.voiceAgentConfig = {};
        input.campaign.voiceAgentConfig.agentId = existingAgentId;
        return existingAgentId;
      }

      const synced = await syncVoiceAgent({
        name: `${input.campaign.name} · voice`.slice(0, 80),
        agentPrompt,
        objective,
        introduction,
        resultPrompt: qualificationExtras.resultPrompt,
        resultSchema: qualificationExtras.resultSchema,
        voicePersona: getHunarVoicePersona(),
        language: getHunarVoiceLanguage(),
        existingAgentId: null,
      });

      const nextConfig = {
        ...(typeof fresh?.voiceAgentConfig === 'object' && fresh.voiceAgentConfig
          ? fresh.voiceAgentConfig
          : {}),
        ...(input.campaign.voiceAgentConfig || {}),
        agentId: synced.agentId,
        objective,
        introduction,
        agentPrompt,
        resultPrompt: qualificationExtras.resultPrompt,
        updatedAt: new Date().toISOString(),
      };

      await OutreachCampaignModel.updateOne(
        { _id: campaignId },
        { $set: { voiceAgentConfig: nextConfig } }
      );
      input.campaign.voiceAgentConfig = nextConfig;
      return synced.agentId;
    });
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
    campaignId,
    agentId,
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
    agentPrompt,
    firstMessage: introduction || undefined,
    preferredLanguage: needsHunar ? undefined : 'en-US',
    questions: input.campaign.qualificationConfig?.questions || [],
    // Zyastra extracts these; include schema keys + common Roshni/Zyastra aliases.
    analysisVariables: needsHunar
      ? undefined
      : Array.from(
          new Set([
            ...analysisVariablesFromResultSchema(qualificationExtras.resultSchema),
            ...Object.keys(
              (qualificationExtras.resultSchema.properties as Record<string, unknown>) || {}
            ),
            'notice_period',
            'notice_period_days',
            'current_ctc',
            'current_ctc_lpa',
            'expected_ctc',
            'expected_ctc_lpa',
            'location',
            'relocation_willingness',
            'work_mode',
            'summary',
          ])
        ),
  });

  return {
    messageId: launched.requestId,
    provider: launched.zyastraDialed > 0 && launched.hunarDialed === 0 ? 'zyastra' : 'hunar',
    script: agentPrompt,
  };
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
    organizationId: input.organizationId,
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

  if (
    await enrollmentHasLiveGatewayReply({
      campaignId: String(campaign._id),
      email,
      phone,
    })
  ) {
    return { outcome: 'skipped', reason: 'candidate_replied', channel: messageType };
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
      idempotencyKey: key,
      relatedEntityType: 'campaign_job',
      relatedEntityId: jobId,
    });

    const renderedSubject = mergeOutboundMessage(step.subject || campaign.name, mergeContext);
    const renderedBody = mergeOutboundMessage(step.body || step.note || '', mergeContext);

    try {
      let sent: { messageId?: string; providerThreadId?: string; provider: string };
      let subjectOut = renderedSubject;

      if (integration.secrets.provider === 'gmail') {
        const accessToken = await withFreshEmailToken(integration.secrets);
        if (!accessToken) {
          throw Object.assign(new Error('No access token for Gmail email send.'), {
            statusCode: 401,
          });
        }

        const html = /<[a-z][\s\S]*>/i.test(renderedBody)
          ? renderedBody
          : `<p>${renderedBody
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br>')}</p>`;

        const followUp = isFollowUpEmailSequenceStep(campaign, step);
        const autoCalendly = Boolean(campaign.schedulingConfig?.enabled);
        const autoScreening = Boolean(campaign.qualificationConfig?.autoScreening);
        const autoWhatsApp = Boolean(campaign.qualificationConfig?.autoWhatsAppAfterQualification);
        const noAfterQualificationAction = !autoCalendly && !autoScreening && !autoWhatsApp;

        let prompt: string | null = null;
        if (!followUp && (autoCalendly || noAfterQualificationAction)) {
          const jobCtx = await loadOutreachJobContext(
            campaign.jobId ? String(campaign.jobId) : null
          );
          const promptBase = {
            jobText: formatOutreachJobContextForPrompt(jobCtx, campaign.name),
            candidateName: candidate?.name || 'Candidate',
            currentRole: candidate?.currentTitle || '',
            experience:
              candidate?.experienceYears != null ? `${candidate.experienceYears} years` : '',
            skills: Array.isArray(candidate?.skills) ? candidate.skills.join(', ') : '',
            location: candidate?.location || '',
            email,
            screening: (campaign.qualificationConfig?.questions || []).map((q) => ({
              id: q.id,
              question: q.prompt,
              required: true,
              pass_condition:
                q.knockout && q.knockoutCondition
                  ? formatKnockoutPassCondition(q.knockoutCondition)
                  : 'Informational only; any reasonable answer is acceptable',
            })),
          };

          if (autoCalendly) {
            const calendly = await getOrgCalendlyCredentials(organizationId, userId);
            let calendlyUrl = String(
              campaign.schedulingConfig?.eventTypeUri || calendly?.schedulingUrl || ''
            ).trim();
            if (calendlyUrl) {
              calendlyUrl = buildSchedulingUrl(calendlyUrl, {
                name: candidate?.name || undefined,
                email,
                utmSource: 'huntlo',
              });
            }
            prompt = buildAutoCalendlyPrompt({ ...promptBase, calendlyUrl });
          } else {
            prompt = buildScreeningClosePrompt(promptBase);
          }
        }

        let threadId: string | null = null;
        let inReplyTo: string | null = null;
        let references: string | null = null;
        if (followUp) {
          const threading = await resolveGatewaySequenceThreading({
            organizationId,
            enrollmentId: String(enrollment._id),
            campaignId: String(campaign._id),
            email,
            fallbackSubject: renderedSubject,
            accessToken,
            waitForThread: true,
          });
          subjectOut = threading.subject;
          threadId = threading.threadId;
          inReplyTo = threading.inReplyTo;
          references = threading.references;
          if (!threadId || !inReplyTo) {
            logger.warn(
              {
                component: 'email-threading',
                campaignId: String(campaign._id),
                enrollmentId: String(enrollment._id),
                hasThreadId: Boolean(threadId),
                hasInReplyTo: Boolean(inReplyTo),
              },
              'Gateway Gmail follow-up missing threadId or In-Reply-To — may create a new inbox thread'
            );
          }
        }

        const result = await sendGmailViaGateway({
          accessToken,
          to: email,
          subject: subjectOut,
          html,
          campaignId: String(campaign._id),
          prompt: followUp ? null : prompt,
          autoReply: followUp ? false : Boolean(prompt),
          threadId,
          inReplyTo,
          references,
        });
        sent = {
          messageId: result.messageId,
          providerThreadId: result.threadId || threadId || undefined,
          provider: 'gmail',
        };
      } else {
        const threading = await resolveSequenceEmailThreading({
          organizationId,
          enrollmentId: String(enrollment._id),
          fallbackSubject: renderedSubject,
        });
        subjectOut =
          threading.providerThreadId || threading.gmailMessageIdHint
            ? threading.subject
            : renderedSubject;
        sent = await sendEmailViaIntegration({
          secrets: integration.secrets,
          to: email,
          subject: subjectOut,
          body: renderedBody,
          fromOverride: campaign.channelConfig.email?.senderEmail,
          providerThreadId: threading.providerThreadId,
          inReplyTo: threading.inReplyTo,
          references: threading.references,
          gmailMessageIdHint: threading.gmailMessageIdHint,
        });
      }

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
        renderedSubject: subjectOut,
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
      conversationBody = mergeOutboundMessage(step.body || step.note || '', mergeContext);
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
      const useGateway =
        integration.secrets.provider === 'huntlo-whatsapp' ||
        integration.secrets.provider === 'meta-whatsapp';

      let sent: { messageId?: string; provider: string };
      let providerThreadId = String(phone || '').replace(/\D/g, '') || phone;

      if (useGateway) {
        const followUp = isFollowUpWhatsAppSequenceStep(campaign, step);
        const autoCalendly = Boolean(campaign.schedulingConfig?.enabled);
        const autoScreening = Boolean(campaign.qualificationConfig?.autoScreening);
        const autoWhatsApp = Boolean(campaign.qualificationConfig?.autoWhatsAppAfterQualification);
        const noAfterQualificationAction = !autoCalendly && !autoScreening && !autoWhatsApp;

        let prompt: string | null = null;
        if (!followUp && (autoCalendly || noAfterQualificationAction)) {
          const jobCtx = await loadOutreachJobContext(
            campaign.jobId ? String(campaign.jobId) : null
          );
          const promptBase = {
            jobText: formatOutreachJobContextForPrompt(jobCtx, campaign.name),
            candidateName: candidate?.name || 'Candidate',
            currentRole: candidate?.currentTitle || '',
            experience:
              candidate?.experienceYears != null ? `${candidate.experienceYears} years` : '',
            skills: Array.isArray(candidate?.skills) ? candidate.skills.join(', ') : '',
            location: candidate?.location || '',
            email: email || '',
            screening: (campaign.qualificationConfig?.questions || []).map((q) => ({
              id: q.id,
              question: q.prompt,
              required: true,
              pass_condition:
                q.knockout && q.knockoutCondition
                  ? formatKnockoutPassCondition(q.knockoutCondition)
                  : 'Informational only; any reasonable answer is acceptable',
            })),
          };
          if (autoCalendly) {
            const calendly = await getOrgCalendlyCredentials(organizationId, userId);
            let calendlyUrl = String(
              campaign.schedulingConfig?.eventTypeUri || calendly?.schedulingUrl || ''
            ).trim();
            if (calendlyUrl) {
              calendlyUrl = buildSchedulingUrl(calendlyUrl, {
                name: candidate?.name || undefined,
                email: email || undefined,
                utmSource: 'huntlo',
              });
            }
            prompt = buildWhatsAppAutoCalendlyPrompt({ ...promptBase, calendlyUrl });
          } else {
            prompt = buildWhatsAppScreeningClosePrompt(promptBase);
          }
        }

        let threadId: string | null = null;
        if (followUp) {
          let hcg = await findHcgWhatsappConversation(String(campaign._id), phone);
          if (!hcgWhatsappThreadIdOf(hcg)) {
            hcg = await waitForHcgWhatsappConversation(String(campaign._id), phone);
          }
          threadId = hcgWhatsappThreadIdOf(hcg);
          if (!threadId) {
            logger.warn(
              {
                component: 'whatsapp-threading',
                campaignId: String(campaign._id),
                enrollmentId: String(enrollment._id),
              },
              'Gateway WhatsApp follow-up missing threadId — may start a new conversation'
            );
          }
        }

        const catalogue =
          isColdTemplate && templateId ? getApprovedTemplate(String(templateId)) : null;
        const result = await sendWhatsAppViaGateway({
          to: phone,
          campaignId: String(campaign._id),
          template: catalogue ? getMetaTemplateName(catalogue) : null,
          variables: catalogue ? buildMetaBodyParameters(catalogue.id, mergeContext) : [],
          body: catalogue ? null : conversationBody,
          prompt: followUp ? null : prompt,
          autoReply: followUp ? false : Boolean(prompt),
          threadId,
        });
        sent = { messageId: result.messageId, provider: 'huntlo-whatsapp' };
        providerThreadId = result.threadId || threadId || providerThreadId;
      } else {
        sent = await sendWhatsAppViaIntegration({
          secrets: integration.secrets,
          to: phone,
          body: conversationBody,
          templateId: isColdTemplate ? templateId : null,
          mergeContext,
          organizationId,
          campaignId: String(campaign._id),
          enrollmentId: String(enrollment._id),
        });
      }
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
        providerThreadId,
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

function isGatewayWhatsAppProvider(provider: string | undefined): boolean {
  return provider === 'huntlo-whatsapp' || provider === 'meta-whatsapp';
}

/** Reuse the campaign's WhatsApp thread so inbound still matches campaignId. */
async function armHcgWhatsappPostQualification(input: {
  campaignId: string;
  to: string;
  threadId: string;
  prompt: string;
}) {
  const phone = String(input.to || '').replace(/\D/g, '');
  await HcgWhatsappConversationModel.updateOne(
    { threadId: input.threadId },
    {
      $set: {
        autoReply: true,
        prompt: input.prompt,
        campaignId: input.campaignId,
        ...(phone ? { phone } : {}),
        overallAIStatus: 'in_qualification',
        overallAIDescription: 'Post-qualification WhatsApp questions',
      },
      $setOnInsert: {
        threadId: input.threadId,
        messages: [],
        questions: [],
      },
    },
    { upsert: true }
  );
}

async function sendHiringFlowWhatsAppViaGateway(input: {
  to: string;
  campaignId: string;
  enrollmentId: string;
  organizationId: string;
  provider: string;
  template?: string | null;
  variables?: string[];
  body?: string | null;
  prompt?: string | null;
  autoReply?: boolean;
  buttons?: GatewayWhatsAppButton[] | null;
  questions?: GatewayWhatsAppQuestion[] | null;
  threadId?: string | null;
}): Promise<{ providerMessageId?: string; provider: string; threadId?: string }> {
  const autoReply = input.autoReply === true;
  const prompt = autoReply ? String(input.prompt || '').trim() || null : null;
  const hcg = await findHcgWhatsappConversation(input.campaignId, input.to);
  const existingThreadId = String(input.threadId || '').trim() || hcgWhatsappThreadIdOf(hcg);
  const result = await sendWhatsAppViaGateway({
    to: input.to,
    campaignId: input.campaignId,
    template: input.template || null,
    variables: input.variables || [],
    body: input.template ? null : input.body || null,
    prompt,
    autoReply,
    threadId: existingThreadId,
    buttons: input.buttons,
    questions: input.questions,
  });
  const threadId = result.threadId || existingThreadId;
  if (autoReply && prompt && threadId) {
    await armHcgWhatsappPostQualification({
      campaignId: input.campaignId,
      to: input.to,
      threadId,
      prompt,
    });
  }
  await stampWhatsAppOutboundRoute({
    providerMessageId: result.messageId,
    toPhone: input.to,
    provider: input.provider,
    organizationId: input.organizationId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
  }).catch((error) => {
    getLogger()
      .child({ component: 'hiring-flow-whatsapp' })
      .warn({ err: error, to: input.to }, 'Failed to stamp hiring-flow WhatsApp outbound route');
  });
  getLogger()
    .child({ component: 'hiring-flow-whatsapp' })
    .info(
      {
        campaignId: input.campaignId,
        enrollmentId: input.enrollmentId,
        threadId,
        template: input.template || null,
        autoReply,
      },
      'Hiring-flow WhatsApp sent via communication gateway'
    );
  return {
    providerMessageId: result.messageId,
    provider: input.provider,
    threadId: threadId || undefined,
  };
}

/** Ad-hoc WhatsApp template send used by post-qualification hiring flows. */
export async function sendHiringFlowWhatsAppTemplate(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
  enrollmentId: string;
  to: string;
  templateId: string;
  body: string;
  mergeContext: Record<string, string>;
}): Promise<{ providerMessageId?: string; provider: string; threadId?: string }> {
  const integration = await resolveIntegration(
    input.organizationId,
    input.userId,
    'whatsapp',
    null
  );
  if (!integration) {
    throw Object.assign(new Error('No connected WhatsApp integration for hiring flow.'), {
      statusCode: 400,
    });
  }

  if (isGatewayWhatsAppProvider(integration.secrets.provider)) {
    const catalogue = getApprovedTemplate(String(input.templateId));
    if (catalogue) {
      return sendHiringFlowWhatsAppViaGateway({
        to: input.to,
        campaignId: input.campaignId,
        enrollmentId: input.enrollmentId,
        organizationId: input.organizationId,
        provider: integration.secrets.provider,
        template: getMetaTemplateName(catalogue),
        variables: buildMetaBodyParameters(catalogue.id, input.mergeContext),
      });
    }
    const metaTemplate = await findApprovedMetaTemplate(String(input.templateId));
    if (metaTemplate) {
      return sendHiringFlowWhatsAppViaGateway({
        to: input.to,
        campaignId: input.campaignId,
        enrollmentId: input.enrollmentId,
        organizationId: input.organizationId,
        provider: integration.secrets.provider,
        template: isForceTestWhatsAppTemplate() ? 'hello_world' : metaTemplate.name,
        variables: isForceTestWhatsAppTemplate()
          ? []
          : buildMetaTemplateBodyParameters(metaTemplate.variableCount, input.mergeContext),
      });
    }
    return sendHiringFlowWhatsAppViaGateway({
      to: input.to,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      organizationId: input.organizationId,
      provider: integration.secrets.provider,
      body: input.body,
    });
  }

  const sent = await sendWhatsAppViaIntegration({
    secrets: integration.secrets,
    to: input.to,
    body: input.body,
    templateId: input.templateId,
    mergeContext: input.mergeContext,
    organizationId: input.organizationId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
  });
  return { providerMessageId: sent.messageId, provider: sent.provider };
}

/**
 * Post-qualify WhatsApp for Huntlo/Meta: /messages/send?autoReply=true with the
 * same campaignId so the gateway thread stays matched and asks questions.
 * Returns null when the org is on Gupshup (Huntlo still owns that playbook).
 */
export async function sendPostQualificationWhatsAppViaGateway(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
  enrollmentId: string;
  to: string;
  templateId: string;
  body: string;
  mergeContext: Record<string, string>;
  prompt: string;
  questions?: GatewayWhatsAppQuestion[] | null;
}): Promise<{ providerMessageId?: string; provider: string; threadId?: string } | null> {
  const integration = await resolveIntegration(
    input.organizationId,
    input.userId,
    'whatsapp',
    null
  );
  if (!integration) {
    throw Object.assign(new Error('No connected WhatsApp integration for hiring flow.'), {
      statusCode: 400,
    });
  }
  if (!isGatewayWhatsAppProvider(integration.secrets.provider)) {
    return null;
  }

  const prompt = String(input.prompt || '').trim();
  if (!prompt) {
    throw Object.assign(new Error('prompt is required when autoReply is true'), {
      statusCode: 400,
    });
  }

  const catalogue = getApprovedTemplate(String(input.templateId));
  if (catalogue) {
    return sendHiringFlowWhatsAppViaGateway({
      to: input.to,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      organizationId: input.organizationId,
      provider: integration.secrets.provider,
      template: getMetaTemplateName(catalogue),
      variables: buildMetaBodyParameters(catalogue.id, input.mergeContext),
      prompt,
      autoReply: true,
      questions: input.questions,
    });
  }
  const metaTemplate = await findApprovedMetaTemplate(String(input.templateId));
  if (metaTemplate) {
    return sendHiringFlowWhatsAppViaGateway({
      to: input.to,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      organizationId: input.organizationId,
      provider: integration.secrets.provider,
      template: isForceTestWhatsAppTemplate() ? 'hello_world' : metaTemplate.name,
      variables: isForceTestWhatsAppTemplate()
        ? []
        : buildMetaTemplateBodyParameters(metaTemplate.variableCount, input.mergeContext),
      prompt,
      autoReply: true,
      questions: input.questions,
    });
  }
  return sendHiringFlowWhatsAppViaGateway({
    to: input.to,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
    organizationId: input.organizationId,
    provider: integration.secrets.provider,
    body: input.body,
    prompt,
    autoReply: true,
    questions: input.questions,
  });
}

/** Ad-hoc WhatsApp free-text send used by hiring-flow question steps. */
export async function sendHiringFlowWhatsAppText(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
  enrollmentId: string;
  to: string;
  body: string;
  replyButtons?: MetaReplyButton[] | null;
  threadId?: string | null;
}): Promise<{ providerMessageId?: string; provider: string; threadId?: string }> {
  const integration = await resolveIntegration(
    input.organizationId,
    input.userId,
    'whatsapp',
    null
  );
  if (!integration) {
    throw Object.assign(new Error('No connected WhatsApp integration for hiring flow.'), {
      statusCode: 400,
    });
  }

  if (isGatewayWhatsAppProvider(integration.secrets.provider)) {
    const buttons = (input.replyButtons || [])
      .map((button) => ({
        id: String(button.id || '').trim(),
        title: String(button.title || '').trim(),
      }))
      .filter((button) => button.id && button.title);
    return sendHiringFlowWhatsAppViaGateway({
      to: input.to,
      campaignId: input.campaignId,
      enrollmentId: input.enrollmentId,
      organizationId: input.organizationId,
      provider: integration.secrets.provider,
      body: input.body,
      buttons,
      autoReply: false,
      threadId: input.threadId,
    });
  }

  const sent = await sendWhatsAppViaIntegration({
    secrets: integration.secrets,
    to: input.to,
    body: input.body,
    templateId: null,
    organizationId: input.organizationId,
    campaignId: input.campaignId,
    enrollmentId: input.enrollmentId,
    replyButtons: input.replyButtons,
  });
  return { providerMessageId: sent.messageId, provider: sent.provider };
}
