"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

import {
  AI_EXECUTIVE_SEARCH_AUTOMATION_GEO,
} from "@/lib/aiExecutiveSearchAutomation";

import { AiExecutiveSearchAutomationBuildSection } from "./AiExecutiveSearchAutomationBuildSection";
import { AiExecutiveSearchAutomationDefinition } from "./AiExecutiveSearchAutomationDefinition";
import { AiExecutiveSearchAutomationFaq } from "./AiExecutiveSearchAutomationFaq";
import { AiExecutiveSearchAutomationHero } from "./AiExecutiveSearchAutomationHero";
import { AiExecutiveSearchAutomationHumanOversight } from "./AiExecutiveSearchAutomationHumanOversight";
import { AiExecutiveSearchAutomationProblem } from "./AiExecutiveSearchAutomationProblem";
import { AiExecutiveSearchAutomationWorkflow } from "./AiExecutiveSearchAutomationWorkflow";

export function AiExecutiveSearchAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiExecutiveSearchAutomationHero reduceMotion={reduceMotion} />
        <AiExecutiveSearchAutomationProblem reduceMotion={reduceMotion} />
        <AiExecutiveSearchAutomationDefinition reduceMotion={reduceMotion} />
        <AiExecutiveSearchAutomationWorkflow reduceMotion={reduceMotion} />
        <AiExecutiveSearchAutomationHumanOversight reduceMotion={reduceMotion} />
        <AiExecutiveSearchAutomationFaq />
        <AiExecutiveSearchAutomationBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_EXECUTIVE_SEARCH_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_EXECUTIVE_SEARCH_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}