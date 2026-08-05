"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { TALENT_INTELLIGENCE_GEO } from "@/lib/talentIntelligence";

import {
  TalentIntelligenceEnterprise,
  TalentIntelligenceFaq,
  TalentIntelligenceFinalCta,
  TalentIntelligenceFuture,
} from "./TalentIntelligenceClosing";
import { TalentIntelligenceHero } from "./TalentIntelligenceHero";
import { TalentIntelligenceStory } from "./TalentIntelligenceStory";
import { TalentIntelligenceSystems } from "./TalentIntelligenceSystems";

export function TalentIntelligencePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <TalentIntelligenceHero reduceMotion={reduceMotion} />
        <TalentIntelligenceStory reduceMotion={reduceMotion} />
        <TalentIntelligenceSystems reduceMotion={reduceMotion} />
        <TalentIntelligenceEnterprise />
        <TalentIntelligenceFuture />
        <TalentIntelligenceFaq />
        <TalentIntelligenceFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={TALENT_INTELLIGENCE_GEO.askPrompt}
        aiAskTopic={TALENT_INTELLIGENCE_GEO.askTopic}
      />
    </div>
  );
}
