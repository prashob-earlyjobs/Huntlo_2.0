"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_CANDIDATE_RE_ENGAGEMENT_GEO } from "@/lib/aiCandidateReEngagement";

import {
  AiCandidateReEngagementFaq,
} from "./AiCandidateReEngagementFaq";
import { AiCandidateReEngagementFinalCta } from "./AiCandidateReEngagementFinalCta";
import { AiCandidateReEngagementHero } from "./AiCandidateReEngagementHero";
import { AiCandidateReEngagementProblem } from "./AiCandidateReEngagementProblem";
import { AiCandidateReEngagementDefinition } from "./AiCandidateReEngagementDefinition";
import { AiCandidateReEngagementWorkflow } from "./AiCandidateReEngagementWorkflow";
import { AiCandidateReEngagementResponseIntelligence } from "./AiCandidateReEngagementResponseIntelligence";
import { AiCandidateReEngagementTrust } from "./AiCandidateReEngagementTrust";
import { AiCandidateReEngagementUseCases } from "./AiCandidateReEngagementUseCases";

export function AiCandidateReEngagementPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiCandidateReEngagementHero reduceMotion={reduceMotion} />
        <AiCandidateReEngagementProblem reduceMotion={reduceMotion} />
        <AiCandidateReEngagementDefinition reduceMotion={reduceMotion} />
        <AiCandidateReEngagementWorkflow reduceMotion={reduceMotion} />
        <AiCandidateReEngagementResponseIntelligence reduceMotion={reduceMotion} />
        <AiCandidateReEngagementTrust reduceMotion={reduceMotion} />
        <AiCandidateReEngagementUseCases reduceMotion={reduceMotion} />
        <AiCandidateReEngagementFaq />
        <AiCandidateReEngagementFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_CANDIDATE_RE_ENGAGEMENT_GEO.askPrompt}
        aiAskTopic={AI_CANDIDATE_RE_ENGAGEMENT_GEO.askTopic}
      />
    </div>
  );
}
