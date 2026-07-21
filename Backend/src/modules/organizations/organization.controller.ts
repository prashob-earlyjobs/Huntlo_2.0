import type { Request, Response } from 'express';

import { hashIp } from '../../shared/auth/crypto.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { getRequestId } from '../../middleware/request-id.js';
import { getClientIp } from '../auth/auth.types.js';
import { organizationService } from './organization.service.js';
import {
  acceptInvitationSchema,
  createInvitationSchema,
  createTeamAccountSchema,
  createRoleSchema,
  updateMemberPermissionsSchema,
  updateMemberRoleSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
  updateOrganizationSchema,
  updateRoleSchema,
} from './organization.validation.js';
import { normalizeEmail } from '../../shared/validation/email.js';

function actorFrom(req: Request) {
  return {
    userId: req.userId!,
    organizationId: req.organizationId!,
    role: req.member?.role ?? req.auth?.role ?? 'recruiter',
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
  };
}

export const getOrganization = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.getOrganization(req.organizationId!);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const updateOrganization = asyncHandler(async (req: Request, res: Response) => {
  const input = updateOrganizationSchema.parse(req.body);
  const data = await organizationService.updateOrganization(actorFrom(req), input);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const listTeam = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.listTeam(req.organizationId!);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const createInvitation = asyncHandler(async (req: Request, res: Response) => {
  const input = createInvitationSchema.parse(req.body);
  const data = await organizationService.createInvitation(actorFrom(req), {
    email: normalizeEmail(input.email),
    name: input.name,
    role: input.role,
    permissions: input.permissions,
    allowedModules: input.allowedModules,
    assignedJobIds: input.assignedJobIds,
  });
  successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
});

export const createTeamAccount = asyncHandler(async (req: Request, res: Response) => {
  const input = createTeamAccountSchema.parse(req.body);
  const data = await organizationService.createTeamAccount(actorFrom(req), {
    name: input.name,
    email: normalizeEmail(input.email),
    role: input.role,
    permissions: input.permissions,
    allowedModules: input.allowedModules,
    assignedJobIds: input.assignedJobIds,
  });
  successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
});

export const acceptInvitation = asyncHandler(async (req: Request, res: Response) => {
  const token = String(req.params.token ?? '');
  const input = acceptInvitationSchema.parse(req.body ?? {});
  const data = await organizationService.acceptInvitation(token, {
    actorUserId: req.userId,
    firstName: input.firstName,
    lastName: input.lastName,
    password: input.password,
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
  });
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const resendInvitation = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.resendInvitation(
    actorFrom(req),
    String(req.params.id)
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const revokeInvitation = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.revokeInvitation(
    actorFrom(req),
    String(req.params.id)
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const getMember = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.getMember(actorFrom(req), String(req.params.id));
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMemberSchema.parse(req.body);
  const data = await organizationService.updateMember(
    actorFrom(req),
    String(req.params.id),
    input
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMemberRoleSchema.parse(req.body);
  const data = await organizationService.updateMemberRole(
    actorFrom(req),
    String(req.params.id),
    input.role
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const updateMemberPermissions = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMemberPermissionsSchema.parse(req.body);
  const data = await organizationService.updateMemberPermissions(
    actorFrom(req),
    String(req.params.id),
    {
      permissions: input.permissions,
      allowedModules: input.allowedModules,
    }
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const updateMemberStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = updateMemberStatusSchema.parse(req.body);
  const data = await organizationService.updateMemberStatus(
    actorFrom(req),
    String(req.params.id),
    input.status
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const resetMemberPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.resetMemberPassword(
    actorFrom(req),
    String(req.params.id)
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.removeMember(actorFrom(req), String(req.params.id));
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const listRoles = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.listRoles(req.organizationId!);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const input = createRoleSchema.parse(req.body);
  const data = await organizationService.createRole(actorFrom(req), input);
  successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const input = updateRoleSchema.parse(req.body);
  const data = await organizationService.updateRole(
    actorFrom(req),
    String(req.params.id),
    input
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const data = await organizationService.deleteRole(actorFrom(req), String(req.params.id));
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});
