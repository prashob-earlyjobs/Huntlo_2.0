"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AGENTIC_AI_RECRUITING_SOFTWARE_GEO } from "@/lib/agenticAiRecruitingSoftware";

import {
  AgenticAiRecruitingSoftwareFaq,
} from "./AgenticAiRecruitingSoftwareFaq";
import { AgenticAiRecruitingSoftwareFinalCta } from "./AgenticAiRecruitingSoftwareFinalCta";
import { AgenticAiRecruitingSoftwareHero } from "./AgenticAiRecruitingSoftwareHero";
import { AgenticAiRecruitingSoftwareOversight } from "./AgenticAiRecruitingSoftwareOversight";
import { AgenticAiRecruitingSoftwareProductivity } from "./AgenticAiRecruitingSoftwareProductivity";
import { AgenticAiRecruitingSoftwareUseCases } from "./AgenticAiRecruitingSoftwareUseCases";
import { AgenticAiRecruitingSoftwareWorkflow } from "./AgenticAiRecruitingSoftwareWorkflow";
import { AgenticAiRecruitingSoftwareDefinition } from "./AgenticAiRecruitingSoftwareDefinition";
import { AgenticAiRecruitingSoftwareProblem } from "./AgenticAiRecruitingSoftwareProblem";

export function AgenticAiRecruitingSoftwarePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AgenticAiRecruitingSoftwareHero reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareProblem reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareDefinition reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareWorkflow reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareOversight reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareUseCases reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareProductivity reduceMotion={reduceMotion} />
        <AgenticAiRecruitingSoftwareFaq />
        <AgenticAiRecruitingSoftwareFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AGENTIC_AI_RECRUITING_SOFTWARE_GEO.askPrompt}
        aiAskTopic={AGENTIC_AI_RECRUITING_SOFTWARE_GEO.askTopic}
      />
    </div>
  );
}