"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_TALENT_POOL_ENGAGEMENT_GEO } from "@/lib/aiTalentPoolEngagement";

import { AiTalentPoolEngagementBuildSection } from "./AiTalentPoolEngagementBuildSection";
import { AiTalentPoolEngagementDefinition } from "./AiTalentPoolEngagementDefinition";
import { AiTalentPoolEngagementFaq } from "./AiTalentPoolEngagementFaq";
import { AiTalentPoolEngagementFinalCta } from "./AiTalentPoolEngagementFinalCta";
import { AiTalentPoolEngagementHero } from "./AiTalentPoolEngagementHero";
import { AiTalentPoolEngagementProblem } from "./AiTalentPoolEngagementProblem";
import { AiTalentPoolEngagementTrust } from "./AiTalentPoolEngagementTrust";
import { AiTalentPoolEngagementWorkflow } from "./AiTalentPoolEngagementWorkflow";

export function AiTalentPoolEngagementPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiTalentPoolEngagementHero reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementProblem reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementDefinition reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementWorkflow reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementTrust reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementBuildSection reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementFaq reduceMotion={reduceMotion} />
        <AiTalentPoolEngagementFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_TALENT_POOL_ENGAGEMENT_GEO.askPrompt}
        aiAskTopic={AI_TALENT_POOL_ENGAGEMENT_GEO.askTopic}
      />
    </div>
  );
}
