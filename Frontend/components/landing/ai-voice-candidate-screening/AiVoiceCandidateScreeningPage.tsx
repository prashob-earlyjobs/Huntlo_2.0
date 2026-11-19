"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_CANDIDATE_SCREENING_GEO } from "@/lib/aiVoiceCandidateScreening";

import {
  AiVoiceCandidateScreeningFaq,
  AiVoiceCandidateScreeningFinalCta,
  AiVoiceCandidateScreeningInvite,
} from "./AiVoiceCandidateScreeningClosing";
import { AiVoiceCandidateScreeningHero } from "./AiVoiceCandidateScreeningHero";
import { AiVoiceCandidateScreeningStory } from "./AiVoiceCandidateScreeningStory";
import { AiVoiceCandidateScreeningSystems } from "./AiVoiceCandidateScreeningSystems";

export function AiVoiceCandidateScreeningPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceCandidateScreeningHero reduceMotion={reduceMotion} />
        <AiVoiceCandidateScreeningStory reduceMotion={reduceMotion} />
        <AiVoiceCandidateScreeningSystems reduceMotion={reduceMotion} />
        <AiVoiceCandidateScreeningInvite />
        <AiVoiceCandidateScreeningFaq />
        <AiVoiceCandidateScreeningFinalCta />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_CANDIDATE_SCREENING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_CANDIDATE_SCREENING_GEO.askTopic}
      />
    </div>
  );
}
