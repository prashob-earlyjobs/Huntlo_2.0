"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_RECRUITER_HANDOFF_AUTOMATION_GEO } from "@/lib/aiRecruiterHandoffAutomation";

import { AiRecruiterHandoffAutomationBrief } from "./AiRecruiterHandoffAutomationBrief";
import { AiRecruiterHandoffAutomationBuildSection } from "./AiRecruiterHandoffAutomationBuildSection";
import { AiRecruiterHandoffAutomationContinuity } from "./AiRecruiterHandoffAutomationContinuity";
import { AiRecruiterHandoffAutomationDefinition } from "./AiRecruiterHandoffAutomationDefinition";
import { AiRecruiterHandoffAutomationFaq } from "./AiRecruiterHandoffAutomationFaq";
import { AiRecruiterHandoffAutomationFinalCta } from "./AiRecruiterHandoffAutomationFinalCta";
import { AiRecruiterHandoffAutomationHero } from "./AiRecruiterHandoffAutomationHero";
import { AiRecruiterHandoffAutomationProblem } from "./AiRecruiterHandoffAutomationProblem";
import { AiRecruiterHandoffAutomationWorkflow } from "./AiRecruiterHandoffAutomationWorkflow";

export function AiRecruiterHandoffAutomationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiRecruiterHandoffAutomationHero reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationProblem reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationDefinition reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationBrief reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationWorkflow reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationContinuity reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationBuildSection reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationFaq reduceMotion={reduceMotion} />
        <AiRecruiterHandoffAutomationFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_RECRUITER_HANDOFF_AUTOMATION_GEO.askPrompt}
        aiAskTopic={AI_RECRUITER_HANDOFF_AUTOMATION_GEO.askTopic}
      />
    </div>
  );
}
