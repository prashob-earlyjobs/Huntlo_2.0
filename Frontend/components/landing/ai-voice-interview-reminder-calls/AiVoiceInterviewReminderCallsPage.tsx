"use client";

import { useReducedMotion } from "motion/react";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { AI_VOICE_INTERVIEW_REMINDER_CALLS_GEO } from "@/lib/aiVoiceInterviewReminderCalls";

import { AiVoiceInterviewReminderCallsBuildSection } from "./AiVoiceInterviewReminderCallsBuildSection";
import { AiVoiceInterviewReminderCallsDefinition } from "./AiVoiceInterviewReminderCallsDefinition";
import { AiVoiceInterviewReminderCallsDiscipline } from "./AiVoiceInterviewReminderCallsDiscipline";
import { AiVoiceInterviewReminderCallsFaq } from "./AiVoiceInterviewReminderCallsFaq";
import { AiVoiceInterviewReminderCallsFinalCta } from "./AiVoiceInterviewReminderCallsFinalCta";
import { AiVoiceInterviewReminderCallsHero } from "./AiVoiceInterviewReminderCallsHero";
import { AiVoiceInterviewReminderCallsProblem } from "./AiVoiceInterviewReminderCallsProblem";
import { AiVoiceInterviewReminderCallsWorkflow } from "./AiVoiceInterviewReminderCallsWorkflow";
import { ReminderConversation } from "./ReminderConversation";

export function AiVoiceInterviewReminderCallsPage() {
  const reduceMotion = !!useReducedMotion();

  return (
    <div className="landing-page min-h-screen bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <AiVoiceInterviewReminderCallsHero reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsProblem reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsDefinition reduceMotion={reduceMotion} />
        <ReminderConversation reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsWorkflow reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsDiscipline reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsBuildSection reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsFaq reduceMotion={reduceMotion} />
        <AiVoiceInterviewReminderCallsFinalCta reduceMotion={reduceMotion} />
      </main>
      <LandingFooter
        aiAskPrompt={AI_VOICE_INTERVIEW_REMINDER_CALLS_GEO.askPrompt}
        aiAskTopic={AI_VOICE_INTERVIEW_REMINDER_CALLS_GEO.askTopic}
      />
    </div>
  );
}
