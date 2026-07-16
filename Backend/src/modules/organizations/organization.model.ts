import mongoose from 'mongoose';

export const ORGANIZATION_STATUSES = ['active', 'suspended', 'deleted'] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export const ORGANIZATION_PLANS = ['Starter', 'Growth', 'Scale', 'Enterprise'] as const;
export type OrganizationPlan = (typeof ORGANIZATION_PLANS)[number];

export const PLAN_SEAT_LIMITS: Record<OrganizationPlan, number> = {
  Starter: 3,
  Growth: 15,
  Scale: 50,
  Enterprise: Number.POSITIVE_INFINITY,
};

const organizationSettingsSchema = new mongoose.Schema(
  {
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    allowMemberInvites: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: false },
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    website: { type: String, default: null, trim: true },
    industry: { type: String, default: null, trim: true },
    companySize: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    logo: { type: String, default: null },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ORGANIZATION_STATUSES,
      default: 'active',
      index: true,
    },
    settings: { type: organizationSettingsSchema, default: () => ({}) },
    plan: {
      type: String,
      enum: ORGANIZATION_PLANS,
      default: 'Starter',
    },
    initials: { type: String, required: true, trim: true },
    /** @deprecated Prefer `timezone` — kept for auth/onboarding compatibility */
    defaultTimezone: { type: String, default: 'Asia/Kolkata' },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export type OrganizationDocument = mongoose.InferSchemaType<typeof organizationSchema> &
  mongoose.Document & {
    _id: mongoose.Types.ObjectId;
  };

export const OrganizationModel = (mongoose.models.Organization ??
  mongoose.model('Organization', organizationSchema)) as mongoose.Model<OrganizationDocument>;

export function getSeatLimit(plan: string): number {
  return PLAN_SEAT_LIMITS[(plan as OrganizationPlan) ?? 'Starter'] ?? PLAN_SEAT_LIMITS.Starter;
}

export function toPublicOrganization(org: OrganizationDocument) {
  return {
    id: org._id.toHexString(),
    name: org.name,
    slug: org.slug,
    website: org.website,
    industry: org.industry,
    companySize: org.companySize,
    country: org.country,
    timezone: org.timezone ?? org.defaultTimezone ?? 'Asia/Kolkata',
    currency: org.currency ?? 'INR',
    logo: org.logo,
    ownerUserId: org.ownerUserId ? org.ownerUserId.toHexString() : null,
    status: org.status ?? 'active',
    settings: org.settings ?? {},
    plan: org.plan,
    initials: org.initials,
    seatLimit: getSeatLimit(org.plan),
  };
}
