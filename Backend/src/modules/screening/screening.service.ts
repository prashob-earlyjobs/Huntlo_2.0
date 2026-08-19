import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import type { z } from 'zod';

import { AppError } from '../../shared/errors/app-error.js';
import { caseInsensitiveContains, escapeRegex } from '../../shared/validation/regex.js';
import { quotaService } from '../../shared/usage/index.js';
import { UserModel } from '../auth/user.model.js';
import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
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
import {
  isZyastraConfigured,
  triggerZyastraVoiceCall,
} from '../../providers/zyastra/index.js';
import {
  getHyrefastInterviewLink,
  isHyrefastConfigured,
  sendHyrefastInterview,
} from '../../providers/hyrefast/index.js';
import { emitScreeningResultUpdated } from '../../realtime/events.js';
import { isValidEmail } from '../../shared/validation/email.js';
import {
  buildRoshniAgentPrompt,
  ROSHNI_INTRODUCTION,
} from '../voice/roshni-prompt.js';
import { analysisVariablesFromResultSchema } from '../voice/voice-qualification-sync.js';
import {
  isIndianE164,
  mapPool,
  resolveIntroduction,
  resolveVoiceTokens,
  sanitizeHunarPromptText,
  seedPendingVoiceCalls,
  toHunarMobile,
} from '../voice/voice-dialer.service.js';
import {
  ScreeningModel,
  defaultScreeningStats,
  type ScreeningDocument,
  type ScreeningLogEntry,
} from './screening.model.js';
import { initialVideoScreeningLog } from './screening-logs.js';
import {
  appendScreeningCandidateLog,
  appendScreeningCandidateVideoLog,
  appendVideoScreeningLog,
  hyrefastInterviewLinkLogEntry,
  hyrefastSendInterviewLogEntry,
} from './screening-logs.js';
import {
  ScreeningCandidateModel,
  type ScreeningCandidateDocument,
} from './screening-candidate.model.js';
import { VoiceWebhookEventModel } from './voice-webhook-event.model.js';
import { scheduleScreeningLaunch } from './screening.facade.js';
import { launchVideoScreening } from './video-launch.service.js';
import { mapEvaluationScores, minutesFromDuration, decisionFromAiRecommendation } from './scoring.js';
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

async function searchMatchingOwnerIds(organizationId: string, q: string) {
  const regex = caseInsensitiveContains(q);
  const users = await UserModel.find({
    organizationId,
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ['$firstName', ' ', '$lastName'] },
            regex: escapeRegex(q.trim()),
            options: 'i',
          },
        },
      },
    ],
  })
    .select('_id')
    .lean();
  return users.map((user) => user._id);
}

async function searchMatchingJobIds(organizationId: string, q: string) {
  const jobs = await JobModel.find({
    organizationId,
    title: caseInsensitiveContains(q),
  })
    .select('_id')
    .lean();
  return jobs.map((job) => job._id);
}

async function searchMatchingCandidateIds(organizationId: string, q: string) {
  const regex = caseInsensitiveContains(q);
  const candidates = await SavedCandidateModel.find({
    organizationId,
    $or: [{ name: regex }, { email: regex }],
  })
    .select('_id')
    .lean();
  return candidates.map((candidate) => candidate._id);
}

async function searchMatchingScreeningIds(organizationId: string, q: string) {
  const jobIds = await searchMatchingJobIds(organizationId, q);
  const screenings = await ScreeningModel.find({
    organizationId,
    deletedAt: null,
    $or: [
      { name: caseInsensitiveContains(q) },
      ...(jobIds.length > 0 ? [{ jobId: { $in: jobIds } }] : []),
    ],
  })
    .select('_id')
    .lean();
  return screenings.map((screening) => screening._id);
}

function asFilterList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((item) => String(item).trim()).filter(Boolean);
}

async function resolveOwnerUserId(
  organizationId: string,
  actorUserId: string,
  requestedOwnerUserId?: string | null
) {
  const ownerUserId = String(requestedOwnerUserId || actorUserId).trim();
  if (!mongoose.Types.ObjectId.isValid(ownerUserId)) {
    throw new AppError(400, 'INVALID_OWNER', 'Invalid screening owner.');
  }
  const member = await OrganizationMemberModel.findOne({
    organizationId,
    userId: ownerUserId,
    status: { $in: ['active', 'invited'] },
  }).lean();
  if (!member) {
    throw new AppError(
      400,
      'OWNER_NOT_IN_ORG',
      'Screening owner must be an active member of this organization.'
    );
  }
  return ownerUserId;
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
    mode: doc.mode === 'video' ? 'video' : 'voice',
    jobId: doc.jobId ? String(doc.jobId) : null,
    jobTitle: extras.jobTitle,
    ownerUserId: String(doc.ownerUserId),
    owner: extras.ownerName,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    workflowId: doc.workflowId ? String(doc.workflowId) : null,
    sourceModule: doc.sourceModule,
    description: doc.description,
    status: STATUS_DISPLAY[doc.status] || doc.status,
    statusRaw: doc.status,
    objective: doc.objective,
    language: doc.language,
    voice: doc.voice,
    tone: doc.tone,
    introductionScript: doc.introductionScript,
    agentPrompt: doc.agentPrompt,
    closingScript: doc.closingScript,
    consentText: doc.consentText,
    questions: doc.questions,
    evaluationCriteria: doc.evaluationCriteria,
    minShortlistScore: doc.minShortlistScore ?? 70,
    knockouts: doc.knockouts || [],
    callSettings: doc.callSettings,
    candidateIds: doc.candidateIds,
    candidates: doc.stats.enrolled,
    completed: doc.stats.completed,
    averageScore: doc.stats.averageScore,
    shortlisted: doc.stats.shortlisted,
    totalAttempts: doc.stats.totalAttempts ?? 0,
    maxAttempts: doc.callSettings?.maxAttempts ?? 2,
    providerAgentId: doc.providerAgentId,
    providerJobId: doc.providerJobId,
    logs:
      doc.mode === 'video'
        ? (doc.logs || []).map((entry) => ({
            at: entry.at instanceof Date ? entry.at.toISOString() : String(entry.at),
            event: entry.event,
            message: entry.message ?? null,
            request: entry.request ?? null,
            response: entry.response ?? null,
            error: entry.error ?? null,
          }))
        : [],
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

function hyrefastCreateApplicationLog(row: ScreeningCandidateDocument) {
  const logs = [
    ...((row.video?.logs || []) as ScreeningLogEntry[]),
    ...((row.logs || []) as ScreeningLogEntry[]),
  ];
  return [...logs]
    .reverse()
    .find((entry) => entry?.event === 'hyrefast_create_application');
}

function hyrefastInviteSucceeded(log: ScreeningLogEntry | undefined): boolean {
  if (!log?.response) return false;
  const httpStatus = Number(log.response.httpStatus || 0);
  const body = log.response.body;
  const status =
    body && typeof body === 'object'
      ? String((body as { status?: string }).status || '').toUpperCase()
      : '';
  return httpStatus >= 200 && httpStatus < 300 && (status === 'SUCCESS' || status === '');
}

function toResultDisplay(
  row: ScreeningCandidateDocument,
  extras: {
    name: string;
    email?: string | null;
    jobId: string | null;
    jobTitle?: string | null;
    screeningName: string;
    knockouts?: string[];
    evaluationCriteria?: Array<{ id: string; label: string; weight?: number; description?: string | null }>;
    questions?: Array<{ id: string; prompt: string; expectedVariable?: string | null }>;
    attemptsMax?: number;
    activity?: Array<{
      id: string;
      icon: string;
      title: string;
      detail: string;
      time: string;
    }>;
  }
) {
  const configuredKnockouts = (extras.knockouts || [])
    .map((value) => String(value).trim())
    .filter(Boolean);
  const triggeredKnockouts = normalizeTriggeredKnockouts(
    row.extractedVariables?.knockouts_triggered ??
      row.extractedVariables?.knockoutsTriggered
  );
  const knockoutResults = buildKnockoutResults(configuredKnockouts, triggeredKnockouts);
  const isVideo = row.mode === 'video';
  const createLog = isVideo ? hyrefastCreateApplicationLog(row) : undefined;
  const inviteOk = isVideo && hyrefastInviteSucceeded(createLog);
  const video = row.video
    ? {
        jobId: row.video.jobId || null,
        applicationId: row.video.applicationId || null,
        invitationStatus:
          inviteOk && !row.video.applicationId
            ? row.video.invitationStatus && row.video.invitationStatus !== 'failed'
              ? row.video.invitationStatus
              : 'sent'
            : row.video.invitationStatus || null,
        invitationError: inviteOk ? null : row.video.invitationError || null,
        logs: row.video.logs || [],
      }
    : null;

  return {
    id: String(row._id),
    screeningId: String(row.screeningId),
    screeningName: extras.screeningName,
    candidateId: String(row.candidateId),
    name: extras.name,
    email: extras.email?.trim() || null,
    jobId: extras.jobId,
    jobTitle: extras.jobTitle ?? null,
    mode: row.mode === 'video' ? 'video' : 'voice',
    callStatus: inviteOk && row.callStatus === 'failed' ? 'invited' : row.callStatus,
    providerCallId: row.providerCallId,
    attempts: row.attempts,
    attemptsMax: extras.attemptsMax ?? null,
    durationSeconds: isVideo ? null : row.durationSeconds,
    transcript: isVideo ? null : row.transcript,
    recordingReference: isVideo ? null : row.recordingReference,
    summary: isVideo ? null : row.summary,
    extractedVariables: isVideo ? {} : row.extractedVariables,
    scoreBreakdown: isVideo ? {} : row.scoreBreakdown,
    overallScore: isVideo ? null : row.overallScore,
    recommendation: isVideo ? null : row.recommendation,
    decision: row.recruiterDecision,
    recruiterDecision: row.recruiterDecision,
    notes: row.notes,
    evaluationCriteria: isVideo ? [] : extras.evaluationCriteria || [],
    questions: isVideo ? [] : extras.questions || [],
    activity: extras.activity || [],
    completedAt: row.completedAt?.toISOString() ?? null,
    error: inviteOk ? null : row.error,
    logs: row.logs || [],
    video,
    lastActivity: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    knockouts: isVideo ? [] : configuredKnockouts,
    triggeredKnockouts: isVideo ? [] : triggeredKnockouts,
    knockoutResults: isVideo ? [] : knockoutResults,
  };
}

function normalizeTriggeredKnockouts(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // fall through — treat as a single label
    }
    return [value.trim()];
  }
  return [];
}

function buildKnockoutResults(
  configured: string[],
  triggered: string[]
): Array<{ criterion: string; passed: boolean; detail: string }> {
  if (configured.length === 0) return [];
  const normalizedTriggered = triggered.map((value) => value.trim().toLowerCase());
  return configured.map((criterion) => {
    const needle = criterion.trim().toLowerCase();
    const failed = normalizedTriggered.some(
      (value) => value === needle || value.includes(needle) || needle.includes(value)
    );
    return {
      criterion,
      passed: !failed,
      detail: failed
        ? 'Triggered during the screening call — forces Reject'
        : 'No trigger detected for this rule',
    };
  });
}

export async function refreshScreeningStats(screeningId: string) {
  const rows = await ScreeningCandidateModel.find({ screeningId }).lean();
  const stats = defaultScreeningStats();
  stats.enrolled = rows.length;
  let scoreSum = 0;
  let scoreCount = 0;
  for (const row of rows) {
    if (
      row.callStatus === 'queued' ||
      row.callStatus === 'invited' ||
      row.callStatus === 'ringing'
    ) {
      stats.queued += 1;
    }
    if (row.callStatus === 'in_progress') stats.inProgress += 1;
    if (row.callStatus === 'completed') stats.completed += 1;
    if (row.callStatus === 'no_answer' || row.callStatus === 'voicemail') stats.noAnswer += 1;
    if (row.callStatus === 'failed' || row.callStatus === 'busy' || row.callStatus === 'cancelled') {
      stats.failed += 1;
    }
    if (row.recruiterDecision === 'shortlisted') stats.shortlisted += 1;
    if (row.recruiterDecision === 'rejected') stats.rejected += 1;
    stats.totalAttempts += Math.max(0, Number(row.attempts) || 0);
    if (typeof row.overallScore === 'number') {
      scoreSum += row.overallScore;
      scoreCount += 1;
    }
  }
  stats.averageScore = scoreCount ? Math.round(scoreSum / scoreCount) : null;

  const screening = await ScreeningModel.findById(screeningId);
  if (!screening) return stats;
  screening.stats = stats;
  screening.markModified('stats');

  // Auto-complete when every dialable contact is terminal and nothing is in-flight.
  if (screening.status === 'running' && rows.length > 0) {
    const open = rows.filter((r) =>
      ['queued', 'invited', 'ringing', 'in_progress'].includes(String(r.callStatus || ''))
    ).length;
    const dialed = rows.filter((r) => Boolean(r.providerRequestId || r.providerCallId));
    if (open === 0 && dialed.length > 0) {
      screening.status = 'completed';
      screening.completedAt = screening.completedAt || new Date();
    }
  }

  await screening.save();
  return stats;
}

function formatActivityTime(value: Date | string | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
}

function humanizeWebhookKind(kind: string): string {
  switch (kind) {
    case 'call-status':
      return 'Call status update';
    case 'call-recording':
      return 'Recording ready';
    case 'call-result':
      return 'Call result received';
    case 'call-summary':
      return 'Summary received';
    default:
      return kind.replace(/-/g, ' ');
  }
}

function iconForWebhookKind(kind: string): string {
  if (kind === 'call-recording') return 'recording';
  if (kind === 'call-result' || kind === 'call-summary') return 'score';
  if (kind.includes('fail')) return 'failed';
  return 'phone';
}

async function buildResultActivity(
  row: ScreeningCandidateDocument
): Promise<
  Array<{ id: string; icon: string; title: string; detail: string; time: string }>
> {
  const callFilters: Record<string, unknown>[] = [];
  if (row.providerCallId) callFilters.push({ 'payload.call_id': row.providerCallId });
  if (row.providerRequestId) {
    callFilters.push({ 'payload.request_id': row.providerRequestId });
  }

  const events = callFilters.length
    ? await VoiceWebhookEventModel.find({
        screeningId: row.screeningId,
        $or: callFilters,
      })
        .sort({ createdAt: 1 })
        .limit(40)
        .lean()
    : await VoiceWebhookEventModel.find({ screeningId: row.screeningId })
        .sort({ createdAt: 1 })
        .limit(40)
        .lean();

  const activity: Array<{
    id: string;
    icon: string;
    title: string;
    detail: string;
    time: string;
  }> = [];

  for (const event of events) {
    const payload = (event.payload || {}) as Record<string, unknown>;
    const status = String(payload.status || payload.lifecycle_status || '').trim();
    const detailParts = [
      status ? `Status: ${status}` : null,
      payload.recording_url || payload.call_recording_url ? 'Recording URL included' : null,
      payload.result ? 'Result payload included' : null,
      event.status === 'duplicate' ? 'Duplicate event' : null,
    ].filter(Boolean);
    activity.push({
      id: `wh-${String(event._id)}`,
      icon: iconForWebhookKind(String(event.kind || '')),
      title: humanizeWebhookKind(String(event.kind || 'webhook')),
      detail: detailParts.join(' · ') || `Webhook ${event.status}`,
      time: formatActivityTime(event.createdAt),
    });
  }

  if (row.completedAt) {
    activity.push({
      id: `completed-${String(row._id)}`,
      icon: 'check',
      title: 'Call marked completed',
      detail: [
        row.durationSeconds != null ? `${Math.round(row.durationSeconds)}s` : null,
        row.overallScore != null ? `Score ${row.overallScore}` : null,
        row.recommendation ? `AI: ${row.recommendation}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      time: formatActivityTime(row.completedAt),
    });
  }

  if (row.recruiterDecision && row.recruiterDecision !== 'pending') {
    activity.push({
      id: `decision-${String(row._id)}`,
      icon: row.recruiterDecision === 'shortlisted' ? 'bookmark' : 'check',
      title: `Decision: ${row.recruiterDecision.replace(/_/g, ' ')}`,
      detail: 'Applied from AI screening recommendation',
      time: formatActivityTime(row.updatedAt),
    });
  }

  for (const note of row.notes || []) {
    activity.push({
      id: `note-${note.id}`,
      icon: 'note',
      title: 'Recruiter note added',
      detail: String(note.text || '').slice(0, 240),
      time: formatActivityTime(note.createdAt),
    });
  }

  return activity.sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

/** Normalize 360 / legacy screening question payloads into ScreeningQuestion rows. */
export function normalizeWorkflowScreeningQuestions(
  questions:
    | Array<
        | string
        | {
            id?: string;
            prompt?: string;
            knockout?: boolean;
            knockoutCondition?: string | null;
          }
      >
    | undefined
    | null
) {
  return (questions || [])
    .map((entry, index) => {
      if (typeof entry === 'string') {
        const prompt = entry.trim();
        if (!prompt) return null;
        return {
          id: `q-${index + 1}`,
          prompt,
          knockout: false,
          knockoutCondition: null as string | null,
        };
      }
      const prompt = String(entry.prompt || '').trim();
      if (!prompt) return null;
      const knockoutCondition = String(entry.knockoutCondition || '').trim() || null;
      const knockout = Boolean(entry.knockout) || Boolean(knockoutCondition);
      return {
        id: String(entry.id || `q-${index + 1}`),
        prompt,
        knockout,
        knockoutCondition: knockout ? knockoutCondition : null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

async function applyPendingAiDecisions(
  rows: ScreeningCandidateDocument[]
): Promise<void> {
  const touchedScreenings = new Set<string>();
  for (const row of rows) {
    if (row.recruiterDecision !== 'pending') continue;
    const autoDecision = decisionFromAiRecommendation(row.recommendation);
    if (!autoDecision) continue;
    row.recruiterDecision = autoDecision;
    await row.save();
    touchedScreenings.add(String(row.screeningId));
    try {
      const { syncEnrollmentScreeningDecision } = await import(
        './screening-conversation-sync.js'
      );
      await syncEnrollmentScreeningDecision({
        organizationId: String(row.organizationId),
        candidateId: String(row.candidateId),
        enrollmentId: row.enrollmentId ? String(row.enrollmentId) : null,
        screeningId: String(row.screeningId),
        recommendation: row.recommendation,
        recruiterDecision: row.recruiterDecision,
      });
    } catch {
      // best-effort
    }
  }
  for (const screeningId of touchedScreenings) {
    await refreshScreeningStats(screeningId);
  }
}

export const screeningService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId, deletedAt: null };
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    if (query.jobId) filter.jobId = query.jobId;
    if (query.ownerUserId) {
      const ownerIds = (Array.isArray(query.ownerUserId)
        ? query.ownerUserId
        : [query.ownerUserId]
      ).filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ownerIds.length === 1) {
        filter.ownerUserId = ownerIds[0];
      } else if (ownerIds.length > 1) {
        filter.ownerUserId = {
          $in: ownerIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    }
    if (query.q) {
      const [ownerIds, jobIds] = await Promise.all([
        searchMatchingOwnerIds(organizationId, query.q),
        searchMatchingJobIds(organizationId, query.q),
      ]);
      const searchOr: Record<string, unknown>[] = [
        { name: caseInsensitiveContains(query.q) },
      ];
      if (ownerIds.length > 0) searchOr.push({ ownerUserId: { $in: ownerIds } });
      if (jobIds.length > 0) searchOr.push({ jobId: { $in: jobIds } });
      filter.$or = searchOr;
    }

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

  async listOwners(organizationId: string) {
    const ownerIds = await ScreeningModel.distinct('ownerUserId', {
      organizationId,
      deletedAt: null,
    });
    const users = await UserModel.find({
      _id: { $in: ownerIds },
      organizationId,
    })
      .select('firstName lastName')
      .sort({ firstName: 1, lastName: 1 })
      .lean();
    return users.map((user) => ({
      id: String(user._id),
      name: `${user.firstName} ${user.lastName}`.trim() || 'Unknown',
    }));
  },

  async get(organizationId: string, id: string) {
    await refreshScreeningStats(id);
    const doc = await loadScreening(organizationId, id);
    return toDisplay(doc, {
      ownerName: await ownerName(String(doc.ownerUserId)),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async create(organizationId: string, userId: string, input: CreateInput) {
    const ownerUserId = await resolveOwnerUserId(
      organizationId,
      userId,
      input.ownerUserId
    );
    if (input.jobId) {
      const job = await JobModel.findOne({
        _id: input.jobId,
        organizationId,
        deletedAt: null,
      }).lean();
      if (!job) throw new AppError(400, 'JOB_NOT_FOUND', 'Linked job not found.');
    }

    const isVideo = input.mode === 'video';
    const doc = await ScreeningModel.create({
      organizationId,
      ownerUserId,
      jobId: input.jobId || null,
      campaignId: input.campaignId || null,
      workflowId: input.workflowId || null,
      sourceModule: input.sourceModule || 'screening',
      name: input.name,
      mode: isVideo ? 'video' : 'voice',
      description: input.description ?? null,
      objective: input.objective ?? null,
      language: input.language ? String(input.language).toUpperCase() : getHunarVoiceLanguage(),
      voice: input.voice ? String(input.voice).toUpperCase() : getHunarVoicePersona(),
      tone: input.tone ?? null,
      introductionScript: input.introductionScript ?? null,
      agentPrompt: input.agentPrompt ?? null,
      closingScript: input.closingScript ?? null,
      consentText: input.consentText ?? null,
      questions: input.questions || [],
      evaluationCriteria: input.evaluationCriteria || [],
      minShortlistScore:
        typeof input.minShortlistScore === 'number' ? input.minShortlistScore : 70,
      knockouts: input.knockouts || [],
      callSettings: {
        maxAttempts: input.callSettings?.maxAttempts ?? 2,
        attemptIntervalHours: input.callSettings?.attemptIntervalHours ?? 24,
        maxRetryCount: input.callSettings?.maxRetryCount ?? 2,
        retryIntervalHours: input.callSettings?.retryIntervalHours ?? 6,
        consentRequired: input.callSettings?.consentRequired ?? true,
        callWindow: input.callSettings?.callWindow ?? '10 AM – 7 PM',
        timezone:
          input.callSettings?.timezone ?? "Candidate's local timezone",
        voicemailBehaviour:
          input.callSettings?.voicemailBehaviour ??
          'Leave a short callback message',
      },
      candidateIds: input.candidateIds || [],
      logs: isVideo ? [initialVideoScreeningLog(input.name)] : [],
      status: 'draft',
      stats: defaultScreeningStats(),
      version: 1,
    });

    if (doc.candidateIds.length) {
      await this.syncCandidates(organizationId, String(doc._id), doc.candidateIds);
    }

    return toDisplay(doc, {
      ownerName: await ownerName(ownerUserId),
      jobTitle: await jobTitle(doc.jobId),
    });
  },

  async update(organizationId: string, userId: string, id: string, input: UpdateInput) {
    const applyUpdate = async (doc: ScreeningDocument) => {
      if (!['draft', 'paused'].includes(doc.status)) {
        throw new AppError(400, 'INVALID_STATUS', 'Only draft or paused screenings can be edited.');
      }

      if (input.name !== undefined) doc.name = input.name;
      if (input.mode !== undefined) {
        const nextMode = input.mode === 'video' ? 'video' : 'voice';
        if (nextMode === 'video' && doc.mode !== 'video' && (!doc.logs || doc.logs.length === 0)) {
          doc.logs = [initialVideoScreeningLog(doc.name)];
        }
        doc.mode = nextMode;
      }
      if (input.ownerUserId !== undefined) {
        doc.ownerUserId = new mongoose.Types.ObjectId(
          await resolveOwnerUserId(organizationId, userId, input.ownerUserId)
        );
      }
      if (input.jobId !== undefined) {
        doc.jobId = input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null;
      }
      if (input.campaignId !== undefined) {
        doc.campaignId = input.campaignId
          ? new mongoose.Types.ObjectId(input.campaignId)
          : null;
      }
      if (input.description !== undefined) doc.description = input.description;
      if (input.objective !== undefined) doc.objective = input.objective;
      if (input.language !== undefined) {
        doc.language = input.language ? String(input.language).toUpperCase() : null;
      }
      if (input.voice !== undefined) {
        doc.voice = input.voice ? String(input.voice).toUpperCase() : null;
      }
      if (input.tone !== undefined) doc.tone = input.tone;
      if (input.introductionScript !== undefined) doc.introductionScript = input.introductionScript;
      if (input.agentPrompt !== undefined) doc.agentPrompt = input.agentPrompt;
      if (input.closingScript !== undefined) doc.closingScript = input.closingScript;
      if (input.consentText !== undefined) doc.consentText = input.consentText;
      if (input.questions !== undefined) doc.questions = input.questions;
      if (input.evaluationCriteria !== undefined) doc.evaluationCriteria = input.evaluationCriteria;
      if (input.minShortlistScore !== undefined) doc.minShortlistScore = input.minShortlistScore;
      if (input.knockouts !== undefined) doc.knockouts = input.knockouts;
      if (input.callSettings !== undefined) {
        doc.callSettings = { ...doc.callSettings, ...input.callSettings };
      }
      if (input.candidateIds !== undefined) {
        doc.candidateIds = input.candidateIds;
        await this.syncCandidates(organizationId, id, input.candidateIds);
      }
      doc.version += 1;
    };

    let doc = await loadScreening(organizationId, id);
    await applyUpdate(doc);
    try {
      await doc.save();
    } catch (err) {
      if (!(err instanceof mongoose.Error.VersionError)) throw err;
      doc = await loadScreening(organizationId, id);
      await applyUpdate(doc);
      await doc.save();
    }

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
            mode: screening.mode === 'video' ? 'video' : 'voice',
            workflowId: screening.workflowId,
            callStatus: 'queued',
            attempts: 0,
            recruiterDecision: 'pending',
            extractedVariables: {},
            scoreBreakdown: {},
            ...(screening.mode === 'video' ? { video: {} } : { audio: {}, video: {} }),
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

    if (doc.mode === 'video') {
      if (!isHyrefastConfigured()) {
        issues.push({
          id: 'provider',
          severity: 'error',
          code: 'HYREFAST_API_KEY_MISSING',
          message: 'Video screening requires HYREFAST_API_KEY.',
        });
      }
      if (!doc.jobId) {
        issues.push({
          id: 'job',
          severity: 'error',
          code: 'JOB_REQUIRED',
          message: 'Video screening requires a linked job.',
        });
      }
      const withEmail = pool.filter((c) => isValidEmail(String(c.email || ''))).length;
      if (candidates.length > 0 && withEmail === 0) {
        issues.push({
          id: 'contacts',
          severity: 'error',
          code: 'NO_EMAIL_CONTACTS',
          message: 'No candidates have an email address for video screening.',
        });
      }
      const ok = !issues.some((i) => i.severity === 'error');
      doc.lastValidation = { ok, checkedAt: new Date(), issues };
      await doc.save();
      return { ok, issues };
    }

    if (!isHunarConfigured() && !isZyastraConfigured()) {
      issues.push({
        id: 'provider',
        severity: 'error',
        code: 'PROVIDER_DISCONNECTED',
        message: 'No voice provider configured. Set HUNAR_VOICE_API_KEY and/or ZYASTRA_API_KEY + ZYASTRA_API_SECRET.',
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
        severity: 'warning',
        code: 'QUESTIONS_DEFAULTS',
        message: 'No custom questions set — Roshni will use the default eight screening questions.',
      });
    }
    if (!doc.introductionScript?.trim()) {
      issues.push({
        id: 'introduction',
        severity: 'warning',
        code: 'INTRODUCTION_DEFAULT',
        message: `Introduction will default to: ${ROSHNI_INTRODUCTION}`,
      });
    }

    const withPhone = pool.filter((c) => c.phone).length;
    if (candidates.length > 0 && withPhone === 0) {
      issues.push({
        id: 'contacts',
        severity: 'error',
        code: 'NO_PHONE_CONTACTS',
        message: 'No candidates have a phone number for AI voice.',
      });
    }

    let hasIndian = false;
    let hasInternational = false;
    for (const candidate of pool) {
      const mobile = toHunarMobile(String(candidate.phone || ''));
      if (!mobile) continue;
      if (isIndianE164(mobile)) hasIndian = true;
      else hasInternational = true;
    }
    if (hasIndian && !isHunarConfigured()) {
      issues.push({
        id: 'provider_hunar',
        severity: 'error',
        code: 'HUNAR_API_KEY_MISSING',
        message: 'Indian (+91) numbers require Hunar. Set HUNAR_VOICE_API_KEY.',
      });
    }
    if (hasInternational && !isZyastraConfigured()) {
      issues.push({
        id: 'provider_zyastra',
        severity: 'error',
        code: 'ZYASTRA_API_KEY_MISSING',
        message: 'Non-Indian numbers require Zyastra. Set ZYASTRA_API_KEY and ZYASTRA_API_SECRET.',
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

  async launch(
    organizationId: string,
    userId: string,
    id: string,
    options?: { candidateIds?: string[]; runInWorker?: boolean }
  ) {
    const doc = await loadScreening(organizationId, id);
    if (!['draft', 'paused', 'scheduled', 'running'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', `Cannot launch from status ${doc.status}.`);
    }

    if (doc.candidateIds.length) {
      await this.syncCandidates(organizationId, id, doc.candidateIds);
    }

    const validation = await this.validate(organizationId, userId, id);
    if (!validation.ok) {
      const errors = validation.issues.filter((issue) => issue.severity === 'error');
      throw new AppError(
        400,
        'LAUNCH_VALIDATION_FAILED',
        errors[0]?.message || 'Screening failed launch validation.',
        {
          details: errors.map((issue) => ({
            path: issue.id,
            message: issue.message,
          })),
          meta: { issues: validation.issues },
        }
      );
    }

    if (doc.mode === 'video') {
      if (!options?.runInWorker) {
        await scheduleScreeningLaunch({
          screening: doc,
          candidateIds: options?.candidateIds?.length ? options.candidateIds : doc.candidateIds,
          source: 'screening',
        });
        const queued = await loadScreening(organizationId, id);
        return toDisplay(queued, {
          ownerName: await ownerName(String(queued.ownerUserId)),
          jobTitle: await jobTitle(queued.jobId),
        });
      }

      const fresh = await loadScreening(organizationId, id);
      await launchVideoScreening({
        organizationId,
        screeningId: id,
        doc: fresh,
        candidateIds: options?.candidateIds,
      });
      await refreshScreeningStats(id);
      return toDisplay(fresh, {
        ownerName: await ownerName(String(fresh.ownerUserId)),
        jobTitle: await jobTitle(fresh.jobId),
      });
    }

    const roshni = await buildRoshniAgentPrompt({
      jobId: doc.jobId ? String(doc.jobId) : null,
      organizationId,
      campaignName: doc.name,
      questions: (doc.questions || []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        followUp: q.followUp,
        required: q.required,
        expectedVariable: q.expectedVariable,
        knockout: q.knockout,
        knockoutCondition: q.knockoutCondition ?? null,
      })),
    });

    const resultSchema = {
      ...roshni.resultSchema,
      properties: {
        ...((roshni.resultSchema.properties as Record<string, unknown>) || {}),
      },
    };
    for (const criterion of doc.evaluationCriteria || []) {
      // Only numeric scores requested for configured criteria (communication).
      if (criterion.id !== 'communication') continue;
      (resultSchema.properties as Record<string, unknown>)[criterion.id] = {
        type: 'number',
        description: criterion.description || `score 0-100 for ${criterion.label}`,
      };
    }
    for (const question of doc.questions || []) {
      if (question.evaluationEnabled === false) continue;
      const variable = String(question.expectedVariable || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      if (!variable) continue;
      const answerKey = `${variable}_answer`;
      if (!(resultSchema.properties as Record<string, unknown>)[answerKey]) {
        (resultSchema.properties as Record<string, unknown>)[answerKey] = {
          type: 'string',
          description: `Candidate's spoken answer for "${question.prompt}" (variable ${variable}). Use "Not Mentioned" when unclear.`,
        };
      }
    }
    const knockouts = (doc.knockouts || []).map((value) => String(value).trim()).filter(Boolean);
    if (knockouts.length > 0) {
      (resultSchema.properties as Record<string, unknown>).knockouts_triggered = {
        type: 'array',
        items: { type: 'string' },
        description: `List which of these knockout rules failed for the candidate (use exact labels): ${knockouts.join('; ')}. Empty array if none failed.`,
      };
    }
    let resultPrompt = roshni.resultPrompt;
    const communicationCriterion = (doc.evaluationCriteria || []).find(
      (criterion) => criterion.id === 'communication'
    );
    if (communicationCriterion) {
      resultPrompt = `${resultPrompt}\n\nAlso include evaluation scores: "communication": number 0-100 — ${communicationCriterion.label}. Do not score other categories or individual questions.`;
    }
    const answerFields = (doc.questions || [])
      .map((question) => {
        if (question.evaluationEnabled === false) return null;
        const variable = String(question.expectedVariable || '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');
        if (!variable) return null;
        return `"${variable}_answer": string — answer to "${question.prompt}"`;
      })
      .filter(Boolean);
    if (answerFields.length > 0) {
      resultPrompt = `${resultPrompt}\n\nAlso include captured answers (text only, no scores): ${answerFields.join(', ')}.`;
    }
    if (knockouts.length > 0) {
      resultPrompt = `${resultPrompt}\n\nAlso include "knockouts_triggered": string[] using only these exact labels when the candidate fails them: ${knockouts
        .map((rule) => `"${rule}"`)
        .join(', ')}. Use [] when none apply.`;
    }

    const storedPrompt = String(doc.agentPrompt || '').trim();
    const usesRoshniTemplate = !storedPrompt || storedPrompt.includes('You are Roshni');
    const agentPrompt = usesRoshniTemplate
      ? resolveVoiceTokens(storedPrompt || roshni.agentPrompt, roshni.tokens)
      : resolveVoiceTokens(storedPrompt, roshni.tokens);

    const introduction = resolveIntroduction(
      doc.tone,
      doc.introductionScript?.trim()
        ? resolveVoiceTokens(doc.introductionScript, roshni.tokens)
        : null
    );

    const agentInput = {
      name: doc.name,
      agentPrompt: sanitizeHunarPromptText(agentPrompt),
      objective: sanitizeHunarPromptText(doc.objective?.trim() || roshni.objective),
      introduction: sanitizeHunarPromptText(introduction),
      resultPrompt: sanitizeHunarPromptText(resultPrompt),
      resultSchema,
      voicePersona: doc.voice || getHunarVoicePersona(),
      language: doc.language
        ? String(doc.language).trim().toUpperCase()
        : getHunarVoiceLanguage(),
    };

    const candidateIds =
      options?.candidateIds?.filter((candidateId) =>
        mongoose.Types.ObjectId.isValid(candidateId)
      ) ?? [];
    const rows = await ScreeningCandidateModel.find({
      screeningId: id,
      callStatus: { $in: ['queued', 'no_answer', 'failed', 'busy'] },
      ...(candidateIds.length > 0
        ? {
            candidateId: {
              $in: candidateIds.map((candidateId) => new mongoose.Types.ObjectId(candidateId)),
            },
          }
        : {}),
    });
    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
      organizationId,
    }).lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));

    type LaunchCallee = {
      row: ScreeningCandidateDocument;
      name: string;
      mobile: string;
      mobileDigits: string;
      indian: boolean;
      candidateId: string;
    };
    const launchCallees: LaunchCallee[] = [];
    for (const row of rows) {
      const candidate = byId.get(String(row.candidateId));
      if (!candidate?.phone) continue;
      const mobile = toHunarMobile(candidate.phone);
      if (!mobile) continue;
      launchCallees.push({
        row,
        name: candidate.name || 'Candidate',
        mobile,
        mobileDigits: mobile.replace(/\D/g, ''),
        indian: isIndianE164(mobile),
        candidateId: String(row.candidateId),
      });
    }

    if (!launchCallees.length) {
      throw new AppError(400, 'VOICE_NO_VALID_PHONES', 'No candidates have a valid phone number.');
    }

    const indianCallees = launchCallees.filter((c) => c.indian);
    const internationalCallees = launchCallees.filter((c) => !c.indian);

    if (indianCallees.length > 0 && !isHunarConfigured()) {
      throw new AppError(
        503,
        'HUNAR_API_KEY_MISSING',
        'Hunar voice API key is not configured. Set HUNAR_VOICE_API_KEY.'
      );
    }
    if (internationalCallees.length > 0 && !isZyastraConfigured()) {
      throw new AppError(
        503,
        'ZYASTRA_API_KEY_MISSING',
        'Non-Indian numbers require Zyastra. Set ZYASTRA_API_KEY and ZYASTRA_API_SECRET.'
      );
    }
    if (internationalCallees.length > 0) {
      const base = String(
        process.env.PUBLIC_API_BASE_URL || process.env.API_PUBLIC_BASE_URL || ''
      ).trim();
      if (!base) {
        throw new AppError(
          503,
          'VOICE_CALLBACK_URL_MISSING',
          'PUBLIC_API_BASE_URL is not configured. Set it so voice providers can deliver call callbacks.'
        );
      }
    }

    if (indianCallees.length > 0) {
      if (doc.providerAgentId) {
        const updated = await updateHunarVoiceAgent(doc.providerAgentId, agentInput);
        doc.providerAgentId = updated.agentId;
      } else {
        const created = await createHunarVoiceAgent(agentInput);
        doc.providerAgentId = created.agentId;
      }
    }

    // Reserve 1 voice minute per dial attempt up front; commit actual usage on webhook.
    for (const callee of launchCallees) {
      const row = callee.row;
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

    const batchRequestId = `${id}-${randomUUID()}`.replace(/[^a-zA-Z0-9_.-]/g, '-').slice(0, 64);
    let lastLaunchRequestId = batchRequestId;
    const jobTitleValue = (await jobTitle(doc.jobId)) || doc.name;

    if (indianCallees.length > 0) {
      const callees: HunarCalleeRow[] = indianCallees.map((c) => ({
        callee_name: c.name,
        mobile_number: c.mobile,
        custom_data: {
          key_0: doc.objective || doc.name,
          key_1: jobTitleValue,
        },
      }));

      const bulk = await createHunarBulkCalls({
        agentId: doc.providerAgentId!,
        screeningId: id,
        callees,
        retryConfig: {
          maxRetryCount: doc.callSettings.maxRetryCount,
          retryIntervalHours: doc.callSettings.retryIntervalHours,
        },
      });
      lastLaunchRequestId = bulk.requestId || lastLaunchRequestId;
      for (const callee of indianCallees) {
        callee.row.providerRequestId = bulk.requestId;
        await callee.row.save();
      }
    }

    if (internationalCallees.length > 0) {
      const analysisVariables = analysisVariablesFromResultSchema(resultSchema);
      const results = await mapPool(internationalCallees, 4, async (callee) => {
        const nameParts = String(callee.name || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        const firstName = nameParts[0] || 'Candidate';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;
        const personalFirstMessage = introduction.includes('{callee_name}')
          ? introduction.replace(/\{callee_name\}/g, callee.name || firstName)
          : introduction;
        const triggered = await triggerZyastraVoiceCall({
          candidate: {
            phoneNumber: callee.mobile,
            firstName,
            ...(lastName ? { lastName } : {}),
          },
          agent: {
            prompt: agentPrompt,
            firstMessage: personalFirstMessage,
            preferredLanguage: 'en-US',
          },
          voiceConfiguration: { engine: 'global-std', speed: 1.0 },
          analysisVariables,
          metadata: {
            source: 'screening',
            organizationId,
            screeningId: id,
            candidateId: callee.candidateId,
            batchRequestId,
          },
        });
        return { callee, triggered };
      });

      for (const { callee, triggered } of results) {
        callee.row.providerCallId = triggered.callId;
        callee.row.providerRequestId = triggered.requestId || batchRequestId;
        await callee.row.save();

        await seedPendingVoiceCalls({
          organizationId,
          source: 'screening',
          screeningId: id,
          requestId: triggered.requestId || batchRequestId,
          agentId: null,
          provider: 'zyastra',
          contacts: [
            {
              candidateId: callee.candidateId,
              name: callee.name,
              phone: callee.mobile,
              mobileDigits: callee.mobileDigits,
              callId: triggered.callId,
            },
          ],
          maxRetries: 0,
          status: 'queued',
        });
      }

      if (!indianCallees.length && results[0]?.triggered.requestId) {
        lastLaunchRequestId = results[0].triggered.requestId;
      }
    }

    doc.status = 'running';
    doc.launchedAt = doc.launchedAt || new Date();
    doc.pausedAt = null;
    doc.lastLaunchRequestId = lastLaunchRequestId;
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
      callStatus: { $in: ['queued', 'invited', 'ringing', 'in_progress'] },
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
      .select('name email')
      .lean();
    const people = new Map(
      candidates.map((c) => [String(c._id), { name: c.name, email: c.email }])
    );
    const screening = await ScreeningModel.findById(id).select('name jobId knockouts').lean();

    return {
      items: rows.map((row) =>
        toResultDisplay(row, {
          name: people.get(String(row.candidateId))?.name || 'Unknown',
          email: people.get(String(row.candidateId))?.email || null,
          jobId: screening?.jobId ? String(screening.jobId) : null,
          screeningName: screening?.name || '',
          knockouts: screening?.knockouts || [],
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
    const and: Record<string, unknown>[] = [];
    if (query.screeningId) filter.screeningId = query.screeningId;
    const decisions = asFilterList(query.decision);
    if (decisions.length === 1) {
      filter.recruiterDecision = decisions[0];
    } else if (decisions.length > 1) {
      filter.recruiterDecision = { $in: decisions };
    }

    if (query.jobId) {
      const screenings = await ScreeningModel.find({
        organizationId,
        jobId: query.jobId,
        deletedAt: null,
      })
        .select('_id')
        .lean();
      filter.screeningId = { $in: screenings.map((s) => s._id) };
    }

    if (query.q) {
      const [candidateIds, screeningIds] = await Promise.all([
        searchMatchingCandidateIds(organizationId, query.q),
        searchMatchingScreeningIds(organizationId, query.q),
      ]);
      const searchOr: Record<string, unknown>[] = [];
      if (candidateIds.length > 0) searchOr.push({ candidateId: { $in: candidateIds } });
      if (screeningIds.length > 0) searchOr.push({ screeningId: { $in: screeningIds } });
      if (searchOr.length === 0) {
        return {
          items: [],
          pagination: {
            page: 1,
            limit: query.limit,
            total: 0,
            totalPages: 1,
          },
        };
      }
      and.push({ $or: searchOr });
    }

    const recommendations = asFilterList(query.recommendation);
    if (recommendations.length > 0) {
      const recOr: Record<string, unknown>[] = [];
      if (recommendations.includes('shortlist')) {
        recOr.push({ recommendation: { $regex: 'shortlist', $options: 'i' } });
      }
      if (recommendations.includes('reject')) {
        recOr.push({ recommendation: { $regex: 'reject', $options: 'i' } });
      }
      if (recommendations.includes('needs_review')) {
        recOr.push({
          $nor: [
            { recommendation: { $regex: 'shortlist', $options: 'i' } },
            { recommendation: { $regex: 'reject', $options: 'i' } },
          ],
        });
      }
      if (recOr.length === 1) and.push(recOr[0]!);
      else if (recOr.length > 1) and.push({ $or: recOr });
    }

    if (and.length > 0) filter.$and = and;

    const total = await ScreeningCandidateModel.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const page = Math.min(query.page, totalPages);
    const rows = await ScreeningCandidateModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * query.limit)
      .limit(query.limit);
    await applyPendingAiDecisions(rows);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name email')
      .lean();
    const screenings = await ScreeningModel.find({
      _id: { $in: rows.map((r) => r.screeningId) },
    })
      .select('name jobId knockouts')
      .lean();
    const people = new Map(
      candidates.map((c) => [String(c._id), { name: c.name, email: c.email }])
    );
    const screeningMap = new Map(screenings.map((s) => [String(s._id), s]));

    const items = rows.map((row) => {
      const screening = screeningMap.get(String(row.screeningId));
      const person = people.get(String(row.candidateId));
      return toResultDisplay(row, {
        name: person?.name || 'Unknown',
        email: person?.email || null,
        jobId: screening?.jobId ? String(screening.jobId) : null,
        screeningName: screening?.name || '',
        knockouts: screening?.knockouts || [],
      });
    });

    return {
      items,
      pagination: {
        page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  },

  async getResult(organizationId: string, id: string) {
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');

    // Backfill: treat AI recommendation as final for older completed rows still pending.
    if (row.recruiterDecision === 'pending') {
      const autoDecision = decisionFromAiRecommendation(row.recommendation);
      if (autoDecision) {
        row.recruiterDecision = autoDecision;
        await row.save();
        await refreshScreeningStats(String(row.screeningId));
      }
    }
    try {
      const { syncEnrollmentScreeningDecision } = await import(
        './screening-conversation-sync.js'
      );
      await syncEnrollmentScreeningDecision({
        organizationId: String(row.organizationId),
        candidateId: String(row.candidateId),
        enrollmentId: row.enrollmentId ? String(row.enrollmentId) : null,
        screeningId: String(row.screeningId),
        recommendation: row.recommendation,
        recruiterDecision: row.recruiterDecision,
      });
    } catch {
      // best-effort enrollment badge sync
    }

    const candidate = await SavedCandidateModel.findById(row.candidateId)
      .select('name email')
      .lean();
    const screening = await ScreeningModel.findById(row.screeningId)
      .select('name jobId knockouts evaluationCriteria questions callSettings')
      .lean();
    const linkedJobTitle = screening?.jobId ? await jobTitle(screening.jobId) : null;
    const activity = await buildResultActivity(row);
    return toResultDisplay(row, {
      name: candidate?.name || 'Unknown',
      email: candidate?.email || null,
      jobId: screening?.jobId ? String(screening.jobId) : null,
      jobTitle: linkedJobTitle,
      screeningName: screening?.name || '',
      knockouts: screening?.knockouts || [],
      evaluationCriteria: screening?.evaluationCriteria || [],
      questions: (screening?.questions || []).map((q) => ({
        id: q.id,
        prompt: q.prompt,
        expectedVariable: q.expectedVariable ?? null,
      })),
      attemptsMax: screening?.callSettings?.maxAttempts ?? 2,
      activity,
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

  async resendInterviewInvite(organizationId: string, _userId: string, id: string) {
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');

    const screening = await loadScreening(organizationId, String(row.screeningId));
    if (screening.mode !== 'video') {
      throw new AppError(400, 'INVALID_MODE', 'Resend invite is only available for video screenings.');
    }

    const applicationId = String(row.video?.applicationId || row.providerCallId || '').trim();
    if (!applicationId) {
      throw new AppError(400, 'APPLICATION_ID_MISSING', 'No Hyrefast application id found for this candidate.');
    }

    const { data, trace } = await sendHyrefastInterview(applicationId);
    const logEntry = hyrefastSendInterviewLogEntry({
      candidateId: String(row.candidateId),
      request: {
        method: trace.method,
        url: trace.url,
        body: trace.requestBody,
      },
      response: {
        httpStatus: trace.httpStatus,
        body: trace.responseBody,
      },
    });

    appendVideoScreeningLog(screening, logEntry);
    appendScreeningCandidateLog(row, logEntry);
    appendScreeningCandidateVideoLog(row, logEntry);
    row.error = null;
    row.video = {
      ...(row.video || {}),
      jobId: row.video?.jobId || row.providerRequestId || null,
      applicationId,
      invitationStatus:
        String(
          (data as { status?: string | null } | null)?.status ||
            (row.video?.invitationStatus || 'resent')
        ) || 'resent',
      invitationError: null,
      logs: row.video?.logs || [],
    };

    await row.save();
    await screening.save();
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
    return this.getResult(organizationId, id);
  },

  async getInterviewLink(organizationId: string, id: string) {
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');

    const screening = await loadScreening(organizationId, String(row.screeningId));
    if (screening.mode !== 'video') {
      throw new AppError(400, 'INVALID_MODE', 'Interview link is only available for video screenings.');
    }

    const applicationId = String(row.video?.applicationId || row.providerCallId || '').trim();
    if (!applicationId) {
      throw new AppError(400, 'APPLICATION_ID_MISSING', 'No Hyrefast application id found for this candidate.');
    }

    const { data, link, trace } = await getHyrefastInterviewLink(applicationId);
    const logEntry = hyrefastInterviewLinkLogEntry({
      candidateId: String(row.candidateId),
      request: {
        method: trace.method,
        url: trace.url,
        body: trace.requestBody,
      },
      response: {
        httpStatus: trace.httpStatus,
        body: trace.responseBody,
      },
    });

    appendVideoScreeningLog(screening, logEntry);
    appendScreeningCandidateLog(row, logEntry);
    appendScreeningCandidateVideoLog(row, logEntry);
    await row.save();
    await screening.save();
    return { link, data };
  },

  async retryInterviewInvite(organizationId: string, userId: string, id: string) {
    const row = await ScreeningCandidateModel.findOne({ _id: id, organizationId });
    if (!row) throw new AppError(404, 'RESULT_NOT_FOUND', 'Screening result not found.');

    const screening = await loadScreening(organizationId, String(row.screeningId));
    if (screening.mode !== 'video') {
      throw new AppError(400, 'INVALID_MODE', 'Retry invite is only available for video screenings.');
    }

    row.mode = 'video';
    row.providerCallId = null;
    row.video = {
      ...(row.video || {}),
      jobId: row.video?.jobId || screening.providerJobId || null,
      applicationId: null,
      invitationStatus: 'queued',
      invitationError: null,
      logs: row.video?.logs || [],
    };
    row.callStatus = 'queued';
    row.error = null;
    await row.save();

    const fresh = await loadScreening(organizationId, String(screening._id));
    await launchVideoScreening({
      organizationId,
      screeningId: String(fresh._id),
      doc: fresh,
      candidateIds: [String(row.candidateId)],
    });
    await refreshScreeningStats(String(fresh._id));

    const result = await this.getResult(organizationId, id);
    emitScreeningResultUpdated({
      organizationId,
      screeningId: String(row.screeningId),
      resultId: id,
      candidateId: String(row.candidateId),
      callStatus: result.callStatus,
      overallScore: result.overallScore,
      recommendation: result.recommendation,
      recruiterDecision: result.recruiterDecision,
    });
    return result;
  },

  /** Used by Huntlo 360 orchestration — creates screening + candidate rows (dial via facade). */
  async ensureWorkflowCandidate(input: {
    organizationId: string;
    workflowId: string;
    campaignId?: string | null;
    candidateId: string;
    enrollmentId?: string | null;
    ownerUserId?: string | null;
    name: string;
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
    minScore?: number;
  }) {
    const normalizedQuestions = normalizeWorkflowScreeningQuestions(input.questions);
    const derivedKnockouts = normalizedQuestions
      .map((q) => q.knockoutCondition)
      .filter((value): value is string => Boolean(value));
    const knockouts = [
      ...new Set([
        ...derivedKnockouts,
        ...(input.knockouts || []).map((k) => String(k || '').trim()).filter(Boolean),
      ]),
    ];
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
        language: input.language
          ? String(input.language).trim().toUpperCase()
          : getHunarVoiceLanguage(),
        voice: getHunarVoicePersona(),
        questions: normalizedQuestions,
        knockouts,
        callSettings: {
          maxAttempts: input.attempts,
          attemptIntervalHours: 24,
          maxRetryCount: Math.max(0, input.attempts - 1),
          retryIntervalHours: 6,
          consentRequired: true,
          callWindow: '10 AM – 7 PM',
          timezone: "Candidate's local timezone",
          voicemailBehaviour: 'Leave a short callback message',
        },
        candidateIds: [input.candidateId],
        status: 'draft',
        stats: defaultScreeningStats(),
      });
    } else {
      let dirty = false;
      if (input.language) {
        const normalized = String(input.language).trim().toUpperCase();
        if (screening.language !== normalized) {
          screening.language = normalized;
          dirty = true;
        }
      }
      if (JSON.stringify(screening.knockouts || []) !== JSON.stringify(knockouts)) {
        screening.knockouts = knockouts;
        dirty = true;
      }
      if (
        JSON.stringify(
          (screening.questions || []).map((q) => ({
            id: q.id,
            prompt: q.prompt,
            knockout: Boolean(q.knockout),
            knockoutCondition: q.knockoutCondition || null,
          }))
        ) !==
        JSON.stringify(
          normalizedQuestions.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            knockout: Boolean(q.knockout),
            knockoutCondition: q.knockoutCondition || null,
          }))
        )
      ) {
        screening.questions = normalizedQuestions;
        dirty = true;
      }
      if (dirty) await screening.save();
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
          mode: screening.mode === 'video' ? 'video' : 'voice',
          workflowId: input.workflowId,
          callStatus: 'queued',
          attempts: 0,
          recruiterDecision: 'pending',
          extractedVariables: {},
          scoreBreakdown: {},
          ...(screening.mode === 'video' ? { video: {} } : { audio: {}, video: {} }),
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
