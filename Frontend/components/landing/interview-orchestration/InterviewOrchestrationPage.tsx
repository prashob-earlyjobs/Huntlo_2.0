"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { INTERVIEW_ORCHESTRATION_GEO } from "@/lib/interviewOrchestration";

import {
  InterviewOrchestrationEnterprise,
  InterviewOrchestrationFaq,
  InterviewOrchestrationFinalCta,
  InterviewOrchestrationFuture,
} from "./InterviewOrchestrationClosing";
import { InterviewOrchestrationHero } from "./InterviewOrchestrationHero";
import { InterviewOrchestrationStory } from "./InterviewOrchestrationStory";
import { InterviewOrchestrationSystems } from "./InterviewOrchestrationSystems";

export function InterviewOrchestrationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <InterviewOrchestrationHero reduceMotion={reduceMotion} />
        <InterviewOrchestrationStory reduceMotion={reduceMotion} />
        <InterviewOrchestrationSystems reduceMotion={reduceMotion} />
        <InterviewOrchestrationEnterprise />
        <InterviewOrchestrationFuture />
        <InterviewOrchestrationFaq />
        <InterviewOrchestrationFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={INTERVIEW_ORCHESTRATION_GEO.askPrompt}
        aiAskTopic={INTERVIEW_ORCHESTRATION_GEO.askTopic}
      />
    </div>
  );
}
