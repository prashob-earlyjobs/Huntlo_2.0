import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../auth/user.model.js';
import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { quotaService } from '../../shared/usage/index.js';
import { campaignsService } from '../outreach/campaigns.service.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import {
  Huntlo360CandidateStateModel,
} from './candidate-state.model.js';
import {
  Huntlo360WorkflowModel,
  defaultStageStats,
  type Huntlo360WorkflowDocument,
} from './workflow.model.js';
import { compileCampaignPayload } from './compiler.js';
import { applyWorkflowTransition, refreshStageStats } from './transitions.js';
import type {
  createWorkflowSchema,
  listCandidatesQuerySchema,
  listWorkflowsQuerySchema,
  transitionBodySchema,
  updateWorkflowSchema,
} from './huntlo360.validation.js';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createWorkflowSchema>;
type UpdateInput = z.infer<typeof updateWorkflowSchema>;
type ListQuery = z.infer<typeof listWorkflowsQuerySchema>;
type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
type TransitionBody = z.infer<typeof transitionBodySchema>;

async function ownerName(userId: string) {
  const user = await UserModel.findById(userId).select('firstName lastName').lean();
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

async function jobTitle(jobId: mongoose.Types.ObjectId | null) {
  if (!jobId) return null;
  const job = await JobModel.findById(jobId).select('title').lean();
  return job?.title ? String(job.title) : null;
}

async function loadWorkflow(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid workflow id.');
  }
  const doc = await Huntlo360WorkflowModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'WORKFLOW_NOT_FOUND', 'Workflow not found.');
  return doc;
}

function toDisplay(doc: Huntlo360WorkflowDocument, extras: {
  ownerName: string;
  jobTitle: string | null;
}) {
  const channels: Array<'Email' | 'WhatsApp'> = [];
  if (doc.outreachConfig.emailEnabled) channels.push('Email');
  if (doc.outreachConfig.whatsappEnabled) channels.push('WhatsApp');

  const statusMap: Record<string, string> = {
    draft: 'Draft',
    running: 'Running',
    paused: 'Paused',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };

  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    name: doc.name,
    jobId: doc.jobId ? String(doc.jobId) : null,
    jobTitle: extras.jobTitle,
    ownerUserId: String(doc.ownerUserId),
    owner: extras.ownerName,
    status: statusMap[doc.status] || doc.status,
    statusRaw: doc.status,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    channels,
    candidates: doc.stageStats.enrolled,
    replied: doc.stageStats.qualification + doc.stageStats.screening + doc.stageStats.recruiter_review + doc.stageStats.scheduling + doc.stageStats.completed,
    qualified: doc.stageStats.recruiter_review + doc.stageStats.scheduling + doc.stageStats.completed,
    screened: doc.stageStats.screening + doc.stageStats.recruiter_review + doc.stageStats.scheduling + doc.stageStats.completed,
    shortlisted: doc.stageStats.recruiter_review + doc.stageStats.scheduling + doc.stageStats.completed,
    scheduled: doc.stageStats.scheduling + doc.stageStats.completed,
    stageStats: doc.stageStats,
    qualificationConfig: doc.qualificationConfig,
    screeningConfig: doc.screeningConfig,
    assessmentConfig: doc.assessmentConfig,
    schedulingConfig: doc.schedulingConfig,
    outreachConfig: doc.outreachConfig,
    candidateSource: doc.candidateSource,
    lastValidation: doc.lastValidation,
    launchedAt: doc.launchedAt?.toISOString() ?? null,
    completedAt: doc.completedAt?.toISOString() ?? null,
    lastActivity: doc.updatedAt.toISOString(),
    version: doc.version,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function mergeConfigs(doc: Huntlo360WorkflowDocument, input: UpdateInput | CreateInput) {
  if (input.outreachConfig) {
    doc.outreachConfig = { ...doc.outreachConfig, ...input.outreachConfig };
  }
  if (input.qualificationConfig) {
    doc.qualificationConfig = {
      ...doc.qualificationConfig,
      ...input.qualificationConfig,
      questions:
        input.qualificationConfig.questions ?? doc.qualificationConfig.questions,
    };
  }
  if (input.screeningConfig) {
    doc.screeningConfig = {
      ...doc.screeningConfig,
      ...input.screeningConfig,
      questions: input.screeningConfig.questions ?? doc.screeningConfig.questions,
      evaluationFields:
        input.screeningConfig.evaluationFields ?? doc.screeningConfig.evaluationFields,
    };
  }
  if (input.assessmentConfig) {
    doc.assessmentConfig = {
      ...doc.assessmentConfig,
      ...input.assessmentConfig,
    };
  }
  if (input.schedulingConfig) {
    doc.schedulingConfig = { ...doc.schedulingConfig, ...input.schedulingConfig };
  }
  if (input.candidateSource) {
    doc.candidateSource = {
      type: input.candidateSource.type || doc.candidateSource.type,
      listId: input.candidateSource.listId ?? doc.candidateSource.listId,
      candidateIds:
        input.candidateSource.candidateIds || doc.candidateSource.candidateIds,
      label: input.candidateSource.label ?? doc.candidateSource.label,
    };
  }
}

async function syncCampaignFromWorkflow(
  organizationId: string,
  userId: string,
  workflow: Huntlo360WorkflowDocument
) {
  const payload = compileCampaignPayload(workflow);
  if (workflow.campaignId) {
    await campaignsService.update(
      organizationId,
      userId,
      String(workflow.campaignId),
      payload
    );
    return String(workflow.campaignId);
  }
  const campaign = await campaignsService.create(organizationId, userId, payload);
  workflow.campaignId = new mongoose.Types.ObjectId(campaign.id);
  await workflow.save();
  return campaign.id;
}

export const huntlo360Service = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      Huntlo360WorkflowModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      Huntlo360WorkflowModel.countDocuments(filter),
    ]);

    const items = await Promise.all(
      docs.map(async (doc) =>
        toDisplay(doc, {
          ownerName: await ownerName(String(doc.ownerUserId)),
          jobTitle: await jobTitle(doc.jobId),
        })
      )
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async get(organizationId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async create(organizationId: string, userId: string, input: CreateInput) {
    const hasFeature = await quotaService.checkFeatureAccess(organizationId, 'huntlo360');
    if (!hasFeature) {
      throw new AppError(403, 'FEATURE_DISABLED', 'Huntlo 360 is not enabled on this plan.');
    }

    if (input.jobId) {
      const job = await JobModel.findOne({
        _id: input.jobId,
        organizationId,
        deletedAt: null,
      }).lean();
      if (!job) throw new AppError(400, 'JOB_NOT_FOUND', 'Linked job not found.');
    }

    const doc = await Huntlo360WorkflowModel.create({
      organizationId,
      ownerUserId: userId,
      jobId: input.jobId || null,
      name: input.name,
      status: 'draft',
      stageStats: defaultStageStats(),
      version: 1,
    });
    mergeConfigs(doc, input);
    await doc.save();

    // Compile linked campaign (draft) without launching
    await syncCampaignFromWorkflow(organizationId, userId, doc);

    return toDisplay(doc, {
      ownerName: await ownerName(userId),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async update(organizationId: string, userId: string, id: string, input: UpdateInput) {
    const doc = await loadWorkflow(organizationId, id);
    if (['completed', 'cancelled'].includes(doc.status)) {
      throw new AppError(400, 'WORKFLOW_LOCKED', `Cannot edit a ${doc.status} workflow.`);
    }
    if (doc.status === 'running') {
      throw new AppError(400, 'WORKFLOW_RUNNING', 'Pause the workflow before editing.');
    }
    if (input.name !== undefined) doc.name = input.name;
    if (input.jobId !== undefined) {
      doc.jobId = input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null;
    }
    mergeConfigs(doc, input);
    doc.version += 1;
    await doc.save();
    await syncCampaignFromWorkflow(organizationId, userId, doc);
    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async remove(organizationId: string, userId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    if (doc.status === 'running') {
      throw new AppError(400, 'WORKFLOW_RUNNING', 'Cancel or pause before deleting.');
    }
    doc.deletedAt = new Date();
    doc.status = 'cancelled';
    doc.cancelledAt = new Date();
    await doc.save();
    if (doc.campaignId) {
      try {
        await campaignsService.remove(organizationId, userId, String(doc.campaignId));
      } catch {
        // Campaign may already be cancelled
      }
    }
    return { deleted: true, id };
  },

  async validate(organizationId: string, userId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    const issues: Array<{ id: string; severity: 'error' | 'warning'; code: string; message: string }> = [];

    const hasFeature = await quotaService.checkFeatureAccess(organizationId, 'huntlo360');
    if (!hasFeature) {
      issues.push({
        id: 'feature',
        severity: 'error',
        code: 'FEATURE_DISABLED',
        message: 'Huntlo 360 is not enabled on this plan.',
      });
    }
    if (!doc.jobId) {
      issues.push({
        id: 'job',
        severity: 'warning',
        code: 'JOB_MISSING',
        message: 'No job is linked to this workflow.',
      });
    }
    if (!doc.outreachConfig.emailEnabled && !doc.outreachConfig.whatsappEnabled) {
      issues.push({
        id: 'channels',
        severity: 'error',
        code: 'NO_CHANNELS',
        message: 'Enable at least one outreach channel.',
      });
    }
    if (
      !doc.candidateSource.candidateIds?.length &&
      doc.candidateSource.type === 'manual'
    ) {
      issues.push({
        id: 'audience',
        severity: 'error',
        code: 'AUDIENCE_EMPTY',
        message: 'Add candidates before launch.',
      });
    }
    if (doc.screeningConfig.enabled && !doc.screeningConfig.questions?.length) {
      issues.push({
        id: 'screening',
        severity: 'error',
        code: 'SCREENING_EMPTY',
        message: 'Screening is enabled but has no questions.',
      });
    }
    if (doc.assessmentConfig?.enabled && !doc.assessmentConfig.templateId) {
      issues.push({
        id: 'assessment',
        severity: 'error',
        code: 'ASSESSMENT_TEMPLATE_MISSING',
        message: 'Assessments are enabled but no template is selected.',
      });
    }
    if (doc.schedulingConfig.enabled && !doc.schedulingConfig.eventTypeUri) {
      issues.push({
        id: 'scheduling',
        severity: 'warning',
        code: 'SCHEDULING_EVENT_MISSING',
        message: 'Scheduling is enabled without an event type URI.',
      });
    }

    await syncCampaignFromWorkflow(organizationId, userId, doc);
    if (doc.campaignId) {
      const campaignValidation = await campaignsService.validate(
        organizationId,
        userId,
        String(doc.campaignId)
      );
      for (const issue of campaignValidation.issues) {
        issues.push({
          id: `campaign_${issue.id}`,
          severity: issue.severity,
          code: issue.code,
          message: issue.message,
        });
      }
    }

    const ok = !issues.some((i) => i.severity === 'error');
    doc.lastValidation = { ok, checkedAt: new Date(), issues };
    await doc.save();
    return { ok, issues };
  },

  async launch(organizationId: string, userId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    if (!['draft', 'paused'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot launch from status ${doc.status}.`);
    }

    const campaignId = await syncCampaignFromWorkflow(organizationId, userId, doc);

    // Ensure audience on campaign before validate/launch
    const candidateIds = doc.candidateSource.candidateIds || [];
    if (candidateIds.length) {
      await campaignsService.addAudience(organizationId, userId, campaignId, {
        candidateIds,
        replace: true,
      });
    }

    const validation = await this.validate(organizationId, userId, id);
    if (!validation.ok) {
      throw new AppError(400, 'LAUNCH_VALIDATION_FAILED', 'Workflow failed launch validation.', {
        meta: { issues: validation.issues },
      });
    }

    await campaignsService.launch(organizationId, userId, campaignId);

    const enrollments = await OutreachEnrollmentModel.find({
      campaignId,
      organizationId,
    }).lean();

    for (const enrollment of enrollments) {
      await Huntlo360CandidateStateModel.findOneAndUpdate(
        {
          workflowId: doc._id,
          candidateId: enrollment.candidateId,
        },
        {
          $setOnInsert: {
            organizationId,
            workflowId: doc._id,
            candidateId: enrollment.candidateId,
            currentStage: 'outreach',
            interestStatus: 'unknown',
            qualificationStatus: 'pending',
            screeningStatus: 'not_started',
            schedulingStatus: 'not_started',
          },
          $set: {
            enrollmentId: enrollment._id,
            outreachStatus: enrollment.status,
            lastTransitionAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }

    doc.status = 'running';
    doc.launchedAt = doc.launchedAt || new Date();
    doc.pausedAt = null;
    doc.version += 1;
    await doc.save();
    await refreshStageStats(id);

    return toDisplay(await loadWorkflow(organizationId, id), {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async pause(organizationId: string, userId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    if (doc.status !== 'running') {
      throw new AppError(400, 'INVALID_STATUS', 'Only running workflows can be paused.');
    }
    if (doc.campaignId) {
      await campaignsService.pause(organizationId, userId, String(doc.campaignId));
    }
    doc.status = 'paused';
    doc.pausedAt = new Date();
    await doc.save();
    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async resume(organizationId: string, userId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    if (doc.status !== 'paused') {
      throw new AppError(400, 'INVALID_STATUS', 'Only paused workflows can be resumed.');
    }
    return this.launch(organizationId, userId, id);
  },

  async cancel(organizationId: string, userId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    if (['completed', 'cancelled'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Workflow already ${doc.status}.`);
    }
    if (doc.campaignId) {
      await campaignsService.cancel(organizationId, userId, String(doc.campaignId));
    }
    doc.status = 'cancelled';
    doc.cancelledAt = new Date();
    doc.completedAt = new Date();
    await doc.save();
    await Huntlo360CandidateStateModel.updateMany(
      {
        workflowId: doc._id,
        currentStage: { $nin: ['completed', 'stopped'] },
      },
      { $set: { currentStage: 'stopped', lastTransitionAt: new Date() } }
    );
    await refreshStageStats(id);
    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async listCandidates(organizationId: string, id: string, query: ListCandidatesQuery) {
    await loadWorkflow(organizationId, id);
    const filter: Record<string, unknown> = { organizationId, workflowId: id };
    if (query.stage) filter.currentStage = query.stage;
    if (query.exceptionOnly) filter.exceptionCode = { $ne: null };

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      Huntlo360CandidateStateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      Huntlo360CandidateStateModel.countDocuments(filter),
    ]);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name email phone currentTitle currentCompany location')
      .lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));

    const items = rows.map((row) => {
      const c = byId.get(String(row.candidateId));
      return {
        id: String(row._id),
        candidateId: String(row.candidateId),
        name: c?.name || 'Unknown',
        email: c?.email || null,
        phone: c?.phone || null,
        headline: [c?.currentTitle, c?.currentCompany].filter(Boolean).join(' · '),
        location: c?.location || '',
        currentStage: row.currentStage,
        outreachStatus: row.outreachStatus,
        interestStatus: row.interestStatus,
        qualificationStatus: row.qualificationStatus,
        screeningId: row.screeningId ? String(row.screeningId) : null,
        screeningStatus: row.screeningStatus,
        recruiterDecision: row.recruiterDecision,
        scheduleCandidateId: row.scheduleCandidateId
          ? String(row.scheduleCandidateId)
          : null,
        schedulingStatus: row.schedulingStatus,
        exceptionCode: row.exceptionCode,
        exceptionDetail: row.exceptionDetail,
        enrollmentId: row.enrollmentId ? String(row.enrollmentId) : null,
        lastTransitionAt: row.lastTransitionAt?.toISOString() || null,
      };
    });

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async stats(organizationId: string, id: string) {
    const doc = await loadWorkflow(organizationId, id);
    const stageStats = await refreshStageStats(id);
    return {
      workflowId: id,
      status: doc.status,
      stageStats,
      campaignId: doc.campaignId ? String(doc.campaignId) : null,
    };
  },

  async exceptions(organizationId: string, id: string) {
    await loadWorkflow(organizationId, id);
    const rows = await Huntlo360CandidateStateModel.find({
      organizationId,
      workflowId: id,
      exceptionCode: { $ne: null },
    })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name')
      .lean();
    const names = new Map(candidates.map((c) => [String(c._id), c.name]));

    return rows.map((row) => ({
      id: String(row._id),
      candidateId: String(row.candidateId),
      candidateName: names.get(String(row.candidateId)) || 'Unknown',
      code: row.exceptionCode,
      detail: row.exceptionDetail,
      stage: row.currentStage,
      updatedAt: row.updatedAt.toISOString(),
    }));
  },

  async transition(
    organizationId: string,
    userId: string | null,
    id: string,
    body: TransitionBody
  ) {
    await loadWorkflow(organizationId, id);
    const result = await applyWorkflowTransition({
      organizationId,
      workflowId: id,
      candidateId: body.candidateId,
      event: body.event,
      idempotencyKey: body.idempotencyKey,
      actorUserId: userId,
      toStage: body.toStage,
      interestStatus: body.interestStatus,
      qualificationStatus: body.qualificationStatus,
      screeningScore: body.screeningScore,
      exceptionCode: body.exceptionCode,
      exceptionDetail: body.exceptionDetail,
      recruiterDecision: body.recruiterDecision,
      metadata: body.metadata,
    });

    return {
      duplicate: result.duplicate,
      transitionId: result.transitionId,
      toStage: result.toStage,
      candidateState: result.state
        ? {
            id: String(result.state._id),
            candidateId: String(result.state.candidateId),
            currentStage: result.state.currentStage,
            outreachStatus: result.state.outreachStatus,
            interestStatus: result.state.interestStatus,
            qualificationStatus: result.state.qualificationStatus,
            screeningStatus: result.state.screeningStatus,
            schedulingStatus: result.state.schedulingStatus,
            exceptionCode: result.state.exceptionCode,
            recruiterDecision: result.state.recruiterDecision,
          }
        : null,
    };
  },

  /**
   * Hook for conversations: map interest / opt-out into workflow transitions.
   */
  async onConversationSignal(input: {
    organizationId: string;
    campaignId: string | null;
    candidateId: string;
    enrollmentId?: string | null;
    interest?: string | null;
    optedOut?: boolean;
  }) {
    if (!input.campaignId) return null;
    const workflow = await Huntlo360WorkflowModel.findOne({
      organizationId: input.organizationId,
      campaignId: input.campaignId,
      deletedAt: null,
      status: { $in: ['running', 'paused'] },
    });
    if (!workflow) return null;

    const event = input.optedOut
      ? 'opt_out'
      : input.interest === 'interested'
        ? 'positive_reply'
        : input.interest === 'not_interested' || input.interest === 'opt_out'
          ? 'opt_out'
          : null;
    if (!event) return null;

    return applyWorkflowTransition({
      organizationId: input.organizationId,
      workflowId: String(workflow._id),
      candidateId: input.candidateId,
      event,
      idempotencyKey: `conv:${input.campaignId}:${input.candidateId}:${event}:${input.interest || 'na'}`,
      interestStatus: input.interest || undefined,
      metadata: { source: 'conversation' },
    });
  },
};
