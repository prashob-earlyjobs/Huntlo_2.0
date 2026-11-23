"use client";

import { motion } from "motion/react";

import { INTEGRATION_LAYERS } from "@/lib/aiRecruitingWorkflowIntegration";

type AiRecruitingWorkflowIntegrationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowIntegrationDefinition({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationDefinitionProps) {
  return (
    <section
      id="what-is-ai-recruiting-workflow-integration"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              What Is AI Recruiting Workflow Integration?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              AI recruiting workflow integration refers to connecting recruitment
              systems and activities through software workflows that may use
              AI-assisted interpretation or coordination. Traditional integrations
              exchange defined information between systems. Workflow automation
              uses that information to support recurring actions.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Agentic workflow concepts may add contextual interpretation when a
              relevant event occurs. For example, a candidate response might
              require an approved follow-up, an internal task, or recruiter
              review. The system should determine the permitted action based on
              available context and organizational rules.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Specific integration capabilities depend on supported APIs,
              permissions, data availability, and the actual software
              implementation.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
          >
            <div className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-6 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#141b2b]">
                  Three layers of a connected recruiting workflow
                </h3>
                <span className="rounded-full border border-[#d7e3f4] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                  Conceptual
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {INTEGRATION_LAYERS.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: reduceMotion ? 0 : index * 0.08,
                    }}
                    className="rounded-xl border border-[#e8eef7] bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f5ff] text-[0.7rem] font-bold text-[#0050cb] ring-1 ring-[#d7e3f4]">
                        {item.layer}
                      </span>
                      <p className="text-sm font-semibold text-[#141b2b]">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
                      {item.detail}
                    </p>
                    <p className="mt-3 border-t border-[#f0f3f9] pt-3 text-[0.7rem] font-medium text-[#8a93a8]">
                      {item.guardrail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
