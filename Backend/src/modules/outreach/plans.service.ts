import { isProduction } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  OutreachPlanModel,
  type OutreachPlanCalendlyAutomation,
  type OutreachPlanDocument,
  type OutreachPlanStartSchedule,
  type OutreachPlanTouchpoint,
} from './outreach-plan.model.js';
import { assertVariablesAllowed } from './variables.js';
import type {
  createOutreachPlanSchema,
  listOutreachPlansQuerySchema,
  updateOutreachPlanSchema,
} from './plan.validation.js';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createOutreachPlanSchema>;
type UpdateInput = z.infer<typeof updateOutreachPlanSchema>;
type ListQuery = z.infer<typeof listOutreachPlansQuerySchema>;
type TouchpointInput = CreateInput['touchpoints'][number];
type StartScheduleInput = CreateInput['startSchedule'];
type CalendlyAutomationInput = CreateInput['calendlyAutomation'];

export type PublicOutreachPlan = {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description: string | null;
  touchpoints: OutreachPlanTouchpoint[];
  startSchedule: OutreachPlanStartSchedule;
  calendlyAutomation: OutreachPlanCalendlyAutomation;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function validateTouchpointOrders(touchpoints: Array<{ order: number }>) {
  const orders = touchpoints.map((touchpoint) => touchpoint.order);
  if (new Set(orders).size !== orders.length) {
    throw new AppError(
      400,
      'DUPLICATE_TOUCHPOINT_ORDER',
      'Touchpoint order values must be unique.'
    );
  }
  const sequential = [...orders].sort((a, b) => a - b).every((value, index) => value === index);
  if (!sequential) {
    throw new AppError(
      400,
      'NON_SEQUENTIAL_TOUCHPOINT_ORDER',
      'Touchpoint order values must be sequential starting at 0 (0, 1, 2, ...).'
    );
  }
}

/**
 * Wait units are never silently converted (e.g. minutes -> hours). Minute-level
 * waits are only clamped/rejected outright in production unless explicitly
 * allowed via OUTREACH_ALLOW_MINUTE_WAITS=true.
 */
function assertMinuteWaitsAllowed(touchpoints: Array<{ waitUnit: string }>) {
  const usesMinutes = touchpoints.some((touchpoint) => touchpoint.waitUnit === 'minutes');
  if (!usesMinutes) return;
  if (isProduction() && process.env.OUTREACH_ALLOW_MINUTE_WAITS !== 'true') {
    throw new AppError(
      400,
      'MINUTE_WAITS_NOT_ALLOWED',
      'Minute-level wait times are disabled in production. Use "hours" or "days" instead, ' +
        'or set OUTREACH_ALLOW_MINUTE_WAITS=true to enable them explicitly.'
    );
  }
}

function validateStartSchedule(startSchedule: StartScheduleInput) {
  if (!startSchedule) return;
  if (startSchedule.mode === 'scheduled' && !startSchedule.scheduledAt) {
    throw new AppError(
      400,
      'INVALID_START_SCHEDULE',
      'scheduledAt is required when startSchedule.mode is "scheduled".'
    );
  }
}

function validateTouchpoints(touchpoints: TouchpointInput[]) {
  validateTouchpointOrders(touchpoints);
  assertMinuteWaitsAllowed(touchpoints);
  for (const touchpoint of touchpoints) {
    try {
      assertVariablesAllowed(touchpoint.subject ?? null, touchpoint.body);
    } catch (error) {
      throw new AppError(400, 'INVALID_VARIABLES', (error as Error).message, {
        meta:
          error && typeof error === 'object' && 'unknown' in error
            ? { unknown: (error as { unknown: string[] }).unknown }
            : undefined,
      });
    }
  }
}

function normalizeTouchpoint(touchpoint: TouchpointInput): OutreachPlanTouchpoint {
  return {
    id: touchpoint.id,
    order: touchpoint.order,
    label: touchpoint.label,
    subject: touchpoint.subject ?? null,
    body: touchpoint.body,
    waitDays: touchpoint.waitDays ?? 0,
    waitHours: touchpoint.waitHours ?? 0,
    waitMinutes: touchpoint.waitMinutes ?? 0,
    waitUnit: touchpoint.waitUnit ?? 'days',
    sendTime: touchpoint.sendTime ?? null,
    timezone: touchpoint.timezone ?? null,
    stopOnReply: touchpoint.stopOnReply ?? true,
    active: touchpoint.active ?? true,
  };
}

function normalizeStartSchedule(startSchedule: StartScheduleInput): OutreachPlanStartSchedule {
  return {
    mode: startSchedule?.mode ?? 'immediate',
    scheduledAt: startSchedule?.scheduledAt ?? null,
    sendTime: startSchedule?.sendTime ?? null,
    timezone: startSchedule?.timezone ?? null,
  };
}

function normalizeCalendlyAutomation(
  calendlyAutomation: CalendlyAutomationInput
): OutreachPlanCalendlyAutomation {
  return {
    enabled: calendlyAutomation?.enabled ?? false,
    schedulingUrl: calendlyAutomation?.schedulingUrl ?? null,
    meetingUri: calendlyAutomation?.meetingUri ?? null,
    sendAfterQualification: calendlyAutomation?.sendAfterQualification ?? false,
    messageTemplate: calendlyAutomation?.messageTemplate ?? null,
  };
}

export function toPublicOutreachPlan(doc: OutreachPlanDocument): PublicOutreachPlan {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    userId: String(doc.userId),
    name: doc.name,
    description: doc.description,
    touchpoints: doc.touchpoints,
    startSchedule: doc.startSchedule,
    calendlyAutomation: doc.calendlyAutomation,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const emailPlansService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.status) filter.status = query.status;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      OutreachPlanModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(query.limit),
      OutreachPlanModel.countDocuments(filter),
    ]);

    return {
      items: docs.map(toPublicOutreachPlan),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async get(organizationId: string, id: string) {
    const doc = await OutreachPlanModel.findOne({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'OUTREACH_PLAN_NOT_FOUND', 'Outreach plan not found.');
    return toPublicOutreachPlan(doc);
  },

  async create(organizationId: string, userId: string, input: CreateInput) {
    validateTouchpoints(input.touchpoints);
    validateStartSchedule(input.startSchedule);

    const doc = await OutreachPlanModel.create({
      organizationId,
      userId,
      name: input.name,
      description: input.description ?? null,
      touchpoints: input.touchpoints.map(normalizeTouchpoint),
      startSchedule: normalizeStartSchedule(input.startSchedule),
      calendlyAutomation: normalizeCalendlyAutomation(input.calendlyAutomation),
      status: input.status || 'draft',
    });

    return toPublicOutreachPlan(doc);
  },

  async update(organizationId: string, id: string, input: UpdateInput) {
    const doc = await OutreachPlanModel.findOne({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'OUTREACH_PLAN_NOT_FOUND', 'Outreach plan not found.');

    if (input.name !== undefined) doc.name = input.name;
    if (input.description !== undefined) doc.description = input.description ?? null;
    if (input.touchpoints !== undefined) {
      validateTouchpoints(input.touchpoints);
      doc.touchpoints = input.touchpoints.map(normalizeTouchpoint);
    }
    if (input.startSchedule !== undefined) {
      validateStartSchedule(input.startSchedule);
      doc.startSchedule = normalizeStartSchedule(input.startSchedule);
    }
    if (input.calendlyAutomation !== undefined) {
      doc.calendlyAutomation = normalizeCalendlyAutomation(input.calendlyAutomation);
    }
    if (input.status !== undefined) doc.status = input.status;

    // organizationId/userId ownership is never mutated on update.
    await doc.save();
    return toPublicOutreachPlan(doc);
  },

  async remove(organizationId: string, id: string) {
    const doc = await OutreachPlanModel.findOneAndDelete({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'OUTREACH_PLAN_NOT_FOUND', 'Outreach plan not found.');
    return { deleted: true, id };
  },
};
