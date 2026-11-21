"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITING_AGENTS_GEO } from "@/lib/aiRecruitingAgents";

import { AiRecruitingAgentsFaq } from "./AiRecruitingAgentsFaq";
import { AiRecruitingAgentsFinalCta } from "./AiRecruitingAgentsFinalCta";
import { AiRecruitingAgentsDayInLife } from "./AiRecruitingAgentsDayInLife";
import { AiRecruitingAgentsDefinition } from "./AiRecruitingAgentsDefinition";
import { AiRecruitingAgentsEvaluation } from "./AiRecruitingAgentsEvaluation";
import { AiRecruitingAgentsGovernance } from "./AiRecruitingAgentsGovernance";
import { AiRecruitingAgentsHero } from "./AiRecruitingAgentsHero";
import { AiRecruitingAgentsUseCases } from "./AiRecruitingAgentsUseCases";

export function AiRecruitingAgentsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingAgentsHero reduceMotion={reduceMotion} />
        <AiRecruitingAgentsDefinition reduceMotion={reduceMotion} />
        <AiRecruitingAgentsUseCases reduceMotion={reduceMotion} />
        <AiRecruitingAgentsDayInLife reduceMotion={reduceMotion} />
        <AiRecruitingAgentsGovernance reduceMotion={reduceMotion} />
        <AiRecruitingAgentsEvaluation reduceMotion={reduceMotion} />
        <AiRecruitingAgentsFaq />
        <AiRecruitingAgentsFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_AGENTS_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_AGENTS_GEO.askTopic}
      />
    </div>
  );
}
