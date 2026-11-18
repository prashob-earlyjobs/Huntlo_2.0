"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_CANDIDATE_PIPELINE_AUTOMATION_GEO } from "@/lib/aiCandidatePipelineAutomation";

import { AiCandidatePipelineAutomationAgentic } from "./AiCandidatePipelineAutomationAgentic";
import { AiCandidatePipelineAutomationConclusion } from "./AiCandidatePipelineAutomationConclusion";
import { AiCandidatePipelineAutomationDefinition } from "./AiCandidatePipelineAutomationDefinition";
import { AiCandidatePipelineAutomationEvents } from "./AiCandidatePipelineAutomationEvents";
import { AiCandidatePipelineAutomationFaq } from "./AiCandidatePipelineAutomationFaq";
import { AiCandidatePipelineAutomationFinalCta } from "./AiCandidatePipelineAutomationFinalCta";
import { AiCandidatePipelineAutomationHero } from "./AiCandidatePipelineAutomationHero";
import { AiCandidatePipelineAutomationRecruiter } from "./AiCandidatePipelineAutomationRecruiter";
import { AiCandidatePipelineAutomationVisibility } from "./AiCandidatePipelineAutomationVisibility";
import { AiCandidatePipelineAutomationWorkflow } from "./AiCandidatePipelineAutomationWorkflow";

export function AiCandidatePipelineAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiCandidatePipelineAutomationHero reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationVisibility reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationDefinition reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationEvents reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationWorkflow reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationAgentic reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationRecruiter reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationConclusion reduceMotion={reduceMotion} />
        <AiCandidatePipelineAutomationFaq />
        <AiCandidatePipelineAutomationFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_CANDIDATE_PIPELINE_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_CANDIDATE_PIPELINE_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}