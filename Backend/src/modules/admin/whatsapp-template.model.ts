import mongoose from 'mongoose';

const whatsappTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    /** Approved Meta / WABA template name used for cold outbound sends. */
    metaTemplateName: { type: String, default: null, trim: true, maxlength: 120 },
    bodyText: { type: String, default: '', maxlength: 4096 },
    enabled: { type: Boolean, default: true },
    updatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export type WhatsAppTemplateDocument = mongoose.InferSchemaType<typeof whatsappTemplateSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const WhatsAppTemplateModel = (mongoose.models.WhatsAppTemplate ??
  mongoose.model(
    'WhatsAppTemplate',
    whatsappTemplateSchema
  )) as mongoose.Model<WhatsAppTemplateDocument>;

export function toPublicWhatsAppTemplate(doc: WhatsAppTemplateDocument) {
  return {
    id: doc._id.toHexString(),
    key: doc.key,
    name: doc.name,
    metaTemplateName: doc.metaTemplateName || null,
    bodyText: doc.bodyText || '',
    enabled: Boolean(doc.enabled),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export type PublicWhatsAppTemplate = ReturnType<typeof toPublicWhatsAppTemplate>;
