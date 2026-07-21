import mongoose from 'mongoose';

const teamInvitationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    invitedName: { type: String, default: null, trim: true, maxlength: 160 },
    role: {
      type: String,
      enum: ['admin', 'recruiter', 'hiring_manager', 'interviewer', 'analyst'],
      required: true,
      default: 'recruiter',
    },
    permissions: { type: [String], default: [] },
    allowedModules: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    assignedJobIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Job',
      default: [],
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    acceptedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

teamInvitationSchema.index({ organizationId: 1, email: 1, revokedAt: 1 });

export type TeamInvitationDocument = mongoose.InferSchemaType<typeof teamInvitationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TeamInvitationModel = (mongoose.models.TeamInvitation ??
  mongoose.model(
    'TeamInvitation',
    teamInvitationSchema
  )) as mongoose.Model<TeamInvitationDocument>;
