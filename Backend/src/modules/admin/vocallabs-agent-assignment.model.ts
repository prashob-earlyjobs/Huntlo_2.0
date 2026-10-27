import mongoose from 'mongoose';

const vocallabsAgentAssignmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agentId: { type: String, required: true, trim: true, maxlength: 80 },
    agentName: { type: String, default: '', trim: true, maxlength: 120 },
    name: { type: String, default: '', trim: true, maxlength: 200 },
    email: { type: String, default: '', trim: true, maxlength: 200 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    organisation: { type: String, default: '', trim: true, maxlength: 200 },
    organizationId: { type: String, default: '', trim: true, maxlength: 40 },
    role: { type: String, default: '', trim: true, maxlength: 40 },
    status: { type: String, default: '', trim: true, maxlength: 40 },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true, collection: 'vocallabs_agent_assignments' }
);

vocallabsAgentAssignmentSchema.index({ userId: 1, agentId: 1 }, { unique: true });
vocallabsAgentAssignmentSchema.index({ agentId: 1, name: 1 });

export type VocallabsAgentAssignmentDocument = mongoose.Document &
  mongoose.InferSchemaType<typeof vocallabsAgentAssignmentSchema> & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

export const VocallabsAgentAssignmentModel = (mongoose.models.VocallabsAgentAssignment ??
  mongoose.model(
    'VocallabsAgentAssignment',
    vocallabsAgentAssignmentSchema
  )) as mongoose.Model<VocallabsAgentAssignmentDocument>;
