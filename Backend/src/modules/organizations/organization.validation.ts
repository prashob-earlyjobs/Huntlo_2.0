import { z } from 'zod';

import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
} from './permissions.js';

const permissionKeySchema = z.union([
  z.literal('*'),
  z.string().regex(
    new RegExp(
      `^(${PERMISSION_MODULES.join('|')}):(${PERMISSION_ACTIONS.join('|')})$`
    )
  ),
]);

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  website: z.string().trim().max(255).nullable().optional(),
  industry: z.string().trim().max(120).nullable().optional(),
  companySize: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().max(80).nullable().optional(),
  timezone: z.string().trim().max(80).optional(),
  currency: z.string().trim().max(10).optional(),
  logo: z.string().url().nullable().optional(),
  settings: z
    .object({
      dateFormat: z.string().optional(),
      allowMemberInvites: z.boolean().optional(),
      requireEmailVerification: z.boolean().optional(),
    })
    .optional(),
});

const inviteableRoles = [
  'admin',
  'recruiter',
  'hiring_manager',
  'interviewer',
  'analyst',
] as const;

const allowedModulesSchema = z
  .array(z.enum(PERMISSION_MODULES))
  .nullable()
  .optional();

export const createInvitationSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().max(160).optional(),
  role: z.enum(inviteableRoles).default('recruiter'),
  permissions: z.array(permissionKeySchema).optional(),
  allowedModules: allowedModulesSchema,
  assignedJobIds: z.array(z.string()).optional(),
});

export const createTeamAccountSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().email(),
  role: z.enum(inviteableRoles).default('recruiter'),
  permissions: z.array(permissionKeySchema).optional(),
  allowedModules: allowedModulesSchema,
  assignedJobIds: z.array(z.string()).optional(),
});

export const acceptInvitationSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  password: z.string().min(8).max(128).optional(),
});

export const updateMemberSchema = z.object({
  managerId: z.string().nullable().optional(),
  assignedJobIds: z.array(z.string()).optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(inviteableRoles),
});

export const updateMemberPermissionsSchema = z.object({
  permissions: z.array(permissionKeySchema).optional(),
  allowedModules: allowedModulesSchema,
});

export const updateMemberStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'deactivated']),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(255).nullable().optional(),
  permissions: z.array(permissionKeySchema).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(255).nullable().optional(),
  permissions: z.array(permissionKeySchema).optional(),
});
