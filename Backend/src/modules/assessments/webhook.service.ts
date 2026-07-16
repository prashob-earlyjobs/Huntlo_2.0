import type { Request, Response } from 'express';

import { getAssessmentProvider } from '../../providers/assessments/registry.js';
import { getLogger } from '../../config/logger.js';
import { AssessmentCandidateModel } from './assessment-candidate.model.js';
import { AssessmentCampaignModel } from './assessment-campaign.model.js';
import { AssessmentWebhookEventModel } from './assessment-webhook-event.model.js';
import {
  applyAttemptUpdate,
  assessmentsService,
  refreshCampaignStats,
} from './assessment.service.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';

/**
 * Ingest provider webhooks for assessment attempt lifecycle updates.
 * Idempotent on (provider, eventId).
 */
export async function processAssessmentWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const provider = getAssessmentProvider();
  const headers = req.headers as Record<string, string | string[] | undefined>;
  const parsed = provider.parseWebhook(headers, req.body);

  try {
    const existing = await AssessmentWebhookEventModel.findOne({
      provider: provider.id,
      eventId: parsed.eventId,
    }).lean();
    if (existing?.processedAt) {
      res.status(200).json({ success: true, data: { duplicate: true } });
      return;
    }

    const event = await AssessmentWebhookEventModel.findOneAndUpdate(
      { provider: provider.id, eventId: parsed.eventId },
      {
        $setOnInsert: {
          provider: provider.id,
          eventId: parsed.eventId,
          eventType: parsed.eventType,
          providerAttemptId: parsed.providerAttemptId,
          providerAssessmentId: parsed.providerAssessmentId,
          payload: parsed.raw,
        },
      },
      { upsert: true, new: true }
    );

    if (!parsed.providerAttemptId) {
      event.error = 'Missing providerAttemptId';
      event.processedAt = new Date();
      await event.save();
      res.status(200).json({ success: true, data: { ignored: true } });
      return;
    }

    const row = await AssessmentCandidateModel.findOne({
      providerAttemptId: parsed.providerAttemptId,
    });
    if (!row) {
      event.error = 'Assessment candidate not found for attempt';
      event.processedAt = new Date();
      await event.save();
      res.status(200).json({ success: true, data: { ignored: true } });
      return;
    }

    event.organizationId = row.organizationId;
    event.assessmentCandidateId = row._id;

    await applyAttemptUpdate(row, {
      status: parsed.status || row.invitationStatus,
      startedAt: parsed.startedAt,
      completedAt: parsed.completedAt,
      score: parsed.score,
      sectionScores: parsed.sectionScores,
      result: parsed.result,
    });
    await refreshCampaignStats(String(row.campaignId));

    try {
      const campaign = await AssessmentCampaignModel.findById(row.campaignId)
        .select('ownerUserId')
        .lean();
      await CandidateActivityModel.create({
        organizationId: row.organizationId,
        candidateId: row.candidateId,
        userId: campaign?.ownerUserId || row.organizationId,
        action:
          parsed.status === 'completed'
            ? 'assessment_completed'
            : 'assessment_status_updated',
        metadata: {
          campaignId: String(row.campaignId),
          score: row.score,
          result: row.result,
          invitationStatus: row.invitationStatus,
          eventId: parsed.eventId,
        },
      });
    } catch {
      // best-effort
    }

    // Auto-complete campaign when all enrolled candidates are terminal.
    const open = await AssessmentCandidateModel.countDocuments({
      campaignId: row.campaignId,
      invitationStatus: { $in: ['pending', 'invited', 'started'] },
    });
    if (open === 0) {
      const { AssessmentCampaignModel } = await import('./assessment-campaign.model.js');
      await AssessmentCampaignModel.findOneAndUpdate(
        { _id: row.campaignId, status: 'running' },
        { $set: { status: 'completed', completedAt: new Date() } }
      );
    }

    event.processedAt = new Date();
    await event.save();

    // Optional Huntlo 360 transition when sourced from 360
    if (row.workflowId && parsed.status === 'completed') {
      try {
        const { applyWorkflowTransition } = await import('../huntlo-360/transitions.js');
        await applyWorkflowTransition({
          organizationId: String(row.organizationId),
          workflowId: String(row.workflowId),
          candidateId: String(row.candidateId),
          event: row.result === 'pass' ? 'assessment_pass' : 'assessment_fail',
          idempotencyKey: `assessment:${String(row._id)}:${parsed.eventId}`,
          screeningScore: row.score ?? undefined,
          metadata: { assessmentCandidateId: String(row._id) },
        });
      } catch (err) {
        getLogger().warn(
          { err, resultId: String(row._id) },
          'Huntlo 360 assessment transition skipped'
        );
      }
    }

    res.status(200).json({
      success: true,
      data: {
        eventId: parsed.eventId,
        resultId: String(row._id),
        invitationStatus: row.invitationStatus,
        score: row.score,
        result: row.result,
      },
    });
  } catch (err) {
    getLogger().error({ err }, 'Assessment webhook processing failed');
    res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_PROCESSING_FAILED', message: 'Failed to process webhook.' },
    });
  }
}

/** Dev helper: sync one result from provider (used by tests / admin). */
export async function syncAssessmentResult(organizationId: string, resultId: string) {
  return assessmentsService.syncResultFromProvider(organizationId, resultId);
}
