import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../auth/user.model.js';
import {
  type OutreachTemplateDocument,
  OutreachTemplateModel,
  type TemplateStatus,
} from './outreach-template.model.js';
import {
  assertVariablesAllowed,
  extractVariables,
  renderTemplate,
  validateMessageVariables,
} from './variables.js';
import type {
  createTemplateSchema,
  listTemplatesQuerySchema,
  previewTemplateSchema,
  updateTemplateSchema,
} from './outreach.validation.js';
import type { z } from 'zod';

type CreateInput = z.infer<typeof createTemplateSchema>;
type UpdateInput = z.infer<typeof updateTemplateSchema>;
type ListQuery = z.infer<typeof listTemplatesQuerySchema>;
type PreviewInput = z.infer<typeof previewTemplateSchema>;

export type SafeTemplateDto = {
  id: string;
  organizationId: string;
  ownerUserId: string;
  ownerName: string;
  name: string;
  channel: string;
  category: string;
  subject: string | null;
  body: string;
  variables: string[];
  language: string;
  scope: string;
  status: string;
  usageCount: number;
  archivedAt: string | null;
  generation: {
    isDraft: boolean;
    action: string | null;
    model: string | null;
    generatedAt: string | null;
    summary: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

async function ownerName(userId: mongoose.Types.ObjectId | string): Promise<string> {
  const user = await UserModel.findById(userId).select('firstName lastName').lean();
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

export async function toSafeTemplate(
  doc: OutreachTemplateDocument,
  nameCache?: Map<string, string>
): Promise<SafeTemplateDto> {
  const ownerKey = String(doc.ownerUserId);
  let name = nameCache?.get(ownerKey);
  if (!name) {
    name = await ownerName(doc.ownerUserId);
    nameCache?.set(ownerKey, name);
  }

  return {
    id: String(doc._id),
    organizationId: String(doc.organizationId),
    ownerUserId: ownerKey,
    ownerName: name,
    name: doc.name,
    channel: doc.channel,
    category: doc.category,
    subject: doc.subject,
    body: doc.body,
    variables: doc.variables || [],
    language: doc.language,
    scope: doc.scope,
    status: doc.status,
    usageCount: doc.usageCount,
    archivedAt: doc.archivedAt ? doc.archivedAt.toISOString() : null,
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
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function wrapVarError(error: unknown): never {
  if (error instanceof AppError) throw error;
  if (error && typeof error === 'object' && 'code' in error) {
    const e = error as { message: string; statusCode?: number; code?: string; unknown?: string[] };
    throw new AppError(e.statusCode || 400, e.code || 'INVALID_VARIABLES', e.message, {
      meta: e.unknown ? { unknown: e.unknown } : undefined,
    });
  }
  throw error;
}

export const outreachTemplatesService = {
  async list(organizationId: string, query: ListQuery) {
    const filter: Record<string, unknown> = { organizationId };
    if (query.channel) filter.channel = query.channel;
    if (query.category) filter.category = query.category;
    if (query.scope) filter.scope = query.scope;
    if (query.archived === true) {
      filter.status = 'archived';
    } else if (query.archived === false) {
      filter.status = { $ne: 'archived' };
    } else if (query.status) {
      filter.status = query.status;
    }
    if (query.q) {
      filter.$or = [
        { name: { $regex: query.q, $options: 'i' } },
        { body: { $regex: query.q, $options: 'i' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [docs, total] = await Promise.all([
      OutreachTemplateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(query.limit),
      OutreachTemplateModel.countDocuments(filter),
    ]);

    const nameCache = new Map<string, string>();
    const items = await Promise.all(docs.map((doc) => toSafeTemplate(doc, nameCache)));
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

  async get(organizationId: string, id: string) {
    const doc = await OutreachTemplateModel.findOne({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found.');
    return toSafeTemplate(doc);
  },

  async create(
    organizationId: string,
    userId: string,
    input: CreateInput,
    generation?: OutreachTemplateDocument['generation']
  ) {
    let variables: string[];
    try {
      variables = assertVariablesAllowed(input.subject ?? null, input.body);
    } catch (error) {
      wrapVarError(error);
    }

    const status: TemplateStatus = input.status || (generation?.isDraft ? 'draft' : 'active');
    const doc = await OutreachTemplateModel.create({
      organizationId,
      ownerUserId: userId,
      name: input.name,
      channel: input.channel,
      category: input.category,
      subject: input.channel === 'email' ? input.subject ?? null : null,
      body: input.body,
      variables,
      language: input.language || 'en',
      scope: input.scope || 'organization',
      status,
      usageCount: 0,
      archivedAt: null,
      generation: generation || null,
    });
    return toSafeTemplate(doc);
  },

  async update(organizationId: string, userId: string, id: string, input: UpdateInput) {
    const doc = await OutreachTemplateModel.findOne({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found.');

    if (input.name !== undefined) doc.name = input.name;
    if (input.channel !== undefined) doc.channel = input.channel;
    if (input.category !== undefined) doc.category = input.category;
    if (input.language !== undefined) doc.language = input.language;
    if (input.scope !== undefined) doc.scope = input.scope;
    if (input.subject !== undefined) doc.subject = input.subject;
    if (input.body !== undefined) doc.body = input.body;

    if (input.status !== undefined) {
      doc.status = input.status;
      doc.archivedAt = input.status === 'archived' ? new Date() : null;
    }

    const subject = doc.subject;
    const body = doc.body;
    try {
      doc.variables = assertVariablesAllowed(subject, body);
    } catch (error) {
      wrapVarError(error);
    }

    // Clearing AI draft flag once a human saves validated content as active
    if (doc.status === 'active' && doc.generation?.isDraft) {
      doc.generation.isDraft = false;
    }

    void userId;
    await doc.save();
    return toSafeTemplate(doc);
  },

  async remove(organizationId: string, id: string) {
    const doc = await OutreachTemplateModel.findOneAndDelete({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found.');
    return { deleted: true, id };
  },

  async duplicate(organizationId: string, userId: string, id: string) {
    const source = await OutreachTemplateModel.findOne({ _id: id, organizationId });
    if (!source) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found.');

    const doc = await OutreachTemplateModel.create({
      organizationId,
      ownerUserId: userId,
      name: `${source.name} (copy)`.slice(0, 160),
      channel: source.channel,
      category: source.category,
      subject: source.subject,
      body: source.body,
      variables: source.variables,
      language: source.language,
      scope: source.scope === 'system' ? 'organization' : source.scope,
      status: 'draft',
      usageCount: 0,
      archivedAt: null,
      generation: null,
    });
    return toSafeTemplate(doc);
  },

  async preview(organizationId: string, id: string, input: PreviewInput) {
    const doc = await OutreachTemplateModel.findOne({ _id: id, organizationId });
    if (!doc) throw new AppError(404, 'TEMPLATE_NOT_FOUND', 'Template not found.');

    const subject = input.subject ?? doc.subject;
    const body = input.body ?? doc.body;
    const validation = validateMessageVariables({
      subject,
      body,
      sampleValues: input.sampleValues,
    });

    return {
      subject: subject
        ? renderTemplate(subject, input.sampleValues || {})
        : null,
      body: renderTemplate(body, input.sampleValues || {}),
      variables: extractVariables(subject, body),
      validation,
    };
  },
};
