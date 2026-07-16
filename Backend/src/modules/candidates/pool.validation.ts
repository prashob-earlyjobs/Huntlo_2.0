import { z } from 'zod';

import { objectIdSchema } from '../../shared/validation/object-id.js';
import { POOL_SOURCE_TYPES, POOL_STATUSES } from './saved-candidate.model.js';
import { LIST_VISIBILITIES } from './candidate-list.model.js';
import { NOTE_VISIBILITIES } from './candidate-note.model.js';

const stringList = z.array(z.string().trim().min(1).max(120)).max(50).optional();
const idListMax200 = z.array(objectIdSchema).min(1).max(200);

export const listPoolQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  search: z.string().trim().max(200).optional(),
  status: z
    .union([z.enum(POOL_STATUSES), z.string()])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return value
        .split(',')
        .map((part) => part.trim().toLowerCase().replace(/\s+/g, '_'))
        .filter(Boolean);
    }),
  ownerUserId: objectIdSchema.optional(),
  assignedUserId: objectIdSchema.optional(),
  listId: objectIdSchema.optional(),
  jobId: objectIdSchema.optional(),
  sourceType: z.enum(POOL_SOURCE_TYPES).optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value.map((t) => t.trim()).filter(Boolean);
      return value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }),
  archived: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),
});

export const createPoolCandidateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  linkedinUrl: z
    .union([z.string().trim().url().max(500), z.literal(''), z.null()])
    .optional(),
  headline: z.string().trim().max(500).nullable().optional(),
  currentTitle: z.string().trim().max(200).nullable().optional(),
  currentCompany: z.string().trim().max(200).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  experienceYears: z.number().min(0).max(60).nullable().optional(),
  skills: stringList,
  tags: stringList,
  status: z.enum(POOL_STATUSES).optional(),
  sourceType: z.enum(POOL_SOURCE_TYPES).optional(),
  sourceId: z.string().trim().max(120).nullable().optional(),
  externalCandidateId: z.string().trim().max(200).nullable().optional(),
  ownerUserId: objectIdSchema.nullable().optional(),
  assignedUserId: objectIdSchema.nullable().optional(),
  jobIds: z.array(objectIdSchema).max(50).optional(),
  listIds: z.array(objectIdSchema).max(50).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export const updatePoolCandidateSchema = createPoolCandidateSchema.partial().omit({
  sourceType: true,
  sourceId: true,
  externalCandidateId: true,
});

export const bulkStatusSchema = z.object({
  ids: idListMax200,
  status: z.enum(POOL_STATUSES),
});

export const bulkAssignSchema = z.object({
  ids: idListMax200,
  assignedUserId: objectIdSchema.nullable(),
});

export const bulkAddToListSchema = z.object({
  ids: idListMax200,
  listId: objectIdSchema,
});

export const bulkRemoveFromListSchema = z.object({
  ids: idListMax200,
  listId: objectIdSchema,
});

export const bulkArchiveSchema = z.object({
  ids: idListMax200,
});

export const bulkExportSchema = z.object({
  ids: idListMax200.optional(),
  format: z.enum(['csv', 'json']).default('csv'),
  status: z.enum(POOL_STATUSES).optional(),
  listId: objectIdSchema.optional(),
});

export const createNoteSchema = z.object({
  body: z.string().trim().min(1).max(10_000),
  visibility: z.enum(NOTE_VISIBILITIES).optional(),
});

export const updateNoteSchema = z.object({
  body: z.string().trim().min(1).max(10_000).optional(),
  visibility: z.enum(NOTE_VISIBILITIES).optional(),
});

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const createListSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  jobId: objectIdSchema.nullable().optional(),
  visibility: z.enum(LIST_VISIBILITIES).optional(),
  tags: stringList,
});

export const updateListSchema = createListSchema.partial();

export const listListsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(200).optional(),
  archived: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),
});

export const importCommitSchema = z.object({
  jobId: objectIdSchema.optional(),
  columnMapping: z.record(z.string().trim().min(1).max(200)).optional(),
  listId: objectIdSchema.nullable().optional(),
  skipDuplicates: z.boolean().optional().default(true),
});

export type ListPoolQuery = z.infer<typeof listPoolQuerySchema>;
export type CreatePoolCandidateInput = z.infer<typeof createPoolCandidateSchema>;
export type UpdatePoolCandidateInput = z.infer<typeof updatePoolCandidateSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;
export type BulkAddToListInput = z.infer<typeof bulkAddToListSchema>;
export type BulkRemoveFromListInput = z.infer<typeof bulkRemoveFromListSchema>;
export type BulkArchiveInput = z.infer<typeof bulkArchiveSchema>;
export type BulkExportInput = z.infer<typeof bulkExportSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type ListListsQuery = z.infer<typeof listListsQuerySchema>;
export type ImportCommitInput = z.infer<typeof importCommitSchema>;
