"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_INTERVIEW_WORKFLOW_AUTOMATION_GEO } from "@/lib/aiInterviewWorkflowAutomation";

import { AiInterviewWorkflowAutomationClosing } from "./AiInterviewWorkflowAutomationClosing";
import { AiInterviewWorkflowAutomationHero } from "./AiInterviewWorkflowAutomationHero";
import { AiInterviewWorkflowAutomationSections } from "./AiInterviewWorkflowAutomationSections";

export function AiInterviewWorkflowAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-white text-[#0b1220] selection:bg-[#2563eb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiInterviewWorkflowAutomationHero reduceMotion={reduceMotion} />
        <AiInterviewWorkflowAutomationSections reduceMotion={reduceMotion} />
        <AiInterviewWorkflowAutomationClosing reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_INTERVIEW_WORKFLOW_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_INTERVIEW_WORKFLOW_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}