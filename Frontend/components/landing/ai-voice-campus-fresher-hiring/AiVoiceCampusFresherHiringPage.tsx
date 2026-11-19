"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

import {
  AI_VOICE_CAMPUS_FRESHER_HIRING_GEO,
} from "@/lib/aiVoiceCampusFresherHiring";

import { AiVoiceCampusFresherHiringBuildSection } from "./AiVoiceCampusFresherHiringBuildSection";
import { AiVoiceCampusFresherHiringDefinition } from "./AiVoiceCampusFresherHiringDefinition";
import { AiVoiceCampusFresherHiringFaq } from "./AiVoiceCampusFresherHiringFaq";
import { AiVoiceCampusFresherHiringHero } from "./AiVoiceCampusFresherHiringHero";
import { AiVoiceCampusFresherHiringHumanOversight } from "./AiVoiceCampusFresherHiringHumanOversight";
import { AiVoiceCampusFresherHiringProblem } from "./AiVoiceCampusFresherHiringProblem";
import { AiVoiceCampusFresherHiringWorkflow } from "./AiVoiceCampusFresherHiringWorkflow";

export function AiVoiceCampusFresherHiringPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceCampusFresherHiringHero reduceMotion={reduceMotion} />
        <AiVoiceCampusFresherHiringProblem reduceMotion={reduceMotion} />
        <AiVoiceCampusFresherHiringDefinition reduceMotion={reduceMotion} />
        <AiVoiceCampusFresherHiringWorkflow reduceMotion={reduceMotion} />
        <AiVoiceCampusFresherHiringHumanOversight reduceMotion={reduceMotion} />
        <AiVoiceCampusFresherHiringFaq />
        <AiVoiceCampusFresherHiringBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_CAMPUS_FRESHER_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_CAMPUS_FRESHER_HIRING_GEO.askTopic}
      />
    </div>
  );
}