import {
  AvailabilityRuleModel,
  DEFAULT_WEEKLY_HOURS,
} from './availability.model.js';
import { normalizeTimezone } from './timezone.js';
import type { z } from 'zod';
import type { putAvailabilitySchema } from './scheduling.validation.js';

type PutInput = z.infer<typeof putAvailabilitySchema>;

function toDisplay(doc: {
  userId: { toString(): string } | string;
  organizationId: { toString(): string } | string;
  timezone: string;
  weeklyHours: unknown[];
  dateOverrides: unknown[];
  unavailableDates: string[];
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
  maximumBookingWindow: number;
  dailyLimit: number;
  updatedAt?: Date;
}) {
  return {
    userId: String(doc.userId),
    organizationId: String(doc.organizationId),
    timezone: doc.timezone,
    weeklyHours: doc.weeklyHours,
    dateOverrides: doc.dateOverrides,
    unavailableDates: doc.unavailableDates,
    bufferBefore: doc.bufferBefore,
    bufferAfter: doc.bufferAfter,
    minimumNotice: doc.minimumNotice,
    maximumBookingWindow: doc.maximumBookingWindow,
    dailyLimit: doc.dailyLimit,
    updatedAt: doc.updatedAt?.toISOString?.() ?? null,
  };
}

export const availabilityService = {
  async get(organizationId: string, userId: string) {
    let doc = await AvailabilityRuleModel.findOne({ organizationId, userId });
    if (!doc) {
      doc = await AvailabilityRuleModel.create({
        organizationId,
        userId,
        timezone: 'Asia/Kolkata',
        weeklyHours: DEFAULT_WEEKLY_HOURS,
      });
    }
    return toDisplay(doc);
  },

  async put(organizationId: string, userId: string, input: PutInput) {
    const existing = await AvailabilityRuleModel.findOne({ organizationId, userId });
    const patch = {
      timezone: normalizeTimezone(input.timezone ?? existing?.timezone),
      weeklyHours: input.weeklyHours ?? existing?.weeklyHours ?? DEFAULT_WEEKLY_HOURS,
      dateOverrides: input.dateOverrides ?? existing?.dateOverrides ?? [],
      unavailableDates: input.unavailableDates ?? existing?.unavailableDates ?? [],
      bufferBefore: input.bufferBefore ?? existing?.bufferBefore ?? 15,
      bufferAfter: input.bufferAfter ?? existing?.bufferAfter ?? 15,
      minimumNotice: input.minimumNotice ?? existing?.minimumNotice ?? 24,
      maximumBookingWindow:
        input.maximumBookingWindow ?? existing?.maximumBookingWindow ?? 14,
      dailyLimit: input.dailyLimit ?? existing?.dailyLimit ?? 6,
    };

    const doc = await AvailabilityRuleModel.findOneAndUpdate(
      { organizationId, userId },
      {
        $set: patch,
        $setOnInsert: { organizationId, userId },
      },
      { upsert: true, new: true }
    );
    return toDisplay(doc!);
  },
};
