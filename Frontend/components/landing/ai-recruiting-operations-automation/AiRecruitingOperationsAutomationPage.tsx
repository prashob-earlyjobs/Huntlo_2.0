"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

import {
  AI_RECRUITING_OPERATIONS_AUTOMATION_GEO,
} from "@/lib/aiRecruitingOperationsAutomation";

import { AiRecruitingOperationsAutomationBuildSection } from "./AiRecruitingOperationsAutomationBuildSection";
import { AiRecruitingOperationsAutomationDefinition } from "./AiRecruitingOperationsAutomationDefinition";
import { AiRecruitingOperationsAutomationFaq } from "./AiRecruitingOperationsAutomationFaq";
import { AiRecruitingOperationsAutomationHero } from "./AiRecruitingOperationsAutomationHero";
import { AiRecruitingOperationsAutomationHumanOversight } from "./AiRecruitingOperationsAutomationHumanOversight";
import { AiRecruitingOperationsAutomationProblem } from "./AiRecruitingOperationsAutomationProblem";
import { AiRecruitingOperationsAutomationWorkflow } from "./AiRecruitingOperationsAutomationWorkflow";

export function AiRecruitingOperationsAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingOperationsAutomationHero reduceMotion={reduceMotion} />
        <AiRecruitingOperationsAutomationProblem reduceMotion={reduceMotion} />
        <AiRecruitingOperationsAutomationDefinition reduceMotion={reduceMotion} />
        <AiRecruitingOperationsAutomationWorkflow reduceMotion={reduceMotion} />
        <AiRecruitingOperationsAutomationHumanOversight reduceMotion={reduceMotion} />
        <AiRecruitingOperationsAutomationFaq />
        <AiRecruitingOperationsAutomationBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_OPERATIONS_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_OPERATIONS_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}