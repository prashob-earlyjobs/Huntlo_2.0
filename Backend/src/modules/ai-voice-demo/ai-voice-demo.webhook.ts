import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { isGupshupWhatsAppConfigured } from '../../providers/gupshup/gupshup.config.js';
import { sendGupshupTemplate } from '../../providers/gupshup/gupshup.send.js';
import {
  mapHunarCallStatus,
  parseHunarWebhookPayload,
  type HunarWebhookKind,
} from '../../providers/hunar/hunar.webhook.js';
import {
  getHuntloWhatsAppCredentials,
  isHuntloWhatsAppConfigured,
} from '../../providers/meta-whatsapp/meta.config.js';
import { sendMetaWhatsAppTemplate } from '../../providers/meta-whatsapp/meta.send.js';
import {
  buildMetaBodyParameters,
  getApprovedTemplate,
  getDefaultTemplateForSlot,
  getMetaTemplateLanguage,
  getMetaTemplateName,
  resolveGupshupTemplateId,
} from '../outreach/whatsapp-template-catalogue.js';
import {
  AI_VOICE_DEMO_KYC_JOB,
  isKycIncompleteDemoJob,
} from './ai-voice-demo.jobs.js';
import { AiVoiceDemoCallModel, type AiVoiceDemoCallDocument } from './ai-voice-demo.model.js';

const DEFAULT_KYC_WHATSAPP_TEMPLATE = 'opening_message_01';

function log() {
  return getLogger().child({ component: 'ai-voice-demo-webhook' });
}

export function kycDemoWhatsAppTemplateId(): string {
  const fromEnv = String(process.env.AI_VOICE_DEMO_KYC_WA_TEMPLATE || '').trim();
  if (fromEnv && getApprovedTemplate(fromEnv)) return fromEnv;
  const opening = getDefaultTemplateForSlot('opening');
  return opening?.id || DEFAULT_KYC_WHATSAPP_TEMPLATE;
}

export function kycDemoWhatsAppMergeContext(demo: {
  company: string;
  email: string;
}): Record<string, string> {
  const fromEmail = demo.email.split('@')[0]?.trim() || '';
  const firstName =
    fromEmail.replace(/[._-]+/g, ' ').split(/\s+/)[0] ||
    demo.company.trim().split(/\s+/)[0] ||
    'there';
  return {
    first_name: firstName,
    FirstName: firstName,
    job_title: `${demo.company.trim() || 'KYC'} completion`,
    JobTitle: `${demo.company.trim() || 'KYC'} completion`,
  };
}

const BLOCKED_KYC_WHATSAPP_STATUSES = new Set([
  'no_answer',
  'failed',
  'busy',
  'cancelled',
  'voicemail',
  'queued',
  'ringing',
  'in_progress',
  'pending',
]);

export function shouldSendKycWhatsApp(input: {
  job: string;
  mappedStatus: string;
  kind: HunarWebhookKind;
}): boolean {
  if (!isKycIncompleteDemoJob(input.job)) return false;
  if (input.mappedStatus === 'completed') return true;
  if (input.kind !== 'call-result') return false;
  return !BLOCKED_KYC_WHATSAPP_STATUSES.has(input.mappedStatus);
}

async function sendKycWhatsAppTemplate(input: {
  to: string;
  templateId: string;
  mergeContext: Record<string, string>;
}): Promise<{ messageId?: string; provider: string }> {
  const catalogue = getApprovedTemplate(input.templateId);
  if (!catalogue) {
    throw Object.assign(new Error(`Unknown WhatsApp template "${input.templateId}".`), {
      statusCode: 400,
    });
  }
  const bodyParameters = buildMetaBodyParameters(catalogue.id, input.mergeContext);

  if (isHuntloWhatsAppConfigured()) {
    const creds = getHuntloWhatsAppCredentials();
    if (!creds) {
      throw Object.assign(new Error('Huntlo WhatsApp is not configured on the server.'), {
        statusCode: 503,
      });
    }
    const result = await sendMetaWhatsAppTemplate({
      phoneNumberId: creds.phoneNumberId,
      accessToken: creds.accessToken,
      to: input.to,
      templateName: getMetaTemplateName(catalogue),
      languageCode: getMetaTemplateLanguage(catalogue),
      bodyParameters,
    });
    return { messageId: result.messageId, provider: 'huntlo-whatsapp' };
  }

  if (isGupshupWhatsAppConfigured()) {
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
    return { messageId: result.messageId, provider: 'gupshup' };
  }

  throw Object.assign(
    new Error('WhatsApp is not configured. Set Huntlo WhatsApp or Gupshup credentials.'),
    { statusCode: 503 }
  );
}

async function maybeSendKycWhatsApp(demo: AiVoiceDemoCallDocument, input: {
  mappedStatus: string;
  kind: HunarWebhookKind;
}): Promise<{ sent: boolean; skipped?: boolean; messageId?: string | null }> {
  if (!shouldSendKycWhatsApp({ job: demo.job, mappedStatus: input.mappedStatus, kind: input.kind })) {
    return { sent: false, skipped: true };
  }
  if (demo.whatsappStatus === 'sent') {
    return { sent: false, skipped: true, messageId: demo.whatsappMessageId };
  }

  const claimed = await AiVoiceDemoCallModel.findOneAndUpdate(
    {
      _id: demo._id,
      whatsappStatus: { $in: ['none', 'failed'] },
    },
    { $set: { whatsappStatus: 'sending', callStatus: input.mappedStatus || demo.callStatus } },
    { new: true }
  );
  if (!claimed) {
    return { sent: false, skipped: true, messageId: demo.whatsappMessageId };
  }

  const templateId = kycDemoWhatsAppTemplateId();
  try {
    const sent = await sendKycWhatsAppTemplate({
      to: claimed.phone,
      templateId,
      mergeContext: kycDemoWhatsAppMergeContext(claimed),
    });
    claimed.whatsappStatus = 'sent';
    claimed.whatsappTemplateId = templateId;
    claimed.whatsappMessageId = sent.messageId || null;
    claimed.whatsappError = null;
    claimed.whatsappSentAt = new Date();
    await claimed.save();
    log().info(
      {
        demoId: String(claimed._id),
        templateId,
        provider: sent.provider,
        messageId: sent.messageId,
      },
      'KYC demo WhatsApp template sent'
    );
    return { sent: true, messageId: sent.messageId || null };
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : 'WhatsApp send failed';
    claimed.whatsappStatus = 'failed';
    claimed.whatsappTemplateId = templateId;
    claimed.whatsappError = message.slice(0, 500);
    await claimed.save();
    log().error({ err: error, demoId: String(claimed._id), templateId }, 'KYC demo WhatsApp send failed');
    return { sent: false };
  }
}

/**
 * If campaignId is an AI voice demo call, handle it here and skip outreach/screening.
 * KYC Incomplete Follow-up sends an approved outbound WhatsApp template when the call ends.
 */
export async function tryProcessAiVoiceDemoWebhook(input: {
  campaignId: string | null;
  kind: HunarWebhookKind;
  body: unknown;
}): Promise<{
  handled: boolean;
  demoId?: string;
  job?: string;
  callStatus?: string | null;
  whatsappSent?: boolean;
} | null> {
  const campaignId = String(input.campaignId || '').trim();
  if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) return null;

  const demo = await AiVoiceDemoCallModel.findById(campaignId);
  if (!demo) return null;

  const parsed = parseHunarWebhookPayload(input.kind, input.body);
  const mappedStatus = parsed.status
    ? mapHunarCallStatus(parsed.status, parsed.answeredBy)
    : demo.callStatus || '';
  if (mappedStatus) demo.callStatus = mappedStatus;
  await demo.save();

  let whatsappSent = false;
  if (demo.job === AI_VOICE_DEMO_KYC_JOB) {
    const result = await maybeSendKycWhatsApp(demo, {
      mappedStatus,
      kind: input.kind,
    });
    whatsappSent = result.sent;
  } else if (demo.whatsappStatus === 'none') {
    demo.whatsappStatus = 'skipped';
    await demo.save();
  }

  log().info(
    {
      demoId: String(demo._id),
      job: demo.job,
      kind: input.kind,
      callStatus: demo.callStatus,
      whatsappSent,
    },
    'AI voice demo webhook applied'
  );

  return {
    handled: true,
    demoId: String(demo._id),
    job: demo.job,
    callStatus: demo.callStatus,
    whatsappSent,
  };
}
