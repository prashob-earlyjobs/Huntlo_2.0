"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const GA_MEASUREMENT_ID = "G-KQE932R4J6";

/** Public blog and the admin blog editor. */
export function isBlogPath(pathname: string): boolean {
  return (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/admin/blog" ||
    pathname.startsWith("/admin/blog/")
  );
}

/**
 * The root snippet sends the first page view. This covers client navigations
 * and turns measurement off once a blog route is open.
 */
export function GoogleAnalyticsRoute() {
  const pathname = usePathname();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    const win = window as Window & {
      gtag?: (...args: unknown[]) => void;
    } & Record<string, unknown>;
    const disableKey = `ga-disable-${GA_MEASUREMENT_ID}`;

    if (isBlogPath(pathname)) {
      win[disableKey] = true;
      return;
    }

    win[disableKey] = false;
    win.gtag?.("config", GA_MEASUREMENT_ID, { page_path: pathname });
  }, [pathname]);

  return null;
}
