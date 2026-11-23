"use client";

import { motion } from "motion/react";

import { WORKFLOW_STAGES } from "@/lib/aiCandidateResponseIntelligence";

type AiCandidateResponseIntelligenceWorkflowProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceWorkflow({
  reduceMotion,
}: AiCandidateResponseIntelligenceWorkflowProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="workflow"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            A practical response intelligence workflow
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            From a candidate reply to a reviewable next action.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            This is an illustrative design model. Product-specific capabilities
            must be verified before publication.
          </p>
        </div>

        <div className="mt-12 relative">
          <div className="absolute left-[1.4rem] top-0 bottom-0 w-px bg-[#e8eef7] hidden md:block" />
          <ol className="space-y-0">
            {WORKFLOW_STAGES.map((stage, index) => (
              <motion.li
                key={stage.stage}
                initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
                className="relative flex gap-5 md:gap-6"
              >
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#0050cb]/20 bg-white text-sm font-bold text-[#0050cb] md:h-14 md:w-14 md:text-base">
                  {stage.stage}
                </div>
                <div className="flex-1 pt-1 md:pt-2">
                  <h3 className="text-lg font-semibold text-[#141b2b] md:text-xl">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[#434654] md:text-lg">
                    {stage.detail}
                  </p>
                </div>
                <div className="relative z-10 hidden w-14 md:block">
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <div className="absolute left-[1.4rem] top-14 h-[calc(100%-1.75rem)] w-px bg-[#e8eef7]" />
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}