"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { SOURCING_GEO } from "@/lib/sourcing";

import { CustomerStory } from "./CustomerStory";
import { FaqSection } from "./FaqSection";
import { FeaturesGrid } from "./FeaturesGrid";
import { FinalCTA } from "./FinalCTA";
import { HeroSection } from "./HeroSection";
import { IntegrationSection } from "./IntegrationSection";
import { OverviewSection } from "./OverviewSection";
import { WorkflowSection } from "./WorkflowSection";

export function SourcingPageContent() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] font-sans text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <HeroSection reduceMotion={reduceMotion} />
        <OverviewSection reduceMotion={reduceMotion} />
        <FeaturesGrid reduceMotion={reduceMotion} />
        <WorkflowSection reduceMotion={reduceMotion} />
        <CustomerStory reduceMotion={reduceMotion} />
        <IntegrationSection reduceMotion={reduceMotion} />
        <FaqSection />
        <FinalCTA reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={SOURCING_GEO.askPrompt}
        aiAskTopic={SOURCING_GEO.askTopic}
      />
    </div>
  );
}
