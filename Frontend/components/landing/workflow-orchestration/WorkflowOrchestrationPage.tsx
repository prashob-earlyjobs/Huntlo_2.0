"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { WORKFLOW_ORCHESTRATION_GEO } from "@/lib/workflowOrchestration";

import {
  WorkflowOrchestrationFaq,
  WorkflowOrchestrationFinalCta,
  WorkflowOrchestrationFuture,
} from "./WorkflowOrchestrationClosing";
import { WorkflowOrchestrationHero } from "./WorkflowOrchestrationHero";
import { WorkflowOrchestrationStory } from "./WorkflowOrchestrationStory";
import { WorkflowOrchestrationSystems } from "./WorkflowOrchestrationSystems";

export function WorkflowOrchestrationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <WorkflowOrchestrationHero reduceMotion={reduceMotion} />
        <WorkflowOrchestrationStory reduceMotion={reduceMotion} />
        <WorkflowOrchestrationSystems reduceMotion={reduceMotion} />
        <WorkflowOrchestrationFuture />
        <WorkflowOrchestrationFaq />
        <WorkflowOrchestrationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={WORKFLOW_ORCHESTRATION_GEO.askPrompt}
        aiAskTopic={WORKFLOW_ORCHESTRATION_GEO.askTopic}
      />
    </div>
  );
}
