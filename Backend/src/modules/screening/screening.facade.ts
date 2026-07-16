/**
 * Huntlo 360 orchestration facade over Screening / ScreeningCandidate.
 * Does not dial Hunar — full launch lives in screeningService.
 */
import { screeningService } from './screening.service.js';
import { ScreeningCandidateModel } from './screening-candidate.model.js';

export const ScreeningSessionModel = ScreeningCandidateModel;

export const screeningFacade = {
  async createSession(input: {
    organizationId: string;
    workflowId: string;
    campaignId?: string | null;
    candidateId: string;
    enrollmentId?: string | null;
    ownerUserId?: string | null;
    minScore: number;
    language?: string | null;
    questions: string[];
    attempts: number;
  }) {
    const { candidate } = await screeningService.ensureWorkflowCandidate({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      campaignId: input.campaignId,
      candidateId: input.candidateId,
      enrollmentId: input.enrollmentId,
      ownerUserId: input.ownerUserId,
      name: `Huntlo 360 screening · ${input.workflowId}`,
      language: input.language,
      questions: input.questions,
      attempts: input.attempts,
      minScore: input.minScore,
    });
    return candidate;
  },

  async completeSession(
    sessionId: string,
    input: { score: number; summary?: string; passed?: boolean }
  ) {
    const session = await ScreeningCandidateModel.findById(sessionId);
    if (!session) return null;
    session.overallScore = input.score;
    session.attempts = Math.max(session.attempts, 1);
    session.summary = input.summary || null;
    session.completedAt = new Date();
    const passed = input.passed ?? input.score >= 70;
    session.callStatus = passed ? 'completed' : 'failed';
    session.recommendation = passed ? 'shortlist' : 'reject';
    await session.save();
    return session;
  },

  async markUnanswered(sessionId: string) {
    const session = await ScreeningCandidateModel.findById(sessionId);
    if (!session) return null;
    session.callStatus = 'no_answer';
    session.completedAt = new Date();
    await session.save();
    return session;
  },
};
