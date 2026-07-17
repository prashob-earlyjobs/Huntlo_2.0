import mongoose from 'mongoose';
import { z } from 'zod';

import { normalizeTimezone, zonedLocalToUtc, zonedParts } from '../scheduling/timezone.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id').optional();

export const analyticsFiltersSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  timezone: z.string().max(80).optional(),
  preset: z
    .enum(['7d', '30d', '90d', 'mtd', 'ytd', 'all'])
    .optional()
    .default('30d'),
  jobId: objectId,
  campaignId: objectId,
  recruiterId: objectId,
  channel: z.enum(['email', 'whatsapp', 'ai_voice', 'voice']).optional(),
  location: z.string().trim().max(120).optional(),
  candidateStatus: z.string().trim().max(40).optional(),
});

export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>;

export type ResolvedAnalyticsFilters = {
  organizationId: mongoose.Types.ObjectId;
  timezone: string;
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  jobId: mongoose.Types.ObjectId | null;
  campaignId: mongoose.Types.ObjectId | null;
  recruiterId: mongoose.Types.ObjectId | null;
  channel: 'email' | 'whatsapp' | 'ai_voice' | null;
  location: string | null;
  candidateStatus: string | null;
  preset: string;
};

function startOfZonedDay(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  return zonedLocalToUtc(p.year, p.month, p.day, 0, 0, timeZone);
}

function endOfZonedDay(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  // Exclusive end = next day 00:00
  const next = new Date(Date.UTC(p.year, p.month - 1, p.day));
  next.setUTCDate(next.getUTCDate() + 1);
  return zonedLocalToUtc(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    0,
    0,
    timeZone
  );
}

function addZonedDays(date: Date, days: number, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  const base = new Date(Date.UTC(p.year, p.month - 1, p.day));
  base.setUTCDate(base.getUTCDate() + days);
  return zonedLocalToUtc(
    base.getUTCFullYear(),
    base.getUTCMonth() + 1,
    base.getUTCDate(),
    0,
    0,
    timeZone
  );
}

export function resolveAnalyticsFilters(
  organizationId: string,
  input: AnalyticsFiltersInput
): ResolvedAnalyticsFilters {
  const timezone = normalizeTimezone(input.timezone);
  const now = new Date();
  let from: Date;
  let to: Date;

  if (input.from && input.to) {
    from = new Date(input.from);
    to = new Date(input.to);
  } else {
    to = endOfZonedDay(now, timezone);
    switch (input.preset) {
      case '7d':
        from = addZonedDays(startOfZonedDay(now, timezone), -6, timezone);
        break;
      case '90d':
        from = addZonedDays(startOfZonedDay(now, timezone), -89, timezone);
        break;
      case 'mtd': {
        const p = zonedParts(now, timezone);
        from = zonedLocalToUtc(p.year, p.month, 1, 0, 0, timezone);
        break;
      }
      case 'ytd': {
        const p = zonedParts(now, timezone);
        from = zonedLocalToUtc(p.year, 1, 1, 0, 0, timezone);
        break;
      }
      case 'all':
        from = new Date(0);
        break;
      case '30d':
      default:
        from = addZonedDays(startOfZonedDay(now, timezone), -29, timezone);
        break;
    }
  }

  if (!(from instanceof Date) || Number.isNaN(from.getTime())) {
    from = addZonedDays(startOfZonedDay(now, timezone), -29, timezone);
  }
  if (!(to instanceof Date) || Number.isNaN(to.getTime())) {
    to = endOfZonedDay(now, timezone);
  }
  if (from > to) {
    const swap = from;
    from = to;
    to = swap;
  }

  const durationMs = Math.max(to.getTime() - from.getTime(), 1);
  const previousTo = new Date(from.getTime());
  const previousFrom = new Date(from.getTime() - durationMs);

  const channel =
    input.channel === 'voice'
      ? 'ai_voice'
      : input.channel === 'email' || input.channel === 'whatsapp' || input.channel === 'ai_voice'
        ? input.channel
        : null;

  return {
    organizationId: new mongoose.Types.ObjectId(organizationId),
    timezone,
    from,
    to,
    previousFrom,
    previousTo,
    jobId: input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null,
    campaignId: input.campaignId
      ? new mongoose.Types.ObjectId(input.campaignId)
      : null,
    recruiterId: input.recruiterId
      ? new mongoose.Types.ObjectId(input.recruiterId)
      : null,
    channel,
    location: input.location?.trim() || null,
    candidateStatus: input.candidateStatus?.trim().toLowerCase() || null,
    preset: input.preset || '30d',
  };
}

export function orgMatch(filters: ResolvedAnalyticsFilters): Record<string, unknown> {
  return {
    organizationId: filters.organizationId,
    deletedAt: null,
  };
}

export function createdAtRange(
  filters: ResolvedAnalyticsFilters,
  field = 'createdAt'
): Record<string, unknown> {
  return {
    [field]: { $gte: filters.from, $lt: filters.to },
  };
}

export function previousCreatedAtRange(
  filters: ResolvedAnalyticsFilters,
  field = 'createdAt'
): Record<string, unknown> {
  return {
    [field]: { $gte: filters.previousFrom, $lt: filters.previousTo },
  };
}
