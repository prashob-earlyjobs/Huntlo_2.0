import { z } from 'zod';

import { ADMIN_PERMISSIONS } from './require-admin.js';
import { PLATFORM_PROVIDERS, PROVIDER_STATUSES } from './platform-settings.model.js';
import { BLOG_STATUSES } from './blog.model.js';
import { passwordSchema } from '../../shared/validation/password.js';

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  organizationId: z.string().trim().max(40).optional(),
  plan: z.string().trim().max(40).optional(),
  provider: z.string().trim().max(40).optional(),
  type: z.string().trim().max(80).optional(),
  module: z.string().trim().max(40).optional(),
});

export const createAdminUserSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  organizationId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
  organizationName: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['owner', 'admin', 'recruiter', 'hiring_manager', 'interviewer', 'analyst', 'viewer']).default('recruiter'),
  platformAdmin: z.boolean().optional(),
  adminPermissions: z.array(z.enum(ADMIN_PERMISSIONS)).optional(),
});

export const updateAdminUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  role: z.enum(['owner', 'admin', 'recruiter', 'hiring_manager', 'interviewer', 'analyst', 'viewer']).optional(),
  platformAdmin: z.boolean().optional(),
  adminPermissions: z.array(z.string()).optional(),
});

export const assignPlanSchema = z.object({
  plan: z.string().trim().min(1).max(40),
});

export const adjustQuotaSchema = z.object({
  metric: z.string().trim().min(1).max(40),
  delta: z.number().int().min(-1_000_000).max(1_000_000),
  reason: z.string().trim().max(200).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema.optional(),
});

export const createBlogSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220).optional(),
  category: z.string().trim().max(80).optional(),
  author: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().max(500).optional(),
  body: z.string().max(100_000).optional(),
  seoStatus: z.string().trim().max(40).optional(),
});

export const updateBlogSchema = createBlogSchema.partial().extend({
  status: z.enum(BLOG_STATUSES).optional(),
});

export const patchPlatformSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  featureFlags: z.record(z.string(), z.unknown()).optional(),
  providers: z
    .array(
      z.object({
        provider: z.enum(PLATFORM_PROVIDERS),
        configured: z.boolean().optional(),
        status: z.enum(PROVIDER_STATUSES).optional(),
        maskedIdentifier: z.string().trim().max(120).nullable().optional(),
        errorSummary: z.string().trim().max(500).nullable().optional(),
        publicConfig: z.record(z.string(), z.unknown()).optional(),
        /** Write-only — never echoed back. */
        secretValue: z.string().max(2000).optional(),
      })
    )
    .optional(),
});
