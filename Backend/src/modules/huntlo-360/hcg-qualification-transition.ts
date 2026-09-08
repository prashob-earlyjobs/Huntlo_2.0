/**
 * Bridge HCG overallAIStatus → Huntlo 360 workflow transitions.
 *
 * Gateway-owned Gmail/WhatsApp/voice qualification updates the HCG collections
 * (and Conversations UI) but historically never called applyWorkflowTransition,
 * so screening never launched for 360 workflows (autoScreening is compiled off).
 */
import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { VoiceCallModel } from '../voice/voice-call.model.js';
import { HcgGmailConversationModel } from '../communication-gateway/models/hcg-gmail-conversation.model.js';
import { HcgWhatsappConversationModel } from '../communication-gateway/models/hcg-whatsapp-conversation.model.js';
import { HcgHunarCommunicationModel } from '../communication-gateway/models/hcg-hunar-communication.model.js';
import { HcgZyvkaCommunicationModel } from '../communication-gateway/models/hcg-zyvka-communication.model.js';
import { hcgHunarOverallAiStatus } from '../conversations/hcg-hunar-overlay.js';
import { hcgZyvkaOverallAiStatus } from '../conversations/hcg-zyvka-overlay.js';
import { ScreeningModel } from '../screening/screening.model.js';
import { ScreeningCandidateModel } from '../screening/screening-candidate.model.js';
import { Huntlo360WorkflowModel } from './workflow.model.js';
import { applyWorkflowTransition } from './transitions.js';

const PASS_STATUSES = new Set(['qualified', 'shortlisted']);
const FAIL_STATUSES = new Set(['not_qualified', 'rejected']);

function log() {
  return getLogger().child({ component: 'hcg-qualification-transition' });
}

function normalizeAiStatus(status: string): string {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function normalizeEmail(email?: string | null): string {
  return String(email || '')
    .trim()
    .toLowerCase();
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

function phonesLikelyMatch(left: string, right: string): boolean {
  const a = phoneDigitVariants(left);
  const b = new Set(phoneDigitVariants(right));
  if (!a.length || !b.size) return false;
  return a.some(
    (value) =>
      b.has(value) ||
      [...b].some((other) => other.endsWith(value) || value.endsWith(other))
  );
}

export function hcgStatusToQualificationEvent(
  overallAiStatus: string
): 'qualification_pass' | 'qualification_fail' | null {
  const status = normalizeAiStatus(overallAiStatus);
  if (PASS_STATUSES.has(status)) return 'qualification_pass';
  if (FAIL_STATUSES.has(status)) return 'qualification_fail';
  return null;
}

/** Post-call HCG statuses on screening-keyed docs (campaignId = Screening._id). */
export function hcgStatusToScreeningEvent(
  overallAiStatus: string
): 'screening_pass' | 'screening_fail' | null {
  const status = normalizeAiStatus(overallAiStatus);
  if (PASS_STATUSES.has(status)) return 'screening_pass';
  if (FAIL_STATUSES.has(status)) return 'screening_fail';
  return null;
}

function workflowAutoInvitesAfterScreening(workflow: {
  screeningConfig?: { onPass?: string | null } | null;
  schedulingConfig?: {
    enabled?: boolean;
    autoSendAfterScreening?: boolean;
  } | null;
}): boolean {
  return Boolean(
    workflow.schedulingConfig?.enabled &&
      (workflow.schedulingConfig.autoSendAfterScreening ||
        workflow.screeningConfig?.onPass === 'scheduling')
  );
}

async function findEnrollmentForCampaignEmail(campaignId: string, email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const campaign = await OutreachCampaignModel.findById(campaignId)
    .select('organizationId')
    .lean();
  if (!campaign?.organizationId) return null;

  const candidate = await SavedCandidateModel.findOne({
    organizationId: campaign.organizationId,
    deletedAt: null,
    email: normalized,
  })
    .select('_id')
    .lean();
  if (!candidate) return null;

  return OutreachEnrollmentModel.findOne({
    campaignId,
    candidateId: candidate._id,
  });
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

  const campaign = await OutreachCampaignModel.findById(campaignId)
    .select('organizationId')
    .lean();
  if (!campaign?.organizationId) return null;

  // Prefer national last-10 for suffix match so +91 / 91 / local storage all hit.
  const national =
    variants.find((row) => row.length === 10) ||
    variants.map((row) => row.slice(-10)).find((row) => row.length === 10) ||
    variants[0];

  const candidates = await SavedCandidateModel.find({
    organizationId: campaign.organizationId,
    deletedAt: null,
    phone: { $regex: `${national}$` },
  })
    .select('_id phone')
    .limit(25)
    .lean();

  const ranked = [...candidates].sort((left, right) => {
    const leftHit = phonesLikelyMatch(String(left.phone || ''), phone) ? 1 : 0;
    const rightHit = phonesLikelyMatch(String(right.phone || ''), phone) ? 1 : 0;
    return rightHit - leftHit;
  });

  for (const match of ranked) {
    if (!phonesLikelyMatch(String(match.phone || ''), phone)) continue;
    const enrollment = await OutreachEnrollmentModel.findOne({
      campaignId,
      candidateId: match._id,
    });
    if (enrollment) return enrollment;
  }

  // Fallback: scan campaign enrollments when candidate phone formatting is unusual.
  const enrollments = await OutreachEnrollmentModel.find({ campaignId })
    .select('_id candidateId')
    .limit(500)
    .lean();
  if (!enrollments.length) return null;

  const enrolledCandidates = await SavedCandidateModel.find({
    _id: { $in: enrollments.map((row) => row.candidateId) },
    deletedAt: null,
  })
    .select('_id phone')
    .lean();
  const byId = new Map(enrolledCandidates.map((row) => [String(row._id), row]));
  for (const enrollment of enrollments) {
    const candidate = byId.get(String(enrollment.candidateId));
    if (!candidate || !phonesLikelyMatch(String(candidate.phone || ''), phone)) continue;
    return OutreachEnrollmentModel.findById(enrollment._id);
  }

  return null;
}

export type ApplyHuntlo360FromHcgInput = {
  campaignId: string;
  overallAiStatus: string;
  email?: string | null;
  phone?: string | null;
  source: 'gmail' | 'whatsapp' | 'hunar' | 'zyvkay' | 'sync';
};

/**
 * Screening dials store Screening._id as HCG campaignId. When gateway writes
 * overallAIStatus=qualified/shortlisted on that doc, map to screening_pass so
 * invite-after-screening can run (only when the workflow has that configured).
 */
async function tryApplyHuntlo360FromHcgScreeningCampaign(
  input: ApplyHuntlo360FromHcgInput
): Promise<{ applied: boolean; reason?: string; toStage?: string } | null> {
  const campaignId = String(input.campaignId || '').trim();
  if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) return null;

  const screening = await ScreeningModel.findOne({
    _id: campaignId,
    sourceModule: 'huntlo360',
    deletedAt: null,
  })
    .select('_id organizationId workflowId')
    .lean();
  if (!screening?.workflowId) return null;

  const event = hcgStatusToScreeningEvent(input.overallAiStatus);
  if (!event) {
    return {
      applied: false,
      reason: `hcg_screening_status:${normalizeAiStatus(input.overallAiStatus)}`,
    };
  }

  const workflow = await Huntlo360WorkflowModel.findOne({
    _id: screening.workflowId,
    organizationId: screening.organizationId,
    deletedAt: null,
    status: { $in: ['running', 'paused'] },
  }).select('_id screeningConfig schedulingConfig');
  if (!workflow) return { applied: false, reason: 'workflow_missing' };

  // Invite backup only when the flow was configured to book after screening.
  if (event === 'screening_pass' && !workflowAutoInvitesAfterScreening(workflow)) {
    return { applied: false, reason: 'invite_after_screening_disabled' };
  }

  const phone = String(input.phone || '').trim();
  if (!phone) return { applied: false, reason: 'missing_phone' };

  const rows = await ScreeningCandidateModel.find({ screeningId: screening._id })
    .select('_id candidateId overallScore recommendation enrollmentId')
    .sort({ updatedAt: -1 })
    .lean();
  if (!rows.length) return { applied: false, reason: 'screening_candidate_missing' };

  const candidates = await SavedCandidateModel.find({
    _id: { $in: rows.map((row) => row.candidateId) },
    organizationId: screening.organizationId,
    deletedAt: null,
  })
    .select('_id phone')
    .lean();
  const phoneByCandidate = new Map(
    candidates.map((row) => [String(row._id), String(row.phone || '')])
  );

  const matchedRow = rows.find((row) =>
    phonesLikelyMatch(phoneByCandidate.get(String(row.candidateId)) || '', phone)
  );
  if (!matchedRow) return { applied: false, reason: 'enrollment_missing' };

  try {
    const result = await applyWorkflowTransition({
      organizationId: String(screening.organizationId),
      workflowId: String(workflow._id),
      candidateId: String(matchedRow.candidateId),
      event,
      idempotencyKey: `hcg-screen:${campaignId}:${String(matchedRow.candidateId)}:${event}`,
      screeningScore:
        typeof matchedRow.overallScore === 'number' ? matchedRow.overallScore : undefined,
      metadata: {
        source: 'hcg',
        hcgSource: input.source,
        overallAiStatus: normalizeAiStatus(input.overallAiStatus),
        screeningId: String(screening._id),
      },
    });

    log().info(
      {
        screeningId: String(screening._id),
        workflowId: String(workflow._id),
        candidateId: String(matchedRow.candidateId),
        event,
        source: input.source,
        duplicate: result.duplicate,
        toStage: result.toStage,
      },
      'Huntlo 360 HCG screening transition applied'
    );

    return {
      applied: true,
      toStage: result.toStage,
      reason: result.duplicate ? 'duplicate' : undefined,
    };
  } catch (error) {
    log().warn(
      {
        err: error,
        screeningId: String(screening._id),
        candidateId: String(matchedRow.candidateId),
        event,
        source: input.source,
      },
      'Huntlo 360 HCG screening transition failed'
    );
    return { applied: false, reason: 'transition_failed' };
  }
}

/**
 * When HCG marks a candidate qualified/not_qualified, advance the linked
 * Huntlo 360 workflow (and launch screening when screeningConfig.enabled).
 * Screening-keyed Hunar/Zyvka docs (campaignId = Screening._id) map to
 * screening_pass/fail instead — and invite only if the workflow auto-books
 * after screening.
 */
export async function applyHuntlo360FromHcgOverallAiStatus(
  input: ApplyHuntlo360FromHcgInput
): Promise<{ applied: boolean; reason?: string; toStage?: string }> {
  const fromScreening = await tryApplyHuntlo360FromHcgScreeningCampaign(input);
  if (fromScreening) return fromScreening;

  const event = hcgStatusToQualificationEvent(input.overallAiStatus);
  if (!event) {
    return {
      applied: false,
      reason: `hcg_status:${normalizeAiStatus(input.overallAiStatus)}`,
    };
  }

  const campaignId = String(input.campaignId || '').trim();
  if (!campaignId) return { applied: false, reason: 'missing_campaign' };

  const campaign = await OutreachCampaignModel.findById(campaignId);
  if (!campaign) return { applied: false, reason: 'campaign_missing' };
  if (campaign.sourceModule !== 'huntlo360') {
    return { applied: false, reason: 'not_huntlo360' };
  }

  const email = normalizeEmail(input.email);
  const phone = String(input.phone || '').trim();
  let enrollment = email ? await findEnrollmentForCampaignEmail(campaignId, email) : null;
  if (!enrollment && phone) {
    enrollment = await findEnrollmentForCampaignPhone(campaignId, phone);
  }

  if (!enrollment) {
    log().info(
      {
        campaignId,
        source: input.source,
        overallAiStatus: input.overallAiStatus,
        hasEmail: Boolean(email),
        hasPhone: Boolean(phone),
      },
      'Huntlo 360 HCG qualification skipped — enrollment not found'
    );
    return { applied: false, reason: 'enrollment_missing' };
  }

  if (enrollment.status === 'opted_out' || enrollment.contactAvailability?.optedOut) {
    return { applied: false, reason: 'opted_out' };
  }

  const workflow = await Huntlo360WorkflowModel.findOne({
    organizationId: campaign.organizationId,
    campaignId: campaign._id,
    deletedAt: null,
    status: { $in: ['running', 'paused'] },
  }).select('_id screeningConfig');
  if (!workflow) return { applied: false, reason: 'workflow_missing' };

  // Keep enrollment Q&A state in sync with gateway outcome (UI + downstream gates).
  const qualStatus = event === 'qualification_pass' ? 'qualified' : 'rejected';
  if (enrollment.qualificationState?.status !== qualStatus) {
    enrollment.qualificationState = {
      status: qualStatus,
      answers: enrollment.qualificationState?.answers || {},
      reason:
        enrollment.qualificationState?.reason ||
        `hcg:${normalizeAiStatus(input.overallAiStatus)}`,
    };
    enrollment.markModified('qualificationState');
    await enrollment.save().catch(() => undefined);
  }

  try {
    const result = await applyWorkflowTransition({
      organizationId: String(campaign.organizationId),
      workflowId: String(workflow._id),
      candidateId: String(enrollment.candidateId),
      event,
      idempotencyKey: `hcg-qual:${campaignId}:${String(enrollment.candidateId)}:${event}`,
      qualificationStatus: qualStatus,
      metadata: {
        source: 'hcg',
        hcgSource: input.source,
        overallAiStatus: normalizeAiStatus(input.overallAiStatus),
      },
    });

    log().info(
      {
        campaignId,
        enrollmentId: String(enrollment._id),
        workflowId: String(workflow._id),
        event,
        source: input.source,
        duplicate: result.duplicate,
        toStage: result.toStage,
        screeningEnabled: Boolean(workflow.screeningConfig?.enabled),
      },
      'Huntlo 360 HCG qualification transition applied'
    );

    return {
      applied: true,
      toStage: result.toStage,
      reason: result.duplicate ? 'duplicate' : undefined,
    };
  } catch (error) {
    log().warn(
      {
        err: error,
        campaignId,
        enrollmentId: String(enrollment._id),
        event,
        source: input.source,
      },
      'Huntlo 360 HCG qualification transition failed'
    );
    return { applied: false, reason: 'transition_failed' };
  }
}

/**
 * Catch-up: scan HCG collections for a campaign and apply any terminal
 * qualification statuses that never reached Huntlo 360 transitions.
 * Also covers screening-keyed Hunar/Zyvka docs (campaignId = Screening._id).
 */
export async function syncHuntlo360QualificationsFromHcg(
  campaignId: string
): Promise<{ checked: number; applied: number }> {
  const cid = String(campaignId || '').trim();
  if (!cid) return { checked: 0, applied: 0 };

  const campaign = await OutreachCampaignModel.findById(cid)
    .select('sourceModule organizationId')
    .lean();
  if (!campaign || campaign.sourceModule !== 'huntlo360') {
    return { checked: 0, applied: 0 };
  }

  let checked = 0;
  let applied = 0;

  const screenings = await ScreeningModel.find({
    organizationId: campaign.organizationId,
    campaignId: cid,
    sourceModule: 'huntlo360',
    deletedAt: null,
  })
    .select('_id')
    .lean();
  const screeningIds = screenings.map((row) => String(row._id));
  const voiceCampaignIds = [...new Set([cid, ...screeningIds])];

  const [gmailDocs, waDocs, hunarDocs, zyvkaDocs] = await Promise.all([
    HcgGmailConversationModel.find({
      $or: [{ campaignId: cid }, { 'messages.campaignId': cid }],
    })
      .select('campaignId emailAddress overallAIStatus messages.campaignId')
      .lean(),
    HcgWhatsappConversationModel.find({ campaignId: cid })
      .select('campaignId phone overallAIStatus')
      .lean(),
    HcgHunarCommunicationModel.find({ campaignId: { $in: voiceCampaignIds } })
      .select('campaignId mobileNumber overallAIStatus call_status call_result')
      .lean(),
    HcgZyvkaCommunicationModel.find({ campaignId: { $in: voiceCampaignIds } })
      .select('campaignId mobileNumber overallAIStatus call_status call_result')
      .lean(),
  ]);

  for (const doc of gmailDocs) {
    const status = String(doc.overallAIStatus || '');
    if (!hcgStatusToQualificationEvent(status)) continue;
    checked += 1;
    const result = await applyHuntlo360FromHcgOverallAiStatus({
      campaignId: cid,
      overallAiStatus: status,
      email: String(doc.emailAddress || ''),
      source: 'sync',
    });
    if (result.applied && result.reason !== 'duplicate') applied += 1;
  }

  for (const doc of waDocs) {
    const status = String(doc.overallAIStatus || '');
    if (!hcgStatusToQualificationEvent(status)) continue;
    checked += 1;
    const result = await applyHuntlo360FromHcgOverallAiStatus({
      campaignId: cid,
      overallAiStatus: status,
      phone: String(doc.phone || ''),
      source: 'sync',
    });
    if (result.applied && result.reason !== 'duplicate') applied += 1;
  }

  for (const doc of hunarDocs) {
    const status = hcgHunarOverallAiStatus(doc as never);
    const docCampaignId = String(doc.campaignId || cid);
    const isScreeningKey = screeningIds.includes(docCampaignId);
    if (isScreeningKey) {
      if (!hcgStatusToScreeningEvent(status)) continue;
    } else if (!hcgStatusToQualificationEvent(status)) {
      continue;
    }
    checked += 1;
    const result = await applyHuntlo360FromHcgOverallAiStatus({
      campaignId: docCampaignId,
      overallAiStatus: status,
      phone: String(doc.mobileNumber || ''),
      source: 'sync',
    });
    if (result.applied && result.reason !== 'duplicate') applied += 1;
  }

  for (const doc of zyvkaDocs) {
    const status = hcgZyvkaOverallAiStatus(doc as never);
    const docCampaignId = String(doc.campaignId || cid);
    const isScreeningKey = screeningIds.includes(docCampaignId);
    if (isScreeningKey) {
      if (!hcgStatusToScreeningEvent(status)) continue;
    } else if (!hcgStatusToQualificationEvent(status)) {
      continue;
    }
    checked += 1;
    const result = await applyHuntlo360FromHcgOverallAiStatus({
      campaignId: docCampaignId,
      overallAiStatus: status,
      phone: String(doc.mobileNumber || ''),
      source: 'sync',
    });
    if (result.applied && result.reason !== 'duplicate') applied += 1;
  }

  if (checked > 0) {
    log().info({ campaignId: cid, checked, applied }, 'Huntlo 360 HCG qualification sync finished');
  }

  return { checked, applied };
}
