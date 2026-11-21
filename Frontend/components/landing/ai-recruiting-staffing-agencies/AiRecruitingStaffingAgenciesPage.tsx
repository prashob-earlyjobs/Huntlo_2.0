"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITING_STAFFING_AGENCIES_GEO } from "@/lib/aiRecruitingStaffingAgencies";

import {
  AiRecruitingStaffingAgenciesChecklist,
  AiRecruitingStaffingAgenciesFaq,
  AiRecruitingStaffingAgenciesFinalCta,
} from "./AiRecruitingStaffingAgenciesClosing";
import { AiRecruitingStaffingAgenciesHero } from "./AiRecruitingStaffingAgenciesHero";
import { AiRecruitingStaffingAgenciesStory } from "./AiRecruitingStaffingAgenciesStory";
import { AiRecruitingStaffingAgenciesSystems } from "./AiRecruitingStaffingAgenciesSystems";

export function AiRecruitingStaffingAgenciesPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitingStaffingAgenciesHero reduceMotion={reduceMotion} />
        <AiRecruitingStaffingAgenciesStory reduceMotion={reduceMotion} />
        <AiRecruitingStaffingAgenciesSystems reduceMotion={reduceMotion} />
        <AiRecruitingStaffingAgenciesChecklist />
        <AiRecruitingStaffingAgenciesFaq />
        <AiRecruitingStaffingAgenciesFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITING_STAFFING_AGENCIES_GEO.askPrompt}
        aiAskTopic={AI_RECRUITING_STAFFING_AGENCIES_GEO.askTopic}
      />
    </div>
  );
}
