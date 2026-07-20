import mongoose from 'mongoose';

import {
  COMPANY_TYPES,
  HIRING_CHALLENGES,
  HIRING_VOLUMES,
  OUTREACH_CHANNELS,
} from './onboarding.constants.js';

export const USER_ROLES = [
  'owner',
  'admin',
  'recruiter',
  'hiring_manager',
  'interviewer',
  'analyst',
  'viewer',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MEMBER_STATUSES = ['active', 'invited', 'suspended', 'blocked'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const ONBOARDING_STATUSES = ['not_started', 'in_progress', 'completed'] as const;
export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    companyName: { type: String, default: null, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: null, trim: true },
    passwordHash: { type: String, required: true, select: false },
    profileImage: { type: String, default: null },
    jobTitle: { type: String, default: null, trim: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    locale: { type: String, default: 'en-IN' },
    role: { type: String, enum: USER_ROLES, default: 'recruiter' },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PricingPlan',
      default: null,
    },
    memberStatus: { type: String, enum: MEMBER_STATUSES, default: 'active', index: true },
    onboardingStatus: {
      type: String,
      enum: ONBOARDING_STATUSES,
      default: 'not_started',
      index: true,
    },
    onboardingCompleted: { type: Boolean, default: false, index: true },
    onboardingCompletedAt: { type: Date, default: null },
    onboardingCompanyType: {
      type: String,
      enum: COMPANY_TYPES,
      default: null,
    },
    onboardingHiringChallenges: {
      type: [{ type: String, enum: HIRING_CHALLENGES }],
      default: [],
    },
    onboardingOutreachChannels: {
      type: [{ type: String, enum: OUTREACH_CHANNELS }],
      default: [],
    },
    onboardingHiringVolume: {
      type: String,
      enum: HIRING_VOLUMES,
      default: null,
    },
    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    /** Huntlo platform operator — cross-tenant admin console. Never grant to normal org users. */
    platformAdmin: { type: Boolean, default: false, index: true },
    adminPermissions: { type: [String], default: [] },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

userSchema.index({ organizationId: 1, email: 1 });

export type UserDocument = mongoose.InferSchemaType<typeof userSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const UserModel = (mongoose.models.User ??
  mongoose.model('User', userSchema)) as mongoose.Model<UserDocument>;

export function accountRoleForUser(user: Pick<UserDocument, 'role'>): 'owner' | 'member' {
  return user.role === 'owner' ? 'owner' : 'member';
}

export function isOnboardingComplete(user: Pick<UserDocument, 'onboardingCompleted' | 'onboardingStatus'>): boolean {
  if (typeof user.onboardingCompleted === 'boolean') {
    return user.onboardingCompleted;
  }
  return user.onboardingStatus === 'completed';
}

export function toPublicUser(user: UserDocument, organizationPlan?: string) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const onboardingCompleted = isOnboardingComplete(user);

  return {
    id: user._id.toHexString(),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName,
    name: fullName,
    companyName: user.companyName ?? null,
    email: user.email,
    phone: user.phone,
    mobile: user.phone,
    profileImage: user.profileImage,
    jobTitle: user.jobTitle,
    timezone: user.timezone,
    locale: user.locale,
    role: user.role,
    accountRole: accountRoleForUser(user),
    initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase(),
    plan: organizationPlan ?? 'Starter',
    planId: user.planId ? user.planId.toHexString() : null,
    memberStatus: user.memberStatus,
    onboardingStatus: onboardingCompleted
      ? ('completed' as const)
      : user.onboardingStatus === 'in_progress'
        ? ('in_progress' as const)
        : ('not_started' as const),
    onboardingCompleted,
    onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
    onboardingCompanyType: user.onboardingCompanyType ?? null,
    onboardingHiringChallenges: user.onboardingHiringChallenges ?? [],
    onboardingOutreachChannels: user.onboardingOutreachChannels ?? [],
    onboardingHiringVolume: user.onboardingHiringVolume ?? null,
    emailVerified: Boolean(user.emailVerifiedAt),
    organizationId: user.organizationId.toHexString(),
    platformAdmin: Boolean(user.platformAdmin),
  };
}
