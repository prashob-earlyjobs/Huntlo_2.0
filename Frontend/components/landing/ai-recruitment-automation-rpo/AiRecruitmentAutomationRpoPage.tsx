"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITMENT_AUTOMATION_RPO_GEO } from "@/lib/aiRecruitmentAutomationRpo";

import { AiRecruitmentAutomationRpoFaq } from "./AiRecruitmentAutomationRpoFaq";
import { AiRecruitmentAutomationRpoBuildSection } from "./AiRecruitmentAutomationRpoBuildSection";
import { AiRecruitmentAutomationRpoHero } from "./AiRecruitmentAutomationRpoHero";
import { AiRecruitmentAutomationRpoComplexityProblem } from "./AiRecruitmentAutomationRpoComplexityProblem";
import { AiRecruitmentAutomationRpoDefinition } from "./AiRecruitmentAutomationRpoDefinition";
import { AiRecruitmentAutomationRpoOrchestrationSection } from "./AiRecruitmentAutomationRpoOrchestrationSection";
import { AiRecruitmentAutomationRpoUseCases } from "./AiRecruitmentAutomationRpoUseCases";
import { AiRecruitmentAutomationRpoGovernance } from "./AiRecruitmentAutomationRpoGovernance";

export function AiRecruitmentAutomationRpoPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitmentAutomationRpoHero reduceMotion={reduceMotion} />
        <AiRecruitmentAutomationRpoComplexityProblem reduceMotion={reduceMotion} />
        <AiRecruitmentAutomationRpoDefinition reduceMotion={reduceMotion} />
        <AiRecruitmentAutomationRpoOrchestrationSection reduceMotion={reduceMotion} />
        <AiRecruitmentAutomationRpoUseCases reduceMotion={reduceMotion} />
        <AiRecruitmentAutomationRpoGovernance reduceMotion={reduceMotion} />
        <AiRecruitmentAutomationRpoFaq />
        <AiRecruitmentAutomationRpoBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITMENT_AUTOMATION_RPO_GEO.askPrompt}
        aiAskTopic={AI_RECRUITMENT_AUTOMATION_RPO_GEO.askTopic}
      />
    </div>
  );
}
