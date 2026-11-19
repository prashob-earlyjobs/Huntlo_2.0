"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import {
  RECRUITMENT_AGENCY_AUTOMATION_GEO,
} from "@/lib/recruitmentAgencyAutomation";

import { RecruitmentAgencyAutomationBuildSection } from "./RecruitmentAgencyAutomationBuildSection";
import { RecruitmentAgencyAutomationDefinition } from "./RecruitmentAgencyAutomationDefinition";
import { RecruitmentAgencyAutomationFaq } from "./RecruitmentAgencyAutomationFaq";
import { RecruitmentAgencyAutomationHero } from "./RecruitmentAgencyAutomationHero";
import { RecruitmentAgencyAutomationHumanOversight } from "./RecruitmentAgencyAutomationHumanOversight";
import { RecruitmentAgencyAutomationProblem } from "./RecruitmentAgencyAutomationProblem";
import { RecruitmentAgencyAutomationVoiceExperience } from "./RecruitmentAgencyAutomationVoiceExperience";
import { RecruitmentAgencyAutomationWorkflow } from "./RecruitmentAgencyAutomationWorkflow";

export function RecruitmentAgencyAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <RecruitmentAgencyAutomationHero reduceMotion={reduceMotion} />
        <RecruitmentAgencyAutomationProblem reduceMotion={reduceMotion} />
        <RecruitmentAgencyAutomationDefinition reduceMotion={reduceMotion} />
        <RecruitmentAgencyAutomationVoiceExperience />
        <RecruitmentAgencyAutomationWorkflow reduceMotion={reduceMotion} />
        <RecruitmentAgencyAutomationHumanOversight reduceMotion={reduceMotion} />
        <RecruitmentAgencyAutomationFaq />
        <RecruitmentAgencyAutomationBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={RECRUITMENT_AGENCY_AUTOMATION_GEO.askPrompt}
        aiAskTopic={RECRUITMENT_AGENCY_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}
