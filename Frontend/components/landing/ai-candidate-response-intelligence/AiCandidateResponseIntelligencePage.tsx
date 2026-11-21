"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_CANDIDATE_RESPONSE_INTELLIGENCE_GEO } from "@/lib/aiCandidateResponseIntelligence";

import { AiCandidateResponseIntelligenceContext } from "./AiCandidateResponseIntelligenceContext";
import { AiCandidateResponseIntelligenceDefinition } from "./AiCandidateResponseIntelligenceDefinition";
import { AiCandidateResponseIntelligenceFaq } from "./AiCandidateResponseIntelligenceFaq";
import { AiCandidateResponseIntelligenceFinalCta } from "./AiCandidateResponseIntelligenceFinalCta";
import { AiCandidateResponseIntelligenceHero } from "./AiCandidateResponseIntelligenceHero";
import { AiCandidateResponseIntelligenceHumanOversight } from "./AiCandidateResponseIntelligenceHumanOversight";
import { AiCandidateResponseIntelligenceProblem } from "./AiCandidateResponseIntelligenceProblem";
import { AiCandidateResponseIntelligenceWorkflow } from "./AiCandidateResponseIntelligenceWorkflow";
import { AiCandidateResponseIntelligenceWorkflowBridge } from "./AiCandidateResponseIntelligenceWorkflowBridge";

export function AiCandidateResponseIntelligencePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiCandidateResponseIntelligenceHero reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceProblem reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceDefinition reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceWorkflowBridge reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceWorkflow reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceContext reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceHumanOversight reduceMotion={reduceMotion} />
        <AiCandidateResponseIntelligenceFaq />
        <AiCandidateResponseIntelligenceFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_CANDIDATE_RESPONSE_INTELLIGENCE_GEO.askPrompt}
        aiAskTopic={AI_CANDIDATE_RESPONSE_INTELLIGENCE_GEO.askTopic}
      />
    </div>
  );
}