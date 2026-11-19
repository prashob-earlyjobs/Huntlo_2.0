"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

import {
  AI_VOICE_FIELD_SALES_HIRING_GEO,
} from "@/lib/aiVoiceFieldSalesHiring";

import { AiVoiceFieldSalesHiringBuildSection } from "./AiVoiceFieldSalesHiringBuildSection";
import { AiVoiceFieldSalesHiringDefinition } from "./AiVoiceFieldSalesHiringDefinition";
import { AiVoiceFieldSalesHiringFaq } from "./AiVoiceFieldSalesHiringFaq";
import { AiVoiceFieldSalesHiringHero } from "./AiVoiceFieldSalesHiringHero";
import { AiVoiceFieldSalesHiringHumanOversight } from "./AiVoiceFieldSalesHiringHumanOversight";
import { AiVoiceFieldSalesHiringProblem } from "./AiVoiceFieldSalesHiringProblem";
import { AiVoiceFieldSalesHiringWorkflow } from "./AiVoiceFieldSalesHiringWorkflow";

export function AiVoiceFieldSalesHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceFieldSalesHiringHero reduceMotion={reduceMotion} />
        <AiVoiceFieldSalesHiringProblem reduceMotion={reduceMotion} />
        <AiVoiceFieldSalesHiringDefinition reduceMotion={reduceMotion} />
        <AiVoiceFieldSalesHiringWorkflow reduceMotion={reduceMotion} />
        <AiVoiceFieldSalesHiringHumanOversight reduceMotion={reduceMotion} />
        <AiVoiceFieldSalesHiringFaq />
        <AiVoiceFieldSalesHiringBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_FIELD_SALES_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_FIELD_SALES_HIRING_GEO.askTopic}
      />
    </div>
  );
}