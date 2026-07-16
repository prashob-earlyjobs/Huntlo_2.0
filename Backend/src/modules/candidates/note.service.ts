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
  CandidateNoteModel,
  type CandidateNoteDocument,
} from './candidate-note.model.js';
import { SavedCandidateModel } from './saved-candidate.model.js';
import type { CreateNoteInput, UpdateNoteInput } from './pool.validation.js';
import type { ActorContext } from './list.service.js';

export function toPublicNote(
  note: CandidateNoteDocument,
  authorName?: string | null
) {
  return {
    id: note._id.toHexString(),
    organizationId: note.organizationId.toHexString(),
    candidateId: note.candidateId.toHexString(),
    authorUserId: note.authorUserId.toHexString(),
    author: authorName ?? null,
    body: note.body,
    visibility: note.visibility,
    createdAt: note.createdAt?.toISOString?.() ?? null,
    updatedAt: note.updatedAt?.toISOString?.() ?? null,
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

async function authorNames(ids: mongoose.Types.ObjectId[]) {
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

export class NoteService {
  async list(
    actor: ActorContext,
    candidateId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResult<ReturnType<typeof toPublicNote>>> {
    await loadCandidateForOrg(candidateId, actor.organizationId);

    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      candidateId: new mongoose.Types.ObjectId(candidateId),
      $or: [
        { visibility: 'team' },
        { visibility: 'private', authorUserId: new mongoose.Types.ObjectId(actor.userId) },
      ],
    };

    const total = await CandidateNoteModel.countDocuments(filter);
    const notes = await CandidateNoteModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(page, limit))
      .limit(limit);

    const names = await authorNames(notes.map((n) => n.authorUserId));
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items: notes.map((note) =>
        toPublicNote(note, names.get(note.authorUserId.toHexString()) ?? null)
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(actor: ActorContext, candidateId: string, input: CreateNoteInput) {
    await loadCandidateForOrg(candidateId, actor.organizationId);

    const note = await CandidateNoteModel.create({
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      candidateId: new mongoose.Types.ObjectId(candidateId),
      authorUserId: new mongoose.Types.ObjectId(actor.userId),
      body: input.body.trim(),
      visibility: input.visibility ?? 'team',
    });

    await SavedCandidateModel.updateOne(
      { _id: candidateId },
      { $set: { lastActivityAt: new Date() } }
    );

    const names = await authorNames([note.authorUserId]);
    return toPublicNote(note, names.get(note.authorUserId.toHexString()) ?? null);
  }

  async update(
    actor: ActorContext,
    candidateId: string,
    noteId: string,
    input: UpdateNoteInput
  ) {
    await loadCandidateForOrg(candidateId, actor.organizationId);
    if (!isValidObjectId(noteId)) {
      throw AppError.notFound('Note not found');
    }

    const note = await CandidateNoteModel.findOne({
      _id: noteId,
      candidateId,
      organizationId: actor.organizationId,
    });
    if (!note) {
      throw AppError.notFound('Note not found');
    }

    if (note.authorUserId.toHexString() !== actor.userId) {
      throw AppError.forbidden('Only the author can edit this note');
    }

    if (input.body !== undefined) note.body = input.body.trim();
    if (input.visibility !== undefined) note.visibility = input.visibility;
    await note.save();

    const names = await authorNames([note.authorUserId]);
    return toPublicNote(note, names.get(note.authorUserId.toHexString()) ?? null);
  }

  async remove(actor: ActorContext, candidateId: string, noteId: string) {
    await loadCandidateForOrg(candidateId, actor.organizationId);
    if (!isValidObjectId(noteId)) {
      throw AppError.notFound('Note not found');
    }

    const note = await CandidateNoteModel.findOne({
      _id: noteId,
      candidateId,
      organizationId: actor.organizationId,
    });
    if (!note) {
      throw AppError.notFound('Note not found');
    }

    const isAuthor = note.authorUserId.toHexString() === actor.userId;
    const canManageTeam =
      note.visibility === 'team' && isMemberManager(actor.role);

    if (!isAuthor && !canManageTeam) {
      throw AppError.forbidden('You cannot delete this note');
    }

    await note.deleteOne();
    return { id: noteId, deleted: true };
  }
}

export const noteService = new NoteService();
