"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_SCREENING_AGENT_GEO } from "@/lib/aiScreeningAgent";

import {
  AiScreeningAgentEnterprise,
  AiScreeningAgentFaq,
  AiScreeningAgentFinalCta,
  AiScreeningAgentFuture,
} from "./AiScreeningAgentClosing";
import { AiScreeningAgentHero } from "./AiScreeningAgentHero";
import { AiScreeningAgentStory } from "./AiScreeningAgentStory";
import { AiScreeningAgentSystems } from "./AiScreeningAgentSystems";

export function AiScreeningAgentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiScreeningAgentHero reduceMotion={reduceMotion} />
        <AiScreeningAgentStory reduceMotion={reduceMotion} />
        <AiScreeningAgentSystems reduceMotion={reduceMotion} />
        <AiScreeningAgentEnterprise />
        <AiScreeningAgentFuture />
        <AiScreeningAgentFaq />
        <AiScreeningAgentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_SCREENING_AGENT_GEO.askPrompt}
        aiAskTopic={AI_SCREENING_AGENT_GEO.askTopic}
      />
    </div>
  );
}
