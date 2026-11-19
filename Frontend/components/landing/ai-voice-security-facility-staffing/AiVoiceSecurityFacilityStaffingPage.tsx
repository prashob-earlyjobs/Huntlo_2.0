"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_SECURITY_FACILITY_STAFFING_GEO } from "@/lib/aiVoiceSecurityFacilityStaffing";

import { AiVoiceSecurityFacilityStaffingBuildSection } from "./AiVoiceSecurityFacilityStaffingBuildSection";
import { AiVoiceSecurityFacilityStaffingDefinition } from "./AiVoiceSecurityFacilityStaffingDefinition";
import { AiVoiceSecurityFacilityStaffingFaq } from "./AiVoiceSecurityFacilityStaffingFaq";
import { AiVoiceSecurityFacilityStaffingFinalCta } from "./AiVoiceSecurityFacilityStaffingFinalCta";
import { AiVoiceSecurityFacilityStaffingHero } from "./AiVoiceSecurityFacilityStaffingHero";
import { AiVoiceSecurityFacilityStaffingProblem } from "./AiVoiceSecurityFacilityStaffingProblem";
import { AiVoiceSecurityFacilityStaffingTrust } from "./AiVoiceSecurityFacilityStaffingTrust";
import { AiVoiceSecurityFacilityStaffingWorkflow } from "./AiVoiceSecurityFacilityStaffingWorkflow";
import { FacilityConversation } from "./FacilityConversation";

export function AiVoiceSecurityFacilityStaffingPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceSecurityFacilityStaffingHero reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingProblem reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingDefinition reduceMotion={reduceMotion} />
        <FacilityConversation reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingWorkflow reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingTrust reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingBuildSection reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingFaq reduceMotion={reduceMotion} />
        <AiVoiceSecurityFacilityStaffingFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_SECURITY_FACILITY_STAFFING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_SECURITY_FACILITY_STAFFING_GEO.askTopic}
      />
    </div>
  );
}
