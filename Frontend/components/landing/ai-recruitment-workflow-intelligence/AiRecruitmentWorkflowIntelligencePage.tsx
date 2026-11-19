"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_GEO } from "@/lib/aiRecruitmentWorkflowIntelligence";

import { AiRecruitmentWorkflowIntelligenceFaq } from "./AiRecruitmentWorkflowIntelligenceFaq";
import { AiRecruitmentWorkflowIntelligenceFinalCta } from "./AiRecruitmentWorkflowIntelligenceFinalCta";
import { AiRecruitmentWorkflowIntelligenceHero } from "./AiRecruitmentWorkflowIntelligenceHero";
import { AiRecruitmentWorkflowIntelligenceDefinition } from "./AiRecruitmentWorkflowIntelligenceDefinition";
import { AiRecruitmentWorkflowIntelligenceWorkflow } from "./AiRecruitmentWorkflowIntelligenceWorkflow";
import { AiRecruitmentWorkflowIntelligenceGovernance } from "./AiRecruitmentWorkflowIntelligenceGovernance";

export function AiRecruitmentWorkflowIntelligencePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitmentWorkflowIntelligenceHero reduceMotion={reduceMotion} />
        <AiRecruitmentWorkflowIntelligenceDefinition reduceMotion={reduceMotion} />
        <AiRecruitmentWorkflowIntelligenceWorkflow reduceMotion={reduceMotion} />
        <AiRecruitmentWorkflowIntelligenceGovernance reduceMotion={reduceMotion} />
        <AiRecruitmentWorkflowIntelligenceFaq />
        <AiRecruitmentWorkflowIntelligenceFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_GEO.askPrompt}
        aiAskTopic={AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_GEO.askTopic}
      />
    </div>
  );
}