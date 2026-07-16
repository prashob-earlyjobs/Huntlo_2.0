/**
 * Abstract assessment provider contract.
 * Swap mock ↔ external adapters without changing domain services.
 */

export type AssessmentInviteChannel = 'email' | 'whatsapp';

export type CreateAssessmentInput = {
  organizationId: string;
  templateId: string;
  name: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  sections: Array<{ id: string; title: string; questionCount?: number }>;
  skills: string[];
  passingScore: number;
  instructions?: string | null;
  metadata?: Record<string, unknown>;
};

export type CreateAssessmentResult = {
  providerAssessmentId: string;
  inviteBaseUrl?: string | null;
  raw?: unknown;
};

export type InviteCandidateInput = {
  organizationId: string;
  providerAssessmentId: string;
  campaignId: string;
  candidateId: string;
  candidateName: string;
  email?: string | null;
  phone?: string | null;
  channel: AssessmentInviteChannel;
  expiresAt: Date;
  message?: string | null;
  metadata?: Record<string, unknown>;
};

export type InviteCandidateResult = {
  providerAttemptId: string;
  inviteUrl?: string | null;
  invitedAt: Date;
  raw?: unknown;
};

export type GetAttemptResult = {
  providerAttemptId: string;
  status: 'invited' | 'started' | 'completed' | 'expired' | 'cancelled' | 'failed';
  startedAt?: Date | null;
  completedAt?: Date | null;
  score?: number | null;
  sectionScores?: Record<string, number>;
  result?: 'pass' | 'fail' | 'pending' | null;
  raw?: unknown;
};

export type ParsedAssessmentWebhook = {
  eventId: string;
  eventType: string;
  providerAssessmentId?: string | null;
  providerAttemptId?: string | null;
  status?: GetAttemptResult['status'] | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  score?: number | null;
  sectionScores?: Record<string, number>;
  result?: 'pass' | 'fail' | 'pending' | null;
  raw: unknown;
};

export type CancelAttemptInput = {
  organizationId: string;
  providerAssessmentId: string;
  providerAttemptId: string;
};

export interface AssessmentProvider {
  readonly id: string;
  createAssessment(input: CreateAssessmentInput): Promise<CreateAssessmentResult>;
  inviteCandidate(input: InviteCandidateInput): Promise<InviteCandidateResult>;
  getAttempt(providerAttemptId: string): Promise<GetAttemptResult | null>;
  parseWebhook(headers: Record<string, string | string[] | undefined>, body: unknown): ParsedAssessmentWebhook;
  cancelAttempt(input: CancelAttemptInput): Promise<void>;
}
