import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { campaignsService } from '../outreach/campaigns.service.js';
import { screeningFacade } from '../screening/index.js';
import { assessmentFacade } from '../assessments/index.js';
import { schedulingFacade } from '../scheduling/index.js';
import {
  Huntlo360CandidateStateModel,
  Huntlo360TransitionModel,
  type ExceptionCode,
  type WorkflowStage,
} from './candidate-state.model.js';
import {
  Huntlo360WorkflowModel,
  defaultStageStats,
  type Huntlo360WorkflowDocument,
} from './workflow.model.js';

export type TransitionEvent =
  | 'positive_reply'
  | 'opt_out'
  | 'qualification_pass'
  | 'qualification_fail'
  | 'qualification_incomplete'
  | 'screening_pass'
  | 'screening_fail'
  | 'screening_unanswered'
  | 'assessment_pass'
  | 'assessment_fail'
  | 'recruiter_approve'
  | 'recruiter_reject'
  | 'recruiter_override_stage'
  | 'scheduling_booked'
  | 'scheduling_expired'
  | 'outreach_failed'
  | 'quota_exhausted'
  | 'missing_contact'
  | 'provider_disconnected';

export type TransitionInput = {
  organizationId: string;
  workflowId: string;
  candidateId: string;
  event: TransitionEvent;
  idempotencyKey: string;
  actorUserId?: string | null;
  toStage?: WorkflowStage;
  interestStatus?: string;
  qualificationStatus?: string;
  screeningScore?: number;
  exceptionCode?: ExceptionCode;
  exceptionDetail?: string;
  recruiterDecision?: string;
  metadata?: Record<string, unknown>;
};

async function refreshStageStats(workflowId: string) {
  const rows = await Huntlo360CandidateStateModel.aggregate<{
    _id: string;
    count: number;
  }>([
    { $match: { workflowId: new mongoose.Types.ObjectId(workflowId) } },
    { $group: { _id: '$currentStage', count: { $sum: 1 } } },
  ]);
  const exceptions = await Huntlo360CandidateStateModel.countDocuments({
    workflowId,
    exceptionCode: { $ne: null },
  });
  const stats = defaultStageStats();
  for (const row of rows) {
    const key = row._id as keyof typeof stats;
    if (key in stats) stats[key] = row.count;
    stats.enrolled += row.count;
  }
  stats.exceptions = exceptions;
  await Huntlo360WorkflowModel.findByIdAndUpdate(workflowId, { stageStats: stats });
  return stats;
}

function resolveNextStage(
  workflow: Huntlo360WorkflowDocument,
  current: WorkflowStage,
  event: TransitionEvent,
  overrideStage?: WorkflowStage
): { stage: WorkflowStage; exceptionCode?: ExceptionCode | null } {
  if (event === 'recruiter_override_stage' && overrideStage) {
    return { stage: overrideStage, exceptionCode: null };
  }

  switch (event) {
    case 'opt_out':
      return { stage: 'stopped', exceptionCode: 'opted_out' };
    case 'missing_contact':
      return { stage: 'stopped', exceptionCode: 'missing_contact' };
    case 'provider_disconnected':
      return { stage: current, exceptionCode: 'provider_disconnected' };
    case 'outreach_failed':
      return { stage: current, exceptionCode: 'outreach_failed' };
    case 'quota_exhausted':
      return { stage: current, exceptionCode: 'quota_exhausted' };
    case 'positive_reply':
      if (workflow.qualificationConfig.enabled) return { stage: 'qualification' };
      if (workflow.screeningConfig.enabled) return { stage: 'screening' };
      if (workflow.schedulingConfig.autoSendAfterQualification && workflow.schedulingConfig.enabled) {
        return { stage: 'scheduling' };
      }
      return { stage: 'recruiter_review' };
    case 'qualification_pass':
      if (workflow.screeningConfig.enabled) return { stage: 'screening' };
      if (
        workflow.schedulingConfig.enabled &&
        workflow.schedulingConfig.autoSendAfterQualification
      ) {
        return { stage: 'scheduling' };
      }
      return { stage: 'recruiter_review' };
    case 'qualification_fail':
      return { stage: 'stopped' };
    case 'qualification_incomplete':
      return { stage: 'qualification', exceptionCode: 'qualification_incomplete' };
    case 'screening_pass':
      if (workflow.assessmentConfig?.enabled && workflow.assessmentConfig.templateId) {
        return { stage: 'recruiter_review' };
      }
      return {
        stage: workflow.screeningConfig.onPass || 'recruiter_review',
      };
    case 'screening_fail':
      if (workflow.screeningConfig.autoReject || workflow.screeningConfig.onFail === 'stop') {
        return { stage: 'stopped', exceptionCode: 'screening_failed' };
      }
      return { stage: 'recruiter_review', exceptionCode: 'screening_failed' };
    case 'screening_unanswered':
      return { stage: 'screening', exceptionCode: 'screening_unanswered' };
    case 'assessment_pass':
      return {
        stage: workflow.assessmentConfig?.onPass || 'recruiter_review',
      };
    case 'assessment_fail':
      if (workflow.assessmentConfig?.onFail === 'stop') {
        return { stage: 'stopped', exceptionCode: 'assessment_failed' };
      }
      return { stage: 'recruiter_review', exceptionCode: 'assessment_failed' };
    case 'recruiter_approve':
      if (workflow.schedulingConfig.enabled) return { stage: 'scheduling' };
      return { stage: 'completed' };
    case 'recruiter_reject':
      return { stage: 'stopped' };
    case 'scheduling_booked':
      return { stage: 'completed' };
    case 'scheduling_expired':
      return { stage: 'scheduling', exceptionCode: 'scheduling_link_expired' };
    default:
      return { stage: current };
  }
}

export async function applyWorkflowTransition(input: TransitionInput) {
  const existing = await Huntlo360TransitionModel.findOne({
    organizationId: input.organizationId,
    workflowId: input.workflowId,
    idempotencyKey: input.idempotencyKey,
  }).lean();
  if (existing) {
    const state = await Huntlo360CandidateStateModel.findById(existing.candidateStateId);
    return {
      duplicate: true,
      transitionId: String(existing._id),
      state,
      toStage: existing.toStage,
    };
  }

  const workflow = await Huntlo360WorkflowModel.findOne({
    _id: input.workflowId,
    organizationId: input.organizationId,
    deletedAt: null,
  });
  if (!workflow) throw new AppError(404, 'WORKFLOW_NOT_FOUND', 'Workflow not found.');

  let state = await Huntlo360CandidateStateModel.findOne({
    workflowId: input.workflowId,
    candidateId: input.candidateId,
  });
  if (!state) {
    throw new AppError(404, 'CANDIDATE_STATE_NOT_FOUND', 'Candidate is not in this workflow.');
  }

  const fromStage = state.currentStage;
  const resolved = resolveNextStage(
    workflow,
    fromStage,
    input.event,
    input.toStage
  );

  // Side effects for stage entry (facades — not full engines)
  if (resolved.stage === 'screening' && fromStage !== 'screening') {
    const session = await screeningFacade.createSession({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      campaignId: workflow.campaignId ? String(workflow.campaignId) : null,
      candidateId: input.candidateId,
      enrollmentId: state.enrollmentId ? String(state.enrollmentId) : null,
      ownerUserId: String(workflow.ownerUserId),
      minScore: workflow.screeningConfig.minScore,
      language: workflow.screeningConfig.language,
      questions: workflow.screeningConfig.questions || [],
      attempts: workflow.screeningConfig.attempts,
    });
    state.screeningId = session._id;
    state.screeningStatus = 'scheduled';
    if (state.enrollmentId) {
      await OutreachEnrollmentModel.findByIdAndUpdate(state.enrollmentId, {
        $set: {
          'screeningState.status': 'scheduled',
          'screeningState.screeningId': String(session._id),
        },
      });
    }
  }

  if (
    resolved.stage === 'screening' &&
    (input.event === 'screening_pass' || input.event === 'screening_fail') &&
    state.screeningId
  ) {
    await screeningFacade.completeSession(String(state.screeningId), {
      score: input.screeningScore ?? (input.event === 'screening_pass' ? 85 : 40),
      passed: input.event === 'screening_pass',
      summary: input.event === 'screening_pass' ? 'Passed screening' : 'Failed screening',
    });
    state.screeningStatus = input.event === 'screening_pass' ? 'completed' : 'failed';
  }

  if (input.event === 'screening_unanswered' && state.screeningId) {
    await screeningFacade.markUnanswered(String(state.screeningId));
    state.screeningStatus = 'unanswered';
  }

  if (
    input.event === 'screening_pass' &&
    workflow.assessmentConfig?.enabled &&
    workflow.assessmentConfig.templateId
  ) {
    const invited = await assessmentFacade.inviteCandidateForWorkflow({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      ownerUserId: String(workflow.ownerUserId),
      candidateId: input.candidateId,
      templateId: workflow.assessmentConfig.templateId,
      jobId: workflow.jobId ? String(workflow.jobId) : null,
      channel: workflow.assessmentConfig.channel,
      expiryHours: workflow.assessmentConfig.expiryHours,
    });
    if (invited) {
      state.assessmentCandidateId = invited._id;
      state.assessmentStatus = invited.invitationStatus || 'invited';
    }
  }

  if (input.event === 'assessment_pass' || input.event === 'assessment_fail') {
    state.assessmentStatus = input.event === 'assessment_pass' ? 'completed' : 'failed';
  }

  if (resolved.stage === 'scheduling' && fromStage !== 'scheduling') {
    const link = await schedulingFacade.createLink({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      campaignId: workflow.campaignId ? String(workflow.campaignId) : null,
      candidateId: input.candidateId,
      enrollmentId: state.enrollmentId ? String(state.enrollmentId) : null,
      ownerUserId: String(workflow.ownerUserId),
      provider: workflow.schedulingConfig.provider,
      eventTypeUri: workflow.schedulingConfig.eventTypeUri,
      channel: workflow.schedulingConfig.channel,
      bookingExpiryHours: workflow.schedulingConfig.bookingExpiryHours,
    });
    state.scheduleCandidateId = link._id;
    state.schedulingStatus = 'link_sent';
    if (state.enrollmentId) {
      await OutreachEnrollmentModel.findByIdAndUpdate(state.enrollmentId, {
        $set: {
          'schedulingState.status': 'link_sent',
          'schedulingState.bookingUrl': link.bookingUrl,
        },
      });
    }
  }

  if (input.event === 'scheduling_booked' && state.scheduleCandidateId) {
    await schedulingFacade.markBooked(String(state.scheduleCandidateId));
    state.schedulingStatus = 'booked';
    if (state.enrollmentId) {
      await OutreachEnrollmentModel.findByIdAndUpdate(state.enrollmentId, {
        $set: { 'schedulingState.status': 'booked' },
      });
    }
  }

  if (input.event === 'scheduling_expired' && state.scheduleCandidateId) {
    await schedulingFacade.markExpired(String(state.scheduleCandidateId));
    state.schedulingStatus = 'expired';
  }

  if (input.event === 'opt_out' && state.enrollmentId) {
    await campaignsService.stopEnrollment(String(state.enrollmentId), 'candidate_opted_out');
    state.outreachStatus = 'opted_out';
  }

  if (input.interestStatus) state.interestStatus = input.interestStatus;
  if (input.qualificationStatus) state.qualificationStatus = input.qualificationStatus;
  if (input.recruiterDecision) state.recruiterDecision = input.recruiterDecision;
  if (input.event === 'positive_reply') {
    state.outreachStatus = 'replied';
    state.interestStatus = input.interestStatus || 'interested';
  }
  if (input.event === 'qualification_pass') {
    state.qualificationStatus = 'qualified';
  }
  if (input.event === 'qualification_fail') {
    state.qualificationStatus = 'rejected';
  }

  state.currentStage = resolved.stage;
  state.exceptionCode = input.exceptionCode ?? resolved.exceptionCode ?? null;
  state.exceptionDetail = input.exceptionDetail || null;
  state.lastTransitionAt = new Date();
  state.lastTransitionKey = input.idempotencyKey;
  await state.save();

  let transition;
  try {
    transition = await Huntlo360TransitionModel.create({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      candidateStateId: state._id,
      candidateId: input.candidateId,
      idempotencyKey: input.idempotencyKey,
      fromStage,
      toStage: resolved.stage,
      event: input.event,
      actorUserId: input.actorUserId || null,
      metadata: input.metadata || {},
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const dup = await Huntlo360TransitionModel.findOne({
        organizationId: input.organizationId,
        workflowId: input.workflowId,
        idempotencyKey: input.idempotencyKey,
      }).lean();
      return {
        duplicate: true,
        transitionId: dup ? String(dup._id) : null,
        state,
        toStage: dup?.toStage || resolved.stage,
      };
    }
    throw error;
  }

  await refreshStageStats(input.workflowId);

  return {
    duplicate: false,
    transitionId: String(transition._id),
    state,
    toStage: resolved.stage,
  };
}

export { refreshStageStats };
