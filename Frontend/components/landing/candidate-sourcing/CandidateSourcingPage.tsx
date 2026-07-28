"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { CANDIDATE_SOURCING_GEO } from "@/lib/candidateSourcing";

import {
  CandidateSourcingEnterprise,
  CandidateSourcingFaq,
  CandidateSourcingFinalCta,
  CandidateSourcingFuture,
} from "./CandidateSourcingClosing";
import { CandidateSourcingHero } from "./CandidateSourcingHero";
import { CandidateSourcingStory } from "./CandidateSourcingStory";
import { CandidateSourcingSystems } from "./CandidateSourcingSystems";

export function CandidateSourcingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <CandidateSourcingHero reduceMotion={reduceMotion} />
        <CandidateSourcingStory reduceMotion={reduceMotion} />
        <CandidateSourcingSystems reduceMotion={reduceMotion} />
        <CandidateSourcingEnterprise />
        <CandidateSourcingFuture />
        <CandidateSourcingFaq />
        <CandidateSourcingFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={CANDIDATE_SOURCING_GEO.askPrompt}
        aiAskTopic={CANDIDATE_SOURCING_GEO.askTopic}
      />
    </div>
  );
}
