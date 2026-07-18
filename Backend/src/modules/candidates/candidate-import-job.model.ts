import mongoose from 'mongoose';

export const IMPORT_JOB_STATUSES = [
  'uploaded',
  'previewed',
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const;

export type ImportJobStatus = (typeof IMPORT_JOB_STATUSES)[number];

const importTotalsSchema = new mongoose.Schema(
  {
    rows: { type: Number, default: 0, min: 0 },
    valid: { type: Number, default: 0, min: 0 },
    invalid: { type: Number, default: 0, min: 0 },
    duplicatesInFile: { type: Number, default: 0, min: 0 },
    duplicatesExisting: { type: Number, default: 0, min: 0 },
    linkedExisting: { type: Number, default: 0, min: 0 },
    imported: { type: Number, default: 0, min: 0 },
    skipped: { type: Number, default: 0, min: 0 },
    failed: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const importErrorSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },
    field: { type: String, default: null },
    code: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false }
);

const candidateImportJobSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: { type: String, required: true, trim: true },
    originalFilename: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    storagePath: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: IMPORT_JOB_STATUSES,
      default: 'uploaded',
      index: true,
    },
    columnMapping: { type: mongoose.Schema.Types.Mixed, default: {} },
    headers: { type: [String], default: [] },
    previewRows: { type: [mongoose.Schema.Types.Mixed], default: [] },
    totals: { type: importTotalsSchema, default: () => ({}) },
    errors: { type: [importErrorSchema], default: [] },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

candidateImportJobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export type CandidateImportJobDocument = mongoose.InferSchemaType<
  typeof candidateImportJobSchema
> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  };

export const CandidateImportJobModel = (mongoose.models.CandidateImportJob ??
  mongoose.model(
    'CandidateImportJob',
    candidateImportJobSchema
  )) as mongoose.Model<CandidateImportJobDocument>;

export const IMPORT_PREVIEW_ROW_CAP = 20;
export const IMPORT_ERROR_CAP = 500;
