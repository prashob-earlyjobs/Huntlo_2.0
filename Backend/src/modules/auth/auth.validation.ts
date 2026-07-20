import type { CookieOptions, Request, Response } from 'express';
import { z } from 'zod';

import { getEnv } from '../../config/env.js';
import { isWorkEmail, normalizeEmail } from '../../shared/validation/email.js';
import { passwordSchema } from '../../shared/validation/password.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  COMPANY_TYPES,
  HIRING_CHALLENGES,
  HIRING_VOLUMES,
  OUTREACH_CHANNELS,
} from './onboarding.constants.js';

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || fullName.trim();
  const lastName = parts.join(' ') || firstName;
  return { firstName: firstName.slice(0, 80), lastName: lastName.slice(0, 80) };
}

const uniqueEnumArray = <T extends readonly [string, ...string[]]>(values: T, code: string) =>
  z
    .array(z.enum(values))
    .min(1)
    .superRefine((items, ctx) => {
      if (new Set(items).size !== items.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate values are not allowed',
        });
      }
    })
    .transform((items) => Array.from(new Set(items)) as Array<(typeof values)[number]>);

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    fullName: z.string().trim().min(1).max(160).optional(),
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    companyName: z.string().trim().min(1).max(120).optional(),
    organizationName: z.string().trim().min(1).max(120).optional(),
    mobile: z.string().trim().min(1).max(30).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.email && !isWorkEmail(value.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Use a work email address. Personal email providers are not allowed.',
      });
    }

    const hasFullName = Boolean(value.fullName?.trim());
    const hasSplitName = Boolean(value.firstName?.trim() && value.lastName?.trim());
    if (!hasFullName && !hasSplitName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fullName'],
        message: 'Full name is required',
      });
    }

    if (value.fullName?.trim() && !value.companyName?.trim() && !value.organizationName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message: 'Company name is required',
      });
    }

    if (value.fullName?.trim() && !value.mobile?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mobile'],
        message: 'Mobile number is required',
      });
    }

    if (value.confirmPassword !== undefined && value.confirmPassword !== value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }

    if (value.mobile !== undefined) {
      try {
        normalizePhone(value.mobile);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['mobile'],
          message: 'Invalid mobile number',
        });
      }
    }
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

export const onboardingAnswersSchema = z.object({
  companyType: z.enum(COMPANY_TYPES),
  hiringChallenges: uniqueEnumArray(HIRING_CHALLENGES, 'ONBOARDING_HIRING_CHALLENGES_REQUIRED'),
  outreachChannels: uniqueEnumArray(OUTREACH_CHANNELS, 'ONBOARDING_OUTREACH_CHANNELS_REQUIRED'),
  hiringVolume: z.enum(HIRING_VOLUMES),
});

/** @deprecated Legacy step-wise patch — kept for migration callers only */
export const onboardingPatchSchema = z
  .object({
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
    companyType: z.enum(COMPANY_TYPES).optional(),
    hiringChallenges: z.array(z.enum(HIRING_CHALLENGES)).optional(),
    outreachChannels: z.array(z.enum(OUTREACH_CHANNELS)).optional(),
    hiringVolume: z.enum(HIRING_VOLUMES).optional(),
  })
  .passthrough();

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

export type NormalizedRegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  mobile: string | null;
};

export function normalizeRegisterInput(input: z.infer<typeof registerSchema>): NormalizedRegisterInput {
  if (input.confirmPassword !== undefined && input.confirmPassword !== input.password) {
    throw new AppError(422, 'AUTH_PASSWORD_MISMATCH', 'Passwords do not match');
  }

  let firstName = input.firstName?.trim() ?? '';
  let lastName = input.lastName?.trim() ?? '';
  if (input.fullName?.trim()) {
    const split = splitFullName(input.fullName);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  if (!firstName || !lastName) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Full name is required');
  }

  const companyName =
    (input.companyName ?? input.organizationName)?.trim() ||
    `${firstName}'s Workspace`;

  let mobile: string | null = null;
  if (input.mobile?.trim()) {
    try {
      mobile = normalizePhone(input.mobile);
    } catch {
      throw new AppError(422, 'AUTH_INVALID_MOBILE', 'Invalid mobile number');
    }
  }

  return {
    email: normalizeEmail(input.email),
    password: input.password,
    firstName,
    lastName,
    companyName,
    mobile,
  };
}

export function normalizeLoginInput(input: z.infer<typeof loginSchema>) {
  return {
    ...input,
    email: normalizeEmail(input.email),
  };
}
