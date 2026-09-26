import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { BullOutreachJobModel } from '../../bull-outreach/job.model.js';
import { RevealedContactModel } from '../candidates/revealed-contact.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OutreachCampaignModel } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';

export const REVEAL_CONTACT_STATUSES = [
  'already_revealed',
  'succeeded',
  'in_process',
  'queued',
  'not_found',
  'waiting',
] as const;
export type RevealContactStatus = (typeof REVEAL_CONTACT_STATUSES)[number];

export type RevealQueuePhase = 'running' | 'queued' | 'idle' | 'failed' | 'finished';

const STATUS_RANK: Record<RevealContactStatus, number> = {
  in_process: 0,
  queued: 1,
  not_found: 2,
  waiting: 3,
  succeeded: 4,
  already_revealed: 5,
};

export function classifyContactReveal(input: {
  hasValue: boolean;
  earliestRevealedAt: Date | null;
  launchedAt: Date | null;
  missingContact: boolean;
  queueActive: boolean;
  isCurrent: boolean;
}): RevealContactStatus {
  if (input.isCurrent && input.queueActive && !input.hasValue) return 'in_process';
  if (input.hasValue) {
    if (
      input.earliestRevealedAt &&
      input.launchedAt &&
      input.earliestRevealedAt.getTime() >= input.launchedAt.getTime()
    ) {
      return 'succeeded';
    }
    return 'already_revealed';
  }
  if (input.missingContact) return 'not_found';
  if (input.launchedAt) return input.isCurrent && input.queueActive ? 'in_process' : 'queued';
  return 'waiting';
}

function worseStatus(current: RevealContactStatus | null, next: RevealContactStatus): RevealContactStatus {
  if (!current) return next;
  return STATUS_RANK[next] < STATUS_RANK[current] ? next : current;
}

type ChannelConfig = {
  email?: { enabled?: boolean };
  whatsapp?: { enabled?: boolean };
  ai_voice?: { enabled?: boolean };
};

function emptySummary() {
  return {
    total: 0,
    alreadyRevealed: 0,
    succeeded: 0,
    inProcess: 0,
    queued: 0,
    notFound: 0,
    waiting: 0,
  };
}

function summaryKey(status: RevealContactStatus): keyof ReturnType<typeof emptySummary> {
  switch (status) {
    case 'already_revealed':
      return 'alreadyRevealed';
    case 'succeeded':
      return 'succeeded';
    case 'in_process':
      return 'inProcess';
    case 'queued':
      return 'queued';
    case 'not_found':
      return 'notFound';
    case 'waiting':
      return 'waiting';
  }
}

/**
 * Read-only reveal progress for an outreach campaign.
 * Does not enqueue, charge, or change enrollments.
 */
export async function getCampaignRevealStatus(organizationId: string, campaignId: string) {
  if (!mongoose.isValidObjectId(campaignId)) {
    throw AppError.notFound('Campaign not found');
  }

  const campaign = await OutreachCampaignModel.findOne({
    _id: campaignId,
    organizationId,
    deletedAt: null,
  })
    .select('channelConfig launchedAt')
    .lean();
  if (!campaign) throw AppError.notFound('Campaign not found');

  const channelConfig = (campaign.channelConfig || {}) as ChannelConfig;
  const needsEmail = Boolean(channelConfig.email?.enabled);
  const needsPhone = Boolean(channelConfig.whatsapp?.enabled || channelConfig.ai_voice?.enabled);
  const channels: Array<'email' | 'mobile'> = [];
  if (needsEmail) channels.push('email');
  if (needsPhone) channels.push('mobile');

  const idleQueue = {
    phase: 'idle' as RevealQueuePhase,
    runAt: null as string | null,
    currentEnrollmentId: null as string | null,
    currentContactType: null as 'email' | 'mobile' | null,
    currentCandidateName: null as string | null,
    lastError: null as string | null,
  };

  if (channels.length === 0) {
    return { included: false, channels, queue: idleQueue, summary: emptySummary(), items: [] };
  }

  const campaignOid = new mongoose.Types.ObjectId(campaignId);
  const orgOid = new mongoose.Types.ObjectId(organizationId);
  const launchedAt = campaign.launchedAt ? new Date(campaign.launchedAt) : null;

  const [enrollments, activeJob, latestJob] = await Promise.all([
    OutreachEnrollmentModel.find({
      organizationId: orgOid,
      campaignId: campaignOid,
    })
      .select('_id candidateId stopReason')
      .lean(),
    BullOutreachJobModel.findOne({
      organizationId: orgOid,
      campaignId: campaignOid,
      kind: 'launch_reveal',
      status: { $in: ['pending', 'queued', 'running'] },
    })
      .sort({ runAt: 1 })
      .select('status runAt lastError details')
      .lean(),
    BullOutreachJobModel.findOne({
      organizationId: orgOid,
      campaignId: campaignOid,
      kind: 'launch_reveal',
    })
      .sort({ updatedAt: -1 })
      .select('status lastError')
      .lean(),
  ]);

  const candidates = await SavedCandidateModel.find({
    _id: { $in: enrollments.map((row) => row.candidateId) },
    organizationId: orgOid,
    deletedAt: null,
  })
    .select('name email phone headline externalCandidateId')
    .lean();
  const candidateById = new Map(candidates.map((row) => [String(row._id), row]));

  const externalIds = candidates
    .map((row) => String(row.externalCandidateId || '').trim())
    .filter(Boolean);
  const ledgers =
    externalIds.length === 0
      ? []
      : await RevealedContactModel.find({
          organizationId: orgOid,
          externalCandidateId: { $in: externalIds },
          contactType: { $in: channels },
        })
          .select('externalCandidateId contactType revealedAt')
          .lean();

  const earliestReveal = new Map<string, Date>();
  for (const row of ledgers) {
    const key = `${row.externalCandidateId}|${row.contactType}`;
    const at = row.revealedAt ? new Date(row.revealedAt) : null;
    if (!at) continue;
    const prev = earliestReveal.get(key);
    if (!prev || at.getTime() < prev.getTime()) earliestReveal.set(key, at);
  }

  const details =
    activeJob?.details && typeof activeJob.details === 'object'
      ? (activeJob.details as Record<string, unknown>)
      : {};
  const currentEnrollmentId =
    activeJob?.status === 'running' ? String(details.currentEnrollmentId || '').trim() : '';
  const currentContactRaw = String(details.currentContactType || '');
  const currentContactType =
    currentContactRaw === 'email' || currentContactRaw === 'mobile' ? currentContactRaw : null;
  const queueActive = activeJob?.status === 'running';

  const items = enrollments.map((enrollment) => {
    const candidate = candidateById.get(String(enrollment.candidateId));
    const external = String(candidate?.externalCandidateId || '').trim();
    const missingContact = enrollment.stopReason === 'missing_contact';
    const enrollmentId = String(enrollment._id);
    const isCurrentEnrollment = Boolean(currentEnrollmentId) && currentEnrollmentId === enrollmentId;

    const email = needsEmail
      ? classifyContactReveal({
          hasValue: Boolean(String(candidate?.email || '').trim()),
          earliestRevealedAt: external ? earliestReveal.get(`${external}|email`) ?? null : null,
          launchedAt,
          missingContact,
          queueActive,
          isCurrent: isCurrentEnrollment && (currentContactType === 'email' || currentContactType == null),
        })
      : null;
    const mobile = needsPhone
      ? classifyContactReveal({
          hasValue: Boolean(String(candidate?.phone || '').trim()),
          earliestRevealedAt: external ? earliestReveal.get(`${external}|mobile`) ?? null : null,
          launchedAt,
          missingContact,
          queueActive,
          isCurrent: isCurrentEnrollment && (currentContactType === 'mobile' || currentContactType == null),
        })
      : null;

    let status: RevealContactStatus = 'waiting';
    if (email) status = worseStatus(null, email);
    if (mobile) status = worseStatus(email ? status : null, mobile);

    return {
      enrollmentId,
      candidateId: String(enrollment.candidateId),
      name: candidate?.name || 'Unknown candidate',
      headline: candidate?.headline ?? null,
      status,
      queuePosition: null as number | null,
      email,
      mobile,
    };
  });

  const pending = items
    .filter((row) => row.status === 'in_process' || row.status === 'queued')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'in_process' ? -1 : 1;
      return a.enrollmentId.localeCompare(b.enrollmentId);
    });
  pending.forEach((row, index) => {
    row.queuePosition = index + 1;
  });

  items.sort((a, b) => {
    const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    if (a.queuePosition != null && b.queuePosition != null) return a.queuePosition - b.queuePosition;
    return a.name.localeCompare(b.name);
  });

  const summary = emptySummary();
  summary.total = items.length;
  for (const row of items) summary[summaryKey(row.status)] += 1;

  const outstanding = summary.inProcess + summary.queued + summary.waiting;
  let phase: RevealQueuePhase = 'idle';
  if (activeJob?.status === 'running') phase = 'running';
  else if (activeJob) phase = 'queued';
  else if (latestJob?.status === 'failed' && outstanding > 0) phase = 'failed';
  else if (outstanding === 0 && (launchedAt || latestJob)) phase = 'finished';

  const current = items.find((row) => row.enrollmentId === currentEnrollmentId) ?? null;

  return {
    included: true,
    channels,
    queue: {
      phase,
      runAt: activeJob?.runAt ? new Date(activeJob.runAt).toISOString() : null,
      currentEnrollmentId: currentEnrollmentId || null,
      currentContactType,
      currentCandidateName: current?.name ?? null,
      lastError: activeJob?.lastError || (phase === 'failed' ? latestJob?.lastError || null : null),
    },
    summary,
    items,
  };
}
