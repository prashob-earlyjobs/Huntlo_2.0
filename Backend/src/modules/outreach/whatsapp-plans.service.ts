import { AppError } from '../../shared/errors/app-error.js';
import { getApprovedTemplate, validateTemplateVariables } from './whatsapp-template-catalogue.js';
import {
  WhatsAppOutreachPlanModel,
  type WhatsAppOutreachCalendlyAutomation,
  type WhatsAppOutreachPlanDocument,
  type WhatsAppOutreachTouchpoint,
} from './whatsapp-plan.model.js';
import type {
  createWhatsAppPlanSchema,
  listWhatsAppPlansQuerySchema,
  updateWhatsAppPlanSchema,
} from './plan.validation.js';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createWhatsAppPlanSchema>;
type UpdateInput = z.infer<typeof updateWhatsAppPlanSchema>;
type ListQuery = z.infer<typeof listWhatsAppPlansQuerySchema>;
type TouchpointInput = CreateInput['touchpoints'][number];
type CalendlyAutomationInput = CreateInput['calendlyAutomation'];

export type PublicWhatsAppOutreachPlan = {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  jobDescription: string | null;
  touchpoints: WhatsAppOutreachTouchpoint[];
  calendlyAutomation: WhatsAppOutreachCalendlyAutomation;
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

function resolveOpeningTouchpoint(touchpoints: TouchpointInput[]): TouchpointInput | null {
  const sorted = [...touchpoints].sort((a, b) => a.order - b.order);
  // The opening step is order 0 if active, otherwise the first active step in order.
  return sorted.find((touchpoint) => touchpoint.active !== false) ?? null;
}

function validateWhatsAppTouchpoints(touchpoints: TouchpointInput[]) {
  validateTouchpointOrders(touchpoints);

  const opening = resolveOpeningTouchpoint(touchpoints);
  if (!opening) {
    throw new AppError(
      400,
      'MISSING_OPENING_TOUCHPOINT',
      'At least one active touchpoint is required to serve as the opening message.'
    );
  }

  const openingTemplate = getApprovedTemplate(opening.templateId);
  if (!openingTemplate) {
    throw new AppError(
      400,
      'OPENING_TEMPLATE_NOT_FOUND',
      `The opening touchpoint's template "${opening.templateId}" was not found in the approved WhatsApp template catalogue.`
    );
  }

  for (const touchpoint of touchpoints) {
    if (touchpoint.isNoReplyFallback && touchpoint.order <= opening.order) {
      throw new AppError(
        400,
        'NO_REPLY_FALLBACK_BEFORE_OPENING',
        `Touchpoint "${touchpoint.label}" is marked as a no-reply fallback but must come after the opening message.`
      );
    }
    if (touchpoint.isReplyFollowUp && touchpoint.order <= opening.order) {
      throw new AppError(
        400,
        'REPLY_FOLLOW_UP_BEFORE_OPENING',
        `Touchpoint "${touchpoint.label}" is marked as a reply follow-up but cannot come before the opening message.`
      );
    }

    const template = getApprovedTemplate(touchpoint.templateId);
    if (!template) {
      throw new AppError(
        400,
        'TEMPLATE_NOT_FOUND',
        `Template "${touchpoint.templateId}" for touchpoint "${touchpoint.label}" was not found in the approved WhatsApp template catalogue.`
      );
    }

    const variableCheck = validateTemplateVariables(touchpoint.templateId, touchpoint.templateVariables);
    if (!variableCheck.valid) {
      throw new AppError(
        400,
        'TEMPLATE_VARIABLES_MISMATCH',
        `Template variables for touchpoint "${touchpoint.label}" do not match template "${template.name}".`,
        { meta: { missing: variableCheck.missing, unknown: variableCheck.unknown } }
      );
    }
  }
}

function normalizeTouchpoint(touchpoint: TouchpointInput): WhatsAppOutreachTouchpoint {
  return {
    id: touchpoint.id,
    order: touchpoint.order,
    label: touchpoint.label,
    body: touchpoint.body,
    waitHours: touchpoint.waitHours ?? 0,
    waitMinutes: touchpoint.waitMinutes ?? 0,
    waitUnit: touchpoint.waitUnit ?? 'hours',
    templateId: touchpoint.templateId,
    templateVariables: touchpoint.templateVariables ?? {},
    isNoReplyFallback: touchpoint.isNoReplyFallback ?? false,
    isReplyFollowUp: touchpoint.isReplyFollowUp ?? false,
    required: touchpoint.required ?? true,
    active: touchpoint.active ?? true,
  };
}

function normalizeCalendlyAutomation(
  calendlyAutomation: CalendlyAutomationInput
): WhatsAppOutreachCalendlyAutomation {
  return {
    enabled: calendlyAutomation?.enabled ?? false,
    schedulingUrl: calendlyAutomation?.schedulingUrl ?? null,
    meetingUri: calendlyAutomation?.meetingUri ?? null,
    sendAfterQualification: calendlyAutomation?.sendAfterQualification ?? false,
    messageTemplate: calendlyAutomation?.messageTemplate ?? null,
  };
}

export function toPublicWhatsAppPlan(
  doc: WhatsAppOutreachPlanDocument
): PublicWhatsAppOutreachPlan {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    userId: String(doc.userId),
    name: doc.name,
    jobDescription: doc.jobDescription,
    touchpoints: doc.touchpoints,
    calendlyAutomation: doc.calendlyAutomation,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const whatsappPlansService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.status) filter.status = query.status;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      WhatsAppOutreachPlanModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(query.limit),
      WhatsAppOutreachPlanModel.countDocuments(filter),
    ]);

    return {
      items: docs.map(toPublicWhatsAppPlan),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async get(organizationId: string, id: string) {
    const doc = await WhatsAppOutreachPlanModel.findOne({ _id: id, organizationId });
    if (!doc) {
      throw new AppError(404, 'WHATSAPP_PLAN_NOT_FOUND', 'WhatsApp outreach plan not found.');
    }
    return toPublicWhatsAppPlan(doc);
  },

  async create(organizationId: string, userId: string, input: CreateInput) {
    validateWhatsAppTouchpoints(input.touchpoints);

    const doc = await WhatsAppOutreachPlanModel.create({
      organizationId,
      userId,
      name: input.name,
      jobDescription: input.jobDescription ?? null,
      touchpoints: input.touchpoints.map(normalizeTouchpoint),
      calendlyAutomation: normalizeCalendlyAutomation(input.calendlyAutomation),
      status: input.status || 'draft',
    });

    return toPublicWhatsAppPlan(doc);
  },

  async update(organizationId: string, id: string, input: UpdateInput) {
    const doc = await WhatsAppOutreachPlanModel.findOne({ _id: id, organizationId });
    if (!doc) {
      throw new AppError(404, 'WHATSAPP_PLAN_NOT_FOUND', 'WhatsApp outreach plan not found.');
    }

    if (input.name !== undefined) doc.name = input.name;
    if (input.jobDescription !== undefined) doc.jobDescription = input.jobDescription ?? null;
    if (input.touchpoints !== undefined) {
      validateWhatsAppTouchpoints(input.touchpoints);
      doc.touchpoints = input.touchpoints.map(normalizeTouchpoint);
    }
    if (input.calendlyAutomation !== undefined) {
      doc.calendlyAutomation = normalizeCalendlyAutomation(input.calendlyAutomation);
    }
    if (input.status !== undefined) doc.status = input.status;

    // organizationId/userId ownership is never mutated on update.
    await doc.save();
    return toPublicWhatsAppPlan(doc);
  },

  async remove(organizationId: string, id: string) {
    const doc = await WhatsAppOutreachPlanModel.findOneAndDelete({ _id: id, organizationId });
    if (!doc) {
      throw new AppError(404, 'WHATSAPP_PLAN_NOT_FOUND', 'WhatsApp outreach plan not found.');
    }
    return { deleted: true, id };
  },
};
