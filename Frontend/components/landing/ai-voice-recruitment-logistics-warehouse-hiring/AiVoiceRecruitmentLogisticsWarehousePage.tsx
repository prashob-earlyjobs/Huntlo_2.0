"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_GEO } from "@/lib/aiVoiceRecruitmentLogisticsWarehouse";

import { AiVoiceRecruitmentLogisticsWarehouseBuildSection } from "./AiVoiceRecruitmentLogisticsWarehouseBuildSection";
import { AiVoiceRecruitmentLogisticsWarehouseDefinition } from "./AiVoiceRecruitmentLogisticsWarehouseDefinition";
import { AiVoiceRecruitmentLogisticsWarehouseFaq } from "./AiVoiceRecruitmentLogisticsWarehouseFaq";
import { AiVoiceRecruitmentLogisticsWarehouseHero } from "./AiVoiceRecruitmentLogisticsWarehouseHero";
import { AiVoiceRecruitmentLogisticsWarehouseHumanOversight } from "./AiVoiceRecruitmentLogisticsWarehouseHumanOversight";
import { AiVoiceRecruitmentLogisticsWarehouseProblem } from "./AiVoiceRecruitmentLogisticsWarehouseProblem";
import { AiVoiceRecruitmentLogisticsWarehouseVoiceExperience } from "./AiVoiceRecruitmentLogisticsWarehouseVoiceExperience";
import { AiVoiceRecruitmentLogisticsWarehouseWorkflow } from "./AiVoiceRecruitmentLogisticsWarehouseWorkflow";

export function AiVoiceRecruitmentLogisticsWarehousePage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceRecruitmentLogisticsWarehouseHero reduceMotion={reduceMotion} />
        <AiVoiceRecruitmentLogisticsWarehouseProblem reduceMotion={reduceMotion} />
        <AiVoiceRecruitmentLogisticsWarehouseDefinition reduceMotion={reduceMotion} />
        <AiVoiceRecruitmentLogisticsWarehouseVoiceExperience />
        <AiVoiceRecruitmentLogisticsWarehouseWorkflow reduceMotion={reduceMotion} />
        <AiVoiceRecruitmentLogisticsWarehouseHumanOversight reduceMotion={reduceMotion} />
        <AiVoiceRecruitmentLogisticsWarehouseFaq />
        <AiVoiceRecruitmentLogisticsWarehouseBuildSection reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_GEO.askPrompt}
        aiAskTopic={AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_GEO.askTopic}
      />
    </div>
  );
}
