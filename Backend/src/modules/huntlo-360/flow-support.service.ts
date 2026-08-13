import mongoose from 'mongoose';

import {
  Huntlo360FlowSupportModel,
  toObjectIdList,
  type Huntlo360FlowSupportDocument,
} from './flow-support.model.js';

export type FlowSupportIds = {
  workflowId: string;
  jobId: string | null;
  campaignId: string | null;
  candidateListId: string | null;
  candidateIds: string[];
  enrollmentIds: string[];
  screeningIds: string[];
  assessmentCandidateIds: string[];
  scheduleCandidateIds: string[];
};

function toDisplay(doc: Huntlo360FlowSupportDocument | null | undefined): FlowSupportIds | null {
  if (!doc) return null;
  return {
    workflowId: String(doc.workflowId),
    jobId: doc.jobId ? String(doc.jobId) : null,
    campaignId: doc.campaignId ? String(doc.campaignId) : null,
    candidateListId: doc.candidateListId ? String(doc.candidateListId) : null,
    candidateIds: (doc.candidateIds || []).map(String),
    enrollmentIds: (doc.enrollmentIds || []).map(String),
    screeningIds: (doc.screeningIds || []).map(String),
    assessmentCandidateIds: (doc.assessmentCandidateIds || []).map(String),
    scheduleCandidateIds: (doc.scheduleCandidateIds || []).map(String),
  };
}

function asObjectId(value: string | mongoose.Types.ObjectId | null | undefined) {
  if (!value) return null;
  const str = String(value);
  return mongoose.Types.ObjectId.isValid(str) ? new mongoose.Types.ObjectId(str) : null;
}

export const flowSupportService = {
  toDisplay,

  async ensure(input: {
    organizationId: string;
    workflowId: string;
    jobId?: string | null;
    campaignId?: string | null;
    candidateListId?: string | null;
    candidateIds?: string[];
  }) {
    const workflowId = asObjectId(input.workflowId);
    const organizationId = asObjectId(input.organizationId);
    if (!workflowId || !organizationId) {
      throw new Error('Invalid organizationId or workflowId for flow support');
    }

    const $set: Record<string, unknown> = {
      organizationId,
      workflowId,
    };
    if (input.jobId !== undefined) $set.jobId = asObjectId(input.jobId);
    if (input.campaignId !== undefined) $set.campaignId = asObjectId(input.campaignId);
    if (input.candidateListId !== undefined) {
      $set.candidateListId = asObjectId(input.candidateListId);
    }

    const update: Record<string, unknown> = {
      $set,
      $setOnInsert: {
        candidateIds: [],
        enrollmentIds: [],
        screeningIds: [],
        assessmentCandidateIds: [],
        scheduleCandidateIds: [],
      },
    };
    if (input.candidateIds?.length) {
      update.$addToSet = {
        candidateIds: { $each: toObjectIdList(input.candidateIds) },
      };
    }

    return Huntlo360FlowSupportModel.findOneAndUpdate({ workflowId }, update, {
      upsert: true,
      new: true,
    });
  },

  async getByWorkflow(workflowId: string) {
    if (!mongoose.Types.ObjectId.isValid(workflowId)) return null;
    return Huntlo360FlowSupportModel.findOne({ workflowId });
  },

  async addIds(
    workflowId: string,
    patch: {
      candidateIds?: string[];
      enrollmentIds?: string[];
      screeningIds?: string[];
      assessmentCandidateIds?: string[];
      scheduleCandidateIds?: string[];
      campaignId?: string | null;
      jobId?: string | null;
      candidateListId?: string | null;
    }
  ) {
    if (!mongoose.Types.ObjectId.isValid(workflowId)) return null;

    const $set: Record<string, unknown> = {};
    if (patch.campaignId !== undefined) $set.campaignId = asObjectId(patch.campaignId);
    if (patch.jobId !== undefined) $set.jobId = asObjectId(patch.jobId);
    if (patch.candidateListId !== undefined) {
      $set.candidateListId = asObjectId(patch.candidateListId);
    }

    const $addToSet: Record<string, unknown> = {};
    if (patch.candidateIds?.length) {
      $addToSet.candidateIds = { $each: toObjectIdList(patch.candidateIds) };
    }
    if (patch.enrollmentIds?.length) {
      $addToSet.enrollmentIds = { $each: toObjectIdList(patch.enrollmentIds) };
    }
    if (patch.screeningIds?.length) {
      $addToSet.screeningIds = { $each: toObjectIdList(patch.screeningIds) };
    }
    if (patch.assessmentCandidateIds?.length) {
      $addToSet.assessmentCandidateIds = {
        $each: toObjectIdList(patch.assessmentCandidateIds),
      };
    }
    if (patch.scheduleCandidateIds?.length) {
      $addToSet.scheduleCandidateIds = {
        $each: toObjectIdList(patch.scheduleCandidateIds),
      };
    }

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($addToSet).length) update.$addToSet = $addToSet;
    if (!Object.keys(update).length) {
      return Huntlo360FlowSupportModel.findOne({ workflowId });
    }

    return Huntlo360FlowSupportModel.findOneAndUpdate({ workflowId }, update, {
      new: true,
    });
  },
};
