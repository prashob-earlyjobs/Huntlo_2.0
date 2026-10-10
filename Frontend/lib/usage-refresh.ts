/** Browser event so usage UI refreshes without waiting on realtime. */
export const USAGE_REFRESH_EVENT = "huntlo:usage-refresh";

export function notifyUsageRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(USAGE_REFRESH_EVENT));
}
