"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { GCC_RECRUITMENT_SOFTWARE_GEO } from "@/lib/gccRecruitmentSoftware";

import {
  GccRecruitmentSoftwareEnterprise,
  GccRecruitmentSoftwareFaq,
  GccRecruitmentSoftwareFinalCta,
  GccRecruitmentSoftwareIndustries,
  GccRecruitmentSoftwareWhy,
} from "./GccRecruitmentSoftwareClosing";
import { GccRecruitmentSoftwareHero } from "./GccRecruitmentSoftwareHero";
import { GccRecruitmentSoftwareStory } from "./GccRecruitmentSoftwareStory";
import { GccRecruitmentSoftwareSystems } from "./GccRecruitmentSoftwareSystems";

export function GccRecruitmentSoftwarePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <GccRecruitmentSoftwareHero reduceMotion={reduceMotion} />
        <GccRecruitmentSoftwareStory reduceMotion={reduceMotion} />
        <GccRecruitmentSoftwareSystems reduceMotion={reduceMotion} />
        <GccRecruitmentSoftwareEnterprise />
        <GccRecruitmentSoftwareIndustries />
        <GccRecruitmentSoftwareWhy />
        <GccRecruitmentSoftwareFaq />
        <GccRecruitmentSoftwareFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={GCC_RECRUITMENT_SOFTWARE_GEO.askPrompt}
        aiAskTopic={GCC_RECRUITMENT_SOFTWARE_GEO.askTopic}
      />
    </div>
  );
}
