"use client";

import { motion } from "motion/react";

import { DEFINITION_POINTS } from "@/lib/aiCandidatePipelineAutomation";

type AiCandidatePipelineAutomationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationDefinition({
  reduceMotion,
}: AiCandidatePipelineAutomationDefinitionProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="definition"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI candidate pipeline automation?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI-assisted software workflows that support recurring activities
            across the recruitment pipeline.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI candidate pipeline automation refers to using AI-assisted software
            workflows to support recurring activities across the recruitment
            pipeline. Potential applications include response organization,
            follow-up coordination, interview handoffs, and process updates.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic workflows may be designed to interpret relevant events and
            initiate permitted actions within defined boundaries. For example, a
            completed interview may trigger a feedback coordination workflow. A
            candidate requesting a reschedule may require a different path. A
            closed vacancy may require approved changes to ongoing communication.
            The precise automation possible depends on system capabilities,
            integrations, and permissions.
          </p>
        </div>

        <div className="mt-10 space-y-5 max-w-3xl">
          {DEFINITION_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{point.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#434654]">
                {point.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}