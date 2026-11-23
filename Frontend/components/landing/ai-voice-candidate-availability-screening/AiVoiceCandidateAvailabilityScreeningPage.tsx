"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_GEO } from "@/lib/aiVoiceCandidateAvailabilityScreening";

import { AiVoiceCandidateAvailabilityScreeningFaq } from "./AiVoiceCandidateAvailabilityScreeningFaq";
import { AiVoiceCandidateAvailabilityScreeningFinalCta } from "./AiVoiceCandidateAvailabilityScreeningFinalCta";
import { AiVoiceCandidateAvailabilityScreeningHero } from "./AiVoiceCandidateAvailabilityScreeningHero";
import { AiVoiceCandidateAvailabilityScreeningDefinition } from "./AiVoiceCandidateAvailabilityScreeningDefinition";
import { AiVoiceCandidateAvailabilityScreeningWorkflow } from "./AiVoiceCandidateAvailabilityScreeningWorkflow";

export function AiVoiceCandidateAvailabilityScreeningPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceCandidateAvailabilityScreeningHero reduceMotion={reduceMotion} />
        <AiVoiceCandidateAvailabilityScreeningDefinition reduceMotion={reduceMotion} />
        <AiVoiceCandidateAvailabilityScreeningWorkflow reduceMotion={reduceMotion} />
        <AiVoiceCandidateAvailabilityScreeningFaq />
        <AiVoiceCandidateAvailabilityScreeningFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_GEO.askTopic}
      />
    </div>
  );
}