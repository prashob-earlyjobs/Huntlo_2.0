"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AGENTIC_HIRING_GEO } from "@/lib/agenticHiring";

import {
  AgenticHiringEnterprise,
  AgenticHiringFaq,
  AgenticHiringFinalCta,
} from "./AgenticHiringClosing";
import { AgenticHiringHero } from "./AgenticHiringHero";
import { AgenticHiringModel } from "./AgenticHiringModel";
import { AgenticHiringStory } from "./AgenticHiringStory";
import { AgenticHiringSystems } from "./AgenticHiringSystems";

export function AgenticHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AgenticHiringHero reduceMotion={reduceMotion} />
        <AgenticHiringStory reduceMotion={reduceMotion} />
        <AgenticHiringModel reduceMotion={reduceMotion} />
        <AgenticHiringSystems reduceMotion={reduceMotion} />
        <AgenticHiringEnterprise />
        <AgenticHiringFaq />
        <AgenticHiringFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AGENTIC_HIRING_GEO.askPrompt}
        aiAskTopic={AGENTIC_HIRING_GEO.askTopic}
      />
    </div>
  );
}
