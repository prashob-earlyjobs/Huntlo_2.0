import { z } from 'zod';

import { objectIdSchema } from '../../shared/validation/object-id.js';

export const candidateIdParamSchema = z.object({
  candidateId: z.string().trim().min(1),
});

export const bulkJobIdParamSchema = z.object({
  jobId: objectIdSchema,
});

export const bulkRevealBodySchema = z.object({
  items: z
    .array(
      z.object({
        candidateId: objectIdSchema,
        contactTypes: z
          .array(z.enum(['email', 'mobile']))
          .min(1)
          .max(2),
      })
    )
    .min(1)
    .max(100),
});

export const revealedContactsLookupSchema = z
  .object({
    candidateIds: z.array(z.string().trim().min(1)).max(100).optional(),
    linkedinUrls: z.array(z.string().trim().min(1)).max(100).optional(),
  })
  .refine(
    (value) =>
      (value.candidateIds && value.candidateIds.length > 0) ||
      (value.linkedinUrls && value.linkedinUrls.length > 0),
    { message: 'Provide candidateIds and/or linkedinUrls' }
  );

export const activityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
