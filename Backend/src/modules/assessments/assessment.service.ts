import mongoose from 'mongoose';
import type { z } from 'zod';

import { getAssessmentProvider } from '../../providers/assessments/registry.js';
import type { AssessmentInviteChannel } from '../../providers/assessments/types.js';
import { emitRealtime } from '../../realtime/events.js';
import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import { UserModel } from '../auth/user.model.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { JobModel } from '../jobs/job.model.js';
import {
  AssessmentCampaignModel,
  defaultCampaignStats,
  type AssessmentCampaignDocument,
} from './assessment-campaign.model.js';
import {
  AssessmentCandidateModel,
  type AssessmentCandidateDocument,
} from './assessment-candidate.model.js';
import {
  AssessmentTemplateModel,
  type AssessmentTemplateDocument,
} from './assessment-template.model.js';
import type {
  createCampaignSchema,
  createTemplateSchema,
  listCampaignsQuerySchema,
  listResultsQuerySchema,
  listTemplatesQuerySchema,
  updateTemplateSchema,
} from './assessment.validation.js';

type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;
type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
type ListResultsQuery = z.infer<typeof listResultsQuerySchema>;

const TEMPLATE_STATUS_DISPLAY: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
};

const CAMPAIGN_STATUS_DISPLAY: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  running: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

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

async function loadTemplate(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid template id.');
  }
  const doc = await AssessmentTemplateModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Assessment template not found.');
  return doc;
}

async function loadCampaign(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid campaign id.');
  }
  const doc = await AssessmentCampaignModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'CAMPAIGN_NOT_FOUND', 'Assessment campaign not found.');
  return doc;
}

function toTemplateDisplay(
  doc: AssessmentTemplateDocument,
  extras: { ownerName: string; jobTitle: string | null }
) {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    name: doc.name,
    title: doc.title,
    description: doc.description,
    jobId: doc.jobId ? String(doc.jobId) : null,
    jobTitle: extras.jobTitle,
    ownerUserId: String(doc.ownerUserId),
    owner: extras.ownerName,
    durationMinutes: doc.durationMinutes,
    sections: doc.sections,
    skills: doc.skills,
    passingScore: doc.passingScore,
    instructions: doc.instructions,
    status: TEMPLATE_STATUS_DISPLAY[doc.status] || doc.status,
    statusRaw: doc.status,
    providerAssessmentId: doc.providerAssessmentId,
    version: doc.version,
    lastActivity: doc.updatedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toCampaignDisplay(
  doc: AssessmentCampaignDocument,
  extras: { ownerName: string; jobTitle: string | null; templateName: string }
) {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    name: doc.name,
    templateId: String(doc.templateId),
    templateName: extras.templateName,
    jobId: doc.jobId ? String(doc.jobId) : null,
    jobTitle: extras.jobTitle,
    ownerUserId: String(doc.ownerUserId),
    owner: extras.ownerName,
    workflowId: doc.workflowId ? String(doc.workflowId) : null,
    sourceModule: doc.sourceModule,
    candidateIds: doc.candidateIds,
    candidates: doc.stats.enrolled,
    invited: doc.stats.invited,
    completed: doc.stats.completed,
    status: CAMPAIGN_STATUS_DISPLAY[doc.status] || doc.status,
    statusRaw: doc.status,
    invitationConfig: doc.invitationConfig,
    reminderConfig: doc.reminderConfig,
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    providerAssessmentId: doc.providerAssessmentId,
    stats: doc.stats,
    launchedAt: doc.launchedAt?.toISOString() ?? null,
    completedAt: doc.completedAt?.toISOString() ?? null,
    lastActivity: doc.updatedAt.toISOString(),
    version: doc.version,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toResultDisplay(
  row: AssessmentCandidateDocument,
  extras: {
    name: string;
    campaignName: string;
    templateName: string;
    jobId: string | null;
    jobTitle: string | null;
  }
) {
  return {
    id: String(row._id),
    campaignId: String(row.campaignId),
    campaignName: extras.campaignName,
    templateName: extras.templateName,
    candidateId: String(row.candidateId),
    name: extras.name,
    jobId: extras.jobId,
    jobTitle: extras.jobTitle,
    invitationStatus: row.invitationStatus,
    inviteChannel: row.inviteChannel,
    inviteUrl: row.inviteUrl,
    invitedAt: row.invitedAt?.toISOString() ?? null,
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    score: row.score,
    sectionScores: row.sectionScores,
    result: row.result,
    providerAssessmentId: row.providerAssessmentId,
    providerAttemptId: row.providerAttemptId,
    decision: row.recruiterDecision,
    recruiterDecision: row.recruiterDecision,
    reminderCount: row.reminderCount,
    error: row.error,
    lastActivity: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function recordCandidateActivity(input: {
  organizationId: string;
  candidateId: string;
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await CandidateActivityModel.create({
      organizationId: input.organizationId,
      candidateId: input.candidateId,
      userId: input.userId,
      action: input.action,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Activity is best-effort.
  }
}

export async function refreshCampaignStats(campaignId: string) {
  const rows = await AssessmentCandidateModel.find({ campaignId }).lean();
  const stats = defaultCampaignStats();
  stats.enrolled = rows.length;
  let scoreSum = 0;
  let scoreCount = 0;
  for (const row of rows) {
    if (row.invitationStatus === 'invited') stats.invited += 1;
    if (row.invitationStatus === 'started') stats.started += 1;
    if (row.invitationStatus === 'completed') stats.completed += 1;
    if (row.invitationStatus === 'expired') stats.expired += 1;
    if (row.invitationStatus === 'cancelled') stats.cancelled += 1;
    if (row.result === 'pass') stats.passed += 1;
    if (row.result === 'fail') stats.failed += 1;
    if (typeof row.score === 'number') {
      scoreSum += row.score;
      scoreCount += 1;
    }
  }
  // Count invited as anyone who left pending
  stats.invited = rows.filter((r) =>
    ['invited', 'started', 'completed', 'expired'].includes(r.invitationStatus)
  ).length;
  stats.averageScore = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null;
  await AssessmentCampaignModel.findByIdAndUpdate(campaignId, { stats });
  return stats;
}

function nextReminderAt(
  invitedAt: Date,
  reminderCount: number,
  intervalsHours: number[]
): Date | null {
  if (reminderCount >= intervalsHours.length || intervalsHours.length === 0) return null;
  const hours = intervalsHours[reminderCount] ?? intervalsHours[intervalsHours.length - 1]!;
  return new Date(invitedAt.getTime() + hours * 60 * 60 * 1000);
}

export const assessmentsService = {
  async listTemplates(organizationId: string, query: ListTemplatesQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.q) {
      filter.$or = [
        { name: { $regex: query.q, $options: 'i' } },
        { title: { $regex: query.q, $options: 'i' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      AssessmentTemplateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      AssessmentTemplateModel.countDocuments(filter),
    ]);
    const items = await Promise.all(
      rows.map(async (doc) =>
        toTemplateDisplay(doc, {
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

  async createTemplate(organizationId: string, userId: string, input: CreateTemplateInput) {
    await quotaService.assertFeatureAccess(organizationId, 'assessments');
    const title = input.title?.trim() || input.name.trim();
    const doc = await AssessmentTemplateModel.create({
      organizationId,
      ownerUserId: userId,
      name: input.name.trim(),
      jobId: input.jobId || null,
      title,
      description: input.description ?? null,
      durationMinutes: input.durationMinutes ?? 45,
      sections: input.sections ?? [],
      skills: input.skills ?? [],
      passingScore: input.passingScore ?? 70,
      instructions: input.instructions ?? null,
      status: input.status ?? 'draft',
    });
    return toTemplateDisplay(doc, {
      ownerName: await ownerName(userId),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async getTemplate(organizationId: string, id: string) {
    const doc = await loadTemplate(organizationId, id);
    return toTemplateDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async updateTemplate(organizationId: string, id: string, input: UpdateTemplateInput) {
    const doc = await loadTemplate(organizationId, id);
    if (input.name !== undefined) doc.name = input.name.trim();
    if (input.title !== undefined) doc.title = input.title.trim();
    if (input.description !== undefined) doc.description = input.description;
    if (input.jobId !== undefined) doc.jobId = input.jobId as unknown as mongoose.Types.ObjectId;
    if (input.durationMinutes !== undefined) doc.durationMinutes = input.durationMinutes;
    if (input.sections !== undefined) doc.sections = input.sections;
    if (input.skills !== undefined) doc.skills = input.skills;
    if (input.passingScore !== undefined) doc.passingScore = input.passingScore;
    if (input.instructions !== undefined) doc.instructions = input.instructions;
    if (input.status !== undefined) doc.status = input.status;
    doc.version += 1;
    await doc.save();
    return toTemplateDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async deleteTemplate(organizationId: string, id: string) {
    const doc = await loadTemplate(organizationId, id);
    const activeCampaigns = await AssessmentCampaignModel.countDocuments({
      organizationId,
      templateId: id,
      status: { $in: ['draft', 'scheduled', 'running'] },
      deletedAt: null,
    });
    if (activeCampaigns > 0) {
      throw new AppError(
        400,
        'TEMPLATE_IN_USE',
        'Cannot delete a template with active campaigns.'
      );
    }
    doc.deletedAt = new Date();
    doc.status = 'archived';
    await doc.save();
    return { id, deleted: true };
  },

  async listCampaigns(organizationId: string, query: ListCampaignsQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.templateId) filter.templateId = query.templateId;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      AssessmentCampaignModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      AssessmentCampaignModel.countDocuments(filter),
    ]);

    const templates = await AssessmentTemplateModel.find({
      _id: { $in: rows.map((r) => r.templateId) },
    })
      .select('name')
      .lean();
    const templateNames = new Map(templates.map((t) => [String(t._id), t.name]));

    const items = await Promise.all(
      rows.map(async (doc) =>
        toCampaignDisplay(doc, {
          ownerName: await ownerName(String(doc.ownerUserId)),
          jobTitle: await jobTitle(doc.jobId),
          templateName: templateNames.get(String(doc.templateId)) || 'Template',
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

  async createCampaign(organizationId: string, userId: string, input: CreateCampaignInput) {
    await quotaService.assertFeatureAccess(organizationId, 'assessments');
    const template = await loadTemplate(organizationId, input.templateId);
    const name = input.name?.trim() || `${template.name} campaign`;
    const expiryHours = input.expiryHours ?? 168;
    const expiresAt = input.expiresAt
      ? new Date(input.expiresAt)
      : new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const doc = await AssessmentCampaignModel.create({
      organizationId,
      templateId: template._id,
      jobId: input.jobId || template.jobId || null,
      ownerUserId: userId,
      workflowId: input.workflowId || null,
      sourceModule: input.sourceModule || 'assessments',
      name,
      candidateIds: input.candidateIds ?? [],
      invitationConfig: {
        channel: input.invitationConfig?.channel ?? 'email',
        subject: input.invitationConfig?.subject ?? `Assessment invitation: ${template.title}`,
        message:
          input.invitationConfig?.message ??
          `You have been invited to complete the assessment "${template.title}".`,
        sendImmediately: input.invitationConfig?.sendImmediately ?? true,
      },
      reminderConfig: {
        enabled: input.reminderConfig?.enabled ?? true,
        intervalsHours: input.reminderConfig?.intervalsHours ?? [24, 72],
        maxReminders: input.reminderConfig?.maxReminders ?? 2,
        channel: input.reminderConfig?.channel ?? null,
      },
      expiresAt,
      stats: defaultCampaignStats(),
    });

    if (doc.candidateIds.length) {
      await this.syncCandidates(organizationId, String(doc._id), doc.candidateIds);
    }

    return toCampaignDisplay(doc, {
      ownerName: await ownerName(userId),
      jobTitle: await jobTitle(doc.jobId),
      templateName: template.name,
    });
  },

  async getCampaign(organizationId: string, id: string) {
    const doc = await loadCampaign(organizationId, id);
    const template = await AssessmentTemplateModel.findById(doc.templateId).select('name').lean();
    return toCampaignDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
      templateName: template?.name || 'Template',
    });
  },

  async syncCandidates(organizationId: string, campaignId: string, candidateIds: string[]) {
    const campaign = await loadCampaign(organizationId, campaignId);
    const unique = [...new Set(candidateIds.filter((id) => mongoose.Types.ObjectId.isValid(id)))];
    for (const candidateId of unique) {
      await AssessmentCandidateModel.findOneAndUpdate(
        { organizationId, campaignId, candidateId },
        {
          $setOnInsert: {
            organizationId,
            campaignId,
            candidateId,
            workflowId: campaign.workflowId,
            invitationStatus: 'pending',
            expiresAt: campaign.expiresAt,
            result: 'pending',
            recruiterDecision: 'pending',
            sectionScores: {},
          },
        },
        { upsert: true, new: true }
      );
    }
    campaign.candidateIds = unique;
    await campaign.save();
    await refreshCampaignStats(campaignId);
    return { synced: unique.length };
  },

  async launch(organizationId: string, userId: string, id: string) {
    const campaign = await loadCampaign(organizationId, id);
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot launch from status ${campaign.status}.`);
    }

    await quotaService.assertFeatureAccess(organizationId, 'assessments');

    if (campaign.candidateIds.length) {
      await this.syncCandidates(organizationId, id, campaign.candidateIds);
    }

    const pending = await AssessmentCandidateModel.find({
      campaignId: id,
      invitationStatus: { $in: ['pending', 'failed'] },
    });
    if (!pending.length) {
      throw new AppError(400, 'AUDIENCE_EMPTY', 'Add candidates before launching.');
    }

    const template = await loadTemplate(organizationId, String(campaign.templateId));
    const provider = getAssessmentProvider();

    if (!campaign.providerAssessmentId) {
      const created = await provider.createAssessment({
        organizationId,
        templateId: String(template._id),
        name: template.name,
        title: template.title,
        description: template.description,
        durationMinutes: template.durationMinutes,
        sections: template.sections.map((s) => ({
          id: s.id,
          title: s.title,
          questionCount: s.questionCount,
        })),
        skills: template.skills,
        passingScore: template.passingScore,
        instructions: template.instructions,
      });
      campaign.providerAssessmentId = created.providerAssessmentId;
      if (!template.providerAssessmentId) {
        template.providerAssessmentId = created.providerAssessmentId;
        if (template.status === 'draft') template.status = 'active';
        await template.save();
      }
    }

    const candidates = await SavedCandidateModel.find({
      _id: { $in: pending.map((p) => p.candidateId) },
      organizationId,
    }).lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));
    const channel = campaign.invitationConfig.channel as AssessmentInviteChannel;

    for (const row of pending) {
      const candidate = byId.get(String(row.candidateId));
      if (!candidate) {
        row.invitationStatus = 'failed';
        row.error = 'Candidate not found in pool.';
        await row.save();
        continue;
      }

      const hasEmail = Boolean(candidate.email);
      const hasPhone = Boolean(candidate.phone);
      if (channel === 'email' && !hasEmail) {
        row.invitationStatus = 'failed';
        row.error = 'Candidate has no email for assessment invite.';
        await row.save();
        continue;
      }
      if (channel === 'whatsapp' && !hasPhone) {
        row.invitationStatus = 'failed';
        row.error = 'Candidate has no phone for WhatsApp invite.';
        await row.save();
        continue;
      }

      const quotaKey = `assessment:${id}:candidate:${String(row.candidateId)}`;
      try {
        await quotaService.reserveUsage({
          organizationId,
          userId,
          metric: 'assessment_invites',
          quantity: 1,
          idempotencyKey: quotaKey,
          relatedEntityType: 'assessment_candidate',
          relatedEntityId: String(row._id),
        });
        row.quotaReservationKey = quotaKey;
      } catch (err) {
        row.invitationStatus = 'failed';
        row.error = err instanceof Error ? err.message : 'Assessment invite quota exceeded.';
        await row.save();
        continue;
      }

      try {
        const invite = await provider.inviteCandidate({
          organizationId,
          providerAssessmentId: campaign.providerAssessmentId!,
          campaignId: id,
          candidateId: String(row.candidateId),
          candidateName: candidate.name || 'Candidate',
          email: candidate.email,
          phone: candidate.phone,
          channel,
          expiresAt: campaign.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          message: campaign.invitationConfig.message,
        });

        row.providerAssessmentId = campaign.providerAssessmentId;
        row.providerAttemptId = invite.providerAttemptId;
        row.inviteUrl = invite.inviteUrl || null;
        row.inviteChannel = channel;
        row.invitedAt = invite.invitedAt;
        row.invitationStatus = 'invited';
        row.expiresAt = campaign.expiresAt;
        row.error = null;

        if (campaign.reminderConfig.enabled) {
          row.nextReminderAt = nextReminderAt(
            invite.invitedAt,
            0,
            campaign.reminderConfig.intervalsHours
          );
        }

        await quotaService.commitUsage({
          organizationId,
          metric: 'assessment_invites',
          idempotencyKey: quotaKey,
        });
        row.quotaCommitted = true;
        await row.save();

        await recordCandidateActivity({
          organizationId,
          candidateId: String(row.candidateId),
          userId,
          action: 'assessment_invited',
          metadata: {
            campaignId: id,
            channel,
            providerAttemptId: invite.providerAttemptId,
          },
        });

        emitRealtime('assessment.invite.sent', {
          organizationId,
          campaignId: id,
          resultId: String(row._id),
          candidateId: String(row.candidateId),
          channel,
        });
      } catch (err) {
        if (row.quotaReservationKey && !row.quotaCommitted) {
          try {
            await quotaService.releaseUsage({
              organizationId,
              metric: 'assessment_invites',
              idempotencyKey: row.quotaReservationKey,
            });
          } catch {
            // best-effort
          }
        }
        row.invitationStatus = 'failed';
        row.error = err instanceof Error ? err.message : 'Invite failed.';
        await row.save();
      }
    }

    campaign.status = 'running';
    campaign.launchedAt = campaign.launchedAt || new Date();
    campaign.version += 1;
    await campaign.save();
    const stats = await refreshCampaignStats(id);
    campaign.stats = stats;

    return toCampaignDisplay(campaign, {
      ownerName: await ownerName(String(campaign.ownerUserId)),
      jobTitle: await jobTitle(campaign.jobId),
      templateName: template.name,
    });
  },

  async remind(organizationId: string, userId: string, id: string) {
    const campaign = await loadCampaign(organizationId, id);
    if (campaign.status !== 'running') {
      throw new AppError(400, 'INVALID_STATUS', 'Only running campaigns can send reminders.');
    }

    const due = await AssessmentCandidateModel.find({
      campaignId: id,
      invitationStatus: { $in: ['invited', 'started'] },
      $or: [{ nextReminderAt: { $lte: new Date() } }, { nextReminderAt: null }],
    });

    let sent = 0;
    for (const row of due) {
      if (row.reminderCount >= campaign.reminderConfig.maxReminders) continue;
      const ok = await this.sendReminder(organizationId, userId, campaign, row);
      if (ok) sent += 1;
    }

    return {
      campaignId: id,
      reminded: sent,
      campaign: await this.getCampaign(organizationId, id),
    };
  },

  async sendReminder(
    organizationId: string,
    userId: string,
    campaign: AssessmentCampaignDocument,
    row: AssessmentCandidateDocument
  ) {
    const channel =
      (campaign.reminderConfig.channel as AssessmentInviteChannel | null) ||
      campaign.invitationConfig.channel;
    const candidate = await SavedCandidateModel.findById(row.candidateId).lean();
    if (!candidate) return false;

    // Reminder reuses invite channel; provider send is mirrored as activity for now.
    row.reminderCount += 1;
    row.lastReminderAt = new Date();
    row.nextReminderAt = campaign.reminderConfig.enabled
      ? nextReminderAt(
          row.invitedAt || new Date(),
          row.reminderCount,
          campaign.reminderConfig.intervalsHours
        )
      : null;
    await row.save();

    await recordCandidateActivity({
      organizationId,
      candidateId: String(row.candidateId),
      userId,
      action: 'assessment_reminder',
      metadata: {
        campaignId: String(campaign._id),
        channel,
        reminderCount: row.reminderCount,
        inviteUrl: row.inviteUrl,
      },
    });

    emitRealtime('assessment.reminder.sent', {
      organizationId,
      campaignId: String(campaign._id),
      resultId: String(row._id),
      candidateId: String(row.candidateId),
      reminderCount: row.reminderCount,
    });
    return true;
  },

  async cancel(organizationId: string, userId: string, id: string) {
    const campaign = await loadCampaign(organizationId, id);
    if (['completed', 'cancelled'].includes(campaign.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot cancel from status ${campaign.status}.`);
    }

    const provider = getAssessmentProvider();
    const pending = await AssessmentCandidateModel.find({
      campaignId: id,
      invitationStatus: { $in: ['pending', 'invited', 'started'] },
    });

    for (const row of pending) {
      if (row.providerAttemptId && row.providerAssessmentId) {
        try {
          await provider.cancelAttempt({
            organizationId,
            providerAssessmentId: row.providerAssessmentId,
            providerAttemptId: row.providerAttemptId,
          });
        } catch {
          // best-effort cancel at provider
        }
      }
      if (row.quotaReservationKey && !row.quotaCommitted) {
        try {
          await quotaService.releaseUsage({
            organizationId,
            metric: 'assessment_invites',
            idempotencyKey: row.quotaReservationKey,
          });
        } catch {
          // best-effort
        }
      }
      row.invitationStatus = 'cancelled';
      row.nextReminderAt = null;
      await row.save();

      await recordCandidateActivity({
        organizationId,
        candidateId: String(row.candidateId),
        userId,
        action: 'assessment_cancelled',
        metadata: { campaignId: id },
      });
    }

    campaign.status = 'cancelled';
    campaign.cancelledAt = new Date();
    campaign.completedAt = new Date();
    await campaign.save();
    await refreshCampaignStats(id);

    return toCampaignDisplay(campaign, {
      ownerName: await ownerName(String(campaign.ownerUserId)),
      jobTitle: await jobTitle(campaign.jobId),
      templateName:
        (await AssessmentTemplateModel.findById(campaign.templateId).select('name').lean())
          ?.name || 'Template',
    });
  },

  async listResults(organizationId: string, query: ListResultsQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.campaignId) filter.campaignId = query.campaignId;
    if (query.candidateId) filter.candidateId = query.candidateId;
    if (query.decision) filter.recruiterDecision = query.decision;
    if (query.invitationStatus) filter.invitationStatus = query.invitationStatus;

    if (query.jobId || query.templateId) {
      const campaignFilter: Record<string, unknown> = {
        organizationId,
        deletedAt: null,
      };
      if (query.jobId) campaignFilter.jobId = query.jobId;
      if (query.templateId) campaignFilter.templateId = query.templateId;
      const campaigns = await AssessmentCampaignModel.find(campaignFilter).select('_id').lean();
      filter.campaignId = { $in: campaigns.map((c) => c._id) };
    }

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      AssessmentCandidateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      AssessmentCandidateModel.countDocuments(filter),
    ]);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name')
      .lean();
    const campaigns = await AssessmentCampaignModel.find({
      _id: { $in: rows.map((r) => r.campaignId) },
    })
      .select('name jobId templateId')
      .lean();
    const templates = await AssessmentTemplateModel.find({
      _id: { $in: campaigns.map((c) => c.templateId) },
    })
      .select('name')
      .lean();

    const names = new Map(candidates.map((c) => [String(c._id), c.name]));
    const campaignMap = new Map(campaigns.map((c) => [String(c._id), c]));
    const templateMap = new Map(templates.map((t) => [String(t._id), t.name]));

    let items = await Promise.all(
      rows.map(async (row) => {
        const campaign = campaignMap.get(String(row.campaignId));
        return toResultDisplay(row, {
          name: names.get(String(row.candidateId)) || 'Unknown',
          campaignName: campaign?.name || '',
          templateName: campaign ? templateMap.get(String(campaign.templateId)) || '' : '',
          jobId: campaign?.jobId ? String(campaign.jobId) : null,
          jobTitle: await jobTitle(campaign?.jobId ?? null),
        });
      })
    );

    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.campaignName.toLowerCase().includes(q) ||
          item.templateName.toLowerCase().includes(q)
      );
    }

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

  async getResult(organizationId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid result id.');
    }
    const row = await AssessmentCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Assessment result not found.');

    const [candidate, campaign] = await Promise.all([
      SavedCandidateModel.findById(row.candidateId).select('name').lean(),
      AssessmentCampaignModel.findById(row.campaignId).select('name jobId templateId').lean(),
    ]);
    const template = campaign
      ? await AssessmentTemplateModel.findById(campaign.templateId).select('name').lean()
      : null;

    return toResultDisplay(row, {
      name: candidate?.name || 'Unknown',
      campaignName: campaign?.name || '',
      templateName: template?.name || '',
      jobId: campaign?.jobId ? String(campaign.jobId) : null,
      jobTitle: await jobTitle(campaign?.jobId ?? null),
    });
  },

  async syncResultFromProvider(organizationId: string, resultId: string) {
    const row = await AssessmentCandidateModel.findOne({ _id: resultId, organizationId });
    if (!row?.providerAttemptId) {
      throw new AppError(400, 'NO_PROVIDER_ATTEMPT', 'Result has no provider attempt id.');
    }
    const provider = getAssessmentProvider();
    const attempt = await provider.getAttempt(row.providerAttemptId);
    if (!attempt) return null;

    await applyAttemptUpdate(row, attempt);
    await refreshCampaignStats(String(row.campaignId));
    return this.getResult(organizationId, resultId);
  },

  /** Convenience list shape for FE AssessmentSummary. */
  async listSummaries(organizationId: string) {
    const data = await this.listCampaigns(organizationId, {
      page: 1,
      limit: 50,
    });
    return data.items.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      candidates: item.candidates,
      invited: item.invited,
      completed: item.completed,
    }));
  },
};

export async function applyAttemptUpdate(
  row: AssessmentCandidateDocument,
  attempt: {
    status: string;
    startedAt?: Date | null;
    completedAt?: Date | null;
    score?: number | null;
    sectionScores?: Record<string, number>;
    result?: 'pass' | 'fail' | 'pending' | null;
  }
) {
  if (attempt.status === 'started' || attempt.startedAt) {
    row.invitationStatus = row.invitationStatus === 'completed' ? 'completed' : 'started';
    row.startedAt = attempt.startedAt || row.startedAt || new Date();
  }
  if (attempt.status === 'completed') {
    row.invitationStatus = 'completed';
    row.completedAt = attempt.completedAt || new Date();
    row.nextReminderAt = null;
  }
  if (attempt.status === 'expired') {
    row.invitationStatus = 'expired';
    row.nextReminderAt = null;
  }
  if (attempt.status === 'cancelled') {
    row.invitationStatus = 'cancelled';
    row.nextReminderAt = null;
  }
  if (attempt.status === 'failed') {
    row.invitationStatus = 'failed';
  }
  if (attempt.score != null) row.score = attempt.score;
  if (attempt.sectionScores) row.sectionScores = attempt.sectionScores;
  if (attempt.result) row.result = attempt.result;
  await row.save();

  emitRealtime('assessment.result.updated', {
    organizationId: String(row.organizationId),
    campaignId: String(row.campaignId),
    resultId: String(row._id),
    candidateId: String(row.candidateId),
    invitationStatus: row.invitationStatus,
    score: row.score,
    result: row.result,
  });
}
