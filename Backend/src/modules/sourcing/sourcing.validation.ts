import { z } from 'zod';

import { objectIdSchema } from '../../shared/validation/object-id.js';
import { SOURCING_SESSION_STATUSES } from './sourcing-session.model.js';

export const interpretedCriterionSchema = z.object({
  id: z.string().min(1).max(80),
  fieldId: z.string().min(1).max(120),
  label: z.string().min(1).max(120),
  value: z.string().max(2000),
  source: z.enum(['ai', 'user', 'system']).default('ai'),
});

export const interpretQuerySchema = z.object({
  query: z.string().trim().min(1).max(5000),
});

export const createSessionSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  query: z.string().trim().min(1).max(5000),
  jobId: objectIdSchema.nullable().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  interpretedCriteria: z.array(interpretedCriterionSchema).optional(),
  confirmFilters: z.boolean().optional(),
  run: z.boolean().optional(),
});

export const updateSessionSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  query: z.string().trim().min(1).max(5000).optional(),
  jobId: objectIdSchema.nullable().optional(),
  filters: z.record(z.string(), z.unknown()).nullable().optional(),
  interpretedCriteria: z.array(interpretedCriterionSchema).optional(),
  confirmFilters: z.boolean().optional(),
});

export const listSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  status: z
    .union([z.enum(SOURCING_SESSION_STATUSES), z.string()])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return value
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);
    }),
  search: z.string().trim().max(200).optional(),
  jobId: objectIdSchema.optional(),
});

export const resultsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(300).default(20),
  sort: z.string().optional(),
});

export type InterpretQueryInput = z.infer<typeof interpretQuerySchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
export type ResultsQuery = z.infer<typeof resultsQuerySchema>;
export type InterpretedCriterion = z.infer<typeof interpretedCriterionSchema>;
