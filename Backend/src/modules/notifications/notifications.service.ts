import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { emitNotificationCreated } from '../../realtime/events.js';
import {
  NotificationModel,
  type NotificationDocument,
  type NotificationSeverity,
  type NotificationType,
} from './notification.model.js';

export type PublicNotification = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  description: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  time: string;
  kind: 'campaign' | 'screening' | 'interview' | 'usage' | 'system';
};

function kindFromType(
  type: NotificationType
): PublicNotification['kind'] {
  if (type.startsWith('campaign')) return 'campaign';
  if (type.startsWith('screening')) return 'screening';
  if (type.startsWith('interview')) return 'interview';
  if (
    type.startsWith('quota') ||
    type === 'billing_event' ||
    type === 'candidate_search_progress'
  ) {
    return 'usage';
  }
  if (type === 'candidate_reply') return 'campaign';
  return 'system';
}

function relativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN');
}

export function toPublicNotification(doc: NotificationDocument): PublicNotification {
  return {
    id: doc._id.toHexString(),
    type: doc.type,
    severity: doc.severity,
    title: doc.title,
    message: doc.message,
    description: doc.message,
    relatedEntityType: doc.relatedEntityType,
    relatedEntityId: doc.relatedEntityId,
    actionUrl: doc.actionUrl,
    read: Boolean(doc.readAt),
    readAt: doc.readAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    time: relativeTime(doc.createdAt),
    kind: kindFromType(doc.type),
  };
}

export type CreateNotificationInput = {
  organizationId: string;
  userId: string;
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  message: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
  expiresAt?: Date | null;
};

export class NotificationsService {
  async list(
    organizationId: string,
    userId: string,
    options: { limit?: number; unreadOnly?: boolean } = {}
  ) {
    const limit = options.limit ?? 30;
    const filter: Record<string, unknown> = {
      organizationId,
      userId,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };
    if (options.unreadOnly) filter.readAt = null;

    const rows = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);
    return rows.map(toPublicNotification);
  }

  async unreadCount(organizationId: string, userId: string) {
    const count = await NotificationModel.countDocuments({
      organizationId,
      userId,
      readAt: null,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });
    return { count };
  }

  async markRead(organizationId: string, userId: string, notificationId: string) {
    const doc = await NotificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        organizationId,
        userId,
      },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!doc) throw AppError.notFound('Notification not found');
    return toPublicNotification(doc);
  }

  async markAllRead(organizationId: string, userId: string) {
    const result = await NotificationModel.updateMany(
      {
        organizationId,
        userId,
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );
    return { updated: result.modifiedCount };
  }

  async remove(organizationId: string, userId: string, notificationId: string) {
    const result = await NotificationModel.deleteOne({
      _id: notificationId,
      organizationId,
      userId,
    });
    if (result.deletedCount === 0) {
      throw AppError.notFound('Notification not found');
    }
    return { deleted: true };
  }

  /** Persist + push realtime `notification.created` to the recipient. */
  async create(input: CreateNotificationInput): Promise<PublicNotification> {
    const doc = await NotificationModel.create({
      organizationId: new mongoose.Types.ObjectId(input.organizationId),
      userId: new mongoose.Types.ObjectId(input.userId),
      type: input.type,
      severity: input.severity ?? 'info',
      title: input.title,
      message: input.message,
      relatedEntityType: input.relatedEntityType ?? null,
      relatedEntityId: input.relatedEntityId ?? null,
      actionUrl: input.actionUrl ?? null,
      expiresAt: input.expiresAt ?? null,
    });

    const publicNotification = toPublicNotification(doc);
    emitNotificationCreated({
      organizationId: input.organizationId,
      userId: input.userId,
      notification: publicNotification,
    });
    return publicNotification;
  }

  async notifyOrganizationMembers(
    organizationId: string,
    userIds: string[],
    input: Omit<CreateNotificationInput, 'organizationId' | 'userId'>
  ) {
    const unique = [...new Set(userIds.filter(Boolean))];
    const created: PublicNotification[] = [];
    for (const userId of unique) {
      created.push(
        await this.create({
          ...input,
          organizationId,
          userId,
        })
      );
    }
    return created;
  }
}

export const notificationsService = new NotificationsService();
