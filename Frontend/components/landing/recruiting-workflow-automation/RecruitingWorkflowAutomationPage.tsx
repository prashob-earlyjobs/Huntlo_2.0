"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { RECRUITING_WORKFLOW_AUTOMATION_GEO } from "@/lib/recruitingWorkflowAutomation";

import {
  RecruitingWorkflowAutomationEvaluation,
  RecruitingWorkflowAutomationFaq,
  RecruitingWorkflowAutomationFinalCta,
} from "./RecruitingWorkflowAutomationClosing";
import { RecruitingWorkflowAutomationHero } from "./RecruitingWorkflowAutomationHero";
import { RecruitingWorkflowAutomationStory } from "./RecruitingWorkflowAutomationStory";
import { RecruitingWorkflowAutomationSystems } from "./RecruitingWorkflowAutomationSystems";

export function RecruitingWorkflowAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <RecruitingWorkflowAutomationHero reduceMotion={reduceMotion} />
        <RecruitingWorkflowAutomationStory reduceMotion={reduceMotion} />
        <RecruitingWorkflowAutomationSystems reduceMotion={reduceMotion} />
        <RecruitingWorkflowAutomationEvaluation />
        <RecruitingWorkflowAutomationFaq />
        <RecruitingWorkflowAutomationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={RECRUITING_WORKFLOW_AUTOMATION_GEO.askPrompt}
        aiAskTopic={RECRUITING_WORKFLOW_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}
