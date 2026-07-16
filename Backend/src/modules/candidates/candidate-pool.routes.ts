import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  bulkAddToList,
  bulkArchive,
  bulkAssign,
  bulkExport,
  bulkRemoveFromList,
  bulkStatus,
  createNote,
  createPoolCandidate,
  deleteNote,
  deletePoolCandidate,
  getPoolCandidate,
  listNotes,
  listPool,
  updateNote,
  updatePoolCandidate,
} from './pool.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const candidatePoolRouter = Router();

candidatePoolRouter.get('/', ...orgAuth, requirePermission('candidates:view'), listPool);
candidatePoolRouter.post('/', ...orgAuth, requirePermission('candidates:create'), createPoolCandidate);

// Static /bulk/* BEFORE /:id
candidatePoolRouter.post(
  '/bulk/status',
  ...orgAuth,
  requirePermission('candidates:edit'),
  bulkStatus
);
candidatePoolRouter.post(
  '/bulk/assign',
  ...orgAuth,
  requirePermission('candidates:edit'),
  bulkAssign
);
candidatePoolRouter.post(
  '/bulk/add-to-list',
  ...orgAuth,
  requirePermission('candidates:edit'),
  bulkAddToList
);
candidatePoolRouter.post(
  '/bulk/remove-from-list',
  ...orgAuth,
  requirePermission('candidates:edit'),
  bulkRemoveFromList
);
candidatePoolRouter.post(
  '/bulk/archive',
  ...orgAuth,
  requirePermission('candidates:edit'),
  bulkArchive
);
candidatePoolRouter.post(
  '/bulk/export',
  ...orgAuth,
  requirePermission('candidates:export', 'candidates:view'),
  bulkExport
);

candidatePoolRouter.get(
  '/:id',
  ...orgAuth,
  requirePermission('candidates:view'),
  getPoolCandidate
);
candidatePoolRouter.patch(
  '/:id',
  ...orgAuth,
  requirePermission('candidates:edit'),
  updatePoolCandidate
);
candidatePoolRouter.delete(
  '/:id',
  ...orgAuth,
  requirePermission('candidates:delete'),
  deletePoolCandidate
);

candidatePoolRouter.get(
  '/:id/notes',
  ...orgAuth,
  requirePermission('candidates:view'),
  listNotes
);
candidatePoolRouter.post(
  '/:id/notes',
  ...orgAuth,
  requirePermission('candidates:edit', 'candidates:create'),
  createNote
);
candidatePoolRouter.patch(
  '/:id/notes/:noteId',
  ...orgAuth,
  requirePermission('candidates:edit'),
  updateNote
);
candidatePoolRouter.delete(
  '/:id/notes/:noteId',
  ...orgAuth,
  requirePermission('candidates:edit', 'candidates:delete'),
  deleteNote
);
