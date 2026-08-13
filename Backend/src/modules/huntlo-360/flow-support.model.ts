/**
 * Huntlo 360 supporting entity IDs for one workflow flow.
 * Workflow config lives in Huntlo360Workflow; this collection holds the
 * cross-module ObjectIds spawned by / linked to that flow.
 */

import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type Huntlo360FlowSupportDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  /** Parent Huntlo 360 workflow (1:1). */
  workflowId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId | null;
  /** Compiled outreach campaign for this flow. */
  campaignId: mongoose.Types.ObjectId | null;
  /** Optional saved-list / pool source. */
  candidateListId: mongoose.Types.ObjectId | null;
  /** Audience snapshot at launch (SavedCandidate ids). */
  candidateIds: mongoose.Types.ObjectId[];
  /** Outreach enrollments created for this flow. */
  enrollmentIds: mongoose.Types.ObjectId[];
  /** Screening sessions / candidates created by transitions. */
  screeningIds: mongoose.Types.ObjectId[];
  /** Assessment invites created by transitions. */
  assessmentCandidateIds: mongoose.Types.ObjectId[];
  /** Scheduling link / schedule-candidate rows. */
  scheduleCandidateIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

const huntlo360FlowSupportSchema = new Schema<Huntlo360FlowSupportDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: 'Huntlo360Workflow',
      required: true,
      unique: true,
      index: true,
    },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCampaign',
      default: null,
      index: true,
    },
    candidateListId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    candidateIds: { type: [Schema.Types.ObjectId], default: [] },
    enrollmentIds: { type: [Schema.Types.ObjectId], default: [] },
    screeningIds: { type: [Schema.Types.ObjectId], default: [] },
    assessmentCandidateIds: { type: [Schema.Types.ObjectId], default: [] },
    scheduleCandidateIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true, collection: 'huntlo360_flow_supports' }
);

huntlo360FlowSupportSchema.index({ organizationId: 1, campaignId: 1 });
huntlo360FlowSupportSchema.index({ organizationId: 1, updatedAt: -1 });

export const Huntlo360FlowSupportModel = (mongoose.models.Huntlo360FlowSupport ??
  mongoose.model<Huntlo360FlowSupportDocument>(
    'Huntlo360FlowSupport',
    huntlo360FlowSupportSchema
  )) as Model<Huntlo360FlowSupportDocument>;

export function toObjectIdList(ids: Array<string | mongoose.Types.ObjectId | null | undefined>) {
  const out: mongoose.Types.ObjectId[] = [];
  const seen = new Set<string>();
  for (const raw of ids) {
    if (!raw) continue;
    const str = String(raw);
    if (!mongoose.Types.ObjectId.isValid(str) || seen.has(str)) continue;
    seen.add(str);
    out.push(new mongoose.Types.ObjectId(str));
  }
  return out;
}
