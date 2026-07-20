import {
  HUNTLO_DASHBOARD_TOUR_VERSION,
  TOUR_LOCAL_CACHE_KEY,
  type ProductTourStatus,
} from "@/lib/config/dashboard-tour";
import type { DashboardProductTourState } from "@/lib/api/product-tour";

export type TourEligibilityInput = {
  isAuthenticated: boolean;
  authLoading: boolean;
  platformAdmin?: boolean;
  onboardingCompleted?: boolean;
  onboardingStatus?: string;
  accountRole?: "owner" | "member";
  pathname: string;
  tourStatus?: ProductTourStatus | null;
  tourFetchFailed?: boolean;
  hasBlockingOverlay?: boolean;
};

export type TourAutoStartDecision =
  | { action: "none"; reason: string }
  | { action: "start"; reason: string }
  | { action: "resume"; reason: string };

function isOnboardingIncomplete(input: TourEligibilityInput): boolean {
  if (input.accountRole === "member") return false;
  if (typeof input.onboardingCompleted === "boolean") {
    return !input.onboardingCompleted;
  }
  return input.onboardingStatus !== "completed";
}

export function isRecruiterDashboardPath(pathname: string): boolean {
  if (!pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/admin")) return false;
  return true;
}

/** Exact home path where the first-time tour auto-starts. */
export function isDashboardHomePath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname === "/dashboard/";
}

export function shouldOfferManualRestart(input: {
  isAuthenticated: boolean;
  platformAdmin?: boolean;
  pathname: string;
}): boolean {
  if (!input.isAuthenticated) return false;
  if (input.platformAdmin) return false;
  if (input.pathname.startsWith("/admin")) return false;
  return isRecruiterDashboardPath(input.pathname);
}

export function decideTourAutoStart(
  input: TourEligibilityInput
): TourAutoStartDecision {
  if (input.authLoading) {
    return { action: "none", reason: "auth_loading" };
  }
  if (!input.isAuthenticated) {
    return { action: "none", reason: "unauthenticated" };
  }
  if (input.platformAdmin) {
    return { action: "none", reason: "platform_admin" };
  }
  if (isOnboardingIncomplete(input)) {
    return { action: "none", reason: "onboarding_incomplete" };
  }
  if (!isDashboardHomePath(input.pathname)) {
    return { action: "none", reason: "not_dashboard_home" };
  }
  if (input.hasBlockingOverlay) {
    return { action: "none", reason: "blocking_overlay" };
  }
  if (input.tourFetchFailed || !input.tourStatus) {
    return { action: "none", reason: "tour_status_unavailable" };
  }
  if (input.tourStatus === "completed" || input.tourStatus === "skipped") {
    return { action: "none", reason: "already_finished" };
  }
  if (input.tourStatus === "in_progress") {
    return { action: "resume", reason: "in_progress" };
  }
  return { action: "start", reason: "not_started" };
}

export function readLocalTourCache(): DashboardProductTourState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TOUR_LOCAL_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardProductTourState;
    if (parsed.version !== HUNTLO_DASHBOARD_TOUR_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalTourCache(state: DashboardProductTourState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOUR_LOCAL_CACHE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private mode failures — backend remains authority.
  }
}

export function clearLocalTourCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOUR_LOCAL_CACHE_KEY);
  } catch {
    // ignore
  }
}

export function pickTourStartDelay(random = Math.random): number {
  const { min, max } = {
    min: 600,
    max: 900,
  };
  return Math.floor(min + random() * (max - min + 1));
}
