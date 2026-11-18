"use client";

import { motion } from "motion/react";

import { WORKFLOW_STAGES } from "@/lib/agenticAiRecruitingSoftware";

type AgenticAiRecruitingSoftwareWorkflowProps = {
  reduceMotion: boolean;
};

export function AgenticAiRecruitingSoftwareWorkflow({ reduceMotion }: AgenticAiRecruitingSoftwareWorkflowProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="agentic-workflow">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Connected stages
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            From individual tasks to connected recruiting workflows.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            An agentic recruiting operating model is designed around several connected stages. Their value comes from the continuity between them.
          </p>
        </div>

        <div className="mt-12 relative">
          <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-[#e8eef7] hidden lg:block" />
          
          <ol className="space-y-0">
            {WORKFLOW_STAGES.map((stage, index) => (
              <motion.li
                key={stage.title}
                initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
                className="relative flex gap-6 lg:gap-8"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#0050cb]/20 bg-white text-base font-bold text-[#0050cb] lg:h-14 lg:w-14 lg:text-lg">
                  {stage.stage}
                </div>
                <div className="flex-1 pt-1 lg:pt-2">
                  <h3 className="text-lg font-semibold text-[#141b2b] md:text-xl">{stage.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-[#434654] md:text-lg">
                    {stage.detail}
                  </p>
                </div>
                <div className="relative z-10 hidden w-12 lg:block">
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <div className="absolute left-[1.15rem] top-14 h-[calc(100%-1.75rem)] w-px bg-[#e8eef7]" />
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-[#0050cb]">
          These stages should not operate as isolated automations. Their value comes from the continuity between them.
        </p>
      </div>
    </section>
  );
}