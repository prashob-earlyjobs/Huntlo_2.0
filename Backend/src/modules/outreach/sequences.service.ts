import { AppError } from '../../shared/errors/app-error.js';
import {
  SequenceTemplateModel,
  type SequenceTemplateDocument,
} from './sequence-template.model.js';
import { assertVariablesAllowed } from './variables.js';
import { UserModel } from '../auth/user.model.js';
import type {
  createSequenceTemplateSchema,
  listSequenceTemplatesQuerySchema,
  updateSequenceTemplateSchema,
} from './outreach.validation.js';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createSequenceTemplateSchema>;
type UpdateInput = z.infer<typeof updateSequenceTemplateSchema>;
type ListQuery = z.infer<typeof listSequenceTemplatesQuerySchema>;

export type SafeSequenceTemplateDto = {
  id: string;
  organizationId: string;
  ownerUserId: string;
  ownerName: string;
  name: string;
  channels: string[];
  steps: SequenceTemplateDocument['steps'];
  qualificationConfig: SequenceTemplateDocument['qualificationConfig'];
  schedulingConfig: SequenceTemplateDocument['schedulingConfig'];
  status: string;
  generation: {
    isDraft: boolean;
    action: string | null;
    model: string | null;
    generatedAt: string | null;
    summary: string | null;
  } | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

async function ownerName(userId: string): Promise<string> {
  const user = await UserModel.findById(userId).select('firstName lastName').lean();
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

function validateSteps(steps: CreateInput['steps']) {
  for (const step of steps) {
    if (step.body) {
      assertVariablesAllowed(step.subject ?? null, step.body);
    } else if (step.subject) {
      assertVariablesAllowed(step.subject, '');
    }
  }
}

export function toSafeSequence(
  doc: SequenceTemplateDocument,
  ownerDisplayName: string
): SafeSequenceTemplateDto {
  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    ownerUserId: String(doc.ownerUserId),
    ownerName: ownerDisplayName,
    name: doc.name,
    channels: doc.channels,
    steps: doc.steps,
    qualificationConfig: doc.qualificationConfig,
    schedulingConfig: doc.schedulingConfig,
    status: doc.status,
    generation: doc.generation
      ? {
          isDraft: Boolean(doc.generation.isDraft),
          action: doc.generation.action,
          model: doc.generation.model,
          generatedAt: doc.generation.generatedAt
            ? doc.generation.generatedAt.toISOString()
            : null,
          summary: doc.generation.summary,
        }
      : null,
    archivedAt: doc.archivedAt ? doc.archivedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const sequenceTemplatesService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.status) filter.status = query.status;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      SequenceTemplateModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(query.limit),
      SequenceTemplateModel.countDocuments(filter),
    ]);

    const items = await Promise.all(
      docs.map(async (doc) =>
        toSafeSequence(doc, await ownerName(String(doc.ownerUserId)))
      )
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async create(
    organizationId: string,
    userId: string,
    input: CreateInput,
    generation?: SequenceTemplateDocument['generation']
  ) {
    try {
      validateSteps(input.steps);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        throw new AppError(
          400,
          'INVALID_VARIABLES',
          (error as Error).message,
          {
            meta:
              'unknown' in error
                ? { unknown: (error as { unknown: string[] }).unknown }
                : undefined,
          }
        );
      }
      throw error;
    }

    const doc = await SequenceTemplateModel.create({
      organizationId,
      ownerUserId: userId,
      name: input.name,
      channels: input.channels || [],
      steps: input.steps.map((step) => ({
        ...step,
        channel: step.channel ?? null,
        templateId: step.templateId ?? null,
        subject: step.subject ?? null,
        body: step.body ?? null,
        stopOnReply: step.stopOnReply ?? false,
        note: step.note ?? null,
        config: step.config || {},
      })),
      qualificationConfig: input.qualificationConfig || {
        enabled: false,
        questions: [],
        aiReplyEnabled: false,
      },
      schedulingConfig: input.schedulingConfig || {
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      },
      status: input.status || (generation?.isDraft ? 'draft' : 'active'),
      generation: generation || null,
      archivedAt: null,
    });

    return toSafeSequence(doc, await ownerName(userId));
  },

  async update(organizationId: string, id: string, input: UpdateInput) {
    const doc = await SequenceTemplateModel.findOne({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'SEQUENCE_TEMPLATE_NOT_FOUND', 'Sequence template not found.');

    if (input.name !== undefined) doc.name = input.name;
    if (input.channels !== undefined) doc.channels = input.channels;
    if (input.steps !== undefined) {
      try {
        validateSteps(input.steps);
      } catch (error) {
        throw new AppError(400, 'INVALID_VARIABLES', (error as Error).message);
      }
      doc.steps = input.steps.map((step) => ({
        id: step.id,
        order: step.order,
        type: step.type,
        channel: step.channel ?? null,
        delayDays: step.delayDays ?? 0,
        templateId: step.templateId ?? null,
        subject: step.subject ?? null,
        body: step.body ?? null,
        stopOnReply: step.stopOnReply ?? false,
        note: step.note ?? null,
        config: step.config || {},
      }));
    }
    if (input.qualificationConfig !== undefined) {
      doc.qualificationConfig = {
        enabled: input.qualificationConfig.enabled,
        questions: input.qualificationConfig.questions,
        aiReplyEnabled: input.qualificationConfig.aiReplyEnabled ?? false,
      };
    }
    if (input.schedulingConfig !== undefined) {
      doc.schedulingConfig = {
        enabled: input.schedulingConfig.enabled,
        provider: input.schedulingConfig.provider ?? null,
        eventTypeUri: input.schedulingConfig.eventTypeUri ?? null,
        messageTemplateId: input.schedulingConfig.messageTemplateId ?? null,
      };
    }
    if (input.status !== undefined) {
      doc.status = input.status;
      doc.archivedAt = input.status === 'archived' ? new Date() : null;
    }

    await doc.save();
    return toSafeSequence(doc, await ownerName(String(doc.ownerUserId)));
  },

  async remove(organizationId: string, id: string) {
    const doc = await SequenceTemplateModel.findOneAndDelete({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'SEQUENCE_TEMPLATE_NOT_FOUND', 'Sequence template not found.');
    return { deleted: true, id };
  },
};
