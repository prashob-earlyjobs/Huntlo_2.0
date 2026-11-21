"use client";

import { Footer } from "@/components/huntlo/Footer";
import { Navbar } from "@/components/huntlo/Navbar";
import {
  PlatformModuleAnswer,
  PlatformModuleFaq,
  PlatformModuleFinalCta,
  PlatformModuleHero,
  PlatformModuleHowItWorks,
  PlatformModuleProblem,
  PlatformModuleProduct,
  PlatformModuleTrust,
  PlatformModuleWhoItHelps,
} from "@/components/huntlo/platform/PlatformModuleSections";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";

type PlatformModulePageProps = {
  config: PlatformModuleConfig;
};

/** Platform modules — `/` design language (tokens, depth, motion), page-specific layouts. */
export function PlatformModulePage({ config }: PlatformModulePageProps) {
  return (
    <div id="top" className="halo-home">
      <Navbar />
      <main className="page-frame">
        <PlatformModuleHero config={config} />
        <PlatformModuleProblem config={config} />
        <PlatformModuleAnswer config={config} />
        <PlatformModuleHowItWorks config={config} />
        <PlatformModuleProduct config={config} />
        <PlatformModuleWhoItHelps config={config} />
        <PlatformModuleTrust config={config} />
        <PlatformModuleFaq config={config} />
        <PlatformModuleFinalCta config={config} />
      </main>
      <Footer />
    </div>
  );
}
