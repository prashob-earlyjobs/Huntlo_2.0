"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITING_WORKFLOW_ORCHESTRATION_GEO } from "@/lib/aiRecruitingWorkflowOrchestration";

import {
  AiRecruitingWorkflowOrchestrationFaq,
  AiRecruitingWorkflowOrchestrationFinalCta,
  AiRecruitingWorkflowOrchestrationInvite,
} from "./AiRecruitingWorkflowOrchestrationClosing";
import { AiRecruitingWorkflowOrchestrationHero } from "./AiRecruitingWorkflowOrchestrationHero";
import { AiRecruitingWorkflowOrchestrationStory } from "./AiRecruitingWorkflowOrchestrationStory";
import { AiRecruitingWorkflowOrchestrationSystems } from "./AiRecruitingWorkflowOrchestrationSystems";

export function AiRecruitingWorkflowOrchestrationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingWorkflowOrchestrationHero reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowOrchestrationStory reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowOrchestrationSystems reduceMotion={reduceMotion} />
        <AiRecruitingWorkflowOrchestrationInvite />
        <AiRecruitingWorkflowOrchestrationFaq />
        <AiRecruitingWorkflowOrchestrationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_WORKFLOW_ORCHESTRATION_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_WORKFLOW_ORCHESTRATION_GEO.askTopic}
      />
    </div>
  );
}
