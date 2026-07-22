import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import {
  getHunarVoiceLanguage,
  getHunarVoicePersona,
} from '../../providers/hunar/hunar.config.js';
import { scheduleJob } from '../../bull-outreach/schedule.js';
import {
  ScreeningCandidateModel,
} from '../screening/screening-candidate.model.js';
import {
  ScreeningModel,
  defaultScreeningStats,
  type ScreeningDocument,
} from '../screening/screening.model.js';
import { BullOutreachJobModel } from '../../bull-outreach/job.model.js';
import { pushToQueue } from '../../bull-outreach/queue.js';
import { refreshScreeningStats } from '../screening/screening.service.js';
import type { OutreachCampaignDocument } from './campaign.model.js';
import type { OutreachEnrollmentDocument } from './enrollment.model.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import { nextSendAtWithinWindow } from './send-window.util.js';

const log = () => getLogger().child({ module: 'outreach-auto-screening' });

/**
 * When outreach qualification completes with auto-screening enabled, ensure one
 * AI screening batch exists per campaign (named after the campaign) and add the
 * qualified candidate. Idempotent per enrollment/candidate.
 */
export async function enrollQualifiedCandidateInCampaignScreening(input: {
  campaign: OutreachCampaignDocument;
  enrollment: OutreachEnrollmentDocument;
}): Promise<{ screeningId: string; createdScreening: boolean }> {
  const { campaign, enrollment } = input;
  const organizationId = String(campaign.organizationId);
  const campaignId = String(campaign._id);
  const candidateId = String(enrollment.candidateId);
  const enrollmentId = String(enrollment._id);

  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    throw new Error('Invalid candidate id on enrollment');
  }

  const existingScreeningId = enrollment.screeningState?.screeningId;
  if (existingScreeningId) {
    const linked = await ScreeningModel.findOne({
      _id: existingScreeningId,
      organizationId,
      campaignId,
      deletedAt: null,
    });
    if (linked) {
      await upsertScreeningCandidate({
        organizationId,
        screeningId: existingScreeningId,
        candidateId,
        enrollmentId,
      });
      await appendCandidateToScreening(existingScreeningId, candidateId);
      await refreshScreeningStats(existingScreeningId);
      await scheduleScreeningLaunch({
        campaign,
        screening: linked,
        candidateId,
      });
      return { screeningId: existingScreeningId, createdScreening: false };
    }
  }

  let screening = await ScreeningModel.findOne({
    organizationId,
    campaignId,
    deletedAt: null,
  }).sort({ createdAt: 1 });

  let createdScreening = false;
  if (!screening) {
    const ownerUserId = String(campaign.ownerUserId);
    screening = await ScreeningModel.create({
      organizationId: campaign.organizationId,
      ownerUserId: campaign.ownerUserId,
      jobId: campaign.jobId,
      campaignId: campaign._id,
      workflowId: null,
      sourceModule: 'outreach',
      name: campaign.name.trim() || 'Outreach screening',
      description: `Auto-created from outreach campaign "${campaign.name}".`,
      language: getHunarVoiceLanguage(),
      voice: getHunarVoicePersona(),
      questions: [],
      evaluationCriteria: [],
      knockouts: [],
      callSettings: {
        maxAttempts: 2,
        attemptIntervalHours: 24,
        maxRetryCount: 2,
        retryIntervalHours: 6,
        consentRequired: true,
      },
      candidateIds: [],
      status: 'draft',
      stats: defaultScreeningStats(),
      version: 1,
    });
    createdScreening = true;
    log().info(
      { organizationId, campaignId, screeningId: String(screening._id), ownerUserId },
      'Created campaign-linked AI screening batch'
    );
  }

  const screeningId = String(screening._id);

  await upsertScreeningCandidate({
    organizationId,
    screeningId,
    candidateId,
    enrollmentId,
  });
  await appendCandidateToScreening(screeningId, candidateId);
  await refreshScreeningStats(screeningId);
  await scheduleScreeningLaunch({
    campaign,
    screening,
    candidateId,
  });

  await recordCampaignActivity({
    organizationId,
    campaignId,
    enrollmentId,
    type: createdScreening ? 'screening.created' : 'screening.candidate.enrolled',
    title: createdScreening
      ? 'AI screening batch created for campaign'
      : 'Candidate added to campaign screening',
    metadata: {
      screeningId,
      candidateId,
      autoFromQualification: true,
    },
  }).catch(() => undefined);

  return { screeningId, createdScreening };
}

async function scheduleScreeningLaunch(input: {
  campaign: OutreachCampaignDocument;
  screening: ScreeningDocument;
  candidateId: string;
}) {
  const { campaign, screening, candidateId } = input;
  const now = new Date();
  const runAt = nextBusinessScreeningRunAt(
    now,
    campaign.channelConfig?.timezone || null
  );

  if (screening.status !== 'running') {
    screening.status = 'scheduled';
    await screening.save();
  }

  const existing = await BullOutreachJobModel.findOne({
    kind: 'launch_screening',
    organizationId: screening.organizationId,
    status: { $in: ['pending', 'queued', 'running'] },
    'details.screeningId': String(screening._id),
  });

  if (existing) {
    const mergedCandidateIds = new Set(
      Array.isArray(existing.details?.candidateIds) ? existing.details.candidateIds.map(String) : []
    );
    mergedCandidateIds.add(candidateId);
    existing.details = {
      ...(existing.details || {}),
      screeningId: String(screening._id),
      candidateIds: [...mergedCandidateIds],
    };
    if (existing.status === 'pending' && existing.runAt.getTime() > runAt.getTime()) {
      existing.runAt = runAt;
    }
    await existing.save();
    if (existing.status === 'pending' && existing.runAt.getTime() <= now.getTime()) {
      await queueJobNow(String(existing._id));
    }
    return;
  }

  const job = await scheduleJob({
    kind: 'launch_screening',
    organizationId: String(screening.organizationId),
    campaignId: screening.campaignId ? String(screening.campaignId) : null,
    runAt,
    details: {
      screeningId: String(screening._id),
      candidateIds: [candidateId],
      source: 'outreach_auto_screening',
    },
  });

  if (job && runAt.getTime() <= now.getTime()) {
    await queueJobNow(String(job._id));
  }
}

async function queueJobNow(jobId: string) {
  const claimed = await BullOutreachJobModel.findOneAndUpdate(
    { _id: jobId, status: 'pending' },
    { $set: { status: 'queued' } },
    { new: true }
  );
  if (!claimed) return;
  try {
    await pushToQueue(String(claimed._id));
  } catch (error) {
    claimed.status = 'pending';
    claimed.lastError = error instanceof Error ? error.message : 'queue push failed';
    await claimed.save();
    throw error;
  }
}

function nextBusinessScreeningRunAt(from: Date, timezone?: string | null): Date {
  return nextSendAtWithinWindow(
    from,
    {
      startHour: 10,
      endHour: 18,
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      timezone: timezone || null,
    },
    timezone
  );
}

async function upsertScreeningCandidate(input: {
  organizationId: string;
  screeningId: string;
  candidateId: string;
  enrollmentId: string;
}) {
  await ScreeningCandidateModel.findOneAndUpdate(
    {
      screeningId: input.screeningId,
      candidateId: input.candidateId,
    },
    {
      $setOnInsert: {
        organizationId: input.organizationId,
        screeningId: input.screeningId,
        candidateId: input.candidateId,
        workflowId: null,
        callStatus: 'queued',
        attempts: 0,
        recruiterDecision: 'pending',
        extractedVariables: {},
        scoreBreakdown: {},
      },
      $set: {
        enrollmentId: input.enrollmentId,
      },
    },
    { upsert: true }
  );
}

async function appendCandidateToScreening(screeningId: string, candidateId: string) {
  await ScreeningModel.updateOne(
    { _id: screeningId, candidateIds: { $ne: candidateId } },
    { $push: { candidateIds: candidateId } }
  );
}
