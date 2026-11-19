"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import {
  AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_GEO,
} from "@/lib/aiRecruitingAutomationHealthcareStaffing";

import { AiRecruitingAutomationHealthcareStaffingBuildSection } from "./AiRecruitingAutomationHealthcareStaffingBuildSection";
import { AiRecruitingAutomationHealthcareStaffingDefinition } from "./AiRecruitingAutomationHealthcareStaffingDefinition";
import { AiRecruitingAutomationHealthcareStaffingFaq } from "./AiRecruitingAutomationHealthcareStaffingFaq";
import { AiRecruitingAutomationHealthcareStaffingHero } from "./AiRecruitingAutomationHealthcareStaffingHero";
import { AiRecruitingAutomationHealthcareStaffingHumanOversight } from "./AiRecruitingAutomationHealthcareStaffingHumanOversight";
import { AiRecruitingAutomationHealthcareStaffingProblem } from "./AiRecruitingAutomationHealthcareStaffingProblem";
import { AiRecruitingAutomationHealthcareStaffingVoiceExperience } from "./AiRecruitingAutomationHealthcareStaffingVoiceExperience";
import { AiRecruitingAutomationHealthcareStaffingWorkflow } from "./AiRecruitingAutomationHealthcareStaffingWorkflow";

export function AiRecruitingAutomationHealthcareStaffingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingAutomationHealthcareStaffingHero reduceMotion={reduceMotion} />
        <AiRecruitingAutomationHealthcareStaffingProblem reduceMotion={reduceMotion} />
        <AiRecruitingAutomationHealthcareStaffingDefinition reduceMotion={reduceMotion} />
        <AiRecruitingAutomationHealthcareStaffingVoiceExperience />
        <AiRecruitingAutomationHealthcareStaffingWorkflow reduceMotion={reduceMotion} />
        <AiRecruitingAutomationHealthcareStaffingHumanOversight reduceMotion={reduceMotion} />
        <AiRecruitingAutomationHealthcareStaffingFaq />
        <AiRecruitingAutomationHealthcareStaffingBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_GEO.askTopic}
      />
    </div>
  );
}
