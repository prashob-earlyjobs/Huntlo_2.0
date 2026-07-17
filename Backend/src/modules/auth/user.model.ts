import mongoose from 'mongoose';

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
    memberStatus: { type: String, enum: MEMBER_STATUSES, default: 'active', index: true },
    onboardingStatus: {
      type: String,
      enum: ONBOARDING_STATUSES,
      default: 'not_started',
      index: true,
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

export type UserDocument = mongoose.InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = (mongoose.models.User ??
  mongoose.model('User', userSchema)) as mongoose.Model<UserDocument>;

export function toPublicUser(user: UserDocument, organizationPlan?: string) {
  return {
    id: user._id.toHexString(),
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    jobTitle: user.jobTitle,
    timezone: user.timezone,
    locale: user.locale,
    role: user.role,
    initials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase(),
    plan: organizationPlan ?? 'Starter',
    memberStatus: user.memberStatus,
    onboardingStatus: user.onboardingStatus,
    emailVerified: Boolean(user.emailVerifiedAt),
    organizationId: user.organizationId.toHexString(),
  };
}
