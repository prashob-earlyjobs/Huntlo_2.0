import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  deleteSession,
  deleteSessions,
  getAuditLogs,
  getPreferences,
  getProfile,
  getSessions,
  getSettings,
  patchPassword,
  patchPreferences,
  patchProfile,
  patchSettings,
} from './users.controller.js';

const userAuth = [requireAuth];
const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const profileRouter = Router();
profileRouter.get('/', ...userAuth, getProfile);
profileRouter.patch('/', ...userAuth, patchProfile);
profileRouter.patch('/password', ...userAuth, patchPassword);
profileRouter.get('/sessions', ...userAuth, getSessions);
profileRouter.delete('/sessions/:id', ...userAuth, deleteSession);
profileRouter.delete('/sessions', ...userAuth, deleteSessions);

export const preferencesRouter = Router();
preferencesRouter.get('/', ...userAuth, getPreferences);
preferencesRouter.patch('/', ...userAuth, patchPreferences);

export const settingsRouter = Router();
settingsRouter.get(
  '/',
  ...orgAuth,
  requirePermission('settings:view', 'settings:manage'),
  getSettings
);
settingsRouter.patch(
  '/',
  ...orgAuth,
  requirePermission('settings:manage', 'settings:edit'),
  patchSettings
);

export const auditLogsRouter = Router();
auditLogsRouter.get(
  '/',
  ...orgAuth,
  requirePermission('settings:view', 'settings:manage', 'team:view'),
  getAuditLogs
);
