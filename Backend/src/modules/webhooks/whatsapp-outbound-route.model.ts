import mongoose, { type Document, type Model, Schema } from 'mongoose';

/**
 * Persists which deploy env sent a WhatsApp outbound (wamid), so fan-out
 * inbound webhooks are processed only by that env.
 * Redis is the shared cross-env source of truth when REDIS_URL is shared;
 * this collection backs local+QA shared Mongo and Redis-miss recovery.
 */
export type WhatsAppOutboundRouteDocument = Document & {
  providerMessageId: string;
  phoneDigits: string;
  routeEnv: string;
  provider: string;
  organizationId: mongoose.Types.ObjectId | null;
  campaignId: mongoose.Types.ObjectId | null;
  enrollmentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

const schema = new Schema<WhatsAppOutboundRouteDocument>(
  {
    providerMessageId: { type: String, required: true, unique: true, index: true },
    phoneDigits: { type: String, required: true, index: true },
    routeEnv: { type: String, required: true, index: true },
    provider: { type: String, default: 'meta-whatsapp' },
    organizationId: { type: Schema.Types.ObjectId, default: null },
    campaignId: { type: Schema.Types.ObjectId, default: null },
    enrollmentId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, collection: 'whatsappoutboundroutes' }
);

schema.index({ phoneDigits: 1, createdAt: -1 });
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 45 });

export const WhatsAppOutboundRouteModel: Model<WhatsAppOutboundRouteDocument> =
  mongoose.models.WhatsAppOutboundRoute ||
  mongoose.model<WhatsAppOutboundRouteDocument>('WhatsAppOutboundRoute', schema);
