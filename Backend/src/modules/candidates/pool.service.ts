import mongoose from 'mongoose';

import { assertSameOrganization } from '../../middleware/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  getSkip,
  parseSortParam,
  type PaginatedResult,
} from '../../shared/pagination/paginate.js';
import { isValidEmail, normalizeEmail } from '../../shared/validation/email.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { isValidPhone, normalizePhone } from '../../shared/validation/phone.js';
import { UserModel } from '../auth/user.model.js';
import { JobModel } from '../jobs/job.model.js';
import { SourcedCandidateModel } from '../sourcing/sourced-candidate.model.js';
import { CandidateListModel } from './candidate-list.model.js';
import { listService } from './list.service.js';
import {
  POOL_STATUSES,
  SavedCandidateModel,
  type PoolSourceType,
  type PoolStatus,
  type SavedCandidateDocument,
} from './saved-candidate.model.js';
import type {
  BulkAddToListInput,
  BulkArchiveInput,
  BulkAssignInput,
  BulkExportInput,
  BulkRemoveFromListInput,
  BulkSaveSourcedToListInput,
  BulkStatusInput,
  CreatePoolCandidateInput,
  ListPoolQuery,
  UpdatePoolCandidateInput,
} from './pool.validation.js';
import type { ActorContext } from './list.service.js';

const SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'lastActivityAt',
  'name',
  'status',
  'experienceYears',
] as const;

const STATUS_TITLE_CASE: Record<PoolStatus, string> = {
  new: 'New',
  saved: 'Saved',
  contacted: 'Contacted',
  interested: 'Interested',
  qualified: 'Qualified',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  rejected: 'Rejected',
  hired: 'Hired',
  archived: 'Archived',
};

const SOURCE_LABEL: Record<PoolSourceType, string> = {
  sourcing: 'AI Search',
  people_scout: 'People Scout',
  import: 'Import',
  referral: 'Referral',
  manual: 'Manual',
};

export function statusToPipelineStatus(status: string): string {
  return STATUS_TITLE_CASE[status as PoolStatus] ?? status;
}

export function pipelineStatusToStatus(value: string): PoolStatus | null {
  const lower = value.trim().toLowerCase().replace(/\s+/g, '_');
  if ((POOL_STATUSES as readonly string[]).includes(lower)) {
    return lower as PoolStatus;
  }
  return null;
}

function optionalNormalizeEmail(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (!isValidEmail(value)) {
    throw AppError.validation('Invalid email address', [
      { path: 'email', message: 'Invalid email address' },
    ]);
  }
  return normalizeEmail(value);
}

function optionalNormalizePhone(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (!isValidPhone(value)) {
    throw AppError.validation('Invalid phone number', [
      { path: 'phone', message: 'Invalid phone number' },
    ]);
  }
  return normalizePhone(value);
}

async function loadUserNames(ids: Array<mongoose.Types.ObjectId | null | undefined>) {
  const unique = [
    ...new Set(
      ids
        .filter((id): id is mongoose.Types.ObjectId => Boolean(id))
        .map((id) => id.toHexString())
    ),
  ];
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

async function loadListNames(
  organizationId: string,
  listIds: mongoose.Types.ObjectId[]
) {
  if (!listIds.length) return new Map<string, string>();
  const lists = await CandidateListModel.find({
    _id: { $in: listIds },
    organizationId,
    deletedAt: null,
  })
    .select('name')
    .lean();
  const map = new Map<string, string>();
  for (const list of lists) {
    map.set(String(list._id), list.name);
  }
  return map;
}

async function loadJobNames(
  organizationId: string,
  jobIds: mongoose.Types.ObjectId[]
) {
  if (!jobIds.length) return new Map<string, string>();
  const jobs = await JobModel.find({
    _id: { $in: jobIds },
    organizationId,
    deletedAt: null,
  })
    .select('title')
    .lean();
  return new Map(jobs.map((job) => [String(job._id), job.title]));
}

export function toPublicPoolCandidate(
  candidate: SavedCandidateDocument,
  options?: {
    ownerName?: string | null;
    assignedName?: string | null;
    listNames?: Map<string, string>;
    jobNames?: Map<string, string>;
  }
) {
  const listIds = (candidate.listIds ?? []).map((id) => id.toHexString());
  const listNames = options?.listNames;
  const lists = listIds.map((id) => listNames?.get(id) ?? id);
  const ownerUserId = candidate.ownerUserId ? candidate.ownerUserId.toHexString() : null;
  const assignedUserId = candidate.assignedUserId
    ? candidate.assignedUserId.toHexString()
    : null;

  return {
    id: candidate._id.toHexString(),
    organizationId: candidate.organizationId.toHexString(),
    externalCandidateId: candidate.externalCandidateId ?? null,
    name: candidate.name,
    email: candidate.email ?? null,
    phone: candidate.phone ?? null,
    linkedinUrl: candidate.linkedinUrl ?? null,
    headline: candidate.headline ?? null,
    currentTitle: candidate.currentTitle ?? null,
    currentCompany: candidate.currentCompany ?? null,
    location: candidate.location ?? null,
    experienceYears: candidate.experienceYears ?? null,
    skills: candidate.skills ?? [],
    tags: candidate.tags ?? [],
    status: candidate.status,
    pipelineStatus: statusToPipelineStatus(candidate.status),
    sourceType: candidate.sourceType,
    source: SOURCE_LABEL[candidate.sourceType as PoolSourceType] ?? candidate.sourceType,
    sourceId: candidate.sourceId ?? null,
    ownerUserId,
    owner: options?.ownerName ?? null,
    assignedUserId,
    assigned: options?.assignedName ?? null,
    jobIds: (candidate.jobIds ?? []).map((id) => id.toHexString()),
    jobs: (candidate.jobIds ?? []).map(
      (id) => options?.jobNames?.get(id.toHexString()) ?? id.toHexString()
    ),
    listIds,
    lists,
    customFields: candidate.customFields ?? {},
    lastActivityAt: candidate.lastActivityAt?.toISOString?.() ?? null,
    archivedAt: candidate.archivedAt?.toISOString?.() ?? null,
    emailRevealed: Boolean(candidate.email),
    phoneRevealed: Boolean(candidate.phone),
    createdAt: candidate.createdAt?.toISOString?.() ?? null,
    updatedAt: candidate.updatedAt?.toISOString?.() ?? null,
  };
}

async function loadCandidateForOrg(candidateId: string, organizationId: string) {
  if (!isValidObjectId(candidateId)) {
    throw AppError.notFound('Candidate not found');
  }
  const candidate = await SavedCandidateModel.findById(candidateId);
  if (!candidate || candidate.deletedAt) {
    throw AppError.notFound('Candidate not found');
  }
  assertSameOrganization(candidate.organizationId, organizationId);
  return candidate;
}

async function enrichPublic(candidates: SavedCandidateDocument[]) {
  const ownerIds = candidates.map((c) => c.ownerUserId);
  const assignedIds = candidates.map((c) => c.assignedUserId);
  const names = await loadUserNames([...ownerIds, ...assignedIds]);
  const allListIds = candidates.flatMap((c) => c.listIds ?? []);
  const allJobIds = candidates.flatMap((c) => c.jobIds ?? []);
  const orgId = candidates[0]?.organizationId?.toHexString();
  const [listNames, jobNames] = orgId
    ? await Promise.all([
        loadListNames(orgId, allListIds),
        loadJobNames(orgId, allJobIds),
      ])
    : [new Map<string, string>(), new Map<string, string>()];

  return candidates.map((c) =>
    toPublicPoolCandidate(c, {
      ownerName: c.ownerUserId ? names.get(c.ownerUserId.toHexString()) ?? null : null,
      assignedName: c.assignedUserId
        ? names.get(c.assignedUserId.toHexString()) ?? null
        : null,
      listNames,
      jobNames,
    })
  );
}

function toObjectIds(ids: string[] | undefined): mongoose.Types.ObjectId[] {
  if (!ids) return [];
  return ids.filter((id) => isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
}

function escapeCsv(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export class PoolService {
  async list(
    actor: ActorContext,
    query: ListPoolQuery
  ): Promise<PaginatedResult<ReturnType<typeof toPublicPoolCandidate>>> {
    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      deletedAt: null,
    };

    if (query.archived === true) {
      filter.archivedAt = { $ne: null };
    } else {
      filter.archivedAt = null;
    }

    if (query.status?.length) {
      filter.status = { $in: query.status };
    }
    if (query.ownerUserId) {
      filter.ownerUserId = new mongoose.Types.ObjectId(query.ownerUserId);
    }
    if (query.assignedUserId) {
      filter.assignedUserId = new mongoose.Types.ObjectId(query.assignedUserId);
    }
    if (query.listId) {
      filter.listIds = new mongoose.Types.ObjectId(query.listId);
    }
    if (query.jobId) {
      filter.jobIds = new mongoose.Types.ObjectId(query.jobId);
    }
    if (query.sourceType) {
      filter.sourceType = query.sourceType;
    }
    if (query.tags?.length) {
      filter.tags = { $all: query.tags };
    }
    if (query.view === 'recent') {
      filter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }
    const conditions: Record<string, unknown>[] = [];
    if (query.view === 'revealed') {
      conditions.push({
        $or: [
          { email: { $nin: [null, ''] } },
          { phone: { $nin: [null, ''] } },
        ],
      });
    }
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      conditions.push({
        $or: [
          { name: regex },
          { email: regex },
          { headline: regex },
          { currentTitle: regex },
          { currentCompany: regex },
          { location: regex },
          { skills: regex },
          { tags: regex },
        ],
      });
    }
    if (conditions.length) filter.$and = conditions;

    let sort: Record<string, 1 | -1>;
    try {
      sort = parseSortParam(query.sort, SORT_FIELDS, '-lastActivityAt');
    } catch {
      throw AppError.badRequest('Invalid sort field');
    }

    const total = await SavedCandidateModel.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / query.limit));
    const page = Math.min(query.page, totalPages);
    const candidates = await SavedCandidateModel.find(filter)
      .sort(sort)
      .skip(getSkip(page, query.limit))
      .limit(query.limit);

    const items = await enrichPublic(candidates);

    return {
      items,
      total,
      page,
      limit: query.limit,
      totalPages,
    };
  }

  async create(actor: ActorContext, input: CreatePoolCandidateInput) {
    const email = optionalNormalizeEmail(input.email);
    const phone = optionalNormalizePhone(input.phone);
    const linkedinUrl =
      input.linkedinUrl === '' || input.linkedinUrl === undefined
        ? null
        : input.linkedinUrl ?? null;

    const candidate = await SavedCandidateModel.create({
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      name: input.name.trim(),
      email,
      phone,
      linkedinUrl,
      headline: input.headline ?? null,
      currentTitle: input.currentTitle ?? null,
      currentCompany: input.currentCompany ?? null,
      location: input.location ?? null,
      experienceYears: input.experienceYears ?? null,
      skills: input.skills ?? [],
      tags: input.tags ?? [],
      status: input.status ?? 'new',
      sourceType: input.sourceType ?? 'manual',
      sourceId: input.sourceId ?? null,
      externalCandidateId: input.externalCandidateId ?? null,
      ownerUserId: input.ownerUserId
        ? new mongoose.Types.ObjectId(input.ownerUserId)
        : new mongoose.Types.ObjectId(actor.userId),
      assignedUserId: input.assignedUserId
        ? new mongoose.Types.ObjectId(input.assignedUserId)
        : null,
      jobIds: toObjectIds(input.jobIds),
      listIds: toObjectIds(input.listIds),
      customFields: input.customFields ?? {},
      lastActivityAt: new Date(),
    });

    // Maintain list counts for any initial list membership
    for (const listId of candidate.listIds ?? []) {
      await listService.incrementCount(listId.toHexString(), 1);
    }

    const [publicCandidate] = await enrichPublic([candidate]);
    return publicCandidate!;
  }

  async getById(actor: ActorContext, candidateId: string) {
    const candidate = await loadCandidateForOrg(candidateId, actor.organizationId);
    const [publicCandidate] = await enrichPublic([candidate]);
    return publicCandidate!;
  }

  async update(actor: ActorContext, candidateId: string, input: UpdatePoolCandidateInput) {
    const candidate = await loadCandidateForOrg(candidateId, actor.organizationId);

    if (input.name !== undefined) candidate.name = input.name.trim();
    if (input.email !== undefined) candidate.email = optionalNormalizeEmail(input.email);
    if (input.phone !== undefined) candidate.phone = optionalNormalizePhone(input.phone);
    if (input.linkedinUrl !== undefined) {
      candidate.linkedinUrl =
        input.linkedinUrl === '' || input.linkedinUrl === null ? null : input.linkedinUrl;
    }
    if (input.headline !== undefined) candidate.headline = input.headline;
    if (input.currentTitle !== undefined) candidate.currentTitle = input.currentTitle;
    if (input.currentCompany !== undefined) candidate.currentCompany = input.currentCompany;
    if (input.location !== undefined) candidate.location = input.location;
    if (input.experienceYears !== undefined) candidate.experienceYears = input.experienceYears;
    if (input.skills !== undefined) candidate.skills = input.skills;
    if (input.tags !== undefined) candidate.tags = input.tags;
    if (input.status !== undefined) {
      candidate.status = input.status;
      if (input.status === 'archived') {
        candidate.archivedAt = candidate.archivedAt ?? new Date();
      }
    }
    if (input.ownerUserId !== undefined) {
      candidate.ownerUserId = input.ownerUserId
        ? new mongoose.Types.ObjectId(input.ownerUserId)
        : null;
    }
    if (input.assignedUserId !== undefined) {
      candidate.assignedUserId = input.assignedUserId
        ? new mongoose.Types.ObjectId(input.assignedUserId)
        : null;
    }
    if (input.jobIds !== undefined) candidate.jobIds = toObjectIds(input.jobIds);
    if (input.customFields !== undefined) candidate.customFields = input.customFields;

    if (input.listIds !== undefined) {
      const prev = new Set((candidate.listIds ?? []).map((id) => id.toHexString()));
      const next = toObjectIds(input.listIds);
      const nextSet = new Set(next.map((id) => id.toHexString()));

      for (const id of prev) {
        if (!nextSet.has(id)) await listService.decrementCount(id, 1);
      }
      for (const id of nextSet) {
        if (!prev.has(id)) await listService.incrementCount(id, 1);
      }
      candidate.listIds = next;
    }

    candidate.lastActivityAt = new Date();
    await candidate.save();

    const [publicCandidate] = await enrichPublic([candidate]);
    return publicCandidate!;
  }

  async softDelete(actor: ActorContext, candidateId: string) {
    const candidate = await loadCandidateForOrg(candidateId, actor.organizationId);
    for (const listId of candidate.listIds ?? []) {
      await listService.decrementCount(listId.toHexString(), 1);
    }
    candidate.listIds = [];
    candidate.deletedAt = new Date();
    await candidate.save();
    return { id: candidate._id.toHexString(), deleted: true };
  }

  async bulkStatus(actor: ActorContext, input: BulkStatusInput) {
    const ids = input.ids.filter(isValidObjectId);
    const result = await SavedCandidateModel.updateMany(
      {
        _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
        organizationId: new mongoose.Types.ObjectId(actor.organizationId),
        deletedAt: null,
      },
      {
        $set: {
          status: input.status,
          lastActivityAt: new Date(),
          ...(input.status === 'archived' ? { archivedAt: new Date() } : {}),
        },
      }
    );
    return { matched: result.matchedCount, modified: result.modifiedCount, status: input.status };
  }

  async bulkAssign(actor: ActorContext, input: BulkAssignInput) {
    const ids = input.ids.filter(isValidObjectId);
    const assignedUserId = input.assignedUserId
      ? new mongoose.Types.ObjectId(input.assignedUserId)
      : null;
    const result = await SavedCandidateModel.updateMany(
      {
        _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
        organizationId: new mongoose.Types.ObjectId(actor.organizationId),
        deletedAt: null,
      },
      {
        $set: {
          assignedUserId,
          lastActivityAt: new Date(),
        },
      }
    );
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      assignedUserId: input.assignedUserId,
    };
  }

  async bulkAddToList(actor: ActorContext, input: BulkAddToListInput) {
    const list = await CandidateListModel.findById(input.listId);
    if (!list || list.deletedAt) {
      throw AppError.notFound('List not found');
    }
    assertSameOrganization(list.organizationId, actor.organizationId);

    const ids = input.ids.filter(isValidObjectId);
    const listOid = new mongoose.Types.ObjectId(input.listId);
    const orgOid = new mongoose.Types.ObjectId(actor.organizationId);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      organizationId: orgOid,
      deletedAt: null,
      listIds: { $ne: listOid },
    }).select('_id');

    if (candidates.length) {
      await SavedCandidateModel.updateMany(
        { _id: { $in: candidates.map((c) => c._id) } },
        {
          $addToSet: { listIds: listOid },
          $set: { lastActivityAt: new Date() },
        }
      );
      await CandidateListModel.updateOne(
        { _id: listOid },
        { $inc: { candidateCount: candidates.length } }
      );
    }

    return { added: candidates.length, listId: input.listId };
  }

  async bulkSaveSourcedToList(
    actor: ActorContext,
    input: BulkSaveSourcedToListInput
  ) {
    const list = await CandidateListModel.findById(input.listId);
    if (!list || list.deletedAt) {
      throw AppError.notFound('List not found');
    }
    assertSameOrganization(list.organizationId, actor.organizationId);

    const orgOid = new mongoose.Types.ObjectId(actor.organizationId);
    const listOid = new mongoose.Types.ObjectId(input.listId);
    const ownerOid = new mongoose.Types.ObjectId(actor.userId);
    const sourcedIds = input.sourcedCandidateIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const sourcedCandidates = await SourcedCandidateModel.find({
      _id: { $in: sourcedIds },
      organizationId: orgOid,
    });

    if (!sourcedCandidates.length) {
      return {
        requested: input.sourcedCandidateIds.length,
        saved: 0,
        notFound: input.sourcedCandidateIds.length,
        listId: input.listId,
      };
    }

    const uniqueCandidates = [
      ...new Map(
        sourcedCandidates.map((candidate) => [
          candidate.candidateId ||
            candidate.externalCandidateId ||
            candidate._id.toHexString(),
          candidate,
        ])
      ).values(),
    ];
    const externalCandidateIds = uniqueCandidates.map(
      (candidate) =>
        candidate.candidateId ||
        candidate.externalCandidateId ||
        candidate._id.toHexString()
    );
    const alreadyOnList = await SavedCandidateModel.countDocuments({
      organizationId: orgOid,
      externalCandidateId: { $in: externalCandidateIds },
      deletedAt: null,
      listIds: listOid,
    });

    const now = new Date();
    const operations = uniqueCandidates.map((candidate) => {
      const externalCandidateId =
        candidate.candidateId ||
        candidate.externalCandidateId ||
        candidate._id.toHexString();
      const linkedinUrl =
        candidate.linkedinProfileUrl ||
        candidate.basicProfile?.linkedinUrl ||
        null;

      return {
        updateOne: {
          filter: {
            organizationId: orgOid,
            externalCandidateId,
            deletedAt: null,
          },
          update: {
            $setOnInsert: {
              organizationId: orgOid,
              externalCandidateId,
              sourceType: 'sourcing' as const,
              sourceId: candidate.sourcingSessionId.toHexString(),
              ownerUserId: ownerOid,
              assignedUserId: null,
              status: 'saved' as const,
              jobIds: [],
              tags: [],
              customFields: {},
              name: candidate.name || candidate.basicProfile?.name || 'Unknown',
              email: null,
              phone: null,
              linkedinUrl,
              headline: candidate.basicProfile?.headline ?? null,
              currentTitle:
                candidate.currentRole ?? candidate.currentEmployment?.title ?? null,
              currentCompany:
                candidate.currentCompany ?? candidate.currentEmployment?.company ?? null,
              location: candidate.location || null,
              experienceYears: candidate.experienceYears ?? null,
              skills: candidate.skills ?? [],
              archivedAt: null,
              deletedAt: null,
              createdAt: now,
            },
            $addToSet: { listIds: listOid },
            $set: { lastActivityAt: now, updatedAt: now },
          },
          upsert: true,
        },
      };
    });

    await SavedCandidateModel.bulkWrite(operations, {
      ordered: false,
    });
    const saved = uniqueCandidates.length - alreadyOnList;

    if (saved > 0) {
      await CandidateListModel.updateOne(
        { _id: listOid },
        { $inc: { candidateCount: saved } }
      );
    }

    return {
      requested: input.sourcedCandidateIds.length,
      saved,
      notFound: input.sourcedCandidateIds.length - sourcedCandidates.length,
      listId: input.listId,
    };
  }

  async bulkRemoveFromList(actor: ActorContext, input: BulkRemoveFromListInput) {
    const list = await CandidateListModel.findById(input.listId);
    if (!list || list.deletedAt) {
      throw AppError.notFound('List not found');
    }
    assertSameOrganization(list.organizationId, actor.organizationId);

    const ids = input.ids.filter(isValidObjectId);
    const listOid = new mongoose.Types.ObjectId(input.listId);
    const orgOid = new mongoose.Types.ObjectId(actor.organizationId);

    const candidates = await SavedCandidateModel.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      organizationId: orgOid,
      deletedAt: null,
      listIds: listOid,
    }).select('_id');

    if (candidates.length) {
      await SavedCandidateModel.updateMany(
        { _id: { $in: candidates.map((c) => c._id) } },
        {
          $pull: { listIds: listOid },
          $set: { lastActivityAt: new Date() },
        }
      );
      list.candidateCount = Math.max(0, (list.candidateCount ?? 0) - candidates.length);
      await list.save();
    }

    return { removed: candidates.length, listId: input.listId };
  }

  async bulkArchive(actor: ActorContext, input: BulkArchiveInput) {
    const ids = input.ids.filter(isValidObjectId);
    const result = await SavedCandidateModel.updateMany(
      {
        _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
        organizationId: new mongoose.Types.ObjectId(actor.organizationId),
        deletedAt: null,
      },
      {
        $set: {
          status: 'archived',
          archivedAt: new Date(),
          lastActivityAt: new Date(),
        },
      }
    );
    return { matched: result.matchedCount, modified: result.modifiedCount };
  }

  async bulkExport(actor: ActorContext, input: BulkExportInput) {
    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      deletedAt: null,
      archivedAt: null,
    };

    if (input.ids?.length) {
      filter._id = {
        $in: input.ids.filter(isValidObjectId).map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (input.status) filter.status = input.status;
    if (input.listId) filter.listIds = new mongoose.Types.ObjectId(input.listId);

    const candidates = await SavedCandidateModel.find(filter).limit(5000);
    const items = await enrichPublic(candidates);

    if (input.format === 'json') {
      return { format: 'json' as const, items };
    }

    const headers = [
      'id',
      'name',
      'email',
      'phone',
      'linkedinUrl',
      'status',
      'pipelineStatus',
      'source',
      'location',
      'currentTitle',
      'currentCompany',
      'experienceYears',
      'skills',
      'tags',
      'owner',
      'lists',
    ];

    const lines = [headers.join(',')];
    for (const item of items) {
      lines.push(
        [
          item.id,
          item.name,
          item.email,
          item.phone,
          item.linkedinUrl,
          item.status,
          item.pipelineStatus,
          item.source,
          item.location,
          item.currentTitle,
          item.currentCompany,
          item.experienceYears,
          (item.skills ?? []).join('; '),
          (item.tags ?? []).join('; '),
          item.owner,
          (item.lists ?? []).join('; '),
        ]
          .map(escapeCsv)
          .join(',')
      );
    }

    return { format: 'csv' as const, csv: lines.join('\n'), items };
  }

  /** Org-wide pool KPIs for the Candidate Pool metric strip. */
  async overview(actor: ActorContext) {
    const orgOid = new mongoose.Types.ObjectId(actor.organizationId);
    const match = {
      organizationId: orgOid,
      deletedAt: null,
      archivedAt: null,
    };

    const [totalCandidates, statusRows] = await Promise.all([
      SavedCandidateModel.countDocuments(match),
      SavedCandidateModel.aggregate<{ _id: string; count: number }>([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus: Record<string, number> = {};
    for (const row of statusRows) byStatus[row._id] = row.count;

    let inOutreach =
      (byStatus.contacted || 0) + (byStatus.interested || 0);

    try {
      const { OutreachEnrollmentModel } = await import(
        '../outreach/enrollment.model.js'
      );
      const enrollmentCount = await OutreachEnrollmentModel.countDocuments({
        organizationId: orgOid,
        status: { $in: ['pending', 'active', 'waiting', 'replied'] },
      });
      if (enrollmentCount > 0) inOutreach = enrollmentCount;
    } catch {
      // Outreach module unavailable — keep status-based count.
    }

    return {
      totalCandidates,
      inOutreach,
      screening: byStatus.screening || 0,
      shortlisted: byStatus.shortlisted || 0,
      interviews: byStatus.interview_scheduled || 0,
      byStatus,
    };
  }
}

export const poolService = new PoolService();
export { loadCandidateForOrg };
