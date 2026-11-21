import type { ReactNode } from "react";
import { Suspense } from "react";

import { UtmVisitTracker } from "@/components/marketing/UtmVisitTracker";

/**
 * Homepage shell — Geist fonts for exact type match with the halo design.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
      />
      {children}
      <Suspense fallback={null}>
        <UtmVisitTracker />
      </Suspense>
    </>
  );
}
