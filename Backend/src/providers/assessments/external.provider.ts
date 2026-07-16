import { AppError } from '../../shared/errors/app-error.js';
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

/**
 * Placeholder adapter for an external assessment vendor.
 * Wire real HTTP calls here once provider documentation is uploaded.
 */
export const externalAssessmentProvider: AssessmentProvider = {
  id: 'external',

  async createAssessment(_input: CreateAssessmentInput): Promise<CreateAssessmentResult> {
    throw new AppError(
      501,
      'ASSESSMENT_PROVIDER_NOT_CONFIGURED',
      'External assessment provider adapter is not configured. Upload provider docs or use the mock provider.'
    );
  },

  async inviteCandidate(_input: InviteCandidateInput): Promise<InviteCandidateResult> {
    throw new AppError(
      501,
      'ASSESSMENT_PROVIDER_NOT_CONFIGURED',
      'External assessment provider adapter is not configured.'
    );
  },

  async getAttempt(_providerAttemptId: string): Promise<GetAttemptResult | null> {
    throw new AppError(
      501,
      'ASSESSMENT_PROVIDER_NOT_CONFIGURED',
      'External assessment provider adapter is not configured.'
    );
  },

  parseWebhook(
    _headers: Record<string, string | string[] | undefined>,
    body: unknown
  ): ParsedAssessmentWebhook {
    const payload = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    return {
      eventId: String(payload.eventId || payload.id || `external-${Date.now()}`),
      eventType: String(payload.eventType || payload.type || 'unknown'),
      providerAssessmentId: (payload.providerAssessmentId ||
        payload.assessmentId ||
        null) as string | null,
      providerAttemptId: (payload.providerAttemptId ||
        payload.attemptId ||
        null) as string | null,
      status: null,
      startedAt: null,
      completedAt: null,
      score: null,
      sectionScores: {},
      result: null,
      raw: body,
    };
  },

  async cancelAttempt(_input: CancelAttemptInput): Promise<void> {
    throw new AppError(
      501,
      'ASSESSMENT_PROVIDER_NOT_CONFIGURED',
      'External assessment provider adapter is not configured.'
    );
  },
};
