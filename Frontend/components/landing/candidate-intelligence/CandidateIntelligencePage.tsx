"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { CANDIDATE_INTELLIGENCE_GEO } from "@/lib/candidateIntelligence";

import {
  CandidateIntelligenceEnterprise,
  CandidateIntelligenceFaq,
  CandidateIntelligenceFinalCta,
  CandidateIntelligenceFuture,
} from "./CandidateIntelligenceClosing";
import { CandidateIntelligenceHero } from "./CandidateIntelligenceHero";
import { CandidateIntelligenceStory } from "./CandidateIntelligenceStory";
import { CandidateIntelligenceSystems } from "./CandidateIntelligenceSystems";

export function CandidateIntelligencePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <CandidateIntelligenceHero reduceMotion={reduceMotion} />
        <CandidateIntelligenceStory reduceMotion={reduceMotion} />
        <CandidateIntelligenceSystems reduceMotion={reduceMotion} />
        <CandidateIntelligenceEnterprise />
        <CandidateIntelligenceFuture />
        <CandidateIntelligenceFaq />
        <CandidateIntelligenceFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={CANDIDATE_INTELLIGENCE_GEO.askPrompt}
        aiAskTopic={CANDIDATE_INTELLIGENCE_GEO.askTopic}
      />
    </div>
  );
}
