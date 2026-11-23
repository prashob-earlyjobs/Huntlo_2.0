"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_BPO_RECRUITMENT_GEO } from "@/lib/aiVoiceBpoRecruitment";

import { AiVoiceBpoRecruitmentFaq } from "./AiVoiceBpoRecruitmentFaq";
import { AiVoiceBpoRecruitmentBuildSection } from "./AiVoiceBpoRecruitmentBuildSection";
import { AiVoiceBpoRecruitmentHero } from "./AiVoiceBpoRecruitmentHero";
import { AiVoiceBpoRecruitmentProblem } from "./AiVoiceBpoRecruitmentProblem";
import { AiVoiceBpoRecruitmentDefinition } from "./AiVoiceBpoRecruitmentDefinition";
import { AiVoiceBpoRecruitmentScreening } from "./AiVoiceBpoRecruitmentScreening";
import { AiVoiceBpoRecruitmentVoiceExperience } from "./AiVoiceBpoRecruitmentVoiceExperience";
import { AiVoiceBpoRecruitmentWorkflow } from "./AiVoiceBpoRecruitmentWorkflow";
import { AiVoiceBpoRecruitmentHumanOversight } from "./AiVoiceBpoRecruitmentHumanOversight";

export function AiVoiceBpoRecruitmentPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceBpoRecruitmentHero reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentProblem reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentDefinition reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentScreening reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentVoiceExperience reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentWorkflow reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentHumanOversight reduceMotion={reduceMotion} />
        <AiVoiceBpoRecruitmentFaq />
        <AiVoiceBpoRecruitmentBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_BPO_RECRUITMENT_GEO.askPrompt}
        aiAskTopic={AI_VOICE_BPO_RECRUITMENT_GEO.askTopic}
      />
    </div>
  );
}
