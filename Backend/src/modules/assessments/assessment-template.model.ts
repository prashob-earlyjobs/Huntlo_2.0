import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const TEMPLATE_STATUSES = ['draft', 'active', 'archived'] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export type AssessmentSection = {
  id: string;
  title: string;
  description?: string | null;
  questionCount?: number;
  durationMinutes?: number | null;
};

export type AssessmentTemplateDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  jobId: mongoose.Types.ObjectId | null;
  title: string;
  description: string | null;
  durationMinutes: number;
  sections: AssessmentSection[];
  skills: string[];
  passingScore: number;
  instructions: string | null;
  status: TemplateStatus;
  providerAssessmentId: string | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

const assessmentTemplateSchema = new Schema<AssessmentTemplateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null },
    durationMinutes: { type: Number, default: 45, min: 1, max: 480 },
    sections: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, default: null },
          questionCount: { type: Number, default: 0 },
          durationMinutes: { type: Number, default: null },
        },
      ],
      default: [],
    },
    skills: { type: [String], default: [] },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    instructions: { type: String, default: null },
    status: {
      type: String,
      enum: TEMPLATE_STATUSES,
      default: 'draft',
      index: true,
    },
    providerAssessmentId: { type: String, default: null },
    deletedAt: { type: Date, default: null, index: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

assessmentTemplateSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
assessmentTemplateSchema.index({ organizationId: 1, jobId: 1 });

export const AssessmentTemplateModel = (mongoose.models.AssessmentTemplate ??
  mongoose.model<AssessmentTemplateDocument>(
    'AssessmentTemplate',
    assessmentTemplateSchema
  )) as Model<AssessmentTemplateDocument>;
