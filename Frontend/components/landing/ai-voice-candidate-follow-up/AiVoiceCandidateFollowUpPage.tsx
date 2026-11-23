"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_CANDIDATE_FOLLOW_UP_GEO } from "@/lib/aiVoiceCandidateFollowUp";

import { AiVoiceCandidateFollowUpBuildSection } from "./AiVoiceCandidateFollowUpBuildSection";
import { AiVoiceCandidateFollowUpDefinition } from "./AiVoiceCandidateFollowUpDefinition";
import { AiVoiceCandidateFollowUpFaq } from "./AiVoiceCandidateFollowUpFaq";
import { AiVoiceCandidateFollowUpHero } from "./AiVoiceCandidateFollowUpHero";
import { AiVoiceCandidateFollowUpHumanOversight } from "./AiVoiceCandidateFollowUpHumanOversight";
import { AiVoiceCandidateFollowUpProblem } from "./AiVoiceCandidateFollowUpProblem";
import { AiVoiceCandidateFollowUpVoiceExperience } from "./AiVoiceCandidateFollowUpVoiceExperience";
import { AiVoiceCandidateFollowUpWorkflow } from "./AiVoiceCandidateFollowUpWorkflow";

export function AiVoiceCandidateFollowUpPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceCandidateFollowUpHero reduceMotion={reduceMotion} />
        <AiVoiceCandidateFollowUpProblem reduceMotion={reduceMotion} />
        <AiVoiceCandidateFollowUpDefinition reduceMotion={reduceMotion} />
        <AiVoiceCandidateFollowUpVoiceExperience />
        <AiVoiceCandidateFollowUpWorkflow reduceMotion={reduceMotion} />
        <AiVoiceCandidateFollowUpHumanOversight reduceMotion={reduceMotion} />
        <AiVoiceCandidateFollowUpFaq />
        <AiVoiceCandidateFollowUpBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_CANDIDATE_FOLLOW_UP_GEO.askPrompt}
        aiAskTopic={AI_VOICE_CANDIDATE_FOLLOW_UP_GEO.askTopic}
      />
    </div>
  );
}
