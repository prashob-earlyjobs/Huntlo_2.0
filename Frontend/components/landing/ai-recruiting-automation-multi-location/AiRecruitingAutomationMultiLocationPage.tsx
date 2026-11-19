"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import {
  AI_RECRUITING_AUTOMATION_MULTI_LOCATION_GEO,
} from "@/lib/aiRecruitingAutomationMultiLocation";

import { AiRecruitingAutomationMultiLocationBuildSection } from "./AiRecruitingAutomationMultiLocationBuildSection";
import { AiRecruitingAutomationMultiLocationDefinition } from "./AiRecruitingAutomationMultiLocationDefinition";
import { AiRecruitingAutomationMultiLocationFaq } from "./AiRecruitingAutomationMultiLocationFaq";
import { AiRecruitingAutomationMultiLocationHero } from "./AiRecruitingAutomationMultiLocationHero";
import { AiRecruitingAutomationMultiLocationHumanOversight } from "./AiRecruitingAutomationMultiLocationHumanOversight";
import { AiRecruitingAutomationMultiLocationProblem } from "./AiRecruitingAutomationMultiLocationProblem";
import { AiRecruitingAutomationMultiLocationVoiceExperience } from "./AiRecruitingAutomationMultiLocationVoiceExperience";
import { AiRecruitingAutomationMultiLocationWorkflow } from "./AiRecruitingAutomationMultiLocationWorkflow";

export function AiRecruitingAutomationMultiLocationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingAutomationMultiLocationHero reduceMotion={reduceMotion} />
        <AiRecruitingAutomationMultiLocationProblem reduceMotion={reduceMotion} />
        <AiRecruitingAutomationMultiLocationDefinition reduceMotion={reduceMotion} />
        <AiRecruitingAutomationMultiLocationVoiceExperience />
        <AiRecruitingAutomationMultiLocationWorkflow reduceMotion={reduceMotion} />
        <AiRecruitingAutomationMultiLocationHumanOversight reduceMotion={reduceMotion} />
        <AiRecruitingAutomationMultiLocationFaq />
        <AiRecruitingAutomationMultiLocationBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_AUTOMATION_MULTI_LOCATION_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_AUTOMATION_MULTI_LOCATION_GEO.askTopic}
      />
    </div>
  );
}
