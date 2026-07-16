import mongoose from 'mongoose';

import { assertSameOrganization } from '../../middleware/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  getSkip,
  type PaginatedResult,
} from '../../shared/pagination/paginate.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { isMemberManager } from '../organizations/permissions.js';
import { UserModel } from '../auth/user.model.js';
import {
  CandidateListModel,
  type CandidateListDocument,
} from './candidate-list.model.js';
import type { CreateListInput, ListListsQuery, UpdateListInput } from './pool.validation.js';

export type ActorContext = {
  userId: string;
  organizationId: string;
  role: string;
};

export function toPublicList(list: CandidateListDocument, ownerName?: string | null) {
  return {
    id: list._id.toHexString(),
    organizationId: list.organizationId.toHexString(),
    name: list.name,
    description: list.description ?? null,
    jobId: list.jobId ? list.jobId.toHexString() : null,
    visibility: list.visibility,
    ownerUserId: list.ownerUserId.toHexString(),
    owner: ownerName ?? null,
    tags: list.tags ?? [],
    candidateCount: list.candidateCount ?? 0,
    archivedAt: list.archivedAt?.toISOString?.() ?? null,
    createdAt: list.createdAt?.toISOString?.() ?? null,
    updatedAt: list.updatedAt?.toISOString?.() ?? null,
  };
}

async function loadListForOrg(listId: string, organizationId: string) {
  if (!isValidObjectId(listId)) {
    throw AppError.notFound('List not found');
  }
  const list = await CandidateListModel.findById(listId);
  if (!list || list.deletedAt) {
    throw AppError.notFound('List not found');
  }
  assertSameOrganization(list.organizationId, organizationId);
  return list;
}

async function ownerNames(ids: mongoose.Types.ObjectId[]) {
  const unique = [...new Set(ids.map((id) => id.toHexString()))];
  if (!unique.length) return new Map<string, string>();
  const users = await UserModel.find({
    _id: { $in: unique.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .select('firstName lastName email')
    .lean();
  const map = new Map<string, string>();
  for (const user of users) {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    map.set(String(user._id), name || user.email || String(user._id));
  }
  return map;
}

export class ListService {
  async list(
    actor: ActorContext,
    query: ListListsQuery
  ): Promise<PaginatedResult<ReturnType<typeof toPublicList>>> {
    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      deletedAt: null,
    };

    if (query.archived === true) {
      filter.archivedAt = { $ne: null };
    } else if (query.archived === false || query.archived === undefined) {
      filter.archivedAt = null;
    }

    if (query.search) {
      filter.name = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    // Private lists only visible to owner (unless manager)
    if (!isMemberManager(actor.role)) {
      filter.$or = [
        { visibility: { $in: ['team', 'organization'] } },
        { visibility: 'private', ownerUserId: new mongoose.Types.ObjectId(actor.userId) },
      ];
    }

    const total = await CandidateListModel.countDocuments(filter);
    const lists = await CandidateListModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip(getSkip(query.page, query.limit))
      .limit(query.limit);

    const names = await ownerNames(lists.map((l) => l.ownerUserId));
    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      items: lists.map((list) =>
        toPublicList(list, names.get(list.ownerUserId.toHexString()) ?? null)
      ),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async create(actor: ActorContext, input: CreateListInput) {
    const existing = await CandidateListModel.findOne({
      organizationId: actor.organizationId,
      name: input.name.trim(),
      deletedAt: null,
    });
    if (existing) {
      throw AppError.conflict('A list with this name already exists');
    }

    const list = await CandidateListModel.create({
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      name: input.name.trim(),
      description: input.description ?? null,
      jobId: input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null,
      visibility: input.visibility ?? 'team',
      ownerUserId: new mongoose.Types.ObjectId(actor.userId),
      tags: input.tags ?? [],
      candidateCount: 0,
    });

    return toPublicList(list);
  }

  async getById(actor: ActorContext, listId: string) {
    const list = await loadListForOrg(listId, actor.organizationId);
    if (
      list.visibility === 'private' &&
      list.ownerUserId.toHexString() !== actor.userId &&
      !isMemberManager(actor.role)
    ) {
      throw AppError.notFound('List not found');
    }
    const names = await ownerNames([list.ownerUserId]);
    return toPublicList(list, names.get(list.ownerUserId.toHexString()) ?? null);
  }

  async update(actor: ActorContext, listId: string, input: UpdateListInput) {
    const list = await loadListForOrg(listId, actor.organizationId);

    if (
      list.ownerUserId.toHexString() !== actor.userId &&
      !isMemberManager(actor.role)
    ) {
      throw AppError.forbidden('Only the list owner or a manager can update this list');
    }

    if (input.name !== undefined && input.name.trim() !== list.name) {
      const clash = await CandidateListModel.findOne({
        organizationId: actor.organizationId,
        name: input.name.trim(),
        deletedAt: null,
        _id: { $ne: list._id },
      });
      if (clash) {
        throw AppError.conflict('A list with this name already exists');
      }
      list.name = input.name.trim();
    }

    if (input.description !== undefined) list.description = input.description;
    if (input.jobId !== undefined) {
      list.jobId = input.jobId ? new mongoose.Types.ObjectId(input.jobId) : null;
    }
    if (input.visibility !== undefined) list.visibility = input.visibility;
    if (input.tags !== undefined) list.tags = input.tags;

    await list.save();
    return toPublicList(list);
  }

  async softDelete(actor: ActorContext, listId: string) {
    const list = await loadListForOrg(listId, actor.organizationId);
    if (
      list.ownerUserId.toHexString() !== actor.userId &&
      !isMemberManager(actor.role)
    ) {
      throw AppError.forbidden('Only the list owner or a manager can delete this list');
    }
    list.deletedAt = new Date();
    await list.save();
    return { id: list._id.toHexString(), deleted: true };
  }

  async archive(actor: ActorContext, listId: string) {
    const list = await loadListForOrg(listId, actor.organizationId);
    if (
      list.ownerUserId.toHexString() !== actor.userId &&
      !isMemberManager(actor.role)
    ) {
      throw AppError.forbidden('Only the list owner or a manager can archive this list');
    }
    list.archivedAt = new Date();
    await list.save();
    return toPublicList(list);
  }

  async incrementCount(listId: string, by = 1) {
    await CandidateListModel.updateOne(
      { _id: listId, deletedAt: null },
      { $inc: { candidateCount: by } }
    );
  }

  async decrementCount(listId: string, by = 1) {
    const list = await CandidateListModel.findById(listId);
    if (!list || list.deletedAt) return;
    list.candidateCount = Math.max(0, (list.candidateCount ?? 0) - by);
    await list.save();
  }
}

export const listService = new ListService();
export { loadListForOrg };
