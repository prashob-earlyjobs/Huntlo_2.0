import type { AuthUser } from "@/lib/api/types";

export type PostAuthUser = Pick<
  AuthUser,
  "role" | "accountRole" | "onboardingCompleted" | "onboardingStatus" | "platformAdmin"
>;

function isOnboardingIncomplete(user: PostAuthUser): boolean {
  if (typeof user.onboardingCompleted === "boolean") {
    return !user.onboardingCompleted;
  }
  return user.onboardingStatus !== "completed";
}

/**
 * Shared post-auth destination for signup, login, session restore, and onboarding.
 */
export function postAuthPath(user: PostAuthUser | null | undefined): string {
  if (!user) return "/login";

  if (user.platformAdmin) {
    return "/admin/dashboard";
  }

  const accountRole =
    user.accountRole ?? (user.role === "owner" ? "owner" : "member");

  if (accountRole === "member") {
    return "/dashboard";
  }

  if (isOnboardingIncomplete(user)) {
    return "/onboarding";
  }

  return "/dashboard";
}

/** Restrict redirects to internal app paths only (no open redirects). */
export function sanitizeInternalPath(
  path: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!path) return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  return trimmed;
}

export function resolvePostAuthDestination(
  user: PostAuthUser | null | undefined,
  preferredPath?: string | null
): string {
  const base = postAuthPath(user);
  if (base === "/onboarding" || base === "/admin/dashboard" || base === "/login") {
    return base;
  }
  return sanitizeInternalPath(preferredPath, base);
}
