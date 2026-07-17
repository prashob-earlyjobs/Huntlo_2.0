import mongoose, { type Document, type Model, Schema } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'candidate_search_progress',
  'candidate_reply',
  'campaign_completed',
  'campaign_failed',
  'screening_completed',
  'interview_booked',
  'interview_reminder',
  'integration_error',
  'quota_warning',
  'quota_exhausted',
  'team_invitation',
  'billing_event',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_SEVERITIES = [
  'info',
  'success',
  'warning',
  'error',
] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export type NotificationDocument = Document & {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  readAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const notificationSchema = new Schema<NotificationDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true, index: true },
    severity: {
      type: String,
      enum: NOTIFICATION_SEVERITIES,
      default: 'info',
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    relatedEntityType: { type: String, default: null, maxlength: 80 },
    relatedEntityId: { type: String, default: null, maxlength: 80 },
    actionUrl: { type: String, default: null, maxlength: 500 },
    readAt: { type: Date, default: null, index: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, userId: 1, readAt: 1 });
notificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: 'date' } } }
);

export const NotificationModel: Model<NotificationDocument> =
  mongoose.models.Notification ??
  mongoose.model<NotificationDocument>('Notification', notificationSchema);
