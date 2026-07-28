"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_SCHEDULING_AGENT_GEO } from "@/lib/aiSchedulingAgent";

import {
  AiSchedulingAgentEnterprise,
  AiSchedulingAgentFaq,
  AiSchedulingAgentFinalCta,
  AiSchedulingAgentFuture,
} from "./AiSchedulingAgentClosing";
import { AiSchedulingAgentHero } from "./AiSchedulingAgentHero";
import { AiSchedulingAgentStory } from "./AiSchedulingAgentStory";
import { AiSchedulingAgentSystems } from "./AiSchedulingAgentSystems";

export function AiSchedulingAgentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiSchedulingAgentHero reduceMotion={reduceMotion} />
        <AiSchedulingAgentStory reduceMotion={reduceMotion} />
        <AiSchedulingAgentSystems reduceMotion={reduceMotion} />
        <AiSchedulingAgentEnterprise />
        <AiSchedulingAgentFuture />
        <AiSchedulingAgentFaq />
        <AiSchedulingAgentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_SCHEDULING_AGENT_GEO.askPrompt}
        aiAskTopic={AI_SCHEDULING_AGENT_GEO.askTopic}
      />
    </div>
  );
}
