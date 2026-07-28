"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { GCC_TALENT_INTELLIGENCE_GEO } from "@/lib/gccTalentIntelligence";

import {
  GccTalentIntelligenceEnterprise,
  GccTalentIntelligenceFaq,
  GccTalentIntelligenceFinalCta,
  GccTalentIntelligenceIndustries,
} from "./GccTalentIntelligenceClosing";
import { GccTalentIntelligenceHero } from "./GccTalentIntelligenceHero";
import { GccTalentIntelligenceStory } from "./GccTalentIntelligenceStory";
import { GccTalentIntelligenceSystems } from "./GccTalentIntelligenceSystems";

export function GccTalentIntelligencePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <GccTalentIntelligenceHero reduceMotion={reduceMotion} />
        <GccTalentIntelligenceStory reduceMotion={reduceMotion} />
        <GccTalentIntelligenceSystems reduceMotion={reduceMotion} />
        <GccTalentIntelligenceIndustries />
        <GccTalentIntelligenceEnterprise />
        <GccTalentIntelligenceFaq />
        <GccTalentIntelligenceFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={GCC_TALENT_INTELLIGENCE_GEO.askPrompt}
        aiAskTopic={GCC_TALENT_INTELLIGENCE_GEO.askTopic}
      />
    </div>
  );
}
