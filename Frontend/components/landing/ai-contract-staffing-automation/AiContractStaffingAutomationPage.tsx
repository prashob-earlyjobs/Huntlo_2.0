"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_CONTRACT_STAFFING_AUTOMATION_GEO } from "@/lib/aiContractStaffingAutomation";

import { AiContractStaffingAutomationAgentic } from "./AiContractStaffingAutomationAgentic";
import { AiContractStaffingAutomationAvailability } from "./AiContractStaffingAutomationAvailability";
import { AiContractStaffingAutomationConclusion } from "./AiContractStaffingAutomationConclusion";
import { AiContractStaffingAutomationDefinition } from "./AiContractStaffingAutomationDefinition";
import { AiContractStaffingAutomationDifferences } from "./AiContractStaffingAutomationDifferences";
import { AiContractStaffingAutomationFaq } from "./AiContractStaffingAutomationFaq";
import { AiContractStaffingAutomationFinalCta } from "./AiContractStaffingAutomationFinalCta";
import { AiContractStaffingAutomationHero } from "./AiContractStaffingAutomationHero";
import { AiContractStaffingAutomationOversight } from "./AiContractStaffingAutomationOversight";
import { AiContractStaffingAutomationWorkflow } from "./AiContractStaffingAutomationWorkflow";

export function AiContractStaffingAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiContractStaffingAutomationHero reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationDifferences reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationDefinition reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationAvailability reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationWorkflow reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationAgentic reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationOversight reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationConclusion reduceMotion={reduceMotion} />
        <AiContractStaffingAutomationFaq />
        <AiContractStaffingAutomationFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_CONTRACT_STAFFING_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_CONTRACT_STAFFING_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}