import type { PlanLimits } from './pricing-plan.model.js';

type SeedPlan = {
  name: string;
  code: string;
  description: string;
  prices: { monthly: number | null; yearly: number | null };
  featureAccess: Record<string, boolean>;
  limits: PlanLimits;
  sortOrder: number;
  public: boolean;
};

export const DEFAULT_PRICING_PLANS: SeedPlan[] = [
  {
    name: 'Starter',
    code: 'starter',
    description: 'For small recruiting teams getting started.',
    prices: { monthly: 9999, yearly: 99_999 },
    sortOrder: 10,
    public: true,
    featureAccess: {
      sourcing: true,
      peopleScout: true,
      outreach: true,
      screening: true,
      assessments: false,
      huntlo360: false,
      analytics: true,
      integrations: false,
      team: true,
    },
    limits: {
      candidate_search: 50,
      email_reveal: 500,
      mobile_reveal: 200,
      people_scout: 50,
      email_outreach: 2000,
      whatsapp_outreach: 500,
      ai_voice_minutes: 100,
      assessment_invites: 0,
      team_seats: 3,
      allowOverage: false,
    },
  },
  {
    name: 'Growth',
    code: 'growth',
    description: 'For growing talent teams with multi-channel outreach.',
    prices: { monthly: 24_999, yearly: 249_999 },
    sortOrder: 20,
    public: true,
    featureAccess: {
      sourcing: true,
      peopleScout: true,
      outreach: true,
      screening: true,
      assessments: true,
      huntlo360: false,
      analytics: true,
      integrations: true,
      team: true,
    },
    limits: {
      candidate_search: 200,
      email_reveal: 2500,
      mobile_reveal: 1200,
      people_scout: 200,
      email_outreach: 20_000,
      whatsapp_outreach: 5000,
      ai_voice_minutes: 600,
      assessment_invites: 200,
      team_seats: 15,
      allowOverage: false,
    },
  },
  {
    name: 'Scale',
    code: 'scale',
    description: 'For high-volume hiring with advanced automation.',
    prices: { monthly: 49_999, yearly: 499_999 },
    sortOrder: 30,
    public: true,
    featureAccess: {
      sourcing: true,
      peopleScout: true,
      outreach: true,
      screening: true,
      assessments: true,
      huntlo360: true,
      analytics: true,
      integrations: true,
      team: true,
    },
    limits: {
      candidate_search: 1000,
      email_reveal: 10_000,
      mobile_reveal: 5000,
      people_scout: 1000,
      email_outreach: 100_000,
      whatsapp_outreach: 25_000,
      ai_voice_minutes: 3000,
      assessment_invites: 1000,
      team_seats: 50,
      allowOverage: false,
    },
  },
  {
    name: 'Enterprise',
    code: 'enterprise',
    description: 'Custom limits, security, and dedicated support.',
    prices: { monthly: null, yearly: null },
    sortOrder: 40,
    public: true,
    featureAccess: {
      sourcing: true,
      peopleScout: true,
      outreach: true,
      screening: true,
      assessments: true,
      huntlo360: true,
      analytics: true,
      integrations: true,
      team: true,
    },
    limits: {
      candidate_search: 999_999_999,
      email_reveal: 999_999_999,
      mobile_reveal: 999_999_999,
      people_scout: 999_999_999,
      email_outreach: 999_999_999,
      whatsapp_outreach: 999_999_999,
      ai_voice_minutes: 999_999_999,
      assessment_invites: 999_999_999,
      team_seats: 999_999_999,
      allowOverage: true,
    },
  },
];
