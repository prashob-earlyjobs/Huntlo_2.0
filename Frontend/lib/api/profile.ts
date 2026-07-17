import { isMockApiEnabled } from "./config";
import { apiClient } from "./client";
import type {
  AppearancePrefs,
  NotificationPrefs,
  ProfilePersonal,
  ThemePreference,
  DensityPreference,
} from "@/lib/mock-profile";

export type ProfileResponse = ProfilePersonal & {
  id: string;
  locale?: string;
  profileImage?: string | null;
  role?: string;
  organizationId?: string;
};

export type PreferencesResponse = {
  theme: ThemePreference;
  density: DensityPreference;
  timezone: string;
  locale: string;
  dateFormat: string;
  notificationPreferences: NotificationPrefs;
  appearance: AppearancePrefs;
};

export type ActiveSessionResponse = {
  id: string;
  device: string;
  browser?: string;
  location: string;
  lastActive: string;
  lastUsedAt?: string | null;
  current: boolean;
};

export interface ProfileApi {
  get(): Promise<ProfileResponse>;
  update(input: Partial<ProfilePersonal> & { locale?: string }): Promise<ProfileResponse>;
  changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void>;
  listSessions(): Promise<ActiveSessionResponse[]>;
  revokeSession(id: string): Promise<void>;
  revokeOtherSessions(currentPassword: string): Promise<void>;
  getPreferences(): Promise<PreferencesResponse>;
  updatePreferences(input: {
    theme?: ThemePreference;
    density?: DensityPreference;
    timezone?: string;
    locale?: string;
    dateFormat?: string;
    notificationPreferences?: NotificationPrefs;
    appearance?: AppearancePrefs;
  }): Promise<PreferencesResponse>;
}

const liveProfileApi: ProfileApi = {
  async get() {
    const result = await apiClient.get<ProfileResponse>("/profile");
    return result.data;
  },
  async update(input) {
    const result = await apiClient.patch<ProfileResponse>("/profile", {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      jobTitle: input.jobTitle || null,
      timezone: input.timezone,
      locale: input.locale,
    });
    return result.data;
  },
  async changePassword(input) {
    await apiClient.patch<{ changed: boolean }>("/profile/password", input, {
      sensitive: true,
    });
  },
  async listSessions() {
    const result = await apiClient.get<{ sessions: ActiveSessionResponse[] }>(
      "/profile/sessions"
    );
    return result.data.sessions;
  },
  async revokeSession(id) {
    await apiClient.delete(`/profile/sessions/${id}`);
  },
  async revokeOtherSessions(currentPassword) {
    await apiClient.delete("/profile/sessions", {
      body: { currentPassword },
      sensitive: true,
    });
  },
  async getPreferences() {
    const result = await apiClient.get<PreferencesResponse>("/preferences");
    return result.data;
  },
  async updatePreferences(input) {
    const result = await apiClient.patch<PreferencesResponse>("/preferences", input);
    return result.data;
  },
};

const mockProfileApi: ProfileApi = {
  async get() {
    return {
      id: "mock-user",
      firstName: "Ananya",
      lastName: "Sharma",
      email: "ananya@acmetalent.in",
      phone: "+91 98765 43210",
      jobTitle: "Senior Recruiter",
      timezone: "Asia/Kolkata",
      initials: "AS",
    };
  },
  async update(input) {
    const current = await this.get();
    return { ...current, ...input, initials: `${(input.firstName ?? current.firstName)[0]}${(input.lastName ?? current.lastName)[0]}`.toUpperCase() };
  },
  async changePassword() {},
  async listSessions() {
    return [
      {
        id: "s1",
        device: "Chrome on Mac",
        location: "—",
        lastActive: "Active now",
        current: true,
      },
    ];
  },
  async revokeSession() {},
  async revokeOtherSessions() {},
  async getPreferences() {
    return {
      theme: "system",
      density: "comfortable",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      dateFormat: "DD MMM YYYY",
      notificationPreferences: {
        candidateReplies: { inApp: true, email: true, whatsapp: true },
        campaignCompletion: { inApp: true, email: true, whatsapp: false },
        screeningCompletion: { inApp: true, email: true, whatsapp: false },
        interviewBooking: { inApp: true, email: true, whatsapp: true },
        usageWarnings: { inApp: true, email: true, whatsapp: false },
        integrationErrors: { inApp: true, email: true, whatsapp: false },
        productUpdates: { inApp: true, email: false, whatsapp: false },
      },
      appearance: { theme: "system", density: "comfortable" },
    };
  },
  async updatePreferences(input) {
    const current = await this.getPreferences();
    return {
      ...current,
      ...input,
      theme: input.theme ?? input.appearance?.theme ?? current.theme,
      density: input.density ?? input.appearance?.density ?? current.density,
      appearance: {
        theme: input.theme ?? input.appearance?.theme ?? current.appearance.theme,
        density:
          input.density ?? input.appearance?.density ?? current.appearance.density,
      },
      notificationPreferences:
        input.notificationPreferences ?? current.notificationPreferences,
    };
  },
};

export const profileApi: ProfileApi = isMockApiEnabled()
  ? mockProfileApi
  : liveProfileApi;
