import { z } from 'zod';

const MAX_PROMPT_LENGTH = 5000;

export const annotateSearchSchema = z
  .object({
    prompt: z.string().optional(),
    userText: z.string().optional(),
    linkedin_profile_url: z.string().optional().default(''),
  })
  .superRefine((value, ctx) => {
    const prompt = (value.prompt ?? value.userText ?? '').trim();
    if (!prompt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Prompt is required',
        path: ['prompt'],
      });
    } else if (prompt.length > MAX_PROMPT_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Prompt must be at most ${MAX_PROMPT_LENGTH} characters`,
        path: ['prompt'],
      });
    }
  })
  .transform((value) => ({
    prompt: (value.prompt ?? value.userText ?? '').trim(),
    linkedin_profile_url: (value.linkedin_profile_url ?? '').trim(),
  }));

export const applySearchSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required').max(MAX_PROMPT_LENGTH),
  filterForm: z.record(z.string(), z.unknown()).default({}),
  sessionId: z.string().trim().optional().default(''),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(300).default(20),
  jobId: z.string().trim().optional().nullable(),
});

export const createSearchSchema = z.object({
  prompt: z.string().trim().min(1).max(MAX_PROMPT_LENGTH),
  session: z.record(z.string(), z.unknown()).optional(),
  filterForm: z.record(z.string(), z.unknown()).optional(),
  jobId: z.string().trim().optional().nullable(),
});

/** Legacy one-shot search — reuses apply semantics. */
export const legacySearchSchema = applySearchSchema;

export const autocompleteQuerySchema = z.object({
  filter_type: z.string().trim().optional().default('region'),
  filterType: z.string().trim().optional(),
  query: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const sessionProfilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(300).default(20),
});

export const storedCandidatesQuerySchema = z.object({
  metaOnly: z
    .union([z.literal('1'), z.literal('true'), z.literal(true), z.literal(1)])
    .optional()
    .transform((v) => v === '1' || v === 'true' || v === true || v === 1),
  all: z
    .union([z.literal('1'), z.literal('true'), z.literal(true), z.literal(1)])
    .optional()
    .transform((v) => v === '1' || v === 'true' || v === true || v === 1),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(300).default(20),
});

export const allCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sessionId: z.string().trim().optional(),
  q: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const candidateDetailsQuerySchema = z.object({
  sessionId: z.string().trim().optional(),
});

export const sessionsListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const recentSearchesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

export const claimPublicSearchSchema = z.object({
  sessionId: z.string().trim().optional(),
  claimToken: z.string().trim().optional(),
}).refine((v) => Boolean(v.sessionId || v.claimToken), {
  message: 'sessionId or claimToken is required',
});

export const fetchMoreBodySchema = z.object({
  page: z.coerce.number().int().min(1).max(100).optional().default(1),
  limit: z.coerce.number().int().min(1).max(300).optional().default(20),
});

export type AnnotateSearchInput = z.infer<typeof annotateSearchSchema>;
export type ApplySearchInput = z.infer<typeof applySearchSchema>;
export type CreateSearchInput = z.infer<typeof createSearchSchema>;
