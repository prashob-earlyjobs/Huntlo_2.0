import { isMockApiEnabled } from "./config";
import { apiClient } from "./client";
import type { AuthMeResponse, AuthOrganization, AuthUser } from "./types";
import type { OnboardingAnswers } from "@/lib/onboarding";
import { emptyOnboardingAnswers } from "@/lib/onboarding";

export type OnboardingRecord = {
  completed: boolean;
  completedAt: string | null;
  companyType: string | null;
  hiringChallenges: string[];
  outreachChannels: string[];
  hiringVolume: string | null;
};

export type OnboardingCompleteResult = {
  completed: boolean;
  redirectPath: string;
  user: AuthUser;
  organization: Pick<AuthOrganization, "id" | "name"> & { slug?: string };
};

export type OnboardingCompleteInput = {
  companyType: NonNullable<OnboardingAnswers["companyType"]>;
  hiringChallenges: OnboardingAnswers["hiringChallenges"];
  outreachChannels: OnboardingAnswers["outreachChannels"];
  hiringVolume: NonNullable<OnboardingAnswers["hiringVolume"]>;
};

export interface OnboardingApi {
  get(): Promise<OnboardingRecord>;
  complete(input: OnboardingCompleteInput): Promise<OnboardingCompleteResult>;
}

function toRecord(data: Partial<OnboardingRecord>): OnboardingRecord {
  return {
    completed: Boolean(data.completed),
    completedAt: data.completedAt ?? null,
    companyType: data.companyType ?? null,
    hiringChallenges: data.hiringChallenges ?? [],
    outreachChannels: data.outreachChannels ?? [],
    hiringVolume: data.hiringVolume ?? null,
  };
}

const liveOnboardingApi: OnboardingApi = {
  async get() {
    const result = await apiClient.get<OnboardingRecord>("/onboarding");
    return toRecord(result.data);
  },
  async complete(input) {
    const result = await apiClient.patch<OnboardingCompleteResult>("/onboarding", input, {
      sensitive: true,
    });
    return result.data;
  },
};

const mockOnboardingApi: OnboardingApi = {
  async get() {
    return toRecord({
      ...emptyOnboardingAnswers(),
      completed: false,
      completedAt: null,
    });
  },
  async complete(input) {
    return {
      completed: true,
      redirectPath: "/dashboard",
      user: {
        id: "user-1",
        name: "Ananya Sharma",
        fullName: "Ananya Sharma",
        email: "ananya@huntlo.ai",
        role: "owner",
        accountRole: "owner",
        initials: "AS",
        plan: "Starter",
        onboardingCompleted: true,
        onboardingStatus: "completed",
        onboardingCompanyType: input.companyType,
        onboardingHiringChallenges: input.hiringChallenges,
        onboardingOutreachChannels: input.outreachChannels,
        onboardingHiringVolume: input.hiringVolume,
      },
      organization: { id: "ws-1", name: "Huntlo", slug: "huntlo" },
    };
  },
};

export const onboardingApi: OnboardingApi = isMockApiEnabled()
  ? mockOnboardingApi
  : liveOnboardingApi;

export type { AuthMeResponse };
