import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import type { z } from 'zod';

import { AppError } from '../../shared/errors/app-error.js';
import { quotaService } from '../../shared/usage/index.js';
import { escapeRegex } from '../../shared/validation/regex.js';
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
import { sendZyastraCallViaGateway } from '../../providers/zyastra/zyastra.gateway.js';
import { emitScreeningResultUpdated } from '../../realtime/events.js';
import {
  buildRoshniAgentPrompt,
  ROSHNI_INTRODUCTION,
} from '../voice/roshni-prompt.js';
import {
  isIndianE164,
  resolveIntroduction,
  resolveVoiceTokens,
  sanitizeHunarPromptText,
  seedPendingVoiceCalls,
  toHunarMobile,
} from '../voice/voice-dialer.service.js';
import {
  buildHcgHunarScreeningResultOverlay,
  findHcgHunarCommunicationByCampaignIds,
  hcgHunarCallStatusValue,
  overlayHcgVoiceOnScreeningResultList,
} from '../conversations/hcg-hunar-overlay.js';
import {
  findHcgZyvkaCommunicationByCampaignIds,
  hcgZyvkaCallStatusValue,
} from '../conversations/hcg-zyvka-overlay.js';
import { mapHunarCallStatus } from '../../providers/hunar/hunar.webhook.js';
import {
  createHyrefastApplication,
  createHyrefastJob,
  disableHyrefastConversationMode,
  enableHyrefastConversationMode,
  getHyrefastInterviewLink,
  listHyrefastResponses,
  publishHyrefastJob,
  sendHyrefastInterview,
  setHyrefastJobQuestions,
  setHyrefastJobSkills,
  setHyrefastJobTopics,
  type HyrefastQuestionItem,
  type HyrefastResponseItem,
  type HyrefastTopicItem,
} from '../../providers/hyrefast/hyrefast.client.js';
import { isHyrefastConfigured } from '../../providers/hyrefast/hyrefast.config.js';
import {
  evaluateVideoInterviewResponses,
  fingerprintVideoResponses,
  recommendationFromCommunicationScore,
} from '../../providers/gemini/gemini.screening-video.js';
import {
  ScreeningModel,
  defaultScreeningStats,
  type ScreeningDocument,
  type ScreeningVideoConfig,
} from './screening.model.js';
import {
  ScreeningCandidateModel,
  type ScreeningCandidateDocument,
} from './screening-candidate.model.js';
import { VoiceWebhookEventModel } from './voice-webhook-event.model.js';
import {
  mapEvaluationScores,
  minutesFromDuration,
  decisionFromAiRecommendation,
  deriveRecommendation,
} from './scoring.js';
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

function normalizeVideoProficiency(value: string | null | undefined): string {
  const raw = String(value || 'L3').trim().toUpperCase();
  if (raw === 'L1' || raw === 'L2') return 'L1';
  if (raw === 'L4' || raw === 'L5') return 'L5';
  return 'L3';
}

function mapVideoConfigInput(
  input: CreateInput['videoConfig'] | undefined
): ScreeningVideoConfig | null {
  if (!input) return null;
  return {
    mustHaveSkills: (input.mustHaveSkills || [])
      .map((skill) => ({
        skillName: String(skill.skillName || '').trim(),
        proficiency: normalizeVideoProficiency(skill.proficiency),
      }))
      .filter((skill) => skill.skillName),
    goodToHaveSkills: (input.goodToHaveSkills || [])
      .map((skill) => ({
        skillName: String(skill.skillName || '').trim(),
        proficiency: normalizeVideoProficiency(skill.proficiency),
      }))
      .filter((skill) => skill.skillName),
    bonusSkills: (input.bonusSkills || [])
      .map((skill) => ({
        skillName: String(skill.skillName || '').trim(),
        proficiency: normalizeVideoProficiency(skill.proficiency),
      }))
      .filter((skill) => skill.skillName),
    topicsFocus: (input.topicsFocus || [])
      .map((topic) => ({
        name: String(topic.name || '').trim(),
        discussionMinutes:
          typeof topic.discussionMinutes === 'number'
            ? topic.discussionMinutes
            : null,
        reason: topic.reason ? String(topic.reason).trim() : null,
        sampleQuestions: (topic.sampleQuestions || [])
          .map((q) => String(q || '').trim())
          .filter(Boolean),
      }))
      .filter((topic) => topic.name),
    topicsAvoid: (input.topicsAvoid || [])
      .map((topic) => String(topic || '').trim())
      .filter(Boolean),
    interviewStandard: input.interviewConversation === true ? false : true,
    interviewConversation: input.interviewConversation === true,
    hyrefastJobId: null,
  };
}

function toHyrefastSkills(
  skills: Array<{ skillName: string; proficiency: string }>
) {
  return skills.map((skill) => ({
    skill_name: skill.skillName,
    proficiency: normalizeVideoProficiency(skill.proficiency),
  }));
}

/** Hyrefast rejects publish unless the job has ≥1 must-have skill. */
function resolveHyrefastSkillsPayload(
  videoConfig: ScreeningVideoConfig,
  title: string
): {
  mustHave: ReturnType<typeof toHyrefastSkills>;
  goodToHave: ReturnType<typeof toHyrefastSkills>;
  bonus: ReturnType<typeof toHyrefastSkills>;
} {
  const mustHave = toHyrefastSkills(videoConfig.mustHaveSkills || []);
  const goodToHave = toHyrefastSkills(videoConfig.goodToHaveSkills || []);
  const bonus = toHyrefastSkills(videoConfig.bonusSkills || []);
  if (mustHave.length > 0) {
    return { mustHave, goodToHave, bonus };
  }
  const fallbackName = String(title || 'Role fit')
    .trim()
    .slice(0, 60) || 'Role fit';
  return {
    mustHave: [{ skill_name: fallbackName, proficiency: 'L3' }],
    goodToHave,
    bonus,
  };
}

function toHyrefastQuestions(
  videoConfig: ScreeningVideoConfig,
  title: string,
  screeningQuestions?: Array<{ prompt?: string | null } | null> | null
): HyrefastQuestionItem[] {
  const fromScreening = (screeningQuestions || [])
    .map((question, index) => {
      const text = String(question?.prompt || '').trim();
      if (!text) return null;
      return {
        title: text,
        question_type: 'video' as const,
        question_proficiency: 'L3',
        order: index + 1,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Standard mode: prefer recruiter-authored screening questions.
  if (videoConfig.interviewConversation !== true && fromScreening.length > 0) {
    return fromScreening.slice(0, 12);
  }

  const fromSamples: HyrefastQuestionItem[] = [];
  for (const topic of videoConfig.topicsFocus || []) {
    const topicName = String(topic.name || '').trim();
    for (const sample of topic.sampleQuestions || []) {
      const text = String(sample || '').trim();
      if (!text) continue;
      fromSamples.push({
        title: text,
        topic_name: topicName || undefined,
        question_type: 'video',
        question_proficiency: 'L3',
        order: fromSamples.length + 1,
      });
    }
  }
  if (fromSamples.length > 0) return fromSamples.slice(0, 8);

  const topicFallback = (videoConfig.topicsFocus || [])
    .map((topic) => String(topic.name || '').trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((topicName, index) => ({
      title: `Tell us about your experience with ${topicName}.`,
      topic_name: topicName,
      question_type: 'video',
      question_proficiency: 'L3',
      order: index + 1,
    }));
  if (topicFallback.length > 0) return topicFallback;

  if (fromScreening.length > 0) return fromScreening.slice(0, 12);

  return [
    {
      title: `Walk us through a recent project relevant to ${title}.`,
      topic_name: title,
      question_type: 'video',
      question_proficiency: 'L3',
      order: 1,
    },
    {
      title: 'Describe a challenging problem you solved and how you approached it.',
      question_type: 'video',
      question_proficiency: 'L3',
      order: 2,
    },
  ];
}

function toHyrefastTopics(
  videoConfig: ScreeningVideoConfig,
  title: string
): { topicsToFocus: HyrefastTopicItem[]; topicsToAvoid: string[] } {
  const topicsToFocus = (videoConfig.topicsFocus || [])
    .map((topic) => {
      const name = String(topic.name || '').trim();
      if (!name) return null;
      const minutes =
        typeof topic.discussionMinutes === 'number' &&
        topic.discussionMinutes >= 1 &&
        topic.discussionMinutes <= 60
          ? topic.discussionMinutes
          : 15;
      return {
        name,
        reason: String(topic.reason || '').trim() || undefined,
        discussionMinutes: minutes,
        sampleQuestions: (topic.sampleQuestions || [])
          .map((q) => String(q || '').trim())
          .filter(Boolean),
      };
    })
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));

  return {
    topicsToFocus: topicsToFocus.length
      ? topicsToFocus
      : [{ name: title || 'Role discussion', discussionMinutes: 15 }],
    topicsToAvoid: (videoConfig.topicsAvoid || [])
      .map((topic) => String(topic || '').trim())
      .filter(Boolean),
  };
}

async function syncHyrefastConversationMode(
  jobId: string,
  enabled: boolean
): Promise<void> {
  if (enabled) {
    await enableHyrefastConversationMode(jobId);
  } else {
    try {
      await disableHyrefastConversationMode(jobId);
    } catch {
      // Job may already be standard-only; ignore disable failures.
    }
  }
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
    description: doc.description,
    modality: doc.modality || 'voice',
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
    videoConfig: doc.videoConfig || null,
    candidateIds: doc.candidateIds,
    candidates: doc.stats.enrolled,
    completed: doc.stats.completed,
    averageScore: doc.stats.averageScore,
    shortlisted: doc.stats.shortlisted,
    totalAttempts: doc.stats.totalAttempts ?? 0,
    maxAttempts: doc.callSettings?.maxAttempts ?? 2,
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
  extras: {
    name: string;
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
    modality?: 'voice' | 'video';
    videoResponses?: HyrefastResponseItem[];
    interviewLink?: string | null;
    strengths?: string[];
    concerns?: string[];
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

  return {
    id: String(row._id),
    screeningId: String(row.screeningId),
    screeningName: extras.screeningName,
    candidateId: String(row.candidateId),
    name: extras.name,
    jobId: extras.jobId,
    jobTitle: extras.jobTitle ?? null,
    callStatus: row.callStatus,
    providerCallId: row.providerCallId,
    attempts: row.attempts,
    attemptsMax: extras.attemptsMax ?? null,
    durationSeconds: row.durationSeconds,
    transcript: row.transcript,
    recordingReference: row.recordingReference,
    summary: row.summary,
    overallAIStatus: null as string | null,
    overallAIDescription: null as string | null,
    answeredBy: null as string | null,
    strengths: extras.strengths || [],
    concerns: extras.concerns || [],
    keyAnswers: [] as Array<{ question: string; answer: string }>,
    hcgQuestions: [] as Array<{
      id: string;
      question: string;
      asked: boolean;
      answer: string;
      status: string;
      description: string;
    }>,
    extractedVariables: row.extractedVariables,
    scoreBreakdown: row.scoreBreakdown,
    overallScore: row.overallScore,
    recommendation: row.recommendation,
    decision: row.recruiterDecision,
    recruiterDecision: row.recruiterDecision,
    notes: row.notes,
    evaluationCriteria: extras.evaluationCriteria || [],
    questions: extras.questions || [],
    activity: extras.activity || [],
    modality: extras.modality || 'voice',
    videoResponses: extras.videoResponses || [],
    interviewLink: extras.interviewLink || null,
    completedAt: row.completedAt?.toISOString() ?? null,
    error: row.error,
    lastActivity: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    knockouts: configuredKnockouts,
    triggeredKnockouts,
    knockoutResults,
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

/** Pull call status / score / recommendation from HCG hunar or zyvka onto voice candidate rows. */
async function syncVoiceCandidatesFromHcg(
  screening: ScreeningDocument,
  rows: ScreeningCandidateDocument[]
): Promise<void> {
  if (rows.length === 0) return;

  const screeningId = String(screening._id);
  const minShortlistScore = screening.minShortlistScore ?? 70;
  const linkedCampaignId = screening.campaignId ? String(screening.campaignId) : '';

  const candidates = await SavedCandidateModel.find({
    _id: { $in: rows.map((row) => row.candidateId) },
  })
    .select('phone')
    .lean();
  const phones = new Map(
    candidates.map((c) => [String(c._id), String(c.phone || '').trim()])
  );

  const items = rows.map((row) => ({
    screeningId,
    candidateId: String(row.candidateId),
    modality: 'voice' as const,
    hcgCampaignIds: linkedCampaignId ? [linkedCampaignId] : [],
    callStatus: String(row.callStatus || 'queued'),
    overallScore: row.overallScore ?? null,
    recommendation: row.recommendation ?? null,
    overallAIStatus: null as string | null,
    overallAIDescription: null as string | null,
    summary: row.summary ?? null,
    durationSeconds: row.durationSeconds ?? null,
    answeredBy: null as string | null,
    completedAt: row.completedAt?.toISOString() ?? null,
    lastActivity: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  await overlayHcgVoiceOnScreeningResultList(
    items,
    phones,
    new Map([[screeningId, minShortlistScore]])
  );

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const item = items[i];
    if (!row || !item) continue;

    let dirty = false;
    if (item.callStatus && item.callStatus !== row.callStatus) {
      row.callStatus = item.callStatus as typeof row.callStatus;
      dirty = true;
    }
    if (item.overallScore != null && item.overallScore !== row.overallScore) {
      row.overallScore = item.overallScore;
      dirty = true;
    }
    if (item.recommendation && item.recommendation !== row.recommendation) {
      row.recommendation = item.recommendation;
      dirty = true;
    }
    if (
      item.durationSeconds != null &&
      item.durationSeconds > 0 &&
      item.durationSeconds !== row.durationSeconds
    ) {
      row.durationSeconds = item.durationSeconds;
      dirty = true;
    }
    if (item.summary && item.summary !== row.summary) {
      row.summary = item.summary;
      dirty = true;
    }
    if (item.completedAt) {
      const completedAt = new Date(item.completedAt);
      if (
        Number.isFinite(completedAt.getTime()) &&
        (!row.completedAt || row.completedAt.getTime() !== completedAt.getTime())
      ) {
        row.completedAt = completedAt;
        dirty = true;
      }
    }
    if (row.recruiterDecision === 'pending') {
      const autoDecision = decisionFromAiRecommendation(row.recommendation);
      if (autoDecision) {
        row.recruiterDecision = autoDecision;
        dirty = true;
      }
    }
    if (dirty) await row.save();
  }
}

export async function refreshScreeningStats(screeningId: string) {
  const screening = await ScreeningModel.findById(screeningId);
  if (!screening) return defaultScreeningStats();

  const rows = await ScreeningCandidateModel.find({ screeningId });
  if (String(screening.modality || 'voice') !== 'video') {
    await syncVoiceCandidatesFromHcg(screening, rows);
  }

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
    stats.totalAttempts += Math.max(0, Number(row.attempts) || 0);
    if (typeof row.overallScore === 'number') {
      scoreSum += row.overallScore;
      scoreCount += 1;
    }
  }
  stats.averageScore = scoreCount ? Math.round(scoreSum / scoreCount) : null;

  screening.stats = stats;
  screening.markModified('stats');

  // Auto-complete when every dialable contact is terminal and nothing is in-flight.
  if (screening.status === 'running' && rows.length > 0) {
    const open = rows.filter((r) =>
      ['queued', 'ringing', 'in_progress'].includes(String(r.callStatus || ''))
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

    const doc = await ScreeningModel.create({
      organizationId,
      ownerUserId,
      jobId: input.jobId || null,
      campaignId: input.campaignId || null,
      workflowId: input.workflowId || null,
      sourceModule: input.sourceModule || 'screening',
      name: input.name,
      description: input.description ?? null,
      objective: input.objective ?? null,
      modality: input.modality === 'video' ? 'video' : 'voice',
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
      videoConfig:
        input.modality === 'video' ? mapVideoConfigInput(input.videoConfig) : null,
      candidateIds: input.candidateIds || [],
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
    const doc = await loadScreening(organizationId, id);
    if (!['draft', 'paused'].includes(doc.status)) {
      throw new AppError(400, 'INVALID_STATUS', 'Only draft or paused screenings can be edited.');
    }

    if (input.name !== undefined) doc.name = input.name;
    if (input.ownerUserId !== undefined) {
      doc.ownerUserId = new mongoose.Types.ObjectId(
        await resolveOwnerUserId(organizationId, userId, input.ownerUserId)
      );
    }
    if (input.jobId !== undefined) doc.jobId = input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null;
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
    const isVideo = doc.modality === 'video';

    if (isVideo) {
      if (!isHyrefastConfigured()) {
        issues.push({
          id: 'provider_hyrefast',
          severity: 'error',
          code: 'HYREFAST_API_KEY_MISSING',
          message: 'Video screening requires HYREFAST_API_KEY on the server.',
        });
      }

      const wantsConversation = doc.videoConfig?.interviewConversation === true;
      if (wantsConversation) {
        const mustHave = doc.videoConfig?.mustHaveSkills || [];
        if (!mustHave.some((skill) => skill.skillName?.trim())) {
          issues.push({
            id: 'skills',
            severity: 'error',
            code: 'VIDEO_SKILLS_REQUIRED',
            message: 'Add at least one must-have skill for Conversation mode.',
          });
        }
        if (!(doc.videoConfig?.topicsFocus || []).some((t) => t.name?.trim())) {
          issues.push({
            id: 'topics',
            severity: 'error',
            code: 'VIDEO_TOPICS_REQUIRED',
            message: 'Add at least one focus topic for Conversation mode.',
          });
        }
      } else if (
        !(doc.questions || []).some((question) => String(question.prompt || '').trim())
      ) {
        issues.push({
          id: 'questions',
          severity: 'error',
          code: 'VIDEO_QUESTIONS_REQUIRED',
          message: 'Add at least one interview question for Standard mode.',
        });
      }

      if (
        !doc.videoConfig?.interviewStandard &&
        !doc.videoConfig?.interviewConversation
      ) {
        issues.push({
          id: 'interview_mode',
          severity: 'error',
          code: 'VIDEO_MODE_REQUIRED',
          message: 'Select standard or conversation interview mode.',
        });
      }
      if (
        doc.videoConfig?.interviewStandard &&
        doc.videoConfig?.interviewConversation
      ) {
        issues.push({
          id: 'interview_mode',
          severity: 'error',
          code: 'VIDEO_MODE_EXCLUSIVE',
          message: 'Choose only one interview mode: Standard or Conversation.',
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
      const withEmail = pool.filter((c) => String(c.email || '').trim()).length;
      const withPhone = pool.filter((c) => String(c.phone || '').trim()).length;
      if (candidates.length > 0 && withEmail === 0) {
        issues.push({
          id: 'contacts',
          severity: 'error',
          code: 'NO_EMAIL_CONTACTS',
          message: 'No candidates have an email for video interview invites.',
        });
      }
      if (candidates.length > 0 && withPhone === 0) {
        issues.push({
          id: 'contacts_phone',
          severity: 'error',
          code: 'NO_PHONE_CONTACTS',
          message: 'Video invites require a phone number on each candidate (provider requirement).',
        });
      }

      const ok = !issues.some((i) => i.severity === 'error');
      doc.lastValidation = { ok, checkedAt: new Date(), issues };
      await doc.save();
      return { ok, issues };
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

    let hasIndian = false;
    for (const candidate of pool) {
      const mobile = toHunarMobile(String(candidate.phone || ''));
      if (!mobile) continue;
      if (isIndianE164(mobile)) hasIndian = true;
    }
    if (hasIndian && !isHunarConfigured()) {
      issues.push({
        id: 'provider_hunar',
        severity: 'error',
        code: 'HUNAR_API_KEY_MISSING',
        message: 'Indian (+91) numbers require Hunar. Set HUNAR_VOICE_API_KEY.',
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
    options?: { candidateIds?: string[] }
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
      throw new AppError(400, 'LAUNCH_VALIDATION_FAILED', 'Screening failed launch validation.', {
        meta: { issues: validation.issues },
      });
    }

    if (doc.modality === 'video') {
      return this.launchVideo(organizationId, userId, id, options);
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
      // Already placed a Hunar/Zyvka dial while still awaiting webhook — skip.
      if (
        row.callStatus === 'queued' &&
        (Boolean(row.providerRequestId) || Number(row.attempts || 0) > 0)
      ) {
        continue;
      }
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

    // One phone → one dial. Prefer the first selected candidateId when several share a number.
    if (candidateIds.length > 0) {
      const rank = new Map(candidateIds.map((id, index) => [id, index]));
      launchCallees.sort(
        (left, right) =>
          (rank.get(left.candidateId) ?? Number.MAX_SAFE_INTEGER) -
          (rank.get(right.candidateId) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    // Phones already dialed on this screening batch (other candidate rows).
    const priorDialedRows = await ScreeningCandidateModel.find({
      screeningId: id,
      candidateId: { $nin: launchCallees.map((c) => c.row.candidateId) },
      $or: [
        { providerRequestId: { $nin: [null, ''] } },
        { attempts: { $gt: 0 } },
        {
          callStatus: {
            $in: [
              'ringing',
              'in_progress',
              'completed',
              'no_answer',
              'failed',
              'busy',
              'voicemail',
              'cancelled',
            ],
          },
        },
      ],
    })
      .select('candidateId')
      .lean();
    const priorCandidates = priorDialedRows.length
      ? await SavedCandidateModel.find({
          _id: { $in: priorDialedRows.map((row) => row.candidateId) },
          organizationId,
        })
          .select('phone')
          .lean()
      : [];
    const priorPhones = new Set(
      priorCandidates
        .map((candidate) => {
          const mobile = toHunarMobile(String(candidate.phone || ''));
          if (!mobile) return '';
          const digits = mobile.replace(/\D/g, '');
          return digits.length > 10 ? digits.slice(-10) : digits;
        })
        .filter(Boolean)
    );

    const uniqueCallees: LaunchCallee[] = [];
    const duplicatePhoneCallees: LaunchCallee[] = [];
    const seenPhones = new Set<string>(priorPhones);
    for (const callee of launchCallees) {
      const key =
        callee.mobileDigits.length > 10
          ? callee.mobileDigits.slice(-10)
          : callee.mobileDigits;
      if (!key || seenPhones.has(key)) {
        duplicatePhoneCallees.push(callee);
        continue;
      }
      seenPhones.add(key);
      uniqueCallees.push(callee);
    }
    for (const duplicate of duplicatePhoneCallees) {
      duplicate.row.callStatus = 'cancelled';
      duplicate.row.error =
        'Skipped — another candidate with the same phone number was already dialed (or selected) for this screening.';
      await duplicate.row.save();
    }

    if (!uniqueCallees.length) {
      // All candidates already dialed (or no phones) — treat as success for re-launches.
      if (rows.length > 0) {
        doc.status = 'running';
        doc.launchedAt = doc.launchedAt || new Date();
        await doc.save();
        return toDisplay(doc, {
          ownerName: await ownerName(String(doc.ownerUserId)),
          jobTitle: await jobTitle(doc.jobId),
        });
      }
      throw new AppError(400, 'VOICE_NO_VALID_PHONES', 'No candidates have a valid phone number.');
    }

    const indianCallees = uniqueCallees.filter((c) => c.indian);
    const internationalCallees = uniqueCallees.filter((c) => !c.indian);

    if (indianCallees.length > 0 && !isHunarConfigured()) {
      throw new AppError(
        503,
        'HUNAR_API_KEY_MISSING',
        'Hunar voice API key is not configured. Set HUNAR_VOICE_API_KEY.'
      );
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
    for (const callee of uniqueCallees) {
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
        questions: doc.questions || [],
      });
      lastLaunchRequestId = bulk.requestId || lastLaunchRequestId;
      for (const callee of indianCallees) {
        callee.row.providerRequestId = bulk.requestId;
        callee.row.callStatus = 'ringing';
        await callee.row.save();
      }
    }

    if (internationalCallees.length > 0) {
      const firstMessage =
        String(introduction || '').trim() || 'Hello, am I speaking with {callee_name}?';
      const data = internationalCallees.map((callee) => {
        const personalFirstMessage = firstMessage.includes('{callee_name}')
          ? firstMessage.replace(/\{callee_name\}/g, callee.name || 'Candidate')
          : firstMessage;
        return {
          callee_name: callee.name || 'Candidate',
          mobile_number: callee.mobile,
          custom_data: {
            firstMessage: personalFirstMessage,
            preferredLanguage: 'en-US',
            candidateId: callee.candidateId,
          },
        };
      });
      const bulk = await sendZyastraCallViaGateway({
        campaignId: id,
        prompt: agentPrompt,
        data,
        questions: doc.questions || [],
      });
      const zyastraRequestId = bulk.requestId || batchRequestId;
      if (!indianCallees.length) lastLaunchRequestId = zyastraRequestId;

      for (const callee of internationalCallees) {
        callee.row.providerRequestId = zyastraRequestId;
        callee.row.callStatus = 'ringing';
        await callee.row.save();
        await seedPendingVoiceCalls({
          organizationId,
          source: 'screening',
          screeningId: id,
          requestId: zyastraRequestId,
          agentId: null,
          provider: 'zyastra',
          contacts: [
            {
              candidateId: callee.candidateId,
              name: callee.name,
              phone: callee.mobile,
              mobileDigits: callee.mobileDigits,
            },
          ],
          maxRetries: 0,
          status: 'queued',
        });
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

  async launchVideo(
    organizationId: string,
    _userId: string,
    id: string,
    options?: { candidateIds?: string[] }
  ) {
    const doc = await loadScreening(organizationId, id);
    if (!isHyrefastConfigured()) {
      throw new AppError(
        400,
        'HYREFAST_API_KEY_MISSING',
        'Video screening requires HYREFAST_API_KEY on the server.'
      );
    }

    const videoConfig = doc.videoConfig;
    if (!videoConfig) {
      throw new AppError(
        400,
        'VIDEO_CONFIG_REQUIRED',
        'Video screening configuration is missing.'
      );
    }

    const wantsConversation = videoConfig.interviewConversation === true;
    if (wantsConversation) {
      if (!videoConfig.mustHaveSkills?.some((skill) => skill.skillName?.trim())) {
        throw new AppError(
          400,
          'VIDEO_SKILLS_REQUIRED',
          'Add at least one must-have skill before launching Conversation mode.'
        );
      }
      if (!(videoConfig.topicsFocus || []).some((t) => t.name?.trim())) {
        throw new AppError(
          400,
          'VIDEO_TOPICS_REQUIRED',
          'Add at least one focus topic before enabling Conversation mode.'
        );
      }
    } else if (
      !(doc.questions || []).some((question) => String(question.prompt || '').trim())
    ) {
      throw new AppError(
        400,
        'VIDEO_QUESTIONS_REQUIRED',
        'Add at least one interview question before launching Standard mode.'
      );
    }

    const title =
      (await jobTitle(doc.jobId)) ||
      doc.name ||
      'Video screening role';

    let hyrefastJobId = String(videoConfig.hyrefastJobId || '').trim();
    const hyrefastQuestions = toHyrefastQuestions(
      videoConfig,
      title,
      doc.questions || []
    );
    const hyrefastSkills = resolveHyrefastSkillsPayload(videoConfig, title);

    if (!hyrefastJobId) {
      try {
        const created = await createHyrefastJob({ title });
        hyrefastJobId = created.id;
        // Required by Hyrefast publish for both Standard and Conversation.
        await setHyrefastJobSkills(hyrefastJobId, hyrefastSkills);

        // Topics must be saved before conversation-mode/enable (Hyrefast eligibility).
        await setHyrefastJobTopics(
          hyrefastJobId,
          toHyrefastTopics(videoConfig, title)
        );

        // Hyrefast rejects interview invites unless the job has at least one question.
        await setHyrefastJobQuestions(hyrefastJobId, hyrefastQuestions);

        await publishHyrefastJob(hyrefastJobId);
        await syncHyrefastConversationMode(hyrefastJobId, wantsConversation);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Hyrefast job setup failed.';
        throw new AppError(502, 'HYREFAST_SETUP_FAILED', message);
      }

      doc.videoConfig = {
        ...videoConfig,
        hyrefastJobId,
      };
    } else {
      // Re-sync topics/questions/mode for jobs created earlier or relaunched.
      try {
        await setHyrefastJobSkills(hyrefastJobId, hyrefastSkills);
        await setHyrefastJobTopics(
          hyrefastJobId,
          toHyrefastTopics(videoConfig, title)
        );
        await setHyrefastJobQuestions(hyrefastJobId, hyrefastQuestions);
        await syncHyrefastConversationMode(hyrefastJobId, wantsConversation);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Hyrefast job update failed.';
        throw new AppError(502, 'HYREFAST_SETUP_FAILED', message);
      }
    }

    const rows = await ScreeningCandidateModel.find({
      screeningId: id,
      ...(options?.candidateIds?.length
        ? { candidateId: { $in: options.candidateIds } }
        : {}),
      callStatus: { $in: ['queued', 'failed', 'no_answer', 'busy', 'cancelled'] },
    });

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((row) => row.candidateId) },
      organizationId,
    }).lean();
    const byId = new Map(candidates.map((c) => [String(c._id), c]));

    let attempted = 0;
    for (const row of rows) {
      const candidate = byId.get(String(row.candidateId));
      if (!candidate) continue;
      attempted += 1;
      const email = String(candidate.email || '').trim();
      const phone =
        toHunarMobile(String(candidate.phone || '')) ||
        String(candidate.phone || '').trim();
      const name = String(candidate.name || 'Candidate').trim() || 'Candidate';
      if (!email || !phone) {
        row.callStatus = 'failed';
        row.error = !email
          ? 'Missing email for video invite'
          : 'Missing phone for video invite';
        await row.save();
        continue;
      }

      try {
        const existingAppId = String(
          (row.extractedVariables as { hyrefastApplicationId?: string } | null)
            ?.hyrefastApplicationId ||
            row.providerRequestId ||
            ''
        ).trim();

        let applicationId = existingAppId;
        let interviewLink = String(
          (row.extractedVariables as { interviewLink?: string } | null)
            ?.interviewLink || ''
        ).trim();

        if (!applicationId) {
          const application = await createHyrefastApplication({
            jobId: hyrefastJobId,
            email,
            name,
            number: phone,
          });
          applicationId = application.id;
          interviewLink =
            application.interviewLink ||
            (await getHyrefastInterviewLink(application.id)).interviewLink;
        } else if (!interviewLink) {
          interviewLink = (
            await getHyrefastInterviewLink(applicationId)
          ).interviewLink;
        }

        // interview-link only returns the URL; send-interview triggers Hyrefast email.
        const sent = await sendHyrefastInterview(applicationId);
        row.providerRequestId = applicationId;
        row.providerCallId = hyrefastJobId;
        // Awaiting candidate to open/complete the video interview (not dialing).
        row.callStatus = 'ringing';
        row.providerStatus = sent.status || 'interview_invite_sent';
        row.error = null;
        row.extractedVariables = {
          ...(row.extractedVariables || {}),
          interviewLink,
          hyrefastApplicationId: applicationId,
          hyrefastJobId,
          ...(sent.interviewId ? { hyrefastInterviewId: sent.interviewId } : {}),
        };
        await row.save();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Hyrefast invite failed';
        row.callStatus = 'failed';
        row.error = message;
        await row.save();
      }
    }

    if (attempted === 0) {
      throw new AppError(
        400,
        'VIDEO_NO_CANDIDATES',
        'No candidates were eligible to invite for this video screening.'
      );
    }

    // Persist Hyrefast job + running status even when some/all invites fail —
    // per-candidate errors are stored on screening candidates for the UI.
    doc.videoConfig = {
      ...(doc.videoConfig || videoConfig),
      hyrefastJobId,
    };
    doc.status = 'running';
    doc.launchedAt = doc.launchedAt || new Date();
    doc.pausedAt = null;
    doc.lastLaunchRequestId = hyrefastJobId;
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
    const screening = await ScreeningModel.findById(id).select('name jobId knockouts').lean();

    return {
      items: rows.map((row) =>
        toResultDisplay(row, {
          name: names.get(String(row.candidateId)) || 'Unknown',
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
    if (query.screeningId) filter.screeningId = query.screeningId;
    if (query.decision?.length === 1) {
      filter.recruiterDecision = query.decision[0];
    } else if (query.decision && query.decision.length > 1) {
      filter.recruiterDecision = { $in: query.decision };
    }
    if (query.recommendation?.length) {
      const recommendations = new Set(query.recommendation);
      if (recommendations.has('review')) recommendations.add('needs_review');
      const values = [...recommendations];
      filter.recommendation =
        values.length === 1 ? values[0] : { $in: values };
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
      const matched = await SavedCandidateModel.find({
        organizationId,
        name: { $regex: escapeRegex(query.q), $options: 'i' },
      })
        .select('_id')
        .lean();
      filter.candidateId = { $in: matched.map((c) => c._id) };
    }

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await Promise.all([
      ScreeningCandidateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      ScreeningCandidateModel.countDocuments(filter),
    ]);
    await applyPendingAiDecisions(rows);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: rows.map((r) => r.candidateId) },
    })
      .select('name phone')
      .lean();
    const screenings = await ScreeningModel.find({
      _id: { $in: rows.map((r) => r.screeningId) },
    })
      .select('name jobId knockouts modality minShortlistScore campaignId')
      .lean();
    const names = new Map(candidates.map((c) => [String(c._id), c.name]));
    const phones = new Map(
      candidates.map((c) => [String(c._id), String(c.phone || '').trim()])
    );
    const screeningMap = new Map(screenings.map((s) => [String(s._id), s]));
    const minScoreByScreeningId = new Map(
      screenings.map((s) => [String(s._id), s.minShortlistScore ?? 70])
    );

    // Video: keep recommendation aligned with communication score (>= threshold → shortlist).
    for (const row of rows) {
      const screening = screeningMap.get(String(row.screeningId));
      if (String(screening?.modality || '') !== 'video') continue;
      if (typeof row.overallScore !== 'number') continue;
      const expected = recommendationFromCommunicationScore(
        row.overallScore,
        screening?.minShortlistScore ?? 70
      );
      if (row.recommendation === expected) continue;
      row.recommendation = expected;
      const autoDecision = decisionFromAiRecommendation(expected);
      if (autoDecision && row.recruiterDecision === 'pending') {
        row.recruiterDecision = autoDecision;
      }
      await row.save();
    }

    const items = rows.map((row) => {
      const screening = screeningMap.get(String(row.screeningId));
      const linkedCampaignId = screening?.campaignId ? String(screening.campaignId) : '';
      return {
        ...toResultDisplay(row, {
          name: names.get(String(row.candidateId)) || 'Unknown',
          jobId: screening?.jobId ? String(screening.jobId) : null,
          screeningName: screening?.name || '',
          knockouts: screening?.knockouts || [],
          modality: String(screening?.modality || '') === 'video' ? 'video' : 'voice',
        }),
        hcgCampaignIds: linkedCampaignId ? [linkedCampaignId] : [],
      };
    });

    // Voice list: prefer HCG hunar / zyvka for status, score, recommendation, dates.
    await overlayHcgVoiceOnScreeningResultList(items, phones, minScoreByScreeningId);

    return {
      items: items.map(({ hcgCampaignIds: _hcgCampaignIds, ...item }) => item),
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
      .select('name phone')
      .lean();
    const screening = await ScreeningModel.findById(row.screeningId)
      .select(
        'name jobId knockouts evaluationCriteria questions callSettings modality minShortlistScore'
      )
      .lean();
    const linkedJobTitle = screening?.jobId ? await jobTitle(screening.jobId) : null;
    const activity = await buildResultActivity(row);
    const modality =
      String(screening?.modality || '').trim() === 'video' ? 'video' : 'voice';

    let videoResponses: HyrefastResponseItem[] = [];
    let interviewLink =
      String(
        (row.extractedVariables as { interviewLink?: string } | null)?.interviewLink ||
          ''
      ).trim() || null;
    const applicationId = String(
      (row.extractedVariables as { hyrefastApplicationId?: string } | null)
        ?.hyrefastApplicationId ||
        row.providerRequestId ||
        ''
    ).trim();

    if (modality === 'video' && applicationId && isHyrefastConfigured()) {
      try {
        const listed = await listHyrefastResponses(applicationId);
        videoResponses = listed.items;
      } catch {
        // Best-effort — result page still loads without Hyrefast responses.
        videoResponses = [];
      }
    }

    const videoKeyAnswers = videoResponses
      .filter((item) => !item.isSkipped)
      .map((item) => ({
        question: item.questionText || `Question ${item.questionNumber}`,
        answer:
          item.transcriptionText ||
          item.responseText ||
          (item.transcriptionStatus === 'processing'
            ? 'Transcription in progress…'
            : item.transcriptionStatus
              ? `Transcription: ${item.transcriptionStatus}`
              : '—'),
      }));
    const videoDurationSeconds = videoResponses.reduce((sum, item) => {
      return sum + (typeof item.responseDuration === 'number' ? item.responseDuration : 0);
    }, 0);
    const firstVideoUrl =
      videoResponses.find((item) => item.videoUrl)?.videoUrl ||
      videoResponses.find((item) => item.audioUrl)?.audioUrl ||
      null;
    const transcriptFromVideo =
      videoResponses.length > 0
        ? videoResponses
            .map((item) => {
              const answer =
                item.transcriptionText || item.responseText || '';
              if (!answer && !item.questionText) return '';
              return `Q${item.questionNumber}: ${item.questionText}\nA: ${answer || '(no transcript yet)'}`;
            })
            .filter(Boolean)
            .join('\n\n')
        : null;

    let videoStrengths: string[] = Array.isArray(
      (row.extractedVariables as { strengths?: unknown } | null)?.strengths
    )
      ? ((row.extractedVariables as { strengths: string[] }).strengths || [])
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [];
    let videoConcerns: string[] = Array.isArray(
      (row.extractedVariables as { concerns?: unknown } | null)?.concerns
    )
      ? ((row.extractedVariables as { concerns: string[] }).concerns || [])
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [];

    if (modality === 'video' && videoResponses.length > 0) {
      const fingerprint = fingerprintVideoResponses(videoResponses);
      const priorFingerprint = String(
        (row.extractedVariables as { hyrefastEvalFingerprint?: string } | null)
          ?.hyrefastEvalFingerprint || ''
      ).trim();
      const needsEval =
        fingerprint !== priorFingerprint ||
        row.overallScore == null ||
        videoStrengths.length === 0;

      if (needsEval) {
        try {
          const evaluation = await evaluateVideoInterviewResponses({
            candidateName: candidate?.name || 'Unknown',
            jobTitle: linkedJobTitle,
            screeningName: screening?.name || '',
            minShortlistScore: screening?.minShortlistScore ?? 70,
            responses: videoResponses,
          });
          if (evaluation) {
            row.overallScore = evaluation.overallScore;
            row.scoreBreakdown = {
              ...(row.scoreBreakdown || {}),
              communication: evaluation.communication,
            };
            row.recommendation = evaluation.recommendation;
            row.summary = evaluation.summary;
            videoStrengths = evaluation.strengths;
            videoConcerns = evaluation.concerns;
            row.extractedVariables = {
              ...(row.extractedVariables || {}),
              strengths: evaluation.strengths,
              concerns: evaluation.concerns,
              summary: evaluation.summary,
              communication: evaluation.communication,
              hyrefastEvalFingerprint: evaluation.fingerprint,
              hyrefastEvalModel: evaluation.model,
            };
            if (row.callStatus !== 'completed' && videoResponses.some((r) => r.transcriptionText)) {
              row.callStatus = 'completed';
              row.completedAt = row.completedAt || new Date();
              row.providerStatus = row.providerStatus || 'interview_evaluated';
            }
            const autoDecision = decisionFromAiRecommendation(evaluation.recommendation);
            if (autoDecision && row.recruiterDecision === 'pending') {
              row.recruiterDecision = autoDecision;
            }
            await row.save();
            await refreshScreeningStats(String(row.screeningId));
          }
        } catch {
          // Scoring is best-effort; still return responses.
        }
      } else if (typeof row.overallScore === 'number') {
        // Reconcile legacy Gemini recommendations that ignored the score threshold.
        const expected = recommendationFromCommunicationScore(
          row.overallScore,
          screening?.minShortlistScore ?? 70
        );
        if (row.recommendation !== expected) {
          row.recommendation = expected;
          const autoDecision = decisionFromAiRecommendation(expected);
          if (autoDecision && row.recruiterDecision === 'pending') {
            row.recruiterDecision = autoDecision;
          }
          await row.save();
          await refreshScreeningStats(String(row.screeningId));
        }
      }
    }

    const display = toResultDisplay(row, {
      name: candidate?.name || 'Unknown',
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
      modality,
      videoResponses,
      interviewLink,
      strengths: videoStrengths,
      concerns: videoConcerns,
    });

    if (modality === 'video') {
      if (videoKeyAnswers.length > 0) display.keyAnswers = videoKeyAnswers;
      if (transcriptFromVideo) display.transcript = transcriptFromVideo;
      if (firstVideoUrl && !display.recordingReference) {
        display.recordingReference = firstVideoUrl;
      }
      if (
        videoDurationSeconds > 0 &&
        (display.durationSeconds == null || display.durationSeconds <= 0)
      ) {
        display.durationSeconds = Math.round(videoDurationSeconds);
      }
      if (row.summary) display.summary = row.summary;
    }

    // Prefer gateway Hunar/Zyvka fields on the result detail UI when present.
    const hcg =
      (await findHcgHunarCommunicationByCampaignIds(
        [String(row.screeningId)],
        candidate?.phone
      )) ||
      (modality === 'voice'
        ? await findHcgZyvkaCommunicationByCampaignIds(
            [String(row.screeningId)],
            candidate?.phone
          )
        : null);
    if (hcg) {
      const overlay = buildHcgHunarScreeningResultOverlay(hcg as never);
      const statusValue =
        hcgHunarCallStatusValue(hcg as never) || hcgZyvkaCallStatusValue(hcg as never);
      if (statusValue) {
        display.callStatus = mapHunarCallStatus(
          statusValue,
          overlay.answeredBy || undefined
        ) as typeof display.callStatus;
      }
      if (overlay.overallAIStatus) display.overallAIStatus = overlay.overallAIStatus;
      if (overlay.overallAIDescription) {
        display.overallAIDescription = overlay.overallAIDescription;
      }
      if (overlay.summary) display.summary = overlay.summary;
      if (overlay.overallScore != null) {
        display.overallScore = overlay.overallScore;
        const expected = deriveRecommendation(
          null,
          overlay.overallScore,
          screening?.minShortlistScore ?? 70
        );
        if (expected) display.recommendation = expected;
      }
      if (
        overlay.durationSeconds != null &&
        (display.durationSeconds == null || display.durationSeconds <= 0)
      ) {
        display.durationSeconds = overlay.durationSeconds;
      }
      if (overlay.recordingReference && !display.recordingReference) {
        display.recordingReference = overlay.recordingReference;
      }
      if (overlay.answeredBy) display.answeredBy = overlay.answeredBy;
      if (overlay.hcgQuestions.length > 0) display.hcgQuestions = overlay.hcgQuestions;
      if (overlay.strengths.length > 0) display.strengths = overlay.strengths;
      if (overlay.concerns.length > 0) display.concerns = overlay.concerns;
      if (overlay.keyAnswers.length > 0) display.keyAnswers = overlay.keyAnswers;
      if (Object.keys(overlay.extractedVariables).length > 0) {
        display.extractedVariables = {
          ...(display.extractedVariables && typeof display.extractedVariables === 'object'
            ? display.extractedVariables
            : {}),
          ...overlay.extractedVariables,
        };
      }
      if (overlay.triggeredKnockouts.length > 0) {
        display.triggeredKnockouts = [
          ...new Set([...(display.triggeredKnockouts || []), ...overlay.triggeredKnockouts]),
        ];
        display.knockoutResults = buildKnockoutResults(
          display.knockouts || [],
          display.triggeredKnockouts
        );
      }
    }

    return display;
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
      row.error = null;
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
      if (['running', 'paused', 'draft'].includes(screening.status)) {
        await this.launch(organizationId, userId, String(screening._id), {
          candidateIds: [String(row.candidateId)],
        });
      }
    }

    return this.getResult(organizationId, id);
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

  /** Used by Huntlo 360 orchestration — creates screening + candidate rows (dial via facade). */
  async ensureWorkflowCandidate(input: {
    organizationId: string;
    workflowId: string;
    campaignId?: string | null;
    jobId?: string | null;
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
    const screeningName = String(input.name || '').trim() || 'AI screening';
    const jobObjectId =
      input.jobId && mongoose.Types.ObjectId.isValid(input.jobId)
        ? new mongoose.Types.ObjectId(input.jobId)
        : null;

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
        jobId: jobObjectId,
        sourceModule: 'huntlo360',
        name: screeningName,
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
      // Upgrade legacy "Huntlo 360 screening · <workflowId>" names + missing job link.
      const legacyName =
        /^Huntlo 360 screening · /i.test(String(screening.name || '')) ||
        String(screening.name || '').includes(String(input.workflowId));
      if (legacyName && screening.name !== screeningName) {
        screening.name = screeningName;
        dirty = true;
      }
      if (jobObjectId && (!screening.jobId || String(screening.jobId) !== String(jobObjectId))) {
        screening.jobId = jobObjectId;
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
