import { z } from 'zod';

import { INTEGRATION_PROVIDERS, INTEGRATION_CATEGORIES } from './user-integration.model.js';

export const listIntegrationsQuerySchema = z.object({
  category: z.enum(INTEGRATION_CATEGORIES).optional(),
});

export const providerParamSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
});

export const atsProviderParamSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
});

export const atsJobParamSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
  jobId: z.string().min(1).max(200),
});

export const listAtsJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().max(200).optional(),
});

export const listAtsApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const importAtsApplicationsBodySchema = z.object({
  jobId: z.string().min(1).max(200),
  applicationIds: z.array(z.string().min(1).max(200)).min(1).max(500),
  huntloJobId: z.string().min(1).max(40).nullable().optional(),
});

export const integrationIdParamSchema = z.object({
  id: z.string().min(1),
});

export const connectBodySchema = z.record(z.string(), z.unknown()).default({});

export const patchIntegrationBodySchema = z
  .object({
    displayName: z.string().max(200).optional(),
    status: z.enum(['connected', 'disconnected', 'disabled']).optional(),
    config: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();
