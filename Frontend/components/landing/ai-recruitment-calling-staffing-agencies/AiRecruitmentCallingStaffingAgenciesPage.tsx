"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_GEO } from "@/lib/aiRecruitmentCallingStaffingAgencies";

import {
  AiRecruitmentCallingStaffingAgenciesFaq,
  AiRecruitmentCallingStaffingAgenciesFinalCta,
  AiRecruitmentCallingStaffingAgenciesInvite,
} from "./AiRecruitmentCallingStaffingAgenciesClosing";
import { AiRecruitmentCallingStaffingAgenciesHero } from "./AiRecruitmentCallingStaffingAgenciesHero";
import { AiRecruitmentCallingStaffingAgenciesStory } from "./AiRecruitmentCallingStaffingAgenciesStory";
import { AiRecruitmentCallingStaffingAgenciesSystems } from "./AiRecruitmentCallingStaffingAgenciesSystems";

export function AiRecruitmentCallingStaffingAgenciesPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitmentCallingStaffingAgenciesHero reduceMotion={reduceMotion} />
        <AiRecruitmentCallingStaffingAgenciesStory reduceMotion={reduceMotion} />
        <AiRecruitmentCallingStaffingAgenciesSystems reduceMotion={reduceMotion} />
        <AiRecruitmentCallingStaffingAgenciesInvite />
        <AiRecruitmentCallingStaffingAgenciesFaq />
        <AiRecruitmentCallingStaffingAgenciesFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_GEO.askPrompt}
        aiAskTopic={AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_GEO.askTopic}
      />
    </div>
  );
}
