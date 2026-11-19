"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITING_WORKFLOW_INTEGRATION_GEO } from "@/lib/aiRecruitingWorkflowIntegration";

import { AiRecruitingWorkflowIntegrationBuildSection } from "./AiRecruitingWorkflowIntegrationBuildSection";
import { AiRecruitingWorkflowIntegrationCase } from "./AiRecruitingWorkflowIntegrationCase";
import { AiRecruitingWorkflowIntegrationDefinition } from "./AiRecruitingWorkflowIntegrationDefinition";
import { AiRecruitingWorkflowIntegrationFaq } from "./AiRecruitingWorkflowIntegrationFaq";
import { AiRecruitingWorkflowIntegrationFinalCta } from "./AiRecruitingWorkflowIntegrationFinalCta";
import { AiRecruitingWorkflowIntegrationFramework } from "./AiRecruitingWorkflowIntegrationFramework";
import { AiRecruitingWorkflowIntegrationGovernance } from "./AiRecruitingWorkflowIntegrationGovernance";
import { AiRecruitingWorkflowIntegrationHero } from "./AiRecruitingWorkflowIntegrationHero";
import { AiRecruitingWorkflowIntegrationProblem } from "./AiRecruitingWorkflowIntegrationProblem";

export function AiRecruitingWorkflowIntegrationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingWorkflowIntegrationHero reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationProblem reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationDefinition reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationCase reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationFramework reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationGovernance reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationBuildSection reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationFaq reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowIntegrationFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_WORKFLOW_INTEGRATION_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_WORKFLOW_INTEGRATION_GEO.askTopic}
      />
    </div>
  );
}
