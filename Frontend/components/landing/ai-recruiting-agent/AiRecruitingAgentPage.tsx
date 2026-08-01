"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITING_AGENT_GEO } from "@/lib/aiRecruitingAgent";

import {
  AiRecruitingAgentEnterprise,
  AiRecruitingAgentFaq,
  AiRecruitingAgentFinalCta,
  AiRecruitingAgentFuture,
  AiRecruitingAgentInfrastructure,
} from "./AiRecruitingAgentClosing";
import { AiRecruitingAgentHero } from "./AiRecruitingAgentHero";
import { AiRecruitingAgentStory } from "./AiRecruitingAgentStory";
import { AiRecruitingAgentSystems } from "./AiRecruitingAgentSystems";

export function AiRecruitingAgentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <AiRecruitingAgentHero reduceMotion={reduceMotion} />
        <AiRecruitingAgentStory reduceMotion={reduceMotion} />
        <AiRecruitingAgentSystems reduceMotion={reduceMotion} />
        <AiRecruitingAgentEnterprise />
        <AiRecruitingAgentInfrastructure />
        <AiRecruitingAgentFuture />
        <AiRecruitingAgentFaq />
        <AiRecruitingAgentFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_AGENT_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_AGENT_GEO.askTopic}
      />
    </div>
  );
}
