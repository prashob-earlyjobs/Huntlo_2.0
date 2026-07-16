import mongoose from 'mongoose';

export const JOB_STATUSES = [
  'draft',
  'active',
  'paused',
  'on_hold',
  'closed',
  'archived',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'temporary',
] as const;

export const WORKPLACE_TYPES = ['onsite', 'hybrid', 'remote'] as const;

export const SENIORITY_LEVELS = [
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'principal',
  'director',
  'executive',
] as const;

export const SALARY_VISIBILITIES = ['hidden', 'range', 'exact'] as const;

export const JOB_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

/** Controlled denormalized counters — updated by sourcing/outreach/screening modules. */
const jobStatsSchema = new mongoose.Schema(
  {
    candidatesSourced: { type: Number, default: 0, min: 0 },
    revealed: { type: Number, default: 0, min: 0 },
    contacted: { type: Number, default: 0, min: 0 },
    positiveReplies: { type: Number, default: 0, min: 0 },
    qualified: { type: Number, default: 0, min: 0 },
    screened: { type: Number, default: 0, min: 0 },
    shortlisted: { type: Number, default: 0, min: 0 },
    interviews: { type: Number, default: 0, min: 0 },
    hired: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    department: { type: String, default: null, trim: true, index: true },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      default: 'full_time',
    },
    workplaceType: {
      type: String,
      enum: WORKPLACE_TYPES,
      default: 'hybrid',
    },
    locations: { type: [String], default: [] },
    minimumExperience: { type: Number, default: null, min: 0 },
    maximumExperience: { type: Number, default: null, min: 0 },
    requiredSkills: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    seniority: {
      type: String,
      enum: SENIORITY_LEVELS,
      default: null,
    },
    preferredIndustries: { type: [String], default: [] },
    educationRequirements: { type: String, default: null },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    descriptionHtml: { type: String, default: null },
    salaryMin: { type: Number, default: null, min: 0 },
    salaryMax: { type: Number, default: null, min: 0 },
    salaryCurrency: { type: String, default: 'INR', trim: true },
    salaryVisibility: {
      type: String,
      enum: SALARY_VISIBILITIES,
      default: 'range',
    },
    openings: { type: Number, default: 1, min: 1 },
    recruiterIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    hiringManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    interviewerIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    screeningEnabled: { type: Boolean, default: false },
    assessmentEnabled: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: JOB_PRIORITIES,
      default: 'medium',
      index: true,
    },
    targetClosingDate: { type: Date, default: null },
    tags: { type: [String], default: [] },
    internalNotes: { type: String, default: null },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stats: { type: jobStatsSchema, default: () => ({}) },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

jobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
jobSchema.index({ organizationId: 1, department: 1 });
jobSchema.index({ organizationId: 1, 'locations': 1 });
jobSchema.index({ organizationId: 1, recruiterIds: 1 });
jobSchema.index({ organizationId: 1, hiringManagerId: 1 });
jobSchema.index({ organizationId: 1, deletedAt: 1, status: 1 });
jobSchema.index(
  { title: 'text', department: 'text', tags: 'text', locations: 'text' },
  { name: 'jobs_text_search' }
);

export type JobDocument = mongoose.InferSchemaType<typeof jobSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const JobModel = (mongoose.models.Job ??
  mongoose.model('Job', jobSchema)) as mongoose.Model<JobDocument>;

export function emptyJobStats() {
  return {
    candidatesSourced: 0,
    revealed: 0,
    contacted: 0,
    positiveReplies: 0,
    qualified: 0,
    screened: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0,
  };
}
