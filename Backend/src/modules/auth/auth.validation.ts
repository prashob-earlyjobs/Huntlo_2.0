import type { CookieOptions, Request, Response } from 'express';
import { z } from 'zod';

import { getEnv } from '../../config/env.js';
import { normalizeEmail } from '../../shared/validation/email.js';
import { passwordSchema } from '../../shared/validation/password.js';

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  organizationName: z.string().trim().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

export const updateMeSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  timezone: z.string().trim().max(80).optional(),
  locale: z.string().trim().max(20).optional(),
  profileImage: z.string().url().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const onboardingPatchSchema = z.object({
  currentStep: z.number().int().min(1).max(8).optional(),
  personalDetails: z
    .object({
      firstName: z.string().nullable().optional(),
      lastName: z.string().nullable().optional(),
      jobTitle: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      timezone: z.string().nullable().optional(),
    })
    .optional(),
  organisationDetails: z
    .object({
      name: z.string().nullable().optional(),
      industry: z.string().nullable().optional(),
      website: z.string().nullable().optional(),
      companySize: z.string().nullable().optional(),
    })
    .optional(),
  recruitingGoals: z.array(z.string()).optional(),
  teamSize: z.string().nullable().optional(),
  hiringLocations: z.array(z.string()).optional(),
  modulePreferences: z.array(z.string()).optional(),
  initialIntegrations: z.array(z.string()).optional(),
});

export function getRefreshCookieOptions(): CookieOptions {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.APP_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: parseDurationCookieMs(env.JWT_REFRESH_EXPIRES_IN),
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(getEnv().REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(getEnv().REFRESH_COOKIE_NAME, getRefreshCookieOptions());
}

export function getRefreshTokenFromRequest(req: Request): string | null {
  const cookieToken = req.cookies?.[getEnv().REFRESH_COOKIE_NAME];
  return typeof cookieToken === 'string' && cookieToken.length > 0 ? cookieToken : null;
}

function parseDurationCookieMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * (multipliers[unit ?? 'd'] ?? 86_400_000);
}

export function normalizeRegisterInput(input: z.infer<typeof registerSchema>) {
  return {
    ...input,
    email: normalizeEmail(input.email),
  };
}

export function normalizeLoginInput(input: z.infer<typeof loginSchema>) {
  return {
    ...input,
    email: normalizeEmail(input.email),
  };
}
