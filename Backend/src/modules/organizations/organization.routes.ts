import { Router } from 'express';

import {
  optionalAuth,
  requireAuth,
  requireMemberManager,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  acceptInvitation,
  createInvitation,
  createTeamAccount,
  createRole,
  deleteRole,
  getMember,
  getOrganization,
  listRoles,
  listTeam,
  removeMember,
  resendInvitation,
  revokeInvitation,
  updateMember,
  updateMemberPermissions,
  updateMemberRole,
  updateMemberStatus,
  updateOrganization,
  updateRole,
} from './organization.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const organizationRouter = Router();
organizationRouter.get('/', ...orgAuth, requirePermission('settings:view', 'team:view'), getOrganization);
organizationRouter.patch(
  '/',
  ...orgAuth,
  requirePermission('settings:manage', 'settings:edit'),
  updateOrganization
);

export const teamRouter = Router();
teamRouter.get('/', ...orgAuth, requirePermission('team:view'), listTeam);

teamRouter.post('/members', ...orgAuth, requireMemberManager(), createTeamAccount);

teamRouter.post(
  '/invitations',
  ...orgAuth,
  requireMemberManager(),
  createInvitation
);
teamRouter.post('/invitations/:token/accept', optionalAuth, acceptInvitation);
teamRouter.post(
  '/invitations/:id/resend',
  ...orgAuth,
  requireMemberManager(),
  resendInvitation
);
teamRouter.delete(
  '/invitations/:id',
  ...orgAuth,
  requireMemberManager(),
  revokeInvitation
);

teamRouter.get('/members/:id', ...orgAuth, requirePermission('team:view'), getMember);
teamRouter.patch('/members/:id', ...orgAuth, requireMemberManager(), updateMember);
teamRouter.patch('/members/:id/role', ...orgAuth, requireMemberManager(), updateMemberRole);
teamRouter.patch(
  '/members/:id/permissions',
  ...orgAuth,
  requireMemberManager(),
  updateMemberPermissions
);
teamRouter.patch('/members/:id/status', ...orgAuth, requireMemberManager(), updateMemberStatus);
teamRouter.delete('/members/:id', ...orgAuth, requireMemberManager(), removeMember);

export const rolesRouter = Router();
rolesRouter.get('/', ...orgAuth, requirePermission('team:view'), listRoles);
rolesRouter.post('/', ...orgAuth, requireMemberManager(), createRole);
rolesRouter.patch('/:id', ...orgAuth, requireMemberManager(), updateRole);
rolesRouter.delete('/:id', ...orgAuth, requireMemberManager(), deleteRole);
