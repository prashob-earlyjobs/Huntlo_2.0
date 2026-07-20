export const COMPANY_TYPES = [
  'recruitment_agency',
  'startup',
  'enterprise_gcc',
  'staffing_firm',
  'executive_search',
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const HIRING_CHALLENGES = [
  'finding_qualified',
  'low_response',
  'manual_outreach',
  'screening',
  'followups',
  'high_volume',
] as const;
export type HiringChallenge = (typeof HIRING_CHALLENGES)[number];

export const OUTREACH_CHANNELS = [
  'whatsapp',
  'email',
  'linkedin',
  'calls',
  'sms',
] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const HIRING_VOLUMES = ['1_5', '5_20', '20_100', '100_plus'] as const;
export type HiringVolume = (typeof HIRING_VOLUMES)[number];

export type OnboardingAnswers = {
  companyType: CompanyType;
  hiringChallenges: HiringChallenge[];
  outreachChannels: OutreachChannel[];
  hiringVolume: HiringVolume;
};
