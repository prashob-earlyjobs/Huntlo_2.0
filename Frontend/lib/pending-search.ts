const STORAGE_KEY = "huntlo:pending-search";

export type PendingSearchWatch = {
  savedSessionId: string;
  sessionId: string;
  prompt?: string;
};

let searchWorkspaceActive = false;

export function setSearchWorkspaceActive(active: boolean): void {
  searchWorkspaceActive = active;
}

export function isSearchWorkspaceActive(): boolean {
  return searchWorkspaceActive;
}

export function readPendingSearch(): PendingSearchWatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSearchWatch;
    if (!parsed?.savedSessionId || !parsed?.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingSearch(watch: PendingSearchWatch): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(watch));
  } catch {
    // ignore quota / private mode
  }
}

export function clearPendingSearch(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const EXPLORE_WHILE_SEARCHING =
  "You are free to explore Huntlo while we find matching profiles. We'll notify you when results are ready.";

export function requestSearchNotificationPermission(): void {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    void Notification.requestPermission().catch(() => undefined);
  }
}

export function notifyPendingSearchFinished(options: {
  title: string;
  body: string;
  url: string;
}): void {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    const notification = new Notification(options.title, {
      body: options.body,
      tag: "huntlo-candidate-search",
    });
    notification.onclick = () => {
      window.focus();
      window.location.assign(options.url);
      notification.close();
    };
  } catch {
    // Browser may block notifications even after grant.
  }
}
