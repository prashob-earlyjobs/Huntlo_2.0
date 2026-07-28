"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_HIRING_GEO } from "@/lib/aiHiringInfrastructure";

import {
  AiHiringEnterprise,
  AiHiringFaq,
  AiHiringFinalCta,
  AiHiringFuture,
} from "./AiHiringClosing";
import { AiHiringHero } from "./AiHiringHero";
import { AiHiringStory } from "./AiHiringStory";
import { AiHiringSystems } from "./AiHiringSystems";

export function AiHiringInfrastructurePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiHiringHero reduceMotion={reduceMotion} />
        <AiHiringStory reduceMotion={reduceMotion} />
        <AiHiringSystems reduceMotion={reduceMotion} />
        <AiHiringEnterprise />
        <AiHiringFuture />
        <AiHiringFaq />
        <AiHiringFinalCta />
      </main>
      <LandingFooter aiAskPrompt={AI_HIRING_GEO.askPrompt} aiAskTopic={AI_HIRING_GEO.askTopic} />
    </div>
  );
}
