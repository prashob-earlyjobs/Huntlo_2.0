import { z } from 'zod';

export const createEasyScoutLookupSchema = z
  .object({
    type: z.string().trim().optional(),
    input: z.string().trim().max(500).optional(),
    query: z.string().trim().max(500).optional(),
    linkedin_url: z.string().trim().max(500).optional(),
    linkedinUrl: z.string().trim().max(500).optional(),
    din: z.string().trim().max(32).optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.input ||
          value.query ||
          value.linkedin_url ||
          value.linkedinUrl ||
          value.din
      ),
    { message: 'Provide a lookup input' }
  );

export const listEasyScoutLookupsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const saveEasyScoutLookupSchema = z.object({
  listId: z.string().trim().optional().nullable(),
});

export type CreateEasyScoutLookupInput = z.infer<typeof createEasyScoutLookupSchema>;
export type ListEasyScoutLookupsQuery = z.infer<typeof listEasyScoutLookupsQuerySchema>;
export type SaveEasyScoutLookupInput = z.infer<typeof saveEasyScoutLookupSchema>;
