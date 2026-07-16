import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { conversationsService } from './conversations.service.js';
import {
  aiDraftBodySchema,
  assignBodySchema,
  classifyBodySchema,
  conversationIdParamSchema,
  listConversationsQuerySchema,
  listMessagesQuerySchema,
  noteBodySchema,
  qualificationAnswerBodySchema,
  replyBodySchema,
} from './conversations.validation.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('outreach:view', 'outreach:manage');
const writePerm = requirePermission(
  'outreach:create',
  'outreach:edit',
  'outreach:manage'
);

export const conversationsRouter = Router();

conversationsRouter.get(
  '/',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listConversationsQuerySchema.parse(req.query);
    const data = await conversationsService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

conversationsRouter.get(
  '/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const data = await conversationsService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.get(
  '/:id/messages',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const query = listMessagesQuerySchema.parse(req.query);
    const data = await conversationsService.listMessages(
      req.organizationId!,
      id,
      query
    );
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

conversationsRouter.post(
  '/:id/reply',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = replyBodySchema.parse(req.body ?? {});
    const data = await conversationsService.reply(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/** Alias for FE contract that posts to /messages */
conversationsRouter.post(
  '/:id/messages',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = replyBodySchema.parse(req.body ?? {});
    const data = await conversationsService.reply(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/note',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = noteBodySchema.parse(req.body ?? {});
    const data = await conversationsService.addNote(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/assign',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = assignBodySchema.parse(req.body ?? {});
    const data = await conversationsService.assign(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/read',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const data = await conversationsService.markRead(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.patch(
  '/:id/read',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const data = await conversationsService.markRead(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/unread',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const data = await conversationsService.markUnread(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/stop-automation',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const data = await conversationsService.stopAutomation(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/resume-automation',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const data = await conversationsService.resumeAutomation(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/ai-draft',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = aiDraftBodySchema.parse(req.body ?? {});
    const data = await conversationsService.aiDraft(req.organizationId!, id, body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/classify',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = classifyBodySchema.parse(req.body ?? {});
    const data = await conversationsService.classify(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

conversationsRouter.post(
  '/:id/qualification-answer',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = conversationIdParamSchema.parse(req.params);
    const body = qualificationAnswerBodySchema.parse(req.body ?? {});
    const data = await conversationsService.qualificationAnswer(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
