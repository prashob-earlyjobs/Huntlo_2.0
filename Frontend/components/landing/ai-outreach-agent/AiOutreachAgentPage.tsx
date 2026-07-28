"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_OUTREACH_AGENT_GEO } from "@/lib/aiOutreachAgent";

import {
  AiOutreachAgentEnterprise,
  AiOutreachAgentFaq,
  AiOutreachAgentFinalCta,
  AiOutreachAgentFuture,
} from "./AiOutreachAgentClosing";
import { AiOutreachAgentHero } from "./AiOutreachAgentHero";
import { AiOutreachAgentStory } from "./AiOutreachAgentStory";
import { AiOutreachAgentSystems } from "./AiOutreachAgentSystems";

export function AiOutreachAgentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiOutreachAgentHero reduceMotion={reduceMotion} />
        <AiOutreachAgentStory reduceMotion={reduceMotion} />
        <AiOutreachAgentSystems reduceMotion={reduceMotion} />
        <AiOutreachAgentEnterprise />
        <AiOutreachAgentFuture />
        <AiOutreachAgentFaq />
        <AiOutreachAgentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_OUTREACH_AGENT_GEO.askPrompt}
        aiAskTopic={AI_OUTREACH_AGENT_GEO.askTopic}
      />
    </div>
  );
}
