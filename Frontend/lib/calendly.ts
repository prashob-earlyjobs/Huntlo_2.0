/** Public Calendly scheduling URL (e.g. https://calendly.com/your-org/demo). */
import {
  appendUtmToUrl,
  buildAttributionPayload,
  loadPersistedUtm,
  readUtmFromSearch,
} from "@/lib/utm";

export function getCalendlyBookDemoUrl(): string {
  const raw = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? "";
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";

    if (typeof window !== "undefined") {
      const fromUrl = readUtmFromSearch(window.location.search);
      const utm = fromUrl ?? loadPersistedUtm();
      return appendUtmToUrl(url.toString(), utm);
    }

    return url.toString();
  } catch {
    return "";
  }
}

/** Fire-and-forget demo click attribution (requires browser). */
export async function trackBookDemoClick(): Promise<void> {
  if (typeof window === "undefined") return;
  const attribution = buildAttributionPayload({
    landingPage: `${window.location.pathname}${window.location.search}`,
  });
  if (!attribution) return;

  const { apiClient } = await import("@/lib/api/client");
  await apiClient
    .post(
      "/public/utm/event",
      {
        eventType: "demo_clicked",
        ...attribution,
        meta: { cta: "book_demo" },
      },
      { auth: false, workspace: false, retry: false }
    )
    .catch(() => undefined);
}
