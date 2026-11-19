"use client";

import { motion } from "motion/react";

import { VOICE_FOLLOW_UP_WORKFLOW_STAGES } from "@/lib/aiVoiceCandidateFollowUp";

type AiVoiceCandidateFollowUpWorkflowProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateFollowUpWorkflow({
  reduceMotion,
}: AiVoiceCandidateFollowUpWorkflowProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36" id="voice-follow-up-workflow">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            A Practical Voice Follow-Up Workflow
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            The precise degree of automation must be verified against
            Huntlo&apos;s current capabilities.
          </p>
        </div>

        <div className="mt-16">
          {VOICE_FOLLOW_UP_WORKFLOW_STAGES.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="grid items-start gap-4 md:grid-cols-[60px_1fr] border-b border-[#e8eef7] py-6 last:border-0"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0050cb] text-white text-[0.75rem] font-bold">
                {stage.stage}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#141b2b]">{stage.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">
                  {stage.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
