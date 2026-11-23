"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import {
  AI_RECRUITING_AUTOMATION_RETAIL_GEO,
} from "@/lib/aiRecruitingAutomationRetail";

import { AiRecruitingAutomationRetailBuildSection } from "./AiRecruitingAutomationRetailBuildSection";
import { AiRecruitingAutomationRetailDefinition } from "./AiRecruitingAutomationRetailDefinition";
import { AiRecruitingAutomationRetailFaq } from "./AiRecruitingAutomationRetailFaq";
import { AiRecruitingAutomationRetailHero } from "./AiRecruitingAutomationRetailHero";
import { AiRecruitingAutomationRetailHumanOversight } from "./AiRecruitingAutomationRetailHumanOversight";
import { AiRecruitingAutomationRetailProblem } from "./AiRecruitingAutomationRetailProblem";
import { AiRecruitingAutomationRetailVoiceExperience } from "./AiRecruitingAutomationRetailVoiceExperience";
import { AiRecruitingAutomationRetailWorkflow } from "./AiRecruitingAutomationRetailWorkflow";

export function AiRecruitingAutomationRetailPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingAutomationRetailHero reduceMotion={reduceMotion} />
        <AiRecruitingAutomationRetailProblem reduceMotion={reduceMotion} />
        <AiRecruitingAutomationRetailDefinition reduceMotion={reduceMotion} />
        <AiRecruitingAutomationRetailVoiceExperience />
        <AiRecruitingAutomationRetailWorkflow reduceMotion={reduceMotion} />
        <AiRecruitingAutomationRetailHumanOversight reduceMotion={reduceMotion} />
        <AiRecruitingAutomationRetailFaq />
        <AiRecruitingAutomationRetailBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_AUTOMATION_RETAIL_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_AUTOMATION_RETAIL_GEO.askTopic}
      />
    </div>
  );
}
