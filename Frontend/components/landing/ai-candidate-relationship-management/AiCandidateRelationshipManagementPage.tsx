"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_GEO } from "@/lib/aiCandidateRelationshipManagement";

import { AiCandidateRelationshipManagementFaq } from "./AiCandidateRelationshipManagementFaq";
import { AiCandidateRelationshipManagementFinalCta } from "./AiCandidateRelationshipManagementFinalCta";
import { AiCandidateRelationshipManagementHero } from "./AiCandidateRelationshipManagementHero";
import { AiCandidateRelationshipManagementDefinition } from "./AiCandidateRelationshipManagementDefinition";
import { AiCandidateRelationshipManagementWorkflow } from "./AiCandidateRelationshipManagementWorkflow";

export function AiCandidateRelationshipManagementPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiCandidateRelationshipManagementHero reduceMotion={reduceMotion} />
        <AiCandidateRelationshipManagementDefinition reduceMotion={reduceMotion} />
        <AiCandidateRelationshipManagementWorkflow reduceMotion={reduceMotion} />
        <AiCandidateRelationshipManagementFaq />
        <AiCandidateRelationshipManagementFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_GEO.askPrompt}
        aiAskTopic={AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_GEO.askTopic}
      />
    </div>
  );
}