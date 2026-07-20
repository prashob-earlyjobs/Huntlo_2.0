import { sanitizeInternalPath } from "@/lib/auth-redirect";

const PENDING_PUBLIC_SEARCH_KEY = "huntlo.pendingPublicSearch";
const PENDING_REDIRECT_KEY = "huntlo.pendingRedirectPath";

export type PendingPublicSearch = {
  sessionId?: string;
  claimToken?: string;
  createdAt: number;
};

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function savePendingPublicSearch(input: {
  sessionId?: string;
  claimToken?: string;
}): void {
  if (!canUseStorage()) return;
  if (!input.sessionId && !input.claimToken) return;
  const payload: PendingPublicSearch = {
    sessionId: input.sessionId,
    claimToken: input.claimToken,
    createdAt: Date.now(),
  };
  window.localStorage.setItem(PENDING_PUBLIC_SEARCH_KEY, JSON.stringify(payload));
}

export function readPendingPublicSearch(): PendingPublicSearch | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PENDING_PUBLIC_SEARCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPublicSearch;
    if (!parsed?.createdAt || Date.now() - parsed.createdAt > MAX_AGE_MS) {
      clearPendingPublicSearch();
      return null;
    }
    if (!parsed.sessionId && !parsed.claimToken) {
      clearPendingPublicSearch();
      return null;
    }
    return parsed;
  } catch {
    clearPendingPublicSearch();
    return null;
  }
}

export function clearPendingPublicSearch(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PENDING_PUBLIC_SEARCH_KEY);
}

export function setPendingRedirectPath(path: string): void {
  if (!canUseStorage()) return;
  const safe = sanitizeInternalPath(path, "");
  if (!safe) return;
  window.localStorage.setItem(PENDING_REDIRECT_KEY, safe);
}

export function consumePendingRedirectPath(): string | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(PENDING_REDIRECT_KEY);
  window.localStorage.removeItem(PENDING_REDIRECT_KEY);
  return sanitizeInternalPath(raw, "") || null;
}

export function peekPendingRedirectPath(): string | null {
  if (!canUseStorage()) return null;
  return sanitizeInternalPath(window.localStorage.getItem(PENDING_REDIRECT_KEY), "") || null;
}

export function sessionResultsPath(sessionId: string): string {
  return `/dashboard/sessions/${encodeURIComponent(sessionId)}`;
}
