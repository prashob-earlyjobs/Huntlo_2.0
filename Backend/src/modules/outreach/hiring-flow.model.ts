import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const HIRING_FLOW_STATUSES = ['draft', 'active', 'archived'] as const;
export type HiringFlowStatus = (typeof HIRING_FLOW_STATUSES)[number];

export const HIRING_FLOW_STEP_TYPES = [
  'send_whatsapp_template',
  'ask_question',
  'branch',
] as const;
export type HiringFlowStepType = (typeof HIRING_FLOW_STEP_TYPES)[number];

export type HiringFlowBranchRule = {
  /** Match candidate reply (case-insensitive). */
  match: 'yes' | 'no' | 'contains' | 'any';
  /** Substring used when match === 'contains'. */
  value?: string | null;
  nextStepId: string;
};

export type HiringFlowStep = {
  id: string;
  type: HiringFlowStepType;
  /** Display label in the editor. */
  label?: string | null;
  /** Meta / catalogue WhatsApp template id (send_whatsapp_template). */
  whatsappTemplateId?: string | null;
  /** Question prompt (ask_question). */
  prompt?: string | null;
  answerType?: string | null;
  knockout?: boolean;
  knockoutCondition?: string | null;
  /** Default next step when no branch matches / after send. */
  nextStepId?: string | null;
  /** Branching rules evaluated against the candidate reply. */
  branches?: HiringFlowBranchRule[];
};

export type HiringFlowDocument = Document & {
  organizationId: mongoose.Types.ObjectId | null;
  ownerUserId: mongoose.Types.ObjectId;
  /** platform = Huntlo admin catalog; organization = assigned copy. */
  scope: 'platform' | 'organization';
  /** Org copy points at the admin catalog flow it was assigned from. */
  sourceFlowId: mongoose.Types.ObjectId | null;
  name: string;
  description: string | null;
  /** e.g. blue_collar, white_collar, campus */
  category: string;
  status: HiringFlowStatus;
  steps: HiringFlowStep[];
  /** First step to run when the flow starts. */
  entryStepId: string | null;
  usageCount: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const branchRuleSchema = new Schema(
  {
    match: {
      type: String,
      enum: ['yes', 'no', 'contains', 'any'],
      required: true,
    },
    value: { type: String, default: null, maxlength: 200 },
    nextStepId: { type: String, required: true },
  },
  { _id: false }
);

const hiringFlowStepSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: HIRING_FLOW_STEP_TYPES, required: true },
    label: { type: String, default: null, maxlength: 160 },
    whatsappTemplateId: { type: String, default: null, maxlength: 120 },
    prompt: { type: String, default: null, maxlength: 2000 },
    answerType: { type: String, default: null, maxlength: 40 },
    knockout: { type: Boolean, default: false },
    knockoutCondition: { type: String, default: null, maxlength: 500 },
    nextStepId: { type: String, default: null },
    branches: { type: [branchRuleSchema], default: [] },
  },
  { _id: false }
);

const hiringFlowSchema = new Schema<HiringFlowDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ['platform', 'organization'],
      default: 'organization',
      index: true,
    },
    sourceFlowId: {
      type: Schema.Types.ObjectId,
      ref: 'HiringFlow',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: null, maxlength: 1000 },
    category: { type: String, default: 'general', trim: true, maxlength: 80, index: true },
    status: {
      type: String,
      enum: HIRING_FLOW_STATUSES,
      default: 'draft',
      index: true,
    },
    steps: { type: [hiringFlowStepSchema], default: [] },
    entryStepId: { type: String, default: null },
    usageCount: { type: Number, default: 0, min: 0 },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

hiringFlowSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
hiringFlowSchema.index({ organizationId: 1, name: 1 });
hiringFlowSchema.index({ scope: 1, status: 1, updatedAt: -1 });
hiringFlowSchema.index(
  { organizationId: 1, sourceFlowId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceFlowId: { $type: 'objectId' } },
  }
);

export const HiringFlowModel: Model<HiringFlowDocument> =
  mongoose.models.HiringFlow ??
  mongoose.model<HiringFlowDocument>('HiringFlow', hiringFlowSchema);
