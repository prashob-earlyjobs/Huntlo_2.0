import mongoose from 'mongoose';

const brightDataSearchSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    filter: { type: mongoose.Schema.Types.Mixed, default: {} },
    records: { type: [mongoose.Schema.Types.Mixed], default: [] },
    snapshotId: { type: String, default: null },
    snapshotStatus: { type: String, default: null },
    searchAfter: { type: mongoose.Schema.Types.Mixed, default: null },
    total: { type: Number, default: 0 },
    hasMore: { type: Boolean, default: false },
    pageSize: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export type BrightDataSearchSessionDocument = mongoose.InferSchemaType<
  typeof brightDataSearchSessionSchema
> &
  mongoose.Document;

export const BrightDataSearchSessionModel = (mongoose.models.BrightDataSearchSession ??
  mongoose.model(
    'BrightDataSearchSession',
    brightDataSearchSessionSchema
  )) as mongoose.Model<BrightDataSearchSessionDocument>;
