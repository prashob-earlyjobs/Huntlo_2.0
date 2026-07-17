import type { Request, Response } from 'express';

import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { getRequestId } from '../../middleware/request-id.js';
import { getClientIp, getRequestContext } from '../auth/auth.types.js';
import { clearRefreshCookie } from '../auth/auth.validation.js';
import { usersService } from './users.service.js';
import {
  auditLogsQuerySchema,
  changePasswordSchema,
  revokeSessionsSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from './users.validation.js';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const data = await usersService.getProfile(context);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const patchProfile = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = updateProfileSchema.parse(req.body);
  const data = await usersService.updateProfile(context, input);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const patchPassword = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = changePasswordSchema.parse(req.body);
  await usersService.changePassword(context, input.currentPassword, input.newPassword);
  clearRefreshCookie(res);
  successResponse(res, { changed: true }, { meta: { requestId: getRequestId(req) } });
});

export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const sessions = await usersService.listSessions(context);
  successResponse(res, { sessions }, { meta: { requestId: getRequestId(req) } });
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const data = await usersService.revokeSession(context, String(req.params.id));
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const deleteSessions = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = revokeSessionsSchema.parse(req.body ?? {});
  const data = await usersService.revokeOtherSessions(context, input.currentPassword);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const data = await usersService.getPreferences(context);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const patchPreferences = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = updatePreferencesSchema.parse(req.body);
  const data = await usersService.updatePreferences(context, input);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const data = await usersService.getSettings(context);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const patchSettings = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = updateSettingsSchema.parse(req.body);
  const data = await usersService.updateSettings(context, input, {
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] ?? null,
  });
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const query = auditLogsQuerySchema.parse(req.query);
  const data = await usersService.listAuditLogs(context, query);
  successResponse(res, data, {
    meta: {
      requestId: getRequestId(req),
      pagination: {
        page: Math.floor(query.offset / query.limit) + 1,
        limit: query.limit,
        total: data.total,
        totalPages: Math.max(1, Math.ceil(data.total / query.limit)),
      },
    },
  });
});
