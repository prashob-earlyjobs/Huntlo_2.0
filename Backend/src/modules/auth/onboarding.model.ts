import mongoose from 'mongoose';

export const ONBOARDING_STEPS = [
  'personal_details',
  'organisation_details',
  'recruiting_goals',
  'team_size',
  'hiring_locations',
  'module_preferences',
  'initial_integrations',
  'completion',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

const onboardingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    currentStep: { type: Number, default: 1, min: 1, max: 8 },
    completed: { type: Boolean, default: false, index: true },
    personalDetails: {
      firstName: { type: String, default: null },
      lastName: { type: String, default: null },
      jobTitle: { type: String, default: null },
      phone: { type: String, default: null },
      timezone: { type: String, default: null },
    },
    organisationDetails: {
      name: { type: String, default: null },
      industry: { type: String, default: null },
      website: { type: String, default: null },
      companySize: { type: String, default: null },
    },
    recruitingGoals: { type: [String], default: [] },
    teamSize: { type: String, default: null },
    hiringLocations: { type: [String], default: [] },
    modulePreferences: { type: [String], default: [] },
    initialIntegrations: { type: [String], default: [] },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type OnboardingDocument = mongoose.InferSchemaType<typeof onboardingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OnboardingModel = (mongoose.models.Onboarding ??
  mongoose.model('Onboarding', onboardingSchema)) as mongoose.Model<OnboardingDocument>;

export function onboardingStepKey(step: number): OnboardingStep {
  return ONBOARDING_STEPS[Math.max(0, Math.min(step - 1, ONBOARDING_STEPS.length - 1))]!;
}
