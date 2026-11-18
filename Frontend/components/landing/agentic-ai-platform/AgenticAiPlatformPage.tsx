"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AGENTIC_AI_PLATFORM_GEO } from "@/lib/agenticAiPlatform";

import {
  AgenticAiPlatformEnterprise,
  AgenticAiPlatformFaq,
  AgenticAiPlatformFinalCta,
  AgenticAiPlatformFuture,
} from "./AgenticAiPlatformClosing";
import { AgenticAiPlatformHero } from "./AgenticAiPlatformHero";
import { AgenticAiPlatformStory } from "./AgenticAiPlatformStory";
import { AgenticAiPlatformSystems } from "./AgenticAiPlatformSystems";

export function AgenticAiPlatformPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AgenticAiPlatformHero reduceMotion={reduceMotion} />
        <AgenticAiPlatformStory reduceMotion={reduceMotion} />
        <AgenticAiPlatformSystems reduceMotion={reduceMotion} />
        <AgenticAiPlatformEnterprise />
        <AgenticAiPlatformFuture />
        <AgenticAiPlatformFaq />
        <AgenticAiPlatformFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AGENTIC_AI_PLATFORM_GEO.askPrompt}
        aiAskTopic={AGENTIC_AI_PLATFORM_GEO.askTopic}
      />
    </div>
  );
}