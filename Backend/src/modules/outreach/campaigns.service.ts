import { randomUUID } from 'node:crypto';

import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { UserModel } from '../auth/user.model.js';
import {
  CampaignJobModel,
  type CampaignJobType,
} from './campaign-job.model.js';
import {
  OutreachCampaignModel,
  defaultChannelConfig,
  defaultStats,
  type CampaignSequenceStep,
  type OutreachCampaignDocument,
  type CampaignStatus,
} from './campaign.model.js';
import {
  OutreachEnrollmentModel,
  type EnrollmentStatus,
  type StopReason,
} from './enrollment.model.js';
import { recordCampaignActivity, CampaignActivityModel } from './campaign-activity.model.js';
import { isOptedOut, validateCampaignLaunch } from './campaign-validate.js';
import type {
  audienceBodySchema,
  createCampaignSchema,
  listCampaignsQuerySchema,
  listEnrollmentsQuerySchema,
  removeAudienceBodySchema,
  updateCampaignSchema,
} from './campaign.validation.js';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createCampaignSchema>;
type UpdateInput = z.infer<typeof updateCampaignSchema>;
type ListQuery = z.infer<typeof listCampaignsQuerySchema>;
type AudienceInput = z.infer<typeof audienceBodySchema>;
type RemoveAudienceInput = z.infer<typeof removeAudienceBodySchema>;
type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;

function mergeChannelConfig(
  base: ReturnType<typeof defaultChannelConfig>,
  patch?: CreateInput['channelConfig']
) {
  if (!patch) return base;
  return {
    email: { ...base.email, ...(patch.email || {}) },
    whatsapp: { ...base.whatsapp, ...(patch.whatsapp || {}) },
    ai_voice: { ...base.ai_voice, ...(patch.ai_voice || {}) },
    timezone: patch.timezone || base.timezone,
    sendWindow: { ...base.sendWindow, ...(patch.sendWindow || {}) },
  };
}

function normalizeSteps(steps?: CreateInput['sequenceSteps']): CampaignSequenceStep[] {
  if (!steps?.length) return [];
  return steps.map((step, index) => ({
    id: step.id || `step-${index + 1}`,
    order: step.order ?? index,
    type: step.type,
    delayDays: step.delayDays ?? 0,
    templateId: step.templateId ?? null,
    subject: step.subject ?? null,
    body: step.body ?? null,
    stopOnReply: step.stopOnReply ?? true,
    note: step.note ?? null,
    sendWindow: step.sendWindow
      ? {
          startHour: step.sendWindow.startHour,
          endHour: step.sendWindow.endHour,
          daysOfWeek: step.sendWindow.daysOfWeek,
          timezone: step.sendWindow.timezone ?? null,
        }
      : null,
    config: step.config || {},
  }));
}

function jobTypeForStep(type: CampaignSequenceStep['type']): CampaignJobType {
  switch (type) {
    case 'email':
      return 'send_email';
    case 'whatsapp':
      return 'send_whatsapp';
    case 'ai_voice':
      return 'launch_voice';
    case 'wait':
      return 'wait';
    case 'conditional':
      return 'evaluate_conditional';
    case 'recruiter_task':
      return 'create_recruiter_task';
    case 'scheduling_link':
      return 'send_scheduling_link';
    default:
      return 'advance_sequence';
  }
}

async function ownerName(userId: string): Promise<string> {
  const user = await UserModel.findById(userId).select('firstName lastName').lean();
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

async function jobTitle(jobId: mongoose.Types.ObjectId | null): Promise<string | null> {
  if (!jobId) return null;
  const job = await JobModel.findById(jobId).select('title').lean();
  return job?.title ? String(job.title) : null;
}

function recomputeStatsFromCounts(counts: Record<string, number>) {
  const stats = defaultStats();
  stats.enrolled = Object.values(counts).reduce((a, b) => a + b, 0);
  stats.pending = counts.pending || 0;
  stats.active = (counts.active || 0) + (counts.waiting || 0);
  stats.replies = counts.replied || 0;
  stats.qualified = counts.qualified || 0;
  stats.stopped = (counts.stopped || 0) + (counts.opted_out || 0);
  stats.failed = counts.failed || 0;
  stats.completed = counts.completed || 0;
  return stats;
}

export async function refreshCampaignStats(campaignId: string) {
  const rows = await OutreachEnrollmentModel.aggregate<{ _id: string; count: number }>([
    { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row._id] = row.count;
  const stats = recomputeStatsFromCounts(counts);
  const campaign = await OutreachCampaignModel.findById(campaignId);
  if (!campaign) return stats;
  stats.sent = campaign.stats?.sent || 0;
  stats.delivered = campaign.stats?.delivered || 0;
  stats.interested = campaign.stats?.interested || 0;
  campaign.stats = stats;
  await campaign.save();
  return stats;
}

export function toSafeCampaign(
  doc: OutreachCampaignDocument,
  extras: { ownerName: string; relatedJobTitle: string | null }
) {
  const channels: string[] = [];
  if (doc.channelConfig?.email?.enabled) channels.push('email');
  if (doc.channelConfig?.whatsapp?.enabled) channels.push('whatsapp');
  if (doc.channelConfig?.ai_voice?.enabled) channels.push('ai_voice');
  // Infer from sequence if channel toggles empty
  if (channels.length === 0) {
    for (const step of doc.sequenceSteps || []) {
      if (step.type === 'email' || step.type === 'whatsapp' || step.type === 'ai_voice') {
        if (!channels.includes(step.type)) channels.push(step.type);
      }
    }
  }

  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    ownerUserId: String(doc.ownerUserId),
    ownerName: extras.ownerName,
    jobId: doc.jobId ? String(doc.jobId) : null,
    relatedJobTitle: extras.relatedJobTitle,
    name: doc.name,
    description: doc.description,
    sourceModule: doc.sourceModule,
    campaignType: doc.campaignType,
    status: doc.status,
    candidateSource: doc.candidateSource,
    channelConfig: doc.channelConfig,
    channels,
    sequenceSteps: doc.sequenceSteps,
    qualificationConfig: doc.qualificationConfig,
    schedulingConfig: doc.schedulingConfig,
    stats: doc.stats,
    scheduledAt: doc.scheduledAt?.toISOString() ?? null,
    launchedAt: doc.launchedAt?.toISOString() ?? null,
    pausedAt: doc.pausedAt?.toISOString() ?? null,
    completedAt: doc.completedAt?.toISOString() ?? null,
    version: doc.version,
    lastValidation: doc.lastValidation,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function loadCampaign(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid campaign id.');
  }
  const doc = await OutreachCampaignModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.');
  return doc;
}

async function assertEditable(doc: OutreachCampaignDocument) {
  if (['completed', 'cancelled'].includes(doc.status)) {
    throw new AppError(400, 'CAMPAIGN_LOCKED', `Cannot edit a ${doc.status} campaign.`);
  }
}

function contactAvailability(candidate: {
  email?: string | null;
  phone?: string | null;
  tags?: string[];
  customFields?: Record<string, unknown> | null;
}) {
  return {
    email: Boolean(candidate.email),
    phone: Boolean(candidate.phone),
    optedOut: isOptedOut(candidate),
  };
}

async function enqueueFirstJobs(campaign: OutreachCampaignDocument, enrollmentIds: string[]) {
  if (!campaign.sequenceSteps.length) return;
  const first = [...campaign.sequenceSteps].sort((a, b) => a.order - b.order)[0];
  if (!first) return;
  const now = new Date();
  const docs = enrollmentIds.map((enrollmentId) => ({
    organizationId: campaign.organizationId,
    campaignId: campaign._id,
    enrollmentId,
    stepId: first.id,
    jobType: jobTypeForStep(first.type),
    scheduledAt: now,
    status: 'queued' as const,
    attempts: 0,
  }));
  if (docs.length) await CampaignJobModel.insertMany(docs, { ordered: false });
}

export const campaignsService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.sourceModule) filter.sourceModule = query.sourceModule;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      OutreachCampaignModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(query.limit),
      OutreachCampaignModel.countDocuments(filter),
    ]);

    const items = await Promise.all(
      docs.map(async (doc) =>
        toSafeCampaign(doc, {
          ownerName: await ownerName(String(doc.ownerUserId)),
          relatedJobTitle: await jobTitle(doc.jobId),
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
    const doc = await loadCampaign(organizationId, id);
    return toSafeCampaign(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async create(organizationId: string, userId: string, input: CreateInput) {
    if (input.jobId) {
      const job = await JobModel.findOne({
        _id: input.jobId,
        organizationId,
        deletedAt: null,
      }).lean();
      if (!job) throw new AppError(400, 'JOB_NOT_FOUND', 'Linked job not found.');
    }

    const channelConfig = mergeChannelConfig(defaultChannelConfig(), input.channelConfig);
    // Auto-enable channels from sequence
    for (const step of input.sequenceSteps || []) {
      if (step.type === 'email') channelConfig.email.enabled = true;
      if (step.type === 'whatsapp') channelConfig.whatsapp.enabled = true;
      if (step.type === 'ai_voice') channelConfig.ai_voice.enabled = true;
    }

    const doc = await OutreachCampaignModel.create({
      organizationId,
      ownerUserId: userId,
      jobId: input.jobId || null,
      name: input.name,
      description: input.description ?? null,
      sourceModule: input.sourceModule || 'outreach',
      campaignType: input.campaignType || 'multi_channel',
      status: 'draft',
      candidateSource: {
        type: input.candidateSource?.type || 'manual',
        listId: input.candidateSource?.listId ?? null,
        jobId: input.candidateSource?.jobId ?? null,
        candidateIds: input.candidateSource?.candidateIds || [],
        label: input.candidateSource?.label ?? null,
      },
      channelConfig,
      sequenceSteps: normalizeSteps(input.sequenceSteps),
      qualificationConfig: input.qualificationConfig || {
        enabled: false,
        questions: [],
        aiReplyEnabled: false,
      },
      schedulingConfig: input.schedulingConfig || {
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      },
      stats: defaultStats(),
      version: 1,
    });

    await recordCampaignActivity({
      organizationId,
      campaignId: String(doc._id),
      actorUserId: userId,
      type: 'campaign.created',
      title: 'Campaign created',
      detail: doc.name,
    });

    return toSafeCampaign(doc, {
      ownerName: await ownerName(userId),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async update(organizationId: string, userId: string, id: string, input: UpdateInput) {
    const doc = await loadCampaign(organizationId, id);
    await assertEditable(doc);
    if (doc.status === 'running') {
      // Allow limited edits while running? User said PATCH — allow sequence only when paused/draft/scheduled
      throw new AppError(400, 'CAMPAIGN_RUNNING', 'Pause the campaign before editing.');
    }

    if (input.name !== undefined) doc.name = input.name;
    if (input.description !== undefined) doc.description = input.description;
    if (input.jobId !== undefined) doc.jobId = input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null;
    if (input.campaignType !== undefined) doc.campaignType = input.campaignType;
    if (input.sourceModule !== undefined) doc.sourceModule = input.sourceModule;
    if (input.candidateSource !== undefined) {
      doc.candidateSource = {
        type: input.candidateSource.type || doc.candidateSource.type,
        listId: input.candidateSource.listId ?? doc.candidateSource.listId,
        jobId: input.candidateSource.jobId ?? doc.candidateSource.jobId,
        candidateIds: input.candidateSource.candidateIds || doc.candidateSource.candidateIds,
        label: input.candidateSource.label ?? doc.candidateSource.label,
      };
    }
    if (input.channelConfig !== undefined) {
      doc.channelConfig = mergeChannelConfig(doc.channelConfig as ReturnType<typeof defaultChannelConfig>, input.channelConfig);
    }
    if (input.sequenceSteps !== undefined) {
      doc.sequenceSteps = normalizeSteps(input.sequenceSteps);
    }
    if (input.qualificationConfig !== undefined) {
      doc.qualificationConfig = {
        enabled: input.qualificationConfig.enabled,
        questions: input.qualificationConfig.questions,
        aiReplyEnabled: input.qualificationConfig.aiReplyEnabled ?? false,
      };
    }
    if (input.schedulingConfig !== undefined) {
      doc.schedulingConfig = {
        enabled: input.schedulingConfig.enabled,
        provider: input.schedulingConfig.provider ?? null,
        eventTypeUri: input.schedulingConfig.eventTypeUri ?? null,
        messageTemplateId: input.schedulingConfig.messageTemplateId ?? null,
      };
    }
    doc.version += 1;
    await doc.save();

    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'campaign.updated',
      title: 'Campaign updated',
    });

    return toSafeCampaign(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async remove(organizationId: string, userId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    if (doc.status === 'running') {
      throw new AppError(400, 'CAMPAIGN_RUNNING', 'Cancel or pause before deleting.');
    }
    doc.deletedAt = new Date();
    doc.status = 'cancelled';
    doc.cancelledAt = new Date();
    await doc.save();
    await CampaignJobModel.updateMany(
      { campaignId: doc._id, status: { $in: ['queued', 'leased', 'running'] } },
      { $set: { status: 'cancelled' } }
    );
    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'campaign.deleted',
      title: 'Campaign deleted',
    });
    return { deleted: true, id };
  },

  async addAudience(organizationId: string, userId: string, id: string, input: AudienceInput) {
    const doc = await loadCampaign(organizationId, id);
    await assertEditable(doc);

    const uniqueIds = [...new Set(input.candidateIds)];
    const candidates = await SavedCandidateModel.find({
      _id: { $in: uniqueIds },
      organizationId,
      deletedAt: null,
    }).lean();

    if (candidates.length === 0) {
      throw new AppError(400, 'AUDIENCE_EMPTY', 'No valid candidates found.');
    }

    if (input.replace) {
      await OutreachEnrollmentModel.deleteMany({ campaignId: doc._id, organizationId });
    }

    const existing = await OutreachEnrollmentModel.find({
      campaignId: doc._id,
      candidateId: { $in: candidates.map((c) => c._id) },
    })
      .select('candidateId')
      .lean();
    const existingSet = new Set(existing.map((e) => String(e.candidateId)));

    const toInsert = candidates
      .filter((c) => !existingSet.has(String(c._id)))
      .map((candidate) => {
        const contact = contactAvailability(candidate);
        const status: EnrollmentStatus = contact.optedOut ? 'opted_out' : 'pending';
        return {
          organizationId,
          campaignId: doc._id,
          candidateId: candidate._id,
          currentStepIndex: 0,
          status,
          contactAvailability: contact,
          stopReason: contact.optedOut ? ('candidate_opted_out' as StopReason) : null,
          nextActionAt: null,
        };
      });

    if (toInsert.length) {
      await OutreachEnrollmentModel.insertMany(toInsert, { ordered: false });
    }

    const allIds = await OutreachEnrollmentModel.find({ campaignId: doc._id })
      .select('candidateId')
      .lean();
    doc.candidateSource.candidateIds = allIds.map((e) => String(e.candidateId));
    if (input.listId) {
      doc.candidateSource.type = 'saved_list';
      doc.candidateSource.listId = input.listId;
    }
    await doc.save();
    await refreshCampaignStats(id);

    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'audience.added',
      title: 'Audience updated',
      detail: `Added ${toInsert.length} candidate(s)`,
    });

    return {
      added: toInsert.length,
      skippedDuplicates: candidates.length - toInsert.length,
      enrolled: doc.candidateSource.candidateIds.length,
    };
  },

  async removeAudience(
    organizationId: string,
    userId: string,
    id: string,
    input: RemoveAudienceInput
  ) {
    const doc = await loadCampaign(organizationId, id);
    await assertEditable(doc);
    const result = await OutreachEnrollmentModel.deleteMany({
      campaignId: doc._id,
      organizationId,
      candidateId: { $in: input.candidateIds },
      status: { $in: ['pending', 'opted_out'] },
    });
    const remaining = await OutreachEnrollmentModel.find({ campaignId: doc._id })
      .select('candidateId')
      .lean();
    doc.candidateSource.candidateIds = remaining.map((e) => String(e.candidateId));
    await doc.save();
    await refreshCampaignStats(id);
    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'audience.removed',
      title: 'Audience candidates removed',
      detail: `Removed ${result.deletedCount}`,
    });
    return { removed: result.deletedCount || 0 };
  },

  async audiencePreview(organizationId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    const enrollments = await OutreachEnrollmentModel.find({
      campaignId: doc._id,
      organizationId,
    })
      .limit(200)
      .lean();
    const candidates = await SavedCandidateModel.find({
      _id: { $in: enrollments.map((e) => e.candidateId) },
      organizationId,
    })
      .select('name email phone currentTitle currentCompany tags customFields')
      .lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));

    return {
      total: enrollments.length,
      withEmail: enrollments.filter((e) => e.contactAvailability.email).length,
      withPhone: enrollments.filter((e) => e.contactAvailability.phone).length,
      optedOut: enrollments.filter((e) => e.contactAvailability.optedOut).length,
      sample: enrollments.slice(0, 25).map((e) => {
        const c = byId.get(String(e.candidateId));
        return {
          enrollmentId: String(e._id),
          candidateId: String(e.candidateId),
          name: c?.name || 'Unknown',
          email: c?.email || null,
          phone: c?.phone || null,
          status: e.status,
          contactAvailability: e.contactAvailability,
        };
      }),
    };
  },

  async validate(organizationId: string, userId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    const result = await validateCampaignLaunch(doc, userId);
    doc.lastValidation = {
      ok: result.ok,
      checkedAt: new Date(),
      issues: result.issues,
    };
    await doc.save();
    return result;
  },

  async launch(organizationId: string, userId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    if (!['draft', 'scheduled', 'paused'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot launch from status ${doc.status}.`);
    }

    // Ensure enrollments exist from candidateSource
    if ((await OutreachEnrollmentModel.countDocuments({ campaignId: doc._id })) === 0) {
      const ids = doc.candidateSource.candidateIds || [];
      if (ids.length) {
        await this.addAudience(organizationId, userId, id, { candidateIds: ids });
      }
    }

    const validation = await validateCampaignLaunch(doc, userId);
    doc.lastValidation = {
      ok: validation.ok,
      checkedAt: new Date(),
      issues: validation.issues,
    };
    if (!validation.ok) {
      await doc.save();
      throw new AppError(400, 'LAUNCH_VALIDATION_FAILED', 'Campaign failed launch validation.', {
        meta: { issues: validation.issues },
      });
    }

    const enrollments = await OutreachEnrollmentModel.find({
      campaignId: doc._id,
      status: { $in: ['pending', 'waiting'] },
      'contactAvailability.optedOut': false,
    });

    const now = new Date();
    for (const enrollment of enrollments) {
      enrollment.status = 'active';
      enrollment.nextActionAt = now;
      enrollment.lastActionAt = now;
      await enrollment.save();
    }

    doc.status = 'running';
    doc.launchedAt = now;
    doc.pausedAt = null;
    doc.scheduledAt = doc.scheduledAt || now;
    doc.version += 1;
    await doc.save();

    await enqueueFirstJobs(
      doc,
      enrollments.map((e) => String(e._id))
    );
    await refreshCampaignStats(id);

    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'campaign.launched',
      title: 'Campaign launched',
      detail: `${enrollments.length} enrollment(s) activated`,
    });

    return toSafeCampaign(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async schedule(organizationId: string, userId: string, id: string, scheduledAt: Date) {
    const doc = await loadCampaign(organizationId, id);
    if (!['draft', 'scheduled', 'paused'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot schedule from status ${doc.status}.`);
    }
    if (scheduledAt.getTime() <= Date.now() - 60_000) {
      throw new AppError(400, 'INVALID_SCHEDULE', 'scheduledAt must be in the future.');
    }
    const validation = await validateCampaignLaunch(doc, userId);
    doc.lastValidation = {
      ok: validation.ok,
      checkedAt: new Date(),
      issues: validation.issues,
    };
    if (!validation.ok) {
      await doc.save();
      throw new AppError(400, 'LAUNCH_VALIDATION_FAILED', 'Campaign failed schedule validation.', {
        meta: { issues: validation.issues },
      });
    }
    doc.status = 'scheduled';
    doc.scheduledAt = scheduledAt;
    await doc.save();
    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'campaign.scheduled',
      title: 'Campaign scheduled',
      detail: scheduledAt.toISOString(),
    });
    return toSafeCampaign(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async pause(organizationId: string, userId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    if (doc.status !== 'running' && doc.status !== 'scheduled') {
      throw new AppError(400, 'INVALID_STATUS', `Cannot pause from status ${doc.status}.`);
    }
    doc.status = 'paused';
    doc.pausedAt = new Date();
    await doc.save();
    await CampaignJobModel.updateMany(
      { campaignId: doc._id, status: 'queued' },
      { $set: { status: 'cancelled' } }
    );
    await OutreachEnrollmentModel.updateMany(
      { campaignId: doc._id, status: { $in: ['active', 'waiting'] } },
      { $set: { status: 'waiting' } }
    );
    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'campaign.paused',
      title: 'Campaign paused',
    });
    return toSafeCampaign(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async resume(organizationId: string, userId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    if (doc.status !== 'paused') {
      throw new AppError(400, 'INVALID_STATUS', 'Only paused campaigns can be resumed.');
    }
    return this.launch(organizationId, userId, id);
  },

  async cancel(organizationId: string, userId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    if (['completed', 'cancelled'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Campaign already ${doc.status}.`);
    }
    doc.status = 'cancelled';
    doc.cancelledAt = new Date();
    doc.completedAt = new Date();
    await doc.save();
    await CampaignJobModel.updateMany(
      { campaignId: doc._id, status: { $in: ['queued', 'leased', 'running'] } },
      { $set: { status: 'cancelled' } }
    );
    await OutreachEnrollmentModel.updateMany(
      {
        campaignId: doc._id,
        status: { $in: ['pending', 'active', 'waiting'] },
      },
      { $set: { status: 'stopped', stopReason: 'campaign_cancelled' } }
    );
    await refreshCampaignStats(id);
    await recordCampaignActivity({
      organizationId,
      campaignId: id,
      actorUserId: userId,
      type: 'campaign.cancelled',
      title: 'Campaign cancelled',
    });
    return toSafeCampaign(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      relatedJobTitle: await jobTitle(doc.jobId),
    });
  },

  async duplicate(organizationId: string, userId: string, id: string) {
    const source = await loadCampaign(organizationId, id);
    const copy = await OutreachCampaignModel.create({
      organizationId,
      ownerUserId: userId,
      jobId: source.jobId,
      name: `${source.name} (copy)`.slice(0, 200),
      description: source.description,
      sourceModule: source.sourceModule,
      campaignType: source.campaignType,
      status: 'draft',
      candidateSource: {
        ...source.candidateSource,
        candidateIds: [...(source.candidateSource.candidateIds || [])],
      },
      channelConfig: source.channelConfig,
      sequenceSteps: source.sequenceSteps,
      qualificationConfig: source.qualificationConfig,
      schedulingConfig: source.schedulingConfig,
      stats: defaultStats(),
      version: 1,
    });

    // Copy audience as pending enrollments
    const enrollments = await OutreachEnrollmentModel.find({ campaignId: source._id }).lean();
    if (enrollments.length) {
      await OutreachEnrollmentModel.insertMany(
        enrollments.map((e) => ({
          organizationId,
          campaignId: copy._id,
          candidateId: e.candidateId,
          currentStepIndex: 0,
          status: e.contactAvailability?.optedOut ? 'opted_out' : 'pending',
          contactAvailability: e.contactAvailability,
          stopReason: e.contactAvailability?.optedOut ? 'candidate_opted_out' : null,
        })),
        { ordered: false }
      );
      await refreshCampaignStats(String(copy._id));
    }

    await recordCampaignActivity({
      organizationId,
      campaignId: String(copy._id),
      actorUserId: userId,
      type: 'campaign.duplicated',
      title: 'Campaign duplicated',
      detail: `From ${id}`,
    });

    return toSafeCampaign(copy, {
      ownerName: await ownerName(userId),
      relatedJobTitle: await jobTitle(copy.jobId),
    });
  },

  async listEnrollments(organizationId: string, id: string, query: ListEnrollmentsQuery) {
    await loadCampaign(organizationId, id);
    const filter: Record<string, unknown> = { organizationId, campaignId: id };
    if (query.status) filter.status = query.status;
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      OutreachEnrollmentModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(query.limit).lean(),
      OutreachEnrollmentModel.countDocuments(filter),
    ]);
    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name email phone currentCompany currentTitle')
      .lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));

    return {
      items: rows.map((row) => {
        const c = byId.get(String(row.candidateId));
        return {
          id: String(row._id),
          candidateId: String(row.candidateId),
          name: c?.name || 'Unknown',
          company: c?.currentCompany || null,
          title: c?.currentTitle || null,
          email: c?.email || null,
          phone: c?.phone || null,
          status: row.status,
          currentStepIndex: row.currentStepIndex,
          contactAvailability: row.contactAvailability,
          replyState: row.replyState,
          qualificationState: row.qualificationState,
          screeningState: row.screeningState,
          schedulingState: row.schedulingState,
          nextActionAt: row.nextActionAt?.toISOString() ?? null,
          lastActionAt: row.lastActionAt?.toISOString() ?? null,
          stopReason: row.stopReason,
        };
      }),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async stats(organizationId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    const stats = await refreshCampaignStats(id);
    return {
      ...stats,
      status: doc.status,
      version: doc.version,
    };
  },

  /** Org-wide outreach KPIs for the campaigns list header strip. */
  async overview(organizationId: string) {
    const orgOid = new mongoose.Types.ObjectId(organizationId);
    const campaignMatch = {
      organizationId: orgOid,
      deletedAt: null,
      sourceModule: 'outreach',
    };

    const [statusRows, campaignIds, campaignAgg] = await Promise.all([
      OutreachCampaignModel.aggregate<{ _id: string; count: number }>([
        { $match: campaignMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      OutreachCampaignModel.find(campaignMatch).distinct('_id'),
      OutreachCampaignModel.aggregate<{
        sent: number;
        delivered: number;
        replies: number;
        interested: number;
        qualified: number;
        enrolled: number;
      }>([
        { $match: campaignMatch },
        {
          $group: {
            _id: null,
            sent: { $sum: { $ifNull: ['$stats.sent', 0] } },
            delivered: { $sum: { $ifNull: ['$stats.delivered', 0] } },
            replies: { $sum: { $ifNull: ['$stats.replies', 0] } },
            interested: { $sum: { $ifNull: ['$stats.interested', 0] } },
            qualified: { $sum: { $ifNull: ['$stats.qualified', 0] } },
            enrolled: { $sum: { $ifNull: ['$stats.enrolled', 0] } },
          },
        },
      ]),
    ]);

    const enrollmentCount =
      campaignIds.length === 0
        ? 0
        : await OutreachEnrollmentModel.countDocuments({
            organizationId: orgOid,
            campaignId: { $in: campaignIds },
          });

    const byStatus: Record<string, number> = {};
    for (const row of statusRows) byStatus[row._id] = row.count;

    const activeCampaigns = (byStatus.running || 0) + (byStatus.scheduled || 0);
    const totals = campaignAgg[0] ?? {
      sent: 0,
      delivered: 0,
      replies: 0,
      interested: 0,
      qualified: 0,
      enrolled: 0,
    };

    const contacted = Math.max(totals.delivered, totals.sent, 0);
    const replyRate = contacted > 0 ? (totals.replies / contacted) * 100 : 0;
    const positiveReplyRate =
      totals.replies > 0 ? (totals.interested / totals.replies) * 100 : 0;
    const enrolled = Math.max(enrollmentCount, totals.enrolled);

    return {
      activeCampaigns,
      totalCampaigns: Object.values(byStatus).reduce((a, b) => a + b, 0),
      candidatesEnrolled: enrolled,
      messagesSent: totals.sent,
      messagesDelivered: totals.delivered,
      replies: totals.replies,
      interested: totals.interested,
      qualified: totals.qualified,
      replyRate: Math.round(replyRate * 10) / 10,
      positiveReplyRate: Math.round(positiveReplyRate * 10) / 10,
      byStatus,
    };
  },

  async activity(organizationId: string, id: string) {
    await loadCampaign(organizationId, id);
    const rows = await CampaignActivityModel.find({ organizationId, campaignId: id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return rows.map((row) => ({
      id: String(row._id),
      type: row.type,
      title: row.title,
      detail: row.detail,
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
    }));
  },

  /** Stop enrollment messaging for any terminal stop reason. */
  async stopEnrollment(
    enrollmentId: string,
    reason: StopReason,
    error?: { code: string; message: string }
  ) {
    const enrollment = await OutreachEnrollmentModel.findById(enrollmentId);
    if (!enrollment) return null;
    if (['completed', 'stopped', 'opted_out', 'failed'].includes(enrollment.status)) {
      return enrollment;
    }
    enrollment.status = reason === 'candidate_opted_out' ? 'opted_out' : reason === 'fatal_provider_error' ? 'failed' : 'stopped';
    enrollment.stopReason = reason;
    enrollment.nextActionAt = null;
    if (error) {
      enrollment.errorState = { code: error.code, message: error.message, at: new Date() };
    }
    await enrollment.save();
    await CampaignJobModel.updateMany(
      { enrollmentId: enrollment._id, status: { $in: ['queued', 'leased'] } },
      { $set: { status: 'cancelled' } }
    );
    await refreshCampaignStats(String(enrollment.campaignId));
    return enrollment;
  },
};
