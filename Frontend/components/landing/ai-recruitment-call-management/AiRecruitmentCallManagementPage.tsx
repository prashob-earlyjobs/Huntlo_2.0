"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITMENT_CALL_MANAGEMENT_GEO } from "@/lib/aiRecruitmentCallManagement";

import { AiRecruitmentCallManagementClosing } from "./AiRecruitmentCallManagementClosing";
import { AiRecruitmentCallManagementHero } from "./AiRecruitmentCallManagementHero";
import { AiRecruitmentCallManagementSections } from "./AiRecruitmentCallManagementSections";

export function AiRecruitmentCallManagementPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-white text-[#0b1220] selection:bg-[#2563eb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruitmentCallManagementHero reduceMotion={reduceMotion} />
        <AiRecruitmentCallManagementSections reduceMotion={reduceMotion} />
        <AiRecruitmentCallManagementClosing reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITMENT_CALL_MANAGEMENT_GEO.askPrompt}
        aiAskTopic={AI_RECRUITMENT_CALL_MANAGEMENT_GEO.askTopic}
      />
    </div>
  );
}