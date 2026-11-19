"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_GEO } from "@/lib/aiVoiceCandidateDatabaseReactivation";

import { AiVoiceCandidateDatabaseReactivationBeyond } from "./AiVoiceCandidateDatabaseReactivationBeyond";
import { AiVoiceCandidateDatabaseReactivationConclusion } from "./AiVoiceCandidateDatabaseReactivationConclusion";
import { AiVoiceCandidateDatabaseReactivationDefinition } from "./AiVoiceCandidateDatabaseReactivationDefinition";
import { AiVoiceCandidateDatabaseReactivationFaq } from "./AiVoiceCandidateDatabaseReactivationFaq";
import { AiVoiceCandidateDatabaseReactivationFinalCta } from "./AiVoiceCandidateDatabaseReactivationFinalCta";
import { AiVoiceCandidateDatabaseReactivationHero } from "./AiVoiceCandidateDatabaseReactivationHero";
import { AiVoiceCandidateDatabaseReactivationOutdated } from "./AiVoiceCandidateDatabaseReactivationOutdated";
import { AiVoiceCandidateDatabaseReactivationTrust } from "./AiVoiceCandidateDatabaseReactivationTrust";
import { AiVoiceCandidateDatabaseReactivationWorkflow } from "./AiVoiceCandidateDatabaseReactivationWorkflow";

export function AiVoiceCandidateDatabaseReactivationPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceCandidateDatabaseReactivationHero reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationOutdated reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationDefinition reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationBeyond reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationWorkflow reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationTrust reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationConclusion reduceMotion={reduceMotion} />
        <AiVoiceCandidateDatabaseReactivationFaq />
        <AiVoiceCandidateDatabaseReactivationFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_GEO.askPrompt}
        aiAskTopic={AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_GEO.askTopic}
      />
    </div>
  );
}