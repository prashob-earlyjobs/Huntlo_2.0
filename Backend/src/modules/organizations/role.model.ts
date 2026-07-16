import mongoose from 'mongoose';

const customRoleSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

customRoleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export type CustomRoleDocument = mongoose.InferSchemaType<typeof customRoleSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CustomRoleModel = (mongoose.models.CustomRole ??
  mongoose.model('CustomRole', customRoleSchema)) as mongoose.Model<CustomRoleDocument>;
