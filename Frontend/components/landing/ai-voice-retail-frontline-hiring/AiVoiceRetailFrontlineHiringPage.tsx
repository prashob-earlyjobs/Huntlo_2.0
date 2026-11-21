"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_RETAIL_FRONTLINE_HIRING_GEO } from "@/lib/aiVoiceRetailFrontlineHiring";

import { AiVoiceRetailFrontlineHiringConclusion } from "./AiVoiceRetailFrontlineHiringConclusion";
import { AiVoiceRetailFrontlineHiringDefinition } from "./AiVoiceRetailFrontlineHiringDefinition";
import { AiVoiceRetailFrontlineHiringDifferences } from "./AiVoiceRetailFrontlineHiringDifferences";
import { AiVoiceRetailFrontlineHiringFaq } from "./AiVoiceRetailFrontlineHiringFaq";
import { AiVoiceRetailFrontlineHiringFinalCta } from "./AiVoiceRetailFrontlineHiringFinalCta";
import { AiVoiceRetailFrontlineHiringFirstCall } from "./AiVoiceRetailFrontlineHiringFirstCall";
import { AiVoiceRetailFrontlineHiringHero } from "./AiVoiceRetailFrontlineHiringHero";
import { AiVoiceRetailFrontlineHiringMultiStore } from "./AiVoiceRetailFrontlineHiringMultiStore";
import { AiVoiceRetailFrontlineHiringWorkflow } from "./AiVoiceRetailFrontlineHiringWorkflow";

export function AiVoiceRetailFrontlineHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceRetailFrontlineHiringHero reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringDifferences reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringDefinition reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringFirstCall reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringWorkflow reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringMultiStore reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringConclusion reduceMotion={reduceMotion} />
        <AiVoiceRetailFrontlineHiringFaq />
        <AiVoiceRetailFrontlineHiringFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_RETAIL_FRONTLINE_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_RETAIL_FRONTLINE_HIRING_GEO.askTopic}
      />
    </div>
  );
}