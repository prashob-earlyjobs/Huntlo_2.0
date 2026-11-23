"use client";

import { motion } from "motion/react";

import { BPO_VOICE_WORKFLOW_STAGES } from "@/lib/aiVoiceBpoRecruitment";

type AiVoiceBpoRecruitmentWorkflowProps = {
  reduceMotion: boolean;
};

export function AiVoiceBpoRecruitmentWorkflow({
  reduceMotion,
}: AiVoiceBpoRecruitmentWorkflowProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="voice-workflow">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            A BPO voice recruitment workflow
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            From defining the hiring requirement to recruiter review.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            These steps describe an implementation approach. Huntlo&apos;s exact
            available functions must be verified before publication.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {BPO_VOICE_WORKFLOW_STAGES.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0050cb]/20 bg-[#f0f5ff] text-[#0050cb] font-bold text-sm">
                {stage.stage}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#141b2b]">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-base">
                {stage.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
