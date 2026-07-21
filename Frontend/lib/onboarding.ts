export const COMPANY_TYPES = [
  "recruitment_agency",
  "startup",
  "enterprise_gcc",
  "staffing_firm",
  "executive_search",
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const HIRING_CHALLENGES = [
  "finding_qualified",
  "low_response",
  "manual_outreach",
  "screening",
  "followups",
  "high_volume",
] as const;
export type HiringChallenge = (typeof HIRING_CHALLENGES)[number];

export const OUTREACH_CHANNELS = [
  "whatsapp",
  "email",
  "linkedin",
  "calls",
  "sms",
] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const HIRING_VOLUMES = ["1_5", "5_20", "20_100", "100_plus"] as const;
export type HiringVolume = (typeof HIRING_VOLUMES)[number];

export type OnboardingAnswers = {
  companyType: CompanyType | null;
  hiringChallenges: HiringChallenge[];
  outreachChannels: OutreachChannel[];
  hiringVolume: HiringVolume | null;
};

export const COMPANY_TYPE_OPTIONS: { value: CompanyType; label: string }[] = [
  { value: "recruitment_agency", label: "Recruitment Agency" },
  { value: "startup", label: "Startup" },
  { value: "enterprise_gcc", label: "Enterprise / GCC" },
  { value: "staffing_firm", label: "Staffing Firm" },
  { value: "executive_search", label: "Executive Search" },
];

export const HIRING_CHALLENGE_OPTIONS: { value: HiringChallenge; label: string }[] = [
  { value: "finding_qualified", label: "Finding Qualified Candidates" },
  { value: "low_response", label: "Low Candidate Response" },
  { value: "manual_outreach", label: "Too Much Manual Outreach" },
  { value: "screening", label: "Screening Candidates" },
  { value: "followups", label: "Managing Follow-Ups" },
  { value: "high_volume", label: "High-Volume Hiring" },
];

export const OUTREACH_CHANNEL_OPTIONS: { value: OutreachChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "calls", label: "Calls" },
  { value: "sms", label: "SMS" },
];

export const HIRING_VOLUME_OPTIONS: { value: HiringVolume; label: string }[] = [
  { value: "1_5", label: "1–5 hires" },
  { value: "5_20", label: "5–20 hires" },
  { value: "20_100", label: "20–100 hires" },
  { value: "100_plus", label: "100+ hires" },
];

export const ONBOARDING_STEPS = [
  { id: 0, key: "welcome", label: "Welcome" },
  { id: 1, key: "company", label: "Company Profile" },
  { id: 2, key: "challenges", label: "Hiring Challenges" },
  { id: 3, key: "channels", label: "Outreach Channels" },
  { id: 4, key: "volume", label: "Hiring Volume" },
] as const;

export const ONBOARDING_DRAFT_KEY = "huntlo.onboarding.draft";

export function emptyOnboardingAnswers(): OnboardingAnswers {
  return {
    companyType: null,
    hiringChallenges: [],
    outreachChannels: [],
    hiringVolume: null,
  };
}

export function isStepValid(step: number, answers: OnboardingAnswers): boolean {
  switch (step) {
    case 0:
      return true;
    case 1:
      return Boolean(answers.companyType);
    case 2:
      return answers.hiringChallenges.length > 0;
    case 3:
      return answers.outreachChannels.length > 0;
    case 4:
      return Boolean(answers.hiringVolume);
    default:
      return false;
  }
}

export function toCompletionPayload(answers: OnboardingAnswers) {
  if (
    !answers.companyType ||
    answers.hiringChallenges.length === 0 ||
    answers.outreachChannels.length === 0 ||
    !answers.hiringVolume
  ) {
    throw new Error("Onboarding answers are incomplete");
  }
  return {
    companyType: answers.companyType,
    hiringChallenges: answers.hiringChallenges,
    outreachChannels: answers.outreachChannels,
    hiringVolume: answers.hiringVolume,
  };
}
