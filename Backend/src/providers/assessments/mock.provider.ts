import { randomUUID } from 'node:crypto';

import type {
  AssessmentProvider,
  CancelAttemptInput,
  CreateAssessmentInput,
  CreateAssessmentResult,
  GetAttemptResult,
  InviteCandidateInput,
  InviteCandidateResult,
  ParsedAssessmentWebhook,
} from './types.js';

type AttemptStore = {
  providerAssessmentId: string;
  status: GetAttemptResult['status'];
  startedAt: Date | null;
  completedAt: Date | null;
  score: number | null;
  sectionScores: Record<string, number>;
  result: 'pass' | 'fail' | 'pending' | null;
};

const assessments = new Map<string, { name: string }>();
const attempts = new Map<string, AttemptStore>();

/** In-memory mock provider for local development and tests. */
export const mockAssessmentProvider: AssessmentProvider = {
  id: 'mock',

  async createAssessment(input: CreateAssessmentInput): Promise<CreateAssessmentResult> {
    const providerAssessmentId = `mock-assessment-${randomUUID()}`;
    assessments.set(providerAssessmentId, { name: input.name });
    return {
      providerAssessmentId,
      inviteBaseUrl: `https://assessments.huntlo.local/a/${providerAssessmentId}`,
      raw: { provider: 'mock', created: true },
    };
  },

  async inviteCandidate(input: InviteCandidateInput): Promise<InviteCandidateResult> {
    const providerAttemptId = `mock-attempt-${randomUUID()}`;
    attempts.set(providerAttemptId, {
      providerAssessmentId: input.providerAssessmentId,
      status: 'invited',
      startedAt: null,
      completedAt: null,
      score: null,
      sectionScores: {},
      result: 'pending',
    });
    return {
      providerAttemptId,
      inviteUrl: `https://assessments.huntlo.local/a/${input.providerAssessmentId}/t/${providerAttemptId}`,
      invitedAt: new Date(),
      raw: {
        provider: 'mock',
        channel: input.channel,
        email: input.email,
        phone: input.phone,
      },
    };
  },

  async getAttempt(providerAttemptId: string): Promise<GetAttemptResult | null> {
    const row = attempts.get(providerAttemptId);
    if (!row) return null;
    return {
      providerAttemptId,
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      score: row.score,
      sectionScores: row.sectionScores,
      result: row.result,
      raw: row,
    };
  },

  parseWebhook(
    _headers: Record<string, string | string[] | undefined>,
    body: unknown
  ): ParsedAssessmentWebhook {
    const payload = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const eventType = String(payload.eventType || payload.event_type || 'attempt.updated');
    const statusRaw = String(payload.status || '').toLowerCase();
    const statusMap: Record<string, GetAttemptResult['status']> = {
      invited: 'invited',
      started: 'started',
      in_progress: 'started',
      completed: 'completed',
      expired: 'expired',
      cancelled: 'cancelled',
      failed: 'failed',
    };
    const score =
      typeof payload.score === 'number'
        ? payload.score
        : payload.score != null
          ? Number(payload.score)
          : null;
    const resultRaw = String(payload.result || '').toLowerCase();
    const result =
      resultRaw === 'pass' || resultRaw === 'fail' || resultRaw === 'pending'
        ? resultRaw
        : score != null
          ? score >= 70
            ? 'pass'
            : 'fail'
          : null;

    return {
      eventId: String(payload.eventId || payload.event_id || randomUUID()),
      eventType,
      providerAssessmentId: (payload.providerAssessmentId ||
        payload.assessment_id ||
        null) as string | null,
      providerAttemptId: (payload.providerAttemptId ||
        payload.attempt_id ||
        null) as string | null,
      status: statusMap[statusRaw] || null,
      startedAt: payload.startedAt ? new Date(String(payload.startedAt)) : null,
      completedAt: payload.completedAt ? new Date(String(payload.completedAt)) : null,
      score: Number.isFinite(score as number) ? (score as number) : null,
      sectionScores:
        payload.sectionScores && typeof payload.sectionScores === 'object'
          ? (payload.sectionScores as Record<string, number>)
          : {},
      result,
      raw: body,
    };
  },

  async cancelAttempt(input: CancelAttemptInput): Promise<void> {
    const row = attempts.get(input.providerAttemptId);
    if (row) {
      row.status = 'cancelled';
      attempts.set(input.providerAttemptId, row);
    }
  },
};

/** Test helper: mark an attempt completed with a score. */
export function mockCompleteAttempt(
  providerAttemptId: string,
  score: number,
  passingScore = 70
): void {
  const row = attempts.get(providerAttemptId);
  if (!row) return;
  row.status = 'completed';
  row.startedAt = row.startedAt || new Date(Date.now() - 60_000);
  row.completedAt = new Date();
  row.score = score;
  row.result = score >= passingScore ? 'pass' : 'fail';
  row.sectionScores = { overall: score };
  attempts.set(providerAttemptId, row);
}

export function clearMockAssessmentStore(): void {
  assessments.clear();
  attempts.clear();
}
