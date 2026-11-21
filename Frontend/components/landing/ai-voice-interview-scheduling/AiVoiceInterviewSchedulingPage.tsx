"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_INTERVIEW_SCHEDULING_GEO } from "@/lib/aiVoiceInterviewScheduling";

import { AiVoiceInterviewSchedulingFaq } from "./AiVoiceInterviewSchedulingFaq";
import { AiVoiceInterviewSchedulingBuildSection } from "./AiVoiceInterviewSchedulingBuildSection";
import { AiVoiceInterviewSchedulingHero } from "./AiVoiceInterviewSchedulingHero";
import { AiVoiceInterviewSchedulingProblem } from "./AiVoiceInterviewSchedulingProblem";
import { AiVoiceInterviewSchedulingDefinition } from "./AiVoiceInterviewSchedulingDefinition";
import { AiVoiceInterviewSchedulingWorkflow } from "./AiVoiceInterviewSchedulingWorkflow";
import { AiVoiceInterviewSchedulingConversation } from "./AiVoiceInterviewSchedulingConversation";
import { AiVoiceInterviewSchedulingCandidateExperience } from "./AiVoiceInterviewSchedulingCandidateExperience";
import { AiVoiceInterviewSchedulingRecruiterControl } from "./AiVoiceInterviewSchedulingRecruiterControl";

export function AiVoiceInterviewSchedulingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceInterviewSchedulingHero reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingProblem reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingDefinition reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingWorkflow reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingConversation reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingCandidateExperience reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingRecruiterControl reduceMotion={reduceMotion} />
        <AiVoiceInterviewSchedulingFaq />
        <AiVoiceInterviewSchedulingBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_INTERVIEW_SCHEDULING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_INTERVIEW_SCHEDULING_GEO.askTopic}
      />
    </div>
  );
}
