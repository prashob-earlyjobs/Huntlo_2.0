/**
 * Huntlo 360 facade over AssessmentTemplate / Campaign / Candidate.
 * Does not launch invites — orchestration calls inviteCandidateForWorkflow.
 */
import { assessmentsService } from './assessment.service.js';
import { AssessmentCandidateModel } from './assessment-candidate.model.js';
import { AssessmentCampaignModel } from './assessment-campaign.model.js';

export const assessmentFacade = {
  async inviteCandidateForWorkflow(input: {
    organizationId: string;
    workflowId: string;
    ownerUserId: string;
    candidateId: string;
    templateId: string;
    jobId?: string | null;
    channel?: 'email' | 'whatsapp';
    expiryHours?: number;
  }) {
    let campaign = await AssessmentCampaignModel.findOne({
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      templateId: input.templateId,
      status: { $in: ['draft', 'running'] },
      deletedAt: null,
    });

    if (!campaign) {
      await assessmentsService.createCampaign(input.organizationId, input.ownerUserId, {
        templateId: input.templateId,
        name: `Huntlo 360 assessment · ${input.workflowId}`,
        jobId: input.jobId ?? null,
        workflowId: input.workflowId,
        sourceModule: 'huntlo360',
        candidateIds: [input.candidateId],
        invitationConfig: {
          channel: input.channel ?? 'email',
          sendImmediately: true,
        },
        expiryHours: input.expiryHours ?? 168,
      });
      campaign = await AssessmentCampaignModel.findOne({
        organizationId: input.organizationId,
        workflowId: input.workflowId,
        templateId: input.templateId,
        deletedAt: null,
      });
    } else {
      const ids = new Set([...(campaign.candidateIds || []), input.candidateId]);
      await assessmentsService.syncCandidates(
        input.organizationId,
        String(campaign._id),
        [...ids]
      );
    }

    if (!campaign) return null;

    if (campaign.status === 'draft') {
      await assessmentsService.launch(
        input.organizationId,
        input.ownerUserId,
        String(campaign._id)
      );
    } else {
      // Launch only the new pending candidate by re-running launch-safe invite path
      const pending = await AssessmentCandidateModel.findOne({
        campaignId: campaign._id,
        candidateId: input.candidateId,
        invitationStatus: 'pending',
      });
      if (pending) {
        // Sync then launch will invite remaining pending rows
        campaign.status = 'draft';
        await campaign.save();
        await assessmentsService.launch(
          input.organizationId,
          input.ownerUserId,
          String(campaign._id)
        );
      }
    }

    return AssessmentCandidateModel.findOne({
      campaignId: campaign._id,
      candidateId: input.candidateId,
    });
  },

  async getCandidateResult(assessmentCandidateId: string) {
    return AssessmentCandidateModel.findById(assessmentCandidateId);
  },
};
