import mongoose from 'mongoose';

import {
  BullOutreachJobModel,
  type BullJobChannel,
  type BullJobKind,
} from './job.model.js';

export type ScheduleInput = {
  kind: BullJobKind;
  channel?: BullJobChannel | null;
  organizationId?: string | null;
  campaignId?: string | null;
  enrollmentId?: string | null;
  stepId?: string | null;
  runAt?: Date;
  details?: Record<string, unknown>;
};

function oid(id: string | null | undefined) {
  if (!id) return null;
  return new mongoose.Types.ObjectId(id);
}

/** Candidate email this job will message — shown in Admin → Worker tasks. */
async function resolveTargetEmail(
  enrollmentId: string | null | undefined
): Promise<string | null> {
  if (!enrollmentId || !mongoose.Types.ObjectId.isValid(enrollmentId)) return null;
  try {
    const { OutreachEnrollmentModel } = await import(
      '../modules/outreach/enrollment.model.js'
    );
    const enrollment = await OutreachEnrollmentModel.findById(enrollmentId)
      .select('candidateId')
      .lean();
    if (!enrollment?.candidateId) return null;
    const { SavedCandidateModel } = await import(
      '../modules/candidates/saved-candidate.model.js'
    );
    const candidate = await SavedCandidateModel.findById(enrollment.candidateId)
      .select('email')
      .lean();
    return candidate?.email ? String(candidate.email) : null;
  } catch {
    return null;
  }
}

export async function scheduleJob(input: ScheduleInput) {
  const details: Record<string, unknown> = { ...(input.details ?? {}) };
  if (!details.targetEmail) {
    const targetEmail = await resolveTargetEmail(input.enrollmentId);
    if (targetEmail) details.targetEmail = targetEmail;
  }

  try {
    return await BullOutreachJobModel.create({
      kind: input.kind,
      channel: input.channel ?? null,
      organizationId: oid(input.organizationId),
      campaignId: oid(input.campaignId),
      enrollmentId: oid(input.enrollmentId),
      stepId: input.stepId ?? null,
      runAt: input.runAt ?? new Date(),
      status: 'pending',
      attempts: 0,
      details,
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as { code?: number }).code === 11000) {
      return null;
    }
    throw error;
  }
}

export async function scheduleFirstSends(input: {
  organizationId: string;
  campaignId: string;
  enrollmentIds: string[];
  stepId: string;
  channel: BullJobChannel | null;
  runAt?: Date;
}) {
  const runAt = input.runAt ?? new Date();
  for (const enrollmentId of input.enrollmentIds) {
    await scheduleJob({
      kind: 'send',
      channel: input.channel,
      organizationId: input.organizationId,
      campaignId: input.campaignId,
      enrollmentId,
      stepId: input.stepId,
      runAt,
    });
  }
}

export async function cancelJobsForCampaign(campaignId: string) {
  await BullOutreachJobModel.updateMany(
    {
      campaignId,
      status: { $in: ['pending', 'queued'] },
    },
    { $set: { status: 'cancelled' } }
  );
}

export async function cancelJobsForEnrollment(enrollmentId: string) {
  await BullOutreachJobModel.updateMany(
    {
      enrollmentId,
      status: { $in: ['pending', 'queued'] },
    },
    { $set: { status: 'cancelled' } }
  );
}
