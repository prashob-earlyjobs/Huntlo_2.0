import { isMockApiEnabled } from "./config";
import { apiClient } from "./client";

export type OnboardingRecord = {
  currentStep: number;
  currentStepKey: string;
  completed: boolean;
  personalDetails: {
    firstName?: string | null;
    lastName?: string | null;
    jobTitle?: string | null;
    phone?: string | null;
    timezone?: string | null;
  };
  organisationDetails: {
    name?: string | null;
    industry?: string | null;
    website?: string | null;
    companySize?: string | null;
  };
  recruitingGoals: string[];
  teamSize: string | null;
  hiringLocations: string[];
  modulePreferences: string[];
  initialIntegrations: string[];
  completedAt: string | null;
};

export type OnboardingPatchInput = {
  currentStep?: number;
  personalDetails?: Partial<OnboardingRecord["personalDetails"]>;
  organisationDetails?: Partial<OnboardingRecord["organisationDetails"]>;
  recruitingGoals?: string[];
  teamSize?: string | null;
  hiringLocations?: string[];
  modulePreferences?: string[];
  initialIntegrations?: string[];
};

export interface OnboardingApi {
  get(): Promise<OnboardingRecord>;
  patch(input: OnboardingPatchInput): Promise<OnboardingRecord>;
  complete(): Promise<{ completed: boolean }>;
}

const mockOnboarding: OnboardingRecord = {
  currentStep: 1,
  currentStepKey: "personal_details",
  completed: false,
  personalDetails: {},
  organisationDetails: {},
  recruitingGoals: [],
  teamSize: null,
  hiringLocations: [],
  modulePreferences: [],
  initialIntegrations: [],
  completedAt: null,
};

const liveOnboardingApi: OnboardingApi = {
  async get() {
    const result = await apiClient.get<OnboardingRecord>("/onboarding");
    return result.data;
  },
  async patch(input) {
    const result = await apiClient.patch<OnboardingRecord>("/onboarding", input, {
      sensitive: true,
    });
    return result.data;
  },
  async complete() {
    const result = await apiClient.post<{ completed: boolean }>("/onboarding/complete", undefined, {
      sensitive: true,
    });
    return result.data;
  },
};

const mockOnboardingApi: OnboardingApi = {
  async get() {
    return { ...mockOnboarding };
  },
  async patch(input) {
    return {
      ...mockOnboarding,
      ...input,
      personalDetails: { ...mockOnboarding.personalDetails, ...input.personalDetails },
      organisationDetails: {
        ...mockOnboarding.organisationDetails,
        ...input.organisationDetails,
      },
    };
  },
  async complete() {
    return { completed: true };
  },
};

export const onboardingApi: OnboardingApi = isMockApiEnabled()
  ? mockOnboardingApi
  : liveOnboardingApi;
