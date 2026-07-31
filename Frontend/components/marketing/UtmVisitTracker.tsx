"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { apiClient } from "@/lib/api/client";
import {
  getOrCreateSessionId,
  getOrCreateVisitorId,
  hasUtm,
  markSessionTracked,
  persistUtm,
  readUtmFromSearch,
  wasSessionTracked,
} from "@/lib/utm";

/**
 * Captures marketing UTM visits once per browser session and posts to the
 * public attribution endpoint. Failures are swallowed — tracking must never
 * break the page.
 */
export function UtmVisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromUrl = readUtmFromSearch(searchParams.toString());
    if (fromUrl) persistUtm(fromUrl);

    // Only count a visit when UTMs are present on this landing URL.
    if (!hasUtm(fromUrl) || !fromUrl) return;

    const sessionId = getOrCreateSessionId();
    if (wasSessionTracked(sessionId)) return;

    const visitorId = getOrCreateVisitorId();
    markSessionTracked(sessionId);

    void apiClient
      .post(
        "/public/utm/visit",
        {
          sessionId,
          visitorId,
          ...fromUrl,
          landingPage: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
          referrer: document.referrer || null,
        },
        { auth: false, workspace: false, retry: false }
      )
      .catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
