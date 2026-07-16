import { z } from 'zod';

import { INTEGRATION_PROVIDERS, INTEGRATION_CATEGORIES } from './user-integration.model.js';

export const listIntegrationsQuerySchema = z.object({
  category: z.enum(INTEGRATION_CATEGORIES).optional(),
});

export const providerParamSchema = z.object({
  provider: z.enum(INTEGRATION_PROVIDERS),
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
