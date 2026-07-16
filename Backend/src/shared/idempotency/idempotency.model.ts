import mongoose from 'mongoose';

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

const idempotencySchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestHash: { type: String, default: null, trim: true },
    responseStatus: { type: Number, required: true },
    responseBody: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
  },
  { timestamps: true }
);

idempotencySchema.index(
  { scope: 1, key: 1, organizationId: 1, userId: 1 },
  { unique: true }
);
idempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IDEMPOTENCY_RECORD_TTL_MS = IDEMPOTENCY_TTL_MS;

export type IdempotencyDocument = mongoose.InferSchemaType<typeof idempotencySchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const IdempotencyModel = (mongoose.models.IdempotencyRecord ??
  mongoose.model(
    'IdempotencyRecord',
    idempotencySchema
  )) as mongoose.Model<IdempotencyDocument>;
