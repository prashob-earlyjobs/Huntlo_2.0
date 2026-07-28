"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { RECRUITING_AGENTS_GEO } from "@/lib/recruitingAgents";

import {
  RecruitingAgentsEnterprise,
  RecruitingAgentsFaq,
  RecruitingAgentsFinalCta,
  RecruitingAgentsFuture,
} from "./RecruitingAgentsClosing";
import { RecruitingAgentsHero } from "./RecruitingAgentsHero";
import { RecruitingAgentsStory } from "./RecruitingAgentsStory";
import { RecruitingAgentsSystems } from "./RecruitingAgentsSystems";

export function RecruitingAgentsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="pt-16">
        <RecruitingAgentsHero reduceMotion={reduceMotion} />
        <RecruitingAgentsStory reduceMotion={reduceMotion} />
        <RecruitingAgentsSystems reduceMotion={reduceMotion} />
        <RecruitingAgentsEnterprise />
        <RecruitingAgentsFuture />
        <RecruitingAgentsFaq />
        <RecruitingAgentsFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={RECRUITING_AGENTS_GEO.askPrompt}
        aiAskTopic={RECRUITING_AGENTS_GEO.askTopic}
      />
    </div>
  );
}
