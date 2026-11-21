"use client";

import { Navbar } from "@/components/huntlo/Navbar";

/**
 * Marketing chrome — uses the V2 Huntlo navbar (Platform + Solutions mega-menu).
 * Scoped halo tokens without forcing a full-page shell.
 * overflow must stay visible so sticky dropdowns are not clipped by .halo-home.
 */
export function LandingNav() {
  return (
    <div className="halo-home !min-h-0 !overflow-visible bg-transparent">
      <Navbar />
    </div>
  );
}
