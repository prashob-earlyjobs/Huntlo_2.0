"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_INSIDE_SALES_HIRING_GEO } from "@/lib/aiVoiceInsideSalesHiring";

import { AiVoiceInsideSalesHiringFaq } from "./AiVoiceInsideSalesHiringFaq";
import { AiVoiceInsideSalesHiringFinalCta } from "./AiVoiceInsideSalesHiringFinalCta";
import { AiVoiceInsideSalesHiringHero } from "./AiVoiceInsideSalesHiringHero";
import { AiVoiceInsideSalesHiringDefinition } from "./AiVoiceInsideSalesHiringDefinition";
import { AiVoiceInsideSalesHiringWorkflow } from "./AiVoiceInsideSalesHiringWorkflow";

export function AiVoiceInsideSalesHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceInsideSalesHiringHero reduceMotion={reduceMotion} />
        <AiVoiceInsideSalesHiringDefinition reduceMotion={reduceMotion} />
        <AiVoiceInsideSalesHiringWorkflow reduceMotion={reduceMotion} />
        <AiVoiceInsideSalesHiringFaq />
        <AiVoiceInsideSalesHiringFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_INSIDE_SALES_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_INSIDE_SALES_HIRING_GEO.askTopic}
      />
    </div>
  );
}