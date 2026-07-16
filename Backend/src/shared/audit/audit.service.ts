import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, default: 'auth' },
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AuditLogDocument = mongoose.InferSchemaType<typeof auditLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AuditLogModel = (mongoose.models.AuditLog ??
  mongoose.model('AuditLog', auditLogSchema)) as mongoose.Model<AuditLogDocument>;

export type AuditEventInput = {
  action: string;
  module?: string;
  userId?: mongoose.Types.ObjectId | string | null;
  organizationId?: mongoose.Types.ObjectId | string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  await AuditLogModel.create({
    action: input.action,
    module: input.module ?? 'auth',
    userId: input.userId ?? null,
    organizationId: input.organizationId ?? null,
    ipHash: input.ipHash ?? null,
    userAgent: input.userAgent ?? null,
    metadata: input.metadata ?? {},
  });
}
