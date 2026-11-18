"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

import {
  AI_RECRUITING_AUTOMATION_MANUFACTURING_GEO,
} from "@/lib/aiRecruitingAutomationManufacturing";

import { AiRecruitingAutomationManufacturingBuildSection } from "./AiRecruitingAutomationManufacturingBuildSection";
import { AiRecruitingAutomationManufacturingDefinition } from "./AiRecruitingAutomationManufacturingDefinition";
import { AiRecruitingAutomationManufacturingFaq } from "./AiRecruitingAutomationManufacturingFaq";
import { AiRecruitingAutomationManufacturingHero } from "./AiRecruitingAutomationManufacturingHero";
import { AiRecruitingAutomationManufacturingHumanOversight } from "./AiRecruitingAutomationManufacturingHumanOversight";
import { AiRecruitingAutomationManufacturingProblem } from "./AiRecruitingAutomationManufacturingProblem";
import { AiRecruitingAutomationManufacturingWorkflow } from "./AiRecruitingAutomationManufacturingWorkflow";

export function AiRecruitingAutomationManufacturingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingAutomationManufacturingHero reduceMotion={reduceMotion} />
        <AiRecruitingAutomationManufacturingProblem reduceMotion={reduceMotion} />
        <AiRecruitingAutomationManufacturingDefinition reduceMotion={reduceMotion} />
        <AiRecruitingAutomationManufacturingWorkflow reduceMotion={reduceMotion} />
        <AiRecruitingAutomationManufacturingHumanOversight reduceMotion={reduceMotion} />
        <AiRecruitingAutomationManufacturingFaq />
        <AiRecruitingAutomationManufacturingBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_AUTOMATION_MANUFACTURING_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_AUTOMATION_MANUFACTURING_GEO.askTopic}
      />
    </div>
  );
}