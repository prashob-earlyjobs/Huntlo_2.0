/**
 * Post-call WhatsApp is triggered from HCG Hunar/Zyvka updates.
 * Gateway owns the call result; Huntlo often never receives the Hunar webhook.
 */
import { getLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OutreachCampaignModel } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';
import { VoiceCallModel } from '../voice/voice-call.model.js';

const PASS_STATUSES = new Set(['qualified', 'interested', 'shortlisted']);

function log() {
  return getLogger().child({ component: 'post-qualification-hcg' });
}

function phoneDigitVariants(phone: string): string[] {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return [];
  const out = new Set<string>([digits]);
  if (digits.length >= 10) out.add(digits.slice(-10));
  if (digits.length === 10) out.add(`91${digits}`);
  if (digits.startsWith('91') && digits.length === 12) out.add(digits.slice(2));
  return [...out];
}

function normalizeAiStatus(status: string): string {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

async function findEnrollmentForCampaignPhone(campaignId: string, phone: string) {
  const variants = phoneDigitVariants(phone);
  if (!variants.length) return null;

  const call = await VoiceCallModel.findOne({
    campaignId,
    enrollmentId: { $ne: null },
    toNumberDigits: { $in: variants },
  })
    .sort({ updatedAt: -1 })
    .select('enrollmentId')
    .lean();
  if (call?.enrollmentId) {
    return OutreachEnrollmentModel.findById(call.enrollmentId);
  }

  const campaign = await OutreachCampaignModel.findById(campaignId).select('organizationId').lean();
  if (!campaign?.organizationId) return null;

  const last10 = [...variants].sort((a, b) => b.length - a.length).find((row) => row.length >= 10) || variants[0];
  const match = await SavedCandidateModel.findOne({
    organizationId: campaign.organizationId,
    deletedAt: null,
    phone: { $regex: `${last10}$` },
  })
    .select('_id')
    .lean();
  if (!match) return null;

  return OutreachEnrollmentModel.findOne({
    campaignId,
    candidateId: match._id,
  });
}

export function hcgVoiceStatusShouldStartPostQualWhatsApp(overallAiStatus: string): boolean {
  return PASS_STATUSES.has(normalizeAiStatus(overallAiStatus));
}

/** Start Auto-send WhatsApp when gateway marks the call qualified/interested. */
export async function startPostQualificationWhatsAppFromHcgVoice(input: {
  campaignId: string;
  phone: string;
  overallAiStatus: string;
  source: 'hunar' | 'zyvkay';
}): Promise<{ started: boolean; reason?: string }> {
  if (!hcgVoiceStatusShouldStartPostQualWhatsApp(input.overallAiStatus)) {
    return { started: false, reason: `hcg_status:${normalizeAiStatus(input.overallAiStatus)}` };
  }

  const campaignId = String(input.campaignId || '').trim();
  const phone = String(input.phone || '').trim();
  if (!campaignId || !phone) {
    return { started: false, reason: 'missing_campaign_or_phone' };
  }

  const campaign = await OutreachCampaignModel.findById(campaignId);
  if (!campaign?.qualificationConfig?.autoWhatsAppAfterQualification) {
    return { started: false, reason: 'disabled' };
  }

  const enrollment = await findEnrollmentForCampaignPhone(campaignId, phone);
  if (!enrollment) {
    log().info(
      { campaignId, source: input.source, overallAiStatus: input.overallAiStatus },
      'Post-qualification WhatsApp skipped — enrollment not found'
    );
    return { started: false, reason: 'enrollment_missing' };
  }
  if (enrollment.status === 'opted_out' || enrollment.contactAvailability?.optedOut) {
    return { started: false, reason: 'opted_out' };
  }

  const { startHiringFlowAfterQualification } = await import('./hiring-flow-runtime.service.js');
  const result = await startHiringFlowAfterQualification({ campaign, enrollment });
  log().info(
    {
      campaignId,
      enrollmentId: String(enrollment._id),
      source: input.source,
      overallAiStatus: input.overallAiStatus,
      started: result.started,
      reason: result.reason || null,
    },
    result.started
      ? 'Post-qualification WhatsApp started from HCG voice update'
      : 'Post-qualification WhatsApp not started from HCG voice update'
  );
  return result;
}
