import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../auth/user.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import {
  HiringFlowModel,
  type HiringFlowDocument,
  type HiringFlowStep,
} from './hiring-flow.model.js';
import { getApprovedTemplate } from './whatsapp-template-catalogue.js';
import { findApprovedMetaTemplate } from '../../providers/meta-whatsapp/meta.templates.js';

export type AssignedOrganizationDto = {
  id: string;
  name: string;
  slug?: string | null;
};

export type SafeHiringFlowDto = {
  id: string;
  organizationId: string | null;
  ownerUserId: string;
  ownerName: string;
  scope: 'platform' | 'organization' | string;
  sourceFlowId: string | null;
  name: string;
  description: string | null;
  category: string;
  status: string;
  steps: HiringFlowStep[];
  entryStepId: string | null;
  /** Recruiter cannot change the first WhatsApp template step. */
  firstMessageLocked: boolean;
  usageCount: number;
  archivedAt: string | null;
  assignedOrganizations?: AssignedOrganizationDto[];
  createdAt: string;
  updatedAt: string;
};

export function blankStarterSteps(): HiringFlowStep[] {
  return [
    {
      id: 'step-wa-first',
      type: 'send_whatsapp_template',
      label: 'First WhatsApp message',
      whatsappTemplateId: null,
      nextStepId: null,
      branches: [],
    },
  ];
}

export function findFirstMessageStep(
  steps: HiringFlowStep[],
  entryStepId: string | null
): HiringFlowStep | null {
  const entry = steps.find((step) => step.id === entryStepId) || steps[0] || null;
  if (entry?.type === 'send_whatsapp_template') return entry;
  return steps.find((step) => step.type === 'send_whatsapp_template') || entry;
}

function withLockedMessageFields(
  step: HiringFlowStep,
  locked: HiringFlowStep
): HiringFlowStep {
  return {
    id: locked.id,
    type: locked.type,
    label: locked.label ?? null,
    whatsappTemplateId: locked.whatsappTemplateId ?? null,
    prompt: step.prompt ?? null,
    answerType: step.answerType ?? null,
    knockout: Boolean(step.knockout),
    knockoutCondition: step.knockoutCondition ?? null,
    nextStepId: step.nextStepId ?? locked.nextStepId ?? null,
    branches: step.branches || [],
  };
}

/**
 * Keep exactly one locked WhatsApp template at the front.
 * Extra template steps (from assign/sync id mismatch) are dropped.
 */
export function ensureSingleLockedWhatsAppStep(
  steps: HiringFlowStep[],
  locked: HiringFlowStep | null
): HiringFlowStep[] {
  const cloned = steps.map((step) => ({ ...step, branches: step.branches || [] }));
  const first =
    locked ||
    findFirstMessageStep(cloned, cloned[0]?.id || null);
  if (!first || first.type !== 'send_whatsapp_template') return cloned;

  const rest = cloned.filter(
    (step) => step.id !== first.id && step.type !== 'send_whatsapp_template'
  );
  const incomingFirst =
    cloned.find((step) => step.id === first.id) ||
    cloned.find((step) => step.type === 'send_whatsapp_template') ||
    first;
  const restored = withLockedMessageFields(incomingFirst, first);
  const restIds = new Set(rest.map((step) => step.id));
  if (!restored.nextStepId || !restIds.has(restored.nextStepId)) {
    restored.nextStepId = rest[0]?.id || null;
  }
  return [restored, ...rest];
}

function lockFirstMessageOnIncoming(
  existing: HiringFlowStep[],
  incoming: HiringFlowStep[],
  entryStepId: string | null
): HiringFlowStep[] {
  const locked = findFirstMessageStep(existing, entryStepId);
  if (!locked) return ensureSingleLockedWhatsAppStep(incoming, null);
  return ensureSingleLockedWhatsAppStep(incoming, locked);
}

async function ownerName(userId: mongoose.Types.ObjectId | string): Promise<string> {
  const user = await UserModel.findById(userId).select('firstName lastName').lean();
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

export async function toSafeHiringFlow(
  doc: HiringFlowDocument,
  nameCache?: Map<string, string>,
  assignedOrganizations?: AssignedOrganizationDto[]
): Promise<SafeHiringFlowDto> {
  const ownerKey = String(doc.ownerUserId);
  let name = nameCache?.get(ownerKey);
  if (!name) {
    name = await ownerName(doc.ownerUserId);
    nameCache?.set(ownerKey, name);
  }

  const collapsedSteps = ensureSingleLockedWhatsAppStep(
    doc.steps || [],
    findFirstMessageStep(doc.steps || [], doc.entryStepId)
  );

  return {
    id: String(doc._id),
    organizationId: doc.organizationId ? String(doc.organizationId) : null,
    ownerUserId: ownerKey,
    ownerName: name,
    scope: doc.scope || (doc.organizationId ? 'organization' : 'platform'),
    sourceFlowId: doc.sourceFlowId ? String(doc.sourceFlowId) : null,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    status: doc.status,
    steps: collapsedSteps,
    entryStepId:
      collapsedSteps.find((step) => step.type === 'send_whatsapp_template')?.id ||
      doc.entryStepId,
    firstMessageLocked: (doc.scope || 'organization') === 'organization',
    usageCount: doc.usageCount || 0,
    archivedAt: doc.archivedAt ? doc.archivedAt.toISOString() : null,
    assignedOrganizations,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function validateSteps(
  steps: HiringFlowStep[],
  entryStepId: string | null,
  options?: { requireWhatsAppEntry?: boolean; allowIncomplete?: boolean }
) {
  if (!steps.length) {
    throw AppError.badRequest('Add at least one step to the hiring flow.');
  }
  const ids = new Set(steps.map((step) => step.id));
  if (ids.size !== steps.length) {
    throw AppError.badRequest('Each flow step must have a unique id.');
  }
  const entry = entryStepId || steps[0]?.id || null;
  if (!entry || !ids.has(entry)) {
    throw AppError.badRequest('entryStepId must point to an existing step.');
  }
  const entryStep = steps.find((step) => step.id === entry) || steps[0];
  if (options?.requireWhatsAppEntry && entryStep?.type !== 'send_whatsapp_template') {
    throw AppError.badRequest('The first step must be an approved WhatsApp template.');
  }
  for (const step of steps) {
    if (step.type === 'send_whatsapp_template') {
      const templateId = String(step.whatsappTemplateId || '').trim();
      if (!templateId && options?.allowIncomplete) continue;
      const known =
        Boolean(templateId && getApprovedTemplate(templateId)) ||
        Boolean(templateId && (await findApprovedMetaTemplate(templateId)));
      if (!known) {
        throw AppError.badRequest(
          `Step "${step.label || step.id}" needs an approved Meta WhatsApp template.`
        );
      }
    }
    if (step.type === 'ask_question' && !String(step.prompt || '').trim()) {
      if (options?.allowIncomplete) continue;
      throw AppError.badRequest(`Step "${step.label || step.id}" needs a question prompt.`);
    }
    if (step.nextStepId && !ids.has(step.nextStepId)) {
      throw AppError.badRequest(
        `Step "${step.label || step.id}" points to unknown nextStepId.`
      );
    }
    for (const branch of step.branches || []) {
      if (!ids.has(branch.nextStepId)) {
        throw AppError.badRequest(
          `Step "${step.label || step.id}" has a branch to an unknown step.`
        );
      }
    }
  }
  return entry;
}

async function loadAssignedOrganizations(
  platformIds: mongoose.Types.ObjectId[]
): Promise<Map<string, AssignedOrganizationDto[]>> {
  const map = new Map<string, AssignedOrganizationDto[]>();
  if (!platformIds.length) return map;

  const copies = await HiringFlowModel.find({
    sourceFlowId: { $in: platformIds },
    status: { $ne: 'archived' },
  })
    .select('sourceFlowId organizationId')
    .lean();

  const orgIds = [
    ...new Set(
      copies
        .map((copy) => (copy.organizationId ? String(copy.organizationId) : ''))
        .filter(Boolean)
    ),
  ];
  const orgs = orgIds.length
    ? await OrganizationModel.find({ _id: { $in: orgIds } }).select('name slug').lean()
    : [];
  const orgMeta = new Map(
    orgs.map((org) => [String(org._id), { name: org.name, slug: org.slug || null }])
  );

  for (const copy of copies) {
    const sourceId = String(copy.sourceFlowId);
    const orgId = copy.organizationId ? String(copy.organizationId) : '';
    if (!orgId) continue;
    const list = map.get(sourceId) || [];
    const meta = orgMeta.get(orgId);
    list.push({
      id: orgId,
      name: meta?.name || 'Organization',
      slug: meta?.slug || null,
    });
    map.set(sourceId, list);
  }
  return map;
}

async function loadPlatformFlow(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid hiring flow id.');
  }
  const doc = await HiringFlowModel.findOne({
    _id: id,
    $or: [{ scope: 'platform' }, { organizationId: null }],
  });
  if (!doc) throw AppError.notFound('Hiring flow not found.');
  return doc;
}

async function syncLockedMessageToCopies(platform: HiringFlowDocument) {
  const locked = findFirstMessageStep(platform.steps, platform.entryStepId);
  if (!locked) return;
  const copies = await HiringFlowModel.find({
    sourceFlowId: platform._id,
    status: { $ne: 'archived' },
  });
  for (const copy of copies) {
    copy.name = platform.name;
    copy.category = platform.category;
    copy.steps = ensureSingleLockedWhatsAppStep(copy.steps, locked);
    copy.entryStepId = locked.id;
    copy.markModified('steps');
    await copy.save();
  }
}

export const hiringFlowsService = {
  async list(
    organizationId: string,
    query: { status?: string; category?: string; q?: string; page?: number; limit?: number }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const filter: Record<string, unknown> = { organizationId };
    if (query.status) filter.status = query.status;
    else filter.status = { $ne: 'archived' };
    if (query.category) filter.category = query.category;
    if (query.q?.trim()) {
      filter.name = { $regex: query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      HiringFlowModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      HiringFlowModel.countDocuments(filter),
    ]);

    const nameCache = new Map<string, string>();
    const items = await Promise.all(
      docs.map(async (doc) => {
        const collapsed = ensureSingleLockedWhatsAppStep(
          doc.steps || [],
          findFirstMessageStep(doc.steps || [], doc.entryStepId)
        );
        if (collapsed.length !== (doc.steps || []).length) {
          doc.steps = collapsed;
          doc.entryStepId = collapsed[0]?.id || doc.entryStepId;
          doc.markModified('steps');
          await doc.save();
        }
        return toSafeHiringFlow(doc, nameCache);
      })
    );
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async get(organizationId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid hiring flow id.');
    }
    const doc = await HiringFlowModel.findOne({ _id: id, organizationId });
    if (!doc) throw AppError.notFound('Hiring flow not found.');
    const collapsed = ensureSingleLockedWhatsAppStep(
      doc.steps || [],
      findFirstMessageStep(doc.steps || [], doc.entryStepId)
    );
    if (collapsed.length !== (doc.steps || []).length) {
      doc.steps = collapsed;
      doc.entryStepId = collapsed[0]?.id || doc.entryStepId;
      doc.markModified('steps');
      await doc.save();
    }
    return toSafeHiringFlow(doc);
  },

  async update(
    organizationId: string,
    id: string,
    input: {
      description?: string | null;
      steps?: HiringFlowStep[];
    }
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid hiring flow id.');
    }
    const doc = await HiringFlowModel.findOne({ _id: id, organizationId });
    if (!doc) throw AppError.notFound('Hiring flow not found.');

    if (input.description !== undefined) {
      doc.description = input.description?.trim() || null;
    }
    if (input.steps !== undefined) {
      const steps = lockFirstMessageOnIncoming(doc.steps, input.steps, doc.entryStepId);
      const locked = findFirstMessageStep(doc.steps, doc.entryStepId);
      const entryStepId = await validateSteps(steps, locked?.id || doc.entryStepId || steps[0]?.id || null);
      doc.steps = steps;
      doc.entryStepId = entryStepId;
    }

    await doc.save();
    return toSafeHiringFlow(doc);
  },
};

type FlowWriteInput = {
  name: string;
  description?: string | null;
  category?: string;
  status?: 'draft' | 'active' | 'archived';
  steps?: HiringFlowStep[];
  entryStepId?: string | null;
};

export const adminHiringFlowsService = {
  async list(query: { status?: string; q?: string; page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const filter: Record<string, unknown> = {
      $or: [{ scope: 'platform' }, { organizationId: null }],
    };
    if (query.status) filter.status = query.status;
    else filter.status = { $ne: 'archived' };
    if (query.q?.trim()) {
      filter.name = { $regex: query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const [docs, total] = await Promise.all([
      HiringFlowModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      HiringFlowModel.countDocuments(filter),
    ]);

    const assigned = await loadAssignedOrganizations(docs.map((doc) => doc._id));
    const nameCache = new Map<string, string>();
    const items = await Promise.all(
      docs.map((doc) => toSafeHiringFlow(doc, nameCache, assigned.get(String(doc._id)) || []))
    );
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async get(id: string) {
    const doc = await loadPlatformFlow(id);
    const assigned = await loadAssignedOrganizations([doc._id]);
    return toSafeHiringFlow(doc, undefined, assigned.get(String(doc._id)) || []);
  },

  async create(userId: string, input: FlowWriteInput) {
    const fromScratch = !input.steps?.length;
    const steps = input.steps?.length ? input.steps : blankStarterSteps();
    const entryStepId = await validateSteps(steps, input.entryStepId || steps[0]?.id || null, {
      requireWhatsAppEntry: true,
      allowIncomplete: fromScratch,
    });

    const doc = await HiringFlowModel.create({
      organizationId: null,
      ownerUserId: userId,
      scope: 'platform',
      sourceFlowId: null,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      category: (input.category || 'general').trim() || 'general',
      status: input.status || 'draft',
      steps,
      entryStepId,
    });
    return toSafeHiringFlow(doc, undefined, []);
  },

  async update(id: string, input: Partial<FlowWriteInput>) {
    const doc = await loadPlatformFlow(id);
    if (input.name !== undefined) doc.name = input.name.trim();
    if (input.description !== undefined) {
      doc.description = input.description?.trim() || null;
    }
    if (input.category !== undefined) {
      doc.category = input.category.trim() || 'general';
    }
    if (input.status !== undefined) {
      doc.status = input.status;
      doc.archivedAt = input.status === 'archived' ? new Date() : null;
    }
    if (input.steps !== undefined) {
      const entryStepId = await validateSteps(
        input.steps,
        input.entryStepId ?? doc.entryStepId ?? input.steps[0]?.id ?? null,
        { requireWhatsAppEntry: true }
      );
      doc.steps = input.steps;
      doc.entryStepId = entryStepId;
    } else if (input.entryStepId !== undefined) {
      doc.entryStepId = await validateSteps(doc.steps, input.entryStepId, {
        requireWhatsAppEntry: true,
      });
    }
    await doc.save();
    await syncLockedMessageToCopies(doc);
    const assigned = await loadAssignedOrganizations([doc._id]);
    return toSafeHiringFlow(doc, undefined, assigned.get(String(doc._id)) || []);
  },

  async remove(id: string) {
    const doc = await loadPlatformFlow(id);
    doc.status = 'archived';
    doc.archivedAt = new Date();
    await doc.save();
    await HiringFlowModel.updateMany(
      { sourceFlowId: doc._id, status: { $ne: 'archived' } },
      { $set: { status: 'archived', archivedAt: new Date() } }
    );
    return { archived: true, id };
  },

  async setAssignedOrganizations(id: string, organizationIds: string[], adminUserId: string) {
    const platform = await loadPlatformFlow(id);
    const uniqueIds = [...new Set(organizationIds.filter((orgId) => mongoose.Types.ObjectId.isValid(orgId)))];
    const orgs = await OrganizationModel.find({
      _id: { $in: uniqueIds },
      deletedAt: null,
    }).select('_id');
    const validIds = new Set(orgs.map((org) => String(org._id)));
    const targetIds = uniqueIds.filter((orgId) => validIds.has(orgId));

    const existing = await HiringFlowModel.find({ sourceFlowId: platform._id });
    const byOrg = new Map(
      existing
        .filter((copy) => copy.organizationId)
        .map((copy) => [String(copy.organizationId), copy])
    );

    for (const orgId of targetIds) {
      const copy = byOrg.get(orgId);
      if (copy) {
        copy.status = 'active';
        copy.archivedAt = null;
        copy.name = platform.name;
        copy.category = platform.category;
        const locked = findFirstMessageStep(platform.steps, platform.entryStepId);
        copy.steps = ensureSingleLockedWhatsAppStep(copy.steps, locked);
        if (locked) copy.entryStepId = locked.id;
        copy.markModified('steps');
        await copy.save();
        continue;
      }
      await HiringFlowModel.create({
        organizationId: orgId,
        ownerUserId: adminUserId,
        scope: 'organization',
        sourceFlowId: platform._id,
        name: platform.name,
        description: platform.description,
        category: platform.category,
        status: 'active',
        steps: platform.steps,
        entryStepId: platform.entryStepId,
      });
    }

    for (const [orgId, copy] of byOrg) {
      if (!targetIds.includes(orgId) && copy.status !== 'archived') {
        copy.status = 'archived';
        copy.archivedAt = new Date();
        await copy.save();
      }
    }

    const assigned = await loadAssignedOrganizations([platform._id]);
    return toSafeHiringFlow(platform, undefined, assigned.get(String(platform._id)) || []);
  },
};
