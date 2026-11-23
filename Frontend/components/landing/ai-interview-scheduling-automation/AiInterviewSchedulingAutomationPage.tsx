"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_INTERVIEW_SCHEDULING_AUTOMATION_GEO } from "@/lib/aiInterviewSchedulingAutomation";

import {
  AiInterviewSchedulingAutomationFaq,
  AiInterviewSchedulingAutomationFinalCta,
  AiInterviewSchedulingAutomationInvite,
} from "./AiInterviewSchedulingAutomationClosing";
import { AiInterviewSchedulingAutomationHero } from "./AiInterviewSchedulingAutomationHero";
import { AiInterviewSchedulingAutomationStory } from "./AiInterviewSchedulingAutomationStory";
import { AiInterviewSchedulingAutomationSystems } from "./AiInterviewSchedulingAutomationSystems";

export function AiInterviewSchedulingAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiInterviewSchedulingAutomationHero reduceMotion={reduceMotion} />
        <AiInterviewSchedulingAutomationStory reduceMotion={reduceMotion} />
        <AiInterviewSchedulingAutomationSystems reduceMotion={reduceMotion} />
        <AiInterviewSchedulingAutomationInvite />
        <AiInterviewSchedulingAutomationFaq />
        <AiInterviewSchedulingAutomationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_INTERVIEW_SCHEDULING_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_INTERVIEW_SCHEDULING_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}
