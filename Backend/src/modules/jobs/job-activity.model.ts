import mongoose from 'mongoose';

export const JOB_ACTIVITY_TYPES = [
  'created',
  'updated',
  'published',
  'paused',
  'reopened',
  'closed',
  'archived',
  'duplicated',
  'status_changed',
  'note',
] as const;

export type JobActivityType = (typeof JOB_ACTIVITY_TYPES)[number];

const jobActivitySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: JOB_ACTIVITY_TYPES,
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

jobActivitySchema.index({ organizationId: 1, jobId: 1, createdAt: -1 });

export type JobActivityDocument = mongoose.InferSchemaType<typeof jobActivitySchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
};

export const JobActivityModel = (mongoose.models.JobActivity ??
  mongoose.model('JobActivity', jobActivitySchema)) as mongoose.Model<JobActivityDocument>;
