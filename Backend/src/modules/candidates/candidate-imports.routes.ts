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
  revalidateImport,
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

candidateImportsRouter.post(
  '/:id/revalidate',
  ...orgAuth,
  requirePermission('candidates:create', 'candidates:edit'),
  revalidateImport
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
