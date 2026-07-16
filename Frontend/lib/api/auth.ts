import { isMockApiEnabled } from "./config";
import { apiClient } from "./client";
import { AUTH_SESSION_COOKIE } from "./config";
import type { AuthMeResponse, AuthSession } from "./types";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
};

export type UpdateMeInput = {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  jobTitle?: string | null;
  timezone?: string;
  locale?: string;
  profileImage?: string | null;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

type AuthPayload = AuthMeResponse & {
  accessToken: string;
};

export interface AuthApi {
  login(input: LoginInput): Promise<AuthSession & { me: AuthMeResponse }>;
  register(input: RegisterInput): Promise<AuthSession & { me: AuthMeResponse }>;
  logout(): Promise<void>;
  refresh(): Promise<AuthSession>;
  me(): Promise<AuthMeResponse>;
  updateMe(input: UpdateMeInput): Promise<AuthMeResponse>;
  changePassword(input: ChangePasswordInput): Promise<void>;
}

function mapAuthPayload(data: AuthPayload): AuthSession & { me: AuthMeResponse } {
  return {
    accessToken: data.accessToken,
    workspaceId: data.organization.id,
    me: {
      user: data.user,
      organization: data.organization,
      permissions: data.permissions,
    },
  };
}

const liveAuthApi: AuthApi = {
  async login(input) {
    const result = await apiClient.post<AuthPayload>("/auth/login", input, {
      auth: false,
      credentials: "include",
      sensitive: true,
    });
    return mapAuthPayload(result.data);
  },

  async register(input) {
    const result = await apiClient.post<AuthPayload>("/auth/register", input, {
      auth: false,
      credentials: "include",
      sensitive: true,
    });
    return mapAuthPayload(result.data);
  },

  async logout() {
    await apiClient.post<{ loggedOut: boolean }>("/auth/logout", undefined, {
      credentials: "include",
      sensitive: true,
    });
  },

  async refresh() {
    const result = await apiClient.post<{ accessToken: string }>("/auth/refresh", undefined, {
      auth: false,
      credentials: "include",
      sensitive: true,
    });
    return { accessToken: result.data.accessToken };
  },

  async me() {
    const result = await apiClient.get<AuthMeResponse>("/auth/me");
    return result.data;
  },

  async updateMe(input) {
    const result = await apiClient.patch<AuthMeResponse>("/auth/me", input, {
      sensitive: true,
    });
    return result.data;
  },

  async changePassword(input) {
    await apiClient.patch<{ changed: boolean }>("/auth/me/password", input, {
      sensitive: true,
    });
  },
};

const mockAuthApi: AuthApi = {
  async login(input) {
    const { MOCK_USER, WORKSPACES } = await import("@/lib/mock-data");
    void input;
    const workspace = WORKSPACES[0]!;
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      workspaceId: workspace.id,
      me: {
        user: {
          id: "user-1",
          name: MOCK_USER.name,
          firstName: "Ananya",
          lastName: "Sharma",
          email: MOCK_USER.email,
          role: MOCK_USER.role,
          initials: MOCK_USER.initials,
          plan: MOCK_USER.plan,
          memberStatus: "active",
          onboardingStatus: "completed",
          emailVerified: true,
        },
        organization: workspace,
        permissions: ["*"],
      },
    };
  },
  async register(input) {
    return mockAuthApi.login({ email: input.email, password: input.password });
  },
  async logout() {
    return;
  },
  async refresh() {
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      workspaceId: "ws-1",
    };
  },
  async me() {
    const { MOCK_USER, WORKSPACES } = await import("@/lib/mock-data");
    return {
      user: {
        id: "user-1",
        name: MOCK_USER.name,
        firstName: "Ananya",
        lastName: "Sharma",
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        initials: MOCK_USER.initials,
        plan: MOCK_USER.plan,
        memberStatus: "active",
        onboardingStatus: "completed",
        emailVerified: true,
      },
      organization: WORKSPACES[0]!,
      permissions: ["*"],
    };
  },
  async updateMe(input) {
    const current = await mockAuthApi.me();
    const firstName = input.firstName ?? current.user.firstName ?? "Ananya";
    const lastName = input.lastName ?? current.user.lastName ?? "Sharma";
    return {
      ...current,
      user: {
        ...current.user,
        ...input,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
      },
    };
  },
  async changePassword() {
    return;
  },
};

export const authApi: AuthApi = isMockApiEnabled() ? mockAuthApi : liveAuthApi;

export async function refreshAccessTokenLive(): Promise<string | null> {
  if (isMockApiEnabled()) {
    const session = await mockAuthApi.refresh();
    return session.accessToken;
  }

  const { tokenStorage } = await import("./client");
  try {
    const session = await liveAuthApi.refresh();
    tokenStorage.setAccessToken(session.accessToken);
    return session.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

export { AUTH_SESSION_COOKIE } from "./config";

export function setAuthSessionCookie(active: boolean): void {
  if (typeof document === "undefined") return;
  if (active) {
    document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}
