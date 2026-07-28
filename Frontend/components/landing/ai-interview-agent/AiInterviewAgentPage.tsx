"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_INTERVIEW_AGENT_GEO } from "@/lib/aiInterviewAgent";

import {
  AiInterviewAgentEnterprise,
  AiInterviewAgentFaq,
  AiInterviewAgentFinalCta,
  AiInterviewAgentFuture,
} from "./AiInterviewAgentClosing";
import { AiInterviewAgentHero } from "./AiInterviewAgentHero";
import { AiInterviewAgentStory } from "./AiInterviewAgentStory";
import { AiInterviewAgentSystems } from "./AiInterviewAgentSystems";

export function AiInterviewAgentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiInterviewAgentHero reduceMotion={reduceMotion} />
        <AiInterviewAgentStory reduceMotion={reduceMotion} />
        <AiInterviewAgentSystems reduceMotion={reduceMotion} />
        <AiInterviewAgentEnterprise />
        <AiInterviewAgentFuture />
        <AiInterviewAgentFaq />
        <AiInterviewAgentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_INTERVIEW_AGENT_GEO.askPrompt}
        aiAskTopic={AI_INTERVIEW_AGENT_GEO.askTopic}
      />
    </div>
  );
}
