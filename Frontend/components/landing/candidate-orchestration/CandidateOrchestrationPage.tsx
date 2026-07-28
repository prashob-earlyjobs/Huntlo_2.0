"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { CANDIDATE_ORCHESTRATION_GEO } from "@/lib/candidateOrchestration";

import {
  CandidateOrchestrationEnterprise,
  CandidateOrchestrationFaq,
  CandidateOrchestrationFinalCta,
  CandidateOrchestrationFuture,
} from "./CandidateOrchestrationClosing";
import { CandidateOrchestrationHero } from "./CandidateOrchestrationHero";
import { CandidateOrchestrationStory } from "./CandidateOrchestrationStory";
import { CandidateOrchestrationSystems } from "./CandidateOrchestrationSystems";

export function CandidateOrchestrationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <CandidateOrchestrationHero reduceMotion={reduceMotion} />
        <CandidateOrchestrationStory reduceMotion={reduceMotion} />
        <CandidateOrchestrationSystems reduceMotion={reduceMotion} />
        <CandidateOrchestrationEnterprise />
        <CandidateOrchestrationFuture />
        <CandidateOrchestrationFaq />
        <CandidateOrchestrationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={CANDIDATE_ORCHESTRATION_GEO.askPrompt}
        aiAskTopic={CANDIDATE_ORCHESTRATION_GEO.askTopic}
      />
    </div>
  );
}
