"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "@/lib/api/errors";
import {
  authApi,
  isMockApiEnabled,
  refreshAccessTokenLive,
  setAuthSessionCookie,
  setTokenProvider,
  tokenStorage,
  AUTH_SESSION_COOKIE,
  type AuthMeResponse,
  type AuthOrganization,
  type AuthSessionState,
  type AuthUser,
} from "@/lib/api";
import type { LoginInput, RegisterInput } from "@/lib/api/auth";

type AuthContextValue = {
  user: AuthUser | null;
  organization: AuthOrganization | null;
  permissions: string[];
  sessionState: AuthSessionState;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setWorkspace: (workspaceId: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isBlockedUser(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.statusCode === 403 &&
    error.message.toLowerCase().includes("blocked")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [sessionState, setSessionState] = useState<AuthSessionState>("loading");
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = refreshAccessTokenLive().finally(() => {
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  }, []);

  useEffect(() => {
    setTokenProvider({
      getAccessToken: () => tokenStorage.getAccessToken(),
      getWorkspaceId: () => tokenStorage.getWorkspaceId(),
      refreshAccessToken,
    });
  }, [refreshAccessToken]);

  const applySession = useCallback(
    (session: AuthMeResponse, tokens?: { accessToken?: string; workspaceId?: string }) => {
      setMe(session);
      if (tokens?.accessToken) tokenStorage.setAccessToken(tokens.accessToken);
      if (tokens?.workspaceId) tokenStorage.setWorkspaceId(tokens.workspaceId);
      else tokenStorage.setWorkspaceId(session.organization.id);

      if (session.user.memberStatus === "blocked" || session.user.memberStatus === "suspended") {
        setSessionState("blocked");
        setAuthSessionCookie(false);
        return;
      }

      setSessionState("authenticated");
      setAuthSessionCookie(true);
    },
    []
  );

  const bootstrap = useCallback(async () => {
    setSessionState("loading");

    const hasAccessToken = Boolean(tokenStorage.getAccessToken());
    const hasSessionCookie =
      typeof document !== "undefined" &&
      document.cookie.includes(`${AUTH_SESSION_COOKIE}=1`);

    if (!isMockApiEnabled() && !hasAccessToken && !hasSessionCookie) {
      setMe(null);
      setSessionState("unauthenticated");
      return;
    }

    try {
      const profile = await authApi.me();
      applySession(profile);
    } catch (error) {
      if (isBlockedUser(error)) {
        tokenStorage.clear();
        setMe(null);
        setSessionState("blocked");
        setAuthSessionCookie(false);
        return;
      }

      if (error instanceof ApiError && error.statusCode === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          try {
            const profile = await authApi.me();
            applySession(profile, { accessToken: refreshed });
            return;
          } catch (retryError) {
            if (isBlockedUser(retryError)) {
              tokenStorage.clear();
              setMe(null);
              setSessionState("blocked");
              setAuthSessionCookie(false);
              return;
            }
          }
        }

        tokenStorage.clear();
        setMe(null);
        setSessionState(hasAccessToken || hasSessionCookie ? "expired" : "unauthenticated");
        setAuthSessionCookie(false);
        return;
      }

      tokenStorage.clear();
      setMe(null);
      setSessionState("unauthenticated");
      setAuthSessionCookie(false);
    }
  }, [applySession, refreshAccessToken]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authApi.login(input);
      applySession(result.me, { accessToken: result.accessToken, workspaceId: result.workspaceId });
    },
    [applySession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await authApi.register(input);
      applySession(result.me, { accessToken: result.accessToken, workspaceId: result.workspaceId });
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
      setMe(null);
      setSessionState("unauthenticated");
      setAuthSessionCookie(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await bootstrap();
  }, [bootstrap]);

  const setWorkspace = useCallback((workspaceId: string) => {
    tokenStorage.setWorkspaceId(workspaceId);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: me?.user ?? null,
      organization: me?.organization ?? null,
      permissions: me?.permissions ?? [],
      sessionState,
      isAuthenticated: sessionState === "authenticated",
      isLoading: sessionState === "loading",
      isMockMode: isMockApiEnabled(),
      login,
      register,
      logout,
      refresh,
      setWorkspace,
    }),
    [me, sessionState, login, register, logout, refresh, setWorkspace]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
