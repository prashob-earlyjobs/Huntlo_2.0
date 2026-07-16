import { z } from 'zod';

export const createLookupSchema = z
  .object({
    type: z.string().trim().optional(),
    input: z.string().trim().max(500).optional(),
    query: z.string().trim().max(500).optional(),
    email: z.string().trim().max(320).optional(),
    linkedin_url: z.string().trim().max(500).optional(),
    linkedinUrl: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.input ||
          value.query ||
          value.email ||
          value.linkedin_url ||
          value.linkedinUrl
      ),
    { message: 'Provide a lookup input' }
  );

export const listLookupsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const saveLookupSchema = z.object({
  listId: z.string().trim().optional().nullable(),
});

export type CreateLookupInput = z.infer<typeof createLookupSchema>;
export type ListLookupsQuery = z.infer<typeof listLookupsQuerySchema>;
export type SaveLookupInput = z.infer<typeof saveLookupSchema>;
