"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITER_PRODUCTIVITY_GEO } from "@/lib/aiRecruiterProductivity";

import { AiRecruiterProductivityFaq } from "./AiRecruiterProductivityFaq";
import { AiRecruiterProductivityFinalCta } from "./AiRecruiterProductivityFinalCta";
import { AiRecruiterProductivityHero } from "./AiRecruiterProductivityHero";
import { AiRecruiterProductivityDefinition } from "./AiRecruiterProductivityDefinition";
import { AiRecruiterProductivityWorkflow } from "./AiRecruiterProductivityWorkflow";
import { AiRecruiterProductivityHumanElement } from "./AiRecruiterProductivityHumanElement";

export function AiRecruiterProductivityPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruiterProductivityHero reduceMotion={reduceMotion} />
        <AiRecruiterProductivityDefinition reduceMotion={reduceMotion} />
        <AiRecruiterProductivityWorkflow reduceMotion={reduceMotion} />
        <AiRecruiterProductivityHumanElement reduceMotion={reduceMotion} />
        <AiRecruiterProductivityFaq />
        <AiRecruiterProductivityFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITER_PRODUCTIVITY_GEO.askPrompt}
        aiAskTopic={AI_RECRUITER_PRODUCTIVITY_GEO.askTopic}
      />
    </div>
  );
}