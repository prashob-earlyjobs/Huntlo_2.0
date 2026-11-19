"use client";

import { motion } from "motion/react";

import { AGENTIC_EXAMPLES } from "@/lib/aiCandidatePipelineAutomation";

type AiCandidatePipelineAutomationAgenticProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationAgentic({
  reduceMotion,
}: AiCandidatePipelineAutomationAgenticProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="agentic"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Where agentic workflows can add value
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Traditional pipeline automation may move a record when a defined
            condition is met. Agentic concepts can support more contextual
            coordination.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate who requests a different interview time should not
            automatically be treated as unresponsive. A candidate who asks for
            clarification should not be advanced without the required
            information. An agentic workflow can be designed to recognize these
            situations and route them appropriately. However, automated
            interpretations should be reviewable. The system should not
            independently reject candidates or make unsupported assessments of
            suitability.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AGENTIC_EXAMPLES.map((example, index) => (
            <motion.div
              key={example.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{example.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {example.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}