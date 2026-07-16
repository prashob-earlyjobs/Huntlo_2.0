import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  archiveList,
  createList,
  deleteList,
  getList,
  listLists,
  updateList,
} from './list.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const candidateListsRouter = Router();

candidateListsRouter.get('/', ...orgAuth, requirePermission('candidates:view'), listLists);
candidateListsRouter.post('/', ...orgAuth, requirePermission('candidates:create'), createList);
candidateListsRouter.get('/:id', ...orgAuth, requirePermission('candidates:view'), getList);
candidateListsRouter.patch('/:id', ...orgAuth, requirePermission('candidates:edit'), updateList);
candidateListsRouter.delete(
  '/:id',
  ...orgAuth,
  requirePermission('candidates:delete'),
  deleteList
);
candidateListsRouter.post(
  '/:id/archive',
  ...orgAuth,
  requirePermission('candidates:edit'),
  archiveList
);
