"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Module-level so the state survives LandingNav remounting on every page.
let initialLoadHandled = false;
let historyNavigationPath: string | null = null;
let popstateListenerAdded = false;

/**
 * Starts each newly visited marketing page at the top. Browser back/forward keeps its
 * restored position, and links that target a #section are left to scroll to that section.
 */
export function useRouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if (popstateListenerAdded) return;
    popstateListenerAdded = true;
    window.addEventListener("popstate", () => {
      historyNavigationPath = window.location.pathname;
    });
  }, []);

  useEffect(() => {
    const fromHistory = historyNavigationPath === pathname;
    historyNavigationPath = null;

    if (!initialLoadHandled) {
      initialLoadHandled = true;
      return;
    }
    if (fromHistory || window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
}
