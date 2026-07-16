import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import type { z } from 'zod';

import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { UserModel } from '../auth/user.model.js';
import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import {
  createHunarBulkCalls,
  createHunarVoiceAgent,
  updateHunarVoiceAgent,
  type HunarCalleeRow,
} from '../../providers/hunar/hunar.client.js';
import {
  getHunarVoiceLanguage,
  getHunarVoicePersona,
  isHunarConfigured,
} from '../../providers/hunar/hunar.config.js';
import { emitScreeningResultUpdated } from '../../realtime/events.js';
import {
  ScreeningModel,
  defaultScreeningStats,
  type ScreeningDocument,
} from './screening.model.js';
import {
  ScreeningCandidateModel,
  type ScreeningCandidateDocument,
} from './screening-candidate.model.js';
import { mapEvaluationScores, minutesFromDuration } from './scoring.js';
import type {
  createScreeningSchema,
  listCandidatesQuerySchema,
  listResultsQuerySchema,
  listScreeningsQuerySchema,
  updateScreeningSchema,
} from './screening.validation.js';

type CreateInput = z.infer<typeof createScreeningSchema>;
type UpdateInput = z.infer<typeof updateScreeningSchema>;
type ListQuery = z.infer<typeof listScreeningsQuerySchema>;
type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
type ListResultsQuery = z.infer<typeof listResultsQuerySchema>;

const STATUS_DISPLAY: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  running: 'Running',
  paused: 'Paused',
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

async function loadScreening(organizationId: string, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid screening id.');
  }
  const doc = await ScreeningModel.findOne({
    _id: id,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'SCREENING_NOT_FOUND', 'Screening not found.');
  return doc;
}

function toDisplay(doc: ScreeningDocument, extras: { ownerName: string; jobTitle: string | null }) {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    name: doc.name,
    jobId: doc.jobId ? String(doc.jobId) : null,
    jobTitle: extras.jobTitle,
    ownerUserId: String(doc.ownerUserId),
    owner: extras.ownerName,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    workflowId: doc.workflowId ? String(doc.workflowId) : null,
    sourceModule: doc.sourceModule,
    status: STATUS_DISPLAY[doc.status] || doc.status,
    statusRaw: doc.status,
    objective: doc.objective,
    language: doc.language,
    voice: doc.voice,
    tone: doc.tone,
    introductionScript: doc.introductionScript,
    closingScript: doc.closingScript,
    consentText: doc.consentText,
    questions: doc.questions,
    evaluationCriteria: doc.evaluationCriteria,
    callSettings: doc.callSettings,
    candidateIds: doc.candidateIds,
    candidates: doc.stats.enrolled,
    completed: doc.stats.completed,
    averageScore: doc.stats.averageScore,
    shortlisted: doc.stats.shortlisted,
    providerAgentId: doc.providerAgentId,
    stats: doc.stats,
    lastValidation: doc.lastValidation,
    launchedAt: doc.launchedAt?.toISOString() ?? null,
    completedAt: doc.completedAt?.toISOString() ?? null,
    lastActivity: doc.updatedAt.toISOString(),
    version: doc.version,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function toResultDisplay(
  row: ScreeningCandidateDocument,
  extras: { name: string; jobId: string | null; screeningName: string }
) {
  return {
    id: String(row._id),
    screeningId: String(row.screeningId),
    screeningName: extras.screeningName,
    candidateId: String(row.candidateId),
    name: extras.name,
    jobId: extras.jobId,
    callStatus: row.callStatus,
    providerCallId: row.providerCallId,
    attempts: row.attempts,
    durationSeconds: row.durationSeconds,
    transcript: row.transcript,
    recordingReference: row.recordingReference,
    summary: row.summary,
    extractedVariables: row.extractedVariables,
    scoreBreakdown: row.scoreBreakdown,
    overallScore: row.overallScore,
    recommendation: row.recommendation,
    decision: row.recruiterDecision,
    recruiterDecision: row.recruiterDecision,
    notes: row.notes,
    completedAt: row.completedAt?.toISOString() ?? null,
    error: row.error,
    lastActivity: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildAgentPrompt(doc: ScreeningDocument) {
  const questionLines = (doc.questions || [])
    .map((q, index) => `${index + 1}. ${q.prompt}`)
    .join('\n');
  const closing = doc.closingScript ? `\n\nClosing:\n${doc.closingScript}` : '';
  const consent = doc.consentText ? `\n\nConsent:\n${doc.consentText}` : '';
  return `You are conducting a voice screening interview.\n\nQuestions:\n${questionLines || 'Ask about role fit and availability.'}${consent}${closing}`;
}

function buildResultPrompt(doc: ScreeningDocument) {
  const fields = (doc.evaluationCriteria || []).map((c) => `"${c.id}": number 0-100`);
  const known = [
    '"summary": ""',
    '"final_outcome": ""',
    '"interest_level": ""',
    '"candidate_status": ""',
    '"callback_requested": ""',
    '"callback_time": ""',
    '"candidate_questions": []',
    '"objections_or_concerns": []',
  ];
  return `TASK
Analyze the conversation and return only valid JSON.

OUTPUT FORMAT
{
  ${[...known, ...fields].join(',\n  ')}
}`;
}

function buildResultSchema(doc: ScreeningDocument) {
  const schema: Record<string, unknown> = {
    summary: 'short call summary',
    final_outcome: 'interested | not_interested | callback',
    interest_level: 'high | medium | low',
    candidate_status: 'string',
    callback_requested: 'yes | no',
    callback_time: 'string',
    candidate_questions: 'array of strings',
    objections_or_concerns: 'array of strings',
  };
  for (const criterion of doc.evaluationCriteria || []) {
    schema[criterion.id] = criterion.description || `score 0-100 for ${criterion.label}`;
  }
  return schema;
}

export async function refreshScreeningStats(screeningId: string) {
  const rows = await ScreeningCandidateModel.find({ screeningId }).lean();
  const stats = defaultScreeningStats();
  stats.enrolled = rows.length;
  let scoreSum = 0;
  let scoreCount = 0;
  for (const row of rows) {
    if (row.callStatus === 'queued' || row.callStatus === 'ringing') stats.queued += 1;
    if (row.callStatus === 'in_progress') stats.inProgress += 1;
    if (row.callStatus === 'completed') stats.completed += 1;
    if (row.callStatus === 'no_answer' || row.callStatus === 'voicemail') stats.noAnswer += 1;
    if (row.callStatus === 'failed' || row.callStatus === 'busy' || row.callStatus === 'cancelled') {
      stats.failed += 1;
    }
    if (row.recruiterDecision === 'shortlisted') stats.shortlisted += 1;
    if (row.recruiterDecision === 'rejected') stats.rejected += 1;
    if (typeof row.overallScore === 'number') {
      scoreSum += row.overallScore;
      scoreCount += 1;
    }
  }
  stats.averageScore = scoreCount ? Math.round(scoreSum / scoreCount) : null;
  await ScreeningModel.findByIdAndUpdate(screeningId, { stats });
  return stats;
}

export const screeningService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.jobId) filter.jobId = query.jobId;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      ScreeningModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(query.limit),
      ScreeningModel.countDocuments(filter),
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
    const doc = await loadScreening(organizationId, id);
    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
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

    const doc = await ScreeningModel.create({
      organizationId,
      ownerUserId: userId,
      jobId: input.jobId || null,
      campaignId: input.campaignId || null,
      workflowId: input.workflowId || null,
      sourceModule: input.sourceModule || 'screening',
      name: input.name,
      objective: input.objective ?? null,
      language: input.language ?? getHunarVoiceLanguage(),
      voice: input.voice ?? getHunarVoicePersona(),
      tone: input.tone ?? null,
      introductionScript: input.introductionScript ?? null,
      closingScript: input.closingScript ?? null,
      consentText: input.consentText ?? null,
      questions: input.questions || [],
      evaluationCriteria: input.evaluationCriteria || [],
      callSettings: {
        maxAttempts: input.callSettings?.maxAttempts ?? 2,
        attemptIntervalHours: input.callSettings?.attemptIntervalHours ?? 24,
        maxRetryCount: input.callSettings?.maxRetryCount ?? 2,
        retryIntervalHours: input.callSettings?.retryIntervalHours ?? 6,
        consentRequired: input.callSettings?.consentRequired ?? true,
      },
      candidateIds: input.candidateIds || [],
      status: 'draft',
      stats: defaultScreeningStats(),
      version: 1,
    });

    if (doc.candidateIds.length) {
      await this.syncCandidates(organizationId, String(doc._id), doc.candidateIds);
    }

    return toDisplay(doc, {
      ownerName: await ownerName(userId),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async update(organizationId: string, userId: string, id: string, input: UpdateInput) {
    const doc = await loadScreening(organizationId, id);
    if (!['draft', 'paused'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', 'Only draft or paused screenings can be edited.');
    }

    if (input.name !== undefined) doc.name = input.name;
    if (input.jobId !== undefined) doc.jobId = input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null;
    if (input.campaignId !== undefined) {
      doc.campaignId = input.campaignId
        ? new mongoose.Types.ObjectId(input.campaignId)
        : null;
    }
    if (input.objective !== undefined) doc.objective = input.objective;
    if (input.language !== undefined) doc.language = input.language;
    if (input.voice !== undefined) doc.voice = input.voice;
    if (input.tone !== undefined) doc.tone = input.tone;
    if (input.introductionScript !== undefined) doc.introductionScript = input.introductionScript;
    if (input.closingScript !== undefined) doc.closingScript = input.closingScript;
    if (input.consentText !== undefined) doc.consentText = input.consentText;
    if (input.questions !== undefined) doc.questions = input.questions;
    if (input.evaluationCriteria !== undefined) doc.evaluationCriteria = input.evaluationCriteria;
    if (input.callSettings !== undefined) {
      doc.callSettings = { ...doc.callSettings, ...input.callSettings };
    }
    if (input.candidateIds !== undefined) {
      doc.candidateIds = input.candidateIds;
      await this.syncCandidates(organizationId, id, input.candidateIds);
    }
    doc.version += 1;
    await doc.save();

    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async remove(organizationId: string, _userId: string, id: string) {
    const doc = await loadScreening(organizationId, id);
    if (doc.status === 'running') {
      throw new AppError(400, 'INVALID_STATUS', 'Pause or cancel the screening before deleting.');
    }
    doc.deletedAt = new Date();
    await doc.save();
    return { deleted: true, id };
  },

  async syncCandidates(organizationId: string, screeningId: string, candidateIds: string[]) {
    const screening = await loadScreening(organizationId, screeningId);
    const unique = [...new Set(candidateIds.filter((id) => mongoose.Types.ObjectId.isValid(id)))];
    const candidates = await SavedCandidateModel.find({
      _id: { $in: unique },
      organizationId,
      deletedAt: null,
    }).lean();

    for (const candidate of candidates) {
      await ScreeningCandidateModel.findOneAndUpdate(
        { screeningId, candidateId: candidate._id },
        {
          $setOnInsert: {
            organizationId,
            screeningId,
            candidateId: candidate._id,
            workflowId: screening.workflowId,
            callStatus: 'queued',
            attempts: 0,
            recruiterDecision: 'pending',
            extractedVariables: {},
            scoreBreakdown: {},
          },
        },
        { upsert: true }
      );
    }

    screening.candidateIds = candidates.map((c) => String(c._id));
    await screening.save();
    await refreshScreeningStats(screeningId);
    return { synced: candidates.length };
  },

  async validate(organizationId: string, userId: string, id: string) {
    const doc = await loadScreening(organizationId, id);
    const issues: Array<{ id: string; severity: 'error' | 'warning'; code: string; message: string }> =
      [];

    if (!isHunarConfigured()) {
      issues.push({
        id: 'provider',
        severity: 'error',
        code: 'PROVIDER_DISCONNECTED',
        message: 'Hunar voice API key is not configured.',
      });
    }

    const integration = await UserIntegrationModel.findOne({
      organizationId,
      provider: 'hunar',
      status: { $in: ['connected', 'needs_attention'] },
    }).lean();
    if (!integration) {
      issues.push({
        id: 'integration',
        severity: 'warning',
        code: 'INTEGRATION_NOT_CONNECTED',
        message: 'Connect Hunar in Integrations for org-level voice usage tracking.',
      });
    }

    if (!doc.questions?.length) {
      issues.push({
        id: 'questions',
        severity: 'error',
        code: 'QUESTIONS_EMPTY',
        message: 'Add at least one screening question.',
      });
    }
    if (!doc.introductionScript?.trim()) {
      issues.push({
        id: 'introduction',
        severity: 'warning',
        code: 'INTRODUCTION_MISSING',
        message: 'Introduction script is empty.',
      });
    }

    const enrolled = await ScreeningCandidateModel.countDocuments({ screeningId: id });
    if (enrolled === 0 && !doc.candidateIds.length) {
      issues.push({
        id: 'audience',
        severity: 'error',
        code: 'AUDIENCE_EMPTY',
        message: 'Add candidates before launch.',
      });
    }

    const candidates = await ScreeningCandidateModel.find({ screeningId: id }).lean();
    const pool = await SavedCandidateModel.find({
      _id: { $in: candidates.map((c) => c.candidateId) },
      organizationId,
    }).lean();
    const withPhone = pool.filter((c) => c.phone).length;
    if (candidates.length > 0 && withPhone === 0) {
      issues.push({
        id: 'contacts',
        severity: 'error',
        code: 'NO_PHONE_CONTACTS',
        message: 'No candidates have a phone number for AI voice.',
      });
    }

    const usage = await quotaService.getUsage(organizationId, 'ai_voice_minutes');
    const row = Array.isArray(usage) ? usage[0] : usage;
    if (row && row.remaining <= 0) {
      issues.push({
        id: 'quota',
        severity: 'error',
        code: 'QUOTA_EXCEEDED',
        message: 'AI voice minutes quota is exhausted.',
      });
    }

    const ok = !issues.some((i) => i.severity === 'error');
    doc.lastValidation = { ok, checkedAt: new Date(), issues };
    await doc.save();
    return { ok, issues };
  },

  async launch(organizationId: string, userId: string, id: string) {
    const doc = await loadScreening(organizationId, id);
    if (!['draft', 'paused', 'scheduled'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot launch from status ${doc.status}.`);
    }

    if (doc.candidateIds.length) {
      await this.syncCandidates(organizationId, id, doc.candidateIds);
    }

    const validation = await this.validate(organizationId, userId, id);
    if (!validation.ok) {
      throw new AppError(400, 'LAUNCH_VALIDATION_FAILED', 'Screening failed launch validation.', {
        meta: { issues: validation.issues },
      });
    }

    const agentInput = {
      name: doc.name,
      agentPrompt: buildAgentPrompt(doc),
      objective: doc.objective || `Screen candidates for ${doc.name}`,
      introduction: doc.introductionScript || 'Hello, this is a screening call from Huntlo.',
      resultPrompt: buildResultPrompt(doc),
      resultSchema: buildResultSchema(doc),
      voicePersona: doc.voice || getHunarVoicePersona(),
      language: doc.language || getHunarVoiceLanguage(),
    };

    if (doc.providerAgentId) {
      const updated = await updateHunarVoiceAgent(doc.providerAgentId, agentInput);
      doc.providerAgentId = updated.agentId;
    } else {
      const created = await createHunarVoiceAgent(agentInput);
      doc.providerAgentId = created.agentId;
    }

    const rows = await ScreeningCandidateModel.find({
      screeningId: id,
      callStatus: { $in: ['queued', 'no_answer', 'failed', 'busy'] },
    });
    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
      organizationId,
    }).lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));

    const callees: HunarCalleeRow[] = [];
    const launchRows: ScreeningCandidateDocument[] = [];
    for (const row of rows) {
      const candidate = byId.get(String(row.candidateId));
      if (!candidate?.phone) continue;
      const mobile = normalizePhone(candidate.phone).replace(/^\+/, '');
      if (!mobile) continue;
      callees.push({
        callee_name: candidate.name || 'Candidate',
        mobile_number: mobile,
        custom_data: {
          key_0: doc.objective || doc.name,
          key_1: (await jobTitle(doc.jobId)) || doc.name,
        },
      });
      launchRows.push(row);
    }

    if (!callees.length) {
      throw new AppError(400, 'VOICE_NO_VALID_PHONES', 'No candidates have a valid phone number.');
    }

    // Reserve 1 voice minute per dial attempt up front; commit actual usage on webhook.
    for (const row of launchRows) {
      const key = `screening:${id}:candidate:${String(row.candidateId)}:attempt:${row.attempts + 1}`;
      await quotaService.reserveUsage({
        organizationId,
        userId,
        metric: 'ai_voice_minutes',
        quantity: 1,
        idempotencyKey: key,
        relatedEntityType: 'screening_candidate',
        relatedEntityId: String(row._id),
      });
      row.quotaReservationKey = key;
      row.attempts += 1;
      row.callStatus = 'queued';
      row.error = null;
      await row.save();
    }

    const bulk = await createHunarBulkCalls({
      agentId: doc.providerAgentId!,
      screeningId: id,
      callees,
      retryConfig: {
        maxRetryCount: doc.callSettings.maxRetryCount,
        retryIntervalHours: doc.callSettings.retryIntervalHours,
      },
    });

    for (const row of launchRows) {
      row.providerRequestId = bulk.requestId;
      await row.save();
    }

    doc.status = 'running';
    doc.launchedAt = doc.launchedAt || new Date();
    doc.pausedAt = null;
    doc.lastLaunchRequestId = bulk.requestId;
    doc.version += 1;
    await doc.save();
    await refreshScreeningStats(id);

    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async pause(organizationId: string, _userId: string, id: string) {
    const doc = await loadScreening(organizationId, id);
    if (doc.status !== 'running') {
      throw new AppError(400, 'INVALID_STATUS', 'Only running screenings can be paused.');
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
    const doc = await loadScreening(organizationId, id);
    if (doc.status !== 'paused') {
      throw new AppError(400, 'INVALID_STATUS', 'Only paused screenings can be resumed.');
    }
    return this.launch(organizationId, userId, id);
  },

  async cancel(organizationId: string, _userId: string, id: string) {
    const doc = await loadScreening(organizationId, id);
    if (['completed', 'cancelled'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot cancel from status ${doc.status}.`);
    }
    doc.status = 'cancelled';
    doc.completedAt = new Date();
    await doc.save();

    const pending = await ScreeningCandidateModel.find({
      screeningId: id,
      callStatus: { $in: ['queued', 'ringing', 'in_progress'] },
    });
    for (const row of pending) {
      if (row.quotaReservationKey && row.quotaCommittedMinutes === 0) {
        try {
          await quotaService.releaseUsage({
            organizationId,
            metric: 'ai_voice_minutes',
            idempotencyKey: row.quotaReservationKey,
          });
        } catch {
          // best-effort release
        }
      }
      row.callStatus = 'cancelled';
      await row.save();
    }
    await refreshScreeningStats(id);

    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async listCandidates(organizationId: string, id: string, query: ListCandidatesQuery) {
    await loadScreening(organizationId, id);
    const filter: Record<string, unknown> = { organizationId, screeningId: id };
    if (query.callStatus) filter.callStatus = query.callStatus;
    if (query.decision) filter.recruiterDecision = query.decision;

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      ScreeningCandidateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      ScreeningCandidateModel.countDocuments(filter),
    ]);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name')
      .lean();
    const names = new Map(candidates.map((c) => [String(c._id), c.name]));
    const screening = await ScreeningModel.findById(id).select('name jobId').lean();

    return {
      items: rows.map((row) =>
        toResultDisplay(row, {
          name: names.get(String(row.candidateId)) || 'Unknown',
          jobId: screening?.jobId ? String(screening.jobId) : null,
          screeningName: screening?.name || '',
        })
      ),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async listResults(organizationId: string, query: ListResultsQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.screeningId) filter.screeningId = query.screeningId;
    if (query.decision) filter.recruiterDecision = query.decision;

    let screeningIds: mongoose.Types.ObjectId[] | null = null;
    if (query.jobId) {
      const screenings = await ScreeningModel.find({
        organizationId,
        jobId: query.jobId,
        deletedAt: null,
      })
        .select('_id')
        .lean();
      screeningIds = screenings.map((s) => s._id);
      filter.screeningId = { $in: screeningIds };
    }

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      ScreeningCandidateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      ScreeningCandidateModel.countDocuments(filter),
    ]);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name')
      .lean();
    const screenings = await ScreeningModel.find({
      _id: { $in: rows.map((r) => r.screeningId) },
    })
      .select('name jobId')
      .lean();
    const names = new Map(candidates.map((c) => [String(c._id), c.name]));
    const screeningMap = new Map(screenings.map((s) => [String(s._id), s]));

    let items = rows.map((row) => {
      const screening = screeningMap.get(String(row.screeningId));
      return toResultDisplay(row, {
        name: names.get(String(row.candidateId)) || 'Unknown',
        jobId: screening?.jobId ? String(screening.jobId) : null,
        screeningName: screening?.name || '',
      });
    });

    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(q));
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
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');
    const candidate = await SavedCandidateModel.findById(row.candidateId).select('name').lean();
    const screening = await ScreeningModel.findById(row.screeningId).select('name jobId').lean();
    return toResultDisplay(row, {
      name: candidate?.name || 'Unknown',
      jobId: screening?.jobId ? String(screening.jobId) : null,
      screeningName: screening?.name || '',
    });
  },

  async setDecision(
    organizationId: string,
    userId: string,
    id: string,
    decision: 'shortlisted' | 'rejected' | 'call_again'
  ) {
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');
    row.recruiterDecision = decision;
    if (decision === 'call_again') {
      row.callStatus = 'queued';
      row.completedAt = null;
    }
    await row.save();
    await refreshScreeningStats(String(row.screeningId));

    const result = await this.getResult(organizationId, id);
    emitScreeningResultUpdated({
      organizationId,
      screeningId: String(row.screeningId),
      resultId: id,
      candidateId: String(row.candidateId),
      callStatus: row.callStatus,
      overallScore: row.overallScore,
      recommendation: row.recommendation,
      recruiterDecision: row.recruiterDecision,
    });

    if (decision === 'call_again') {
      const screening = await loadScreening(organizationId, String(row.screeningId));
      if (screening.status === 'running' || screening.status === 'paused') {
        await this.launch(organizationId, userId, String(screening._id));
      }
    }

    return result;
  },

  async addNote(organizationId: string, userId: string, id: string, text: string) {
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');
    row.notes.unshift({
      id: randomUUID(),
      text,
      authorUserId: userId,
      createdAt: new Date(),
    });
    await row.save();
    return this.getResult(organizationId, id);
  },

  /** Used by Huntlo 360 orchestration — creates screening + candidate without dialing. */
  async ensureWorkflowCandidate(input: {
    organizationId: string;
    workflowId: string;
    campaignId?: string | null;
    candidateId: string;
    enrollmentId?: string | null;
    ownerUserId?: string | null;
    name: string;
    language?: string | null;
    questions: string[];
    attempts: number;
    minScore?: number;
  }) {
    let screening = await ScreeningModel.findOne({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      deletedAt: null,
    });
    if (!screening) {
      screening = await ScreeningModel.create({
        organizationId: input.organizationId,
        ownerUserId: input.ownerUserId || input.organizationId,
        workflowId: input.workflowId,
        campaignId: input.campaignId || null,
        sourceModule: 'huntlo360',
        name: input.name,
        language: input.language || getHunarVoiceLanguage(),
        voice: getHunarVoicePersona(),
        questions: input.questions.map((prompt, index) => ({
          id: `q-${index + 1}`,
          prompt,
        })),
        callSettings: {
          maxAttempts: input.attempts,
          attemptIntervalHours: 24,
          maxRetryCount: Math.max(0, input.attempts - 1),
          retryIntervalHours: 6,
          consentRequired: true,
        },
        candidateIds: [input.candidateId],
        status: 'draft',
        stats: defaultScreeningStats(),
      });
    }

    const row = await ScreeningCandidateModel.findOneAndUpdate(
      {
        screeningId: screening._id,
        candidateId: input.candidateId,
      },
      {
        $setOnInsert: {
          organizationId: input.organizationId,
          screeningId: screening._id,
          candidateId: input.candidateId,
          workflowId: input.workflowId,
          callStatus: 'queued',
          attempts: 0,
          recruiterDecision: 'pending',
          extractedVariables: {},
          scoreBreakdown: {},
        },
        $set: {
          enrollmentId: input.enrollmentId || null,
        },
      },
      { upsert: true, new: true }
    );

    await refreshScreeningStats(String(screening._id));
    return { screening, candidate: row };
  },

  mapEvaluationScores,
  minutesFromDuration,
  refreshScreeningStats,
  toResultDisplay,
  loadScreening,
};
