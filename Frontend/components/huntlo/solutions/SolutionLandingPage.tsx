"use client";

import { Footer } from "@/components/huntlo/Footer";
import { Navbar } from "@/components/huntlo/Navbar";
import {
  SolutionLandingCapabilities,
  SolutionLandingFaq,
  SolutionLandingFinalCta,
  SolutionLandingHero,
  SolutionLandingProblem,
  SolutionLandingProduct,
  SolutionLandingSolution,
  SolutionLandingTrust,
  SolutionLandingUseCases,
  SolutionLandingValue,
} from "@/components/huntlo/solutions/SolutionLandingSections";
import type { SolutionLandingConfig } from "@/lib/solutions/solutionLandingTypes";

type SolutionLandingPageProps = {
  config: SolutionLandingConfig;
};

/** Child solution landings — same V2 chrome and tokens as PlatformModulePage. */
export function SolutionLandingPage({ config }: SolutionLandingPageProps) {
  return (
    <div id="top" className="halo-home">
      <Navbar />
      <main className="page-frame">
        <SolutionLandingHero config={config} />
        <SolutionLandingProblem config={config} />
        <SolutionLandingSolution config={config} />
        <SolutionLandingCapabilities config={config} />
        <SolutionLandingProduct config={config} />
        <SolutionLandingUseCases config={config} />
        <SolutionLandingValue config={config} />
        <SolutionLandingTrust config={config} />
        <SolutionLandingFaq config={config} />
        <SolutionLandingFinalCta config={config} />
      </main>
      <Footer />
    </div>
  );
}
