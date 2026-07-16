import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  cancelSession,
  createSession,
  deleteSession,
  duplicateSession,
  getSession,
  getSessionProgress,
  getSessionResults,
  interpretQuery,
  listSessions,
  rerunSession,
  runSession,
  updateSession,
} from './sourcing.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const sourcingRouter = Router();

sourcingRouter.post(
  '/interpret',
  ...orgAuth,
  requirePermission('sourcing:create', 'sourcing:view'),
  interpretQuery
);

sourcingRouter.post(
  '/sessions',
  ...orgAuth,
  requirePermission('sourcing:create'),
  createSession
);
sourcingRouter.get('/sessions', ...orgAuth, requirePermission('sourcing:view'), listSessions);
sourcingRouter.get(
  '/sessions/:id',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getSession
);
sourcingRouter.patch(
  '/sessions/:id',
  ...orgAuth,
  requirePermission('sourcing:edit'),
  updateSession
);
sourcingRouter.delete(
  '/sessions/:id',
  ...orgAuth,
  requirePermission('sourcing:edit'),
  deleteSession
);

sourcingRouter.post(
  '/sessions/:id/run',
  ...orgAuth,
  requirePermission('sourcing:edit', 'sourcing:create'),
  runSession
);
sourcingRouter.post(
  '/sessions/:id/cancel',
  ...orgAuth,
  requirePermission('sourcing:edit'),
  cancelSession
);
sourcingRouter.post(
  '/sessions/:id/rerun',
  ...orgAuth,
  requirePermission('sourcing:edit', 'sourcing:create'),
  rerunSession
);
sourcingRouter.post(
  '/sessions/:id/duplicate',
  ...orgAuth,
  requirePermission('sourcing:create'),
  duplicateSession
);

sourcingRouter.get(
  '/sessions/:id/results',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getSessionResults
);
sourcingRouter.get(
  '/sessions/:id/progress',
  ...orgAuth,
  requirePermission('sourcing:view'),
  getSessionProgress
);
