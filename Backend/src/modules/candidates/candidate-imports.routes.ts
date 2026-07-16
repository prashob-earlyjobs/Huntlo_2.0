import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { createImportUpload } from '../../middleware/upload.js';
import {
  commitImport,
  getImportErrors,
  getImportJob,
  previewImport,
} from './import.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const upload = createImportUpload();

export const candidateImportsRouter = Router();

candidateImportsRouter.post(
  '/preview',
  ...orgAuth,
  requirePermission('candidates:create', 'candidates:edit'),
  upload.single('file'),
  previewImport
);

candidateImportsRouter.post(
  '/',
  ...orgAuth,
  requirePermission('candidates:create', 'candidates:edit'),
  upload.single('file'),
  commitImport
);

candidateImportsRouter.get(
  '/:id',
  ...orgAuth,
  requirePermission('candidates:view'),
  getImportJob
);

candidateImportsRouter.get(
  '/:id/errors',
  ...orgAuth,
  requirePermission('candidates:view'),
  getImportErrors
);
