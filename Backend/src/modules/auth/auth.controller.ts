import type { Request, Response } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { getRequestId } from '../../middleware/request-id.js';
import { requireAuth } from '../../middleware/auth.js';
import { authService, getClientIp } from './auth.service.js';
import { onboardingService } from './onboarding.service.js';
import { getRequestContext } from './auth.types.js';
import {
  changePasswordSchema,
  clearRefreshCookie,
  forgotPasswordSchema,
  getRefreshTokenFromRequest,
  loginSchema,
  normalizeLoginInput,
  normalizeRegisterInput,
  registerSchema,
  resetPasswordSchema,
  setRefreshCookie,
  updateMeSchema,
  verifyEmailSchema,
  onboardingPatchSchema,
  onboardingAnswersSchema,
} from './auth.validation.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = normalizeRegisterInput(registerSchema.parse(req.body));
  const result = await authService.register({
    ...input,
    meta: { ip: getClientIp(req), userAgent: req.headers['user-agent'] },
  });

  setRefreshCookie(res, result.refreshToken);
  successResponse(
    res,
    {
      accessToken: result.accessToken,
      ...result.me,
    },
    { statusCode: 201, meta: { requestId: getRequestId(req) } }
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = normalizeLoginInput(loginSchema.parse(req.body));
  const result = await authService.login({
    ...input,
    meta: { ip: getClientIp(req), userAgent: req.headers['user-agent'] },
  });

  setRefreshCookie(res, result.refreshToken);
  successResponse(res, {
    accessToken: result.accessToken,
    ...result.me,
  }, { meta: { requestId: getRequestId(req) } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  if (!refreshToken) {
    clearRefreshCookie(res);
    throw AppError.unauthorized('Missing refresh token');
  }

  const result = await authService.refresh(refreshToken, {
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });

  if (result.refreshToken) {
    setRefreshCookie(res, result.refreshToken);
  }
  successResponse(res, { accessToken: result.accessToken }, { meta: { requestId: getRequestId(req) } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  const context = req.auth ? getRequestContext(req) : undefined;
  await authService.logout(refreshToken, context);
  clearRefreshCookie(res);
  successResponse(res, { loggedOut: true }, { meta: { requestId: getRequestId(req) } });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  await authService.logoutAll(context.userId);
  clearRefreshCookie(res);
  successResponse(res, { loggedOut: true }, { meta: { requestId: getRequestId(req) } });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(input.email, {
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'],
  });
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(input.token, input.password);
  successResponse(res, { reset: true }, { meta: { requestId: getRequestId(req) } });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const input = verifyEmailSchema.parse(req.body);
  const result = await authService.verifyEmail(input.token);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const result = await authService.resendVerification(context);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const result = await authService.me(context);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = updateMeSchema.parse(req.body);
  const result = await authService.updateMe(context, input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const input = changePasswordSchema.parse(req.body);
  await authService.changePassword(context, input.currentPassword, input.newPassword);
  clearRefreshCookie(res);
  successResponse(res, { changed: true }, { meta: { requestId: getRequestId(req) } });
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const sessions = await authService.listSessions(context);
  successResponse(res, { sessions }, { meta: { requestId: getRequestId(req) } });
});

export const getOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const result = await onboardingService.get(context);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const patchOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const looksLikeCompletion =
    'companyType' in body &&
    'hiringChallenges' in body &&
    'outreachChannels' in body &&
    'hiringVolume' in body;

  if (looksLikeCompletion) {
    const input = onboardingAnswersSchema.parse(body);
    const result = await onboardingService.completeOwnerOnboarding(context, input);
    successResponse(res, result, { meta: { requestId: getRequestId(req) } });
    return;
  }

  const input = onboardingPatchSchema.parse(body);
  const result = await onboardingService.patch(context, input);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export const completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
  const context = getRequestContext(req);
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const looksLikeCompletion =
    'companyType' in body &&
    'hiringChallenges' in body &&
    'outreachChannels' in body &&
    'hiringVolume' in body;

  const result = looksLikeCompletion
    ? await onboardingService.completeOwnerOnboarding(
        context,
        onboardingAnswersSchema.parse(body)
      )
    : await onboardingService.complete(context);
  successResponse(res, result, { meta: { requestId: getRequestId(req) } });
});

export { requireAuth };
