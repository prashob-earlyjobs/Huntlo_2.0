"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_SOURCING_AGENT_GEO } from "@/lib/aiSourcingAgent";

import {
  AiSourcingAgentEnterprise,
  AiSourcingAgentFaq,
  AiSourcingAgentFinalCta,
  AiSourcingAgentFuture,
} from "./AiSourcingAgentClosing";
import { AiSourcingAgentHero } from "./AiSourcingAgentHero";
import { AiSourcingAgentStory } from "./AiSourcingAgentStory";
import { AiSourcingAgentSystems } from "./AiSourcingAgentSystems";

export function AiSourcingAgentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiSourcingAgentHero reduceMotion={reduceMotion} />
        <AiSourcingAgentStory reduceMotion={reduceMotion} />
        <AiSourcingAgentSystems reduceMotion={reduceMotion} />
        <AiSourcingAgentEnterprise />
        <AiSourcingAgentFuture />
        <AiSourcingAgentFaq />
        <AiSourcingAgentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_SOURCING_AGENT_GEO.askPrompt}
        aiAskTopic={AI_SOURCING_AGENT_GEO.askTopic}
      />
    </div>
  );
}
