/**
 * Huntlo 360 orchestration facade over Screening / ScreeningCandidate.
 * Creates the batch + candidate, then schedules a real launch (Hunar dial).
 */
import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { scheduleJob } from '../../bull-outreach/schedule.js';
import { BullOutreachJobModel } from '../../bull-outreach/job.model.js';
import { pushToQueue } from '../../bull-outreach/queue.js';
import { nextSendAtWithinWindow } from '../outreach/send-window.util.js';
import { screeningService } from './screening.service.js';
import { ScreeningCandidateModel } from './screening-candidate.model.js';
import { ScreeningModel, type ScreeningDocument } from './screening.model.js';

export const ScreeningSessionModel = ScreeningCandidateModel;

const log = () => getLogger().child({ component: 'screening-facade' });

export const screeningFacade = {
  async createSession(input: {
    organizationId: string;
    workflowId: string;
    campaignId?: string | null;
    jobId?: string | null;
    name?: string | null;
    candidateId: string;
    enrollmentId?: string | null;
    ownerUserId?: string | null;
    minScore: number;
    language?: string | null;
    questions: Array<
      | string
      | {
          id?: string;
          prompt?: string;
          knockout?: boolean;
          knockoutCondition?: string | null;
        }
    >;
    knockouts?: string[];
    attempts: number;
    timezone?: string | null;
  }) {
    const questions =
      (input.questions || []).length > 0
        ? input.questions
        : [
            'Walk me through your most recent role and what you were responsible for.',
            'Why are you interested in this opportunity right now?',
            'What is your notice period, and when could you start?',
          ];
    const screeningName =
      String(input.name || '').trim() || 'AI screening';
    const { screening, candidate } = await screeningService.ensureWorkflowCandidate({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      campaignId: input.campaignId,
      jobId: input.jobId,
      candidateId: input.candidateId,
      enrollmentId: input.enrollmentId,
      ownerUserId: input.ownerUserId,
      name: screeningName,
      language: input.language,
      questions,
      knockouts: input.knockouts,
      attempts: input.attempts,
      minScore: input.minScore,
    });

    await scheduleWorkflowScreeningLaunch({
      screening,
      candidateId: input.candidateId,
      timezone: input.timezone,
    });

    return { screening, candidate };
  },

  async completeSession(
    sessionId: string,
    input: { score: number; summary?: string; passed?: boolean }
  ) {
    const session = await ScreeningCandidateModel.findById(sessionId);
    if (!session) return null;
    // Webhook already wrote the real Hunar result — don't overwrite it.
    if (session.completedAt) return session;
    session.overallScore = input.score;
    session.attempts = Math.max(session.attempts, 1);
    session.summary = input.summary || null;
    session.completedAt = new Date();
    const passed = input.passed ?? input.score >= 70;
    session.callStatus = passed ? 'completed' : 'failed';
    session.recommendation = passed ? 'shortlist' : 'reject';
    await session.save();
    return session;
  },

  async markUnanswered(sessionId: string) {
    const session = await ScreeningCandidateModel.findById(sessionId);
    if (!session) return null;
    session.callStatus = 'no_answer';
    session.completedAt = new Date();
    await session.save();
    return session;
  },
};

async function scheduleWorkflowScreeningLaunch(input: {
  screening: ScreeningDocument;
  candidateId: string;
  timezone?: string | null;
}) {
  const { screening, candidateId } = input;
  const now = new Date();
  const runAt = nextSendAtWithinWindow(
    now,
    {
      startHour: 10,
      endHour: 18,
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      timezone: input.timezone || null,
    },
    input.timezone
  );

  if (screening.status !== 'running') {
    screening.status = 'scheduled';
    await screening.save();
  }

  // Ensure candidate is on the batch list for launch filtering.
  if (mongoose.Types.ObjectId.isValid(candidateId)) {
    await ScreeningModel.updateOne(
      { _id: screening._id, candidateIds: { $ne: candidateId } },
      { $push: { candidateIds: candidateId } }
    );
  }

  const existing = await BullOutreachJobModel.findOne({
    kind: 'launch_screening',
    organizationId: screening.organizationId,
    status: { $in: ['pending', 'queued', 'running'] },
    'details.screeningId': String(screening._id),
  });

  if (existing) {
    const mergedCandidateIds = new Set(
      Array.isArray(existing.details?.candidateIds)
        ? existing.details.candidateIds.map(String)
        : []
    );
    mergedCandidateIds.add(candidateId);
    existing.details = {
      ...(existing.details || {}),
      screeningId: String(screening._id),
      candidateIds: [...mergedCandidateIds],
      source: 'huntlo360',
    };
    if (existing.status === 'pending' && existing.runAt.getTime() > runAt.getTime()) {
      existing.runAt = runAt;
    }
    await existing.save();
    if (existing.status === 'pending' && existing.runAt.getTime() <= now.getTime()) {
      await queueJobNow(String(existing._id));
    }
    log().info(
      {
        screeningId: String(screening._id),
        candidateId,
        jobId: String(existing._id),
        runAt: existing.runAt.toISOString(),
      },
      'Updated Huntlo 360 screening launch job'
    );
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
      source: 'huntlo360',
    },
  });

  if (job && runAt.getTime() <= now.getTime()) {
    await queueJobNow(String(job._id));
  }

  log().info(
    {
      screeningId: String(screening._id),
      candidateId,
      jobId: job ? String(job._id) : null,
      runAt: runAt.toISOString(),
    },
    'Scheduled Huntlo 360 screening launch'
  );
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
