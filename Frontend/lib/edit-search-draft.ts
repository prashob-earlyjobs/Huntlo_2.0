import type { SearchFilterState } from "@/lib/mock-search";
import { ROUTES } from "@/lib/routes";

export const EDIT_SEARCH_STORAGE_KEY = "huntlo:edit-search";

export type EditSearchDraft = {
  savedSessionId: string;
  /** Future Jobs session id when known — preferred for apply updates. */
  sessionId: string | null;
  prompt: string;
  filters: SearchFilterState;
  jobId: string | null;
};

export function searchEditPath(savedSessionId: string): string {
  return `${ROUTES.search}?editSessionId=${encodeURIComponent(savedSessionId)}`;
}

export function saveEditSearchDraft(draft: EditSearchDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(EDIT_SEARCH_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode failures
  }
}

export function loadEditSearchDraft(
  savedSessionId?: string | null
): EditSearchDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EDIT_SEARCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EditSearchDraft;
    if (!parsed?.savedSessionId || typeof parsed.prompt !== "string") return null;
    if (savedSessionId && parsed.savedSessionId !== savedSessionId) return null;
    return {
      savedSessionId: parsed.savedSessionId,
      sessionId: parsed.sessionId ?? null,
      prompt: parsed.prompt,
      filters:
        parsed.filters && typeof parsed.filters === "object" ? parsed.filters : {},
      jobId: parsed.jobId ?? null,
    };
  } catch {
    return null;
  }
}

export function clearEditSearchDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(EDIT_SEARCH_STORAGE_KEY);
  } catch {
    // ignore
  }
}
