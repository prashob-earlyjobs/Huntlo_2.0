import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import {
  createBulkReveal,
  enrichCandidate,
  getBulkRevealJob,
  getCandidate,
  getCandidateActivity,
  getRevealStatus,
  lookupRevealedContacts,
  revealEmail,
  revealMobile,
} from './candidate.controller.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];

export const candidatesRouter = Router();

// Static paths BEFORE /:candidateId
candidatesRouter.post(
  '/reveal/bulk',
  ...orgAuth,
  requirePermission('candidates:edit'),
  createBulkReveal
);
candidatesRouter.get(
  '/reveal/bulk/:jobId',
  ...orgAuth,
  requirePermission('candidates:view', 'candidates:edit'),
  getBulkRevealJob
);
candidatesRouter.post(
  '/revealed-contacts/lookup',
  ...orgAuth,
  requirePermission('candidates:view'),
  lookupRevealedContacts
);

candidatesRouter.get(
  '/:candidateId',
  ...orgAuth,
  requirePermission('candidates:view'),
  getCandidate
);
candidatesRouter.post(
  '/:candidateId/enrich',
  ...orgAuth,
  requirePermission('candidates:edit'),
  enrichCandidate
);
candidatesRouter.post(
  '/:candidateId/reveal/email',
  ...orgAuth,
  requirePermission('candidates:edit'),
  revealEmail
);
candidatesRouter.post(
  '/:candidateId/reveal/mobile',
  ...orgAuth,
  requirePermission('candidates:edit'),
  revealMobile
);
candidatesRouter.get(
  '/:candidateId/reveal-status',
  ...orgAuth,
  requirePermission('candidates:view'),
  getRevealStatus
);
candidatesRouter.get(
  '/:candidateId/activity',
  ...orgAuth,
  requirePermission('candidates:view'),
  getCandidateActivity
);
