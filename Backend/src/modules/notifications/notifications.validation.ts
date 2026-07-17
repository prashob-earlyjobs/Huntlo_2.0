import { z } from 'zod';

import { NOTIFICATION_SEVERITIES, NOTIFICATION_TYPES } from './notification.model.js';

export const listNotificationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  unreadOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined) return false;
      if (typeof value === 'boolean') return value;
      return value === 'true' || value === '1';
    }),
  cursor: z.string().optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

export const createNotificationSchema = z.object({
  userId: z.string().regex(/^[a-fA-F0-9]{24}$/),
  type: z.enum(NOTIFICATION_TYPES),
  severity: z.enum(NOTIFICATION_SEVERITIES).default('info'),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  relatedEntityType: z.string().trim().max(80).nullable().optional(),
  relatedEntityId: z.string().trim().max(80).nullable().optional(),
  actionUrl: z.string().trim().max(500).nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});
