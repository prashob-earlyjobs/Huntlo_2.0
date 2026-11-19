"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_PASSIVE_CANDIDATE_ENGAGEMENT_GEO } from "@/lib/aiPassiveCandidateEngagement";

import { AiPassiveCandidateEngagementAgentic } from "./AiPassiveCandidateEngagementAgentic";
import { AiPassiveCandidateEngagementComparison } from "./AiPassiveCandidateEngagementComparison";
import { AiPassiveCandidateEngagementConclusion } from "./AiPassiveCandidateEngagementConclusion";
import { AiPassiveCandidateEngagementDefinition } from "./AiPassiveCandidateEngagementDefinition";
import { AiPassiveCandidateEngagementFaq } from "./AiPassiveCandidateEngagementFaq";
import { AiPassiveCandidateEngagementFinalCta } from "./AiPassiveCandidateEngagementFinalCta";
import { AiPassiveCandidateEngagementHero } from "./AiPassiveCandidateEngagementHero";
import { AiPassiveCandidateEngagementPersonalization } from "./AiPassiveCandidateEngagementPersonalization";
import { AiPassiveCandidateEngagementQuality } from "./AiPassiveCandidateEngagementQuality";
import { AiPassiveCandidateEngagementWorkflow } from "./AiPassiveCandidateEngagementWorkflow";

export function AiPassiveCandidateEngagementPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiPassiveCandidateEngagementHero reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementComparison reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementDefinition reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementPersonalization reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementWorkflow reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementAgentic reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementQuality reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementConclusion reduceMotion={reduceMotion} />
        <AiPassiveCandidateEngagementFaq />
        <AiPassiveCandidateEngagementFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_PASSIVE_CANDIDATE_ENGAGEMENT_GEO.askPrompt}
        aiAskTopic={AI_PASSIVE_CANDIDATE_ENGAGEMENT_GEO.askTopic}
      />
    </div>
  );
}