"use client";

import { motion } from "motion/react";

import {
  EXECUTIVE_SEARCH_WORKFLOW_STAGES,
} from "@/lib/aiExecutiveSearchAutomation";

type AiExecutiveSearchAutomationWorkflowProps = {
  reduceMotion: boolean;
};

export function AiExecutiveSearchAutomationWorkflow({
  reduceMotion,
}: AiExecutiveSearchAutomationWorkflowProps) {
  return (
    <section
      id="executive-search-workflow"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            A Practical Executive Search Workflow
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            This is an illustrative operating model. Specific Huntlo capabilities
            and integrations must be verified.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-12 space-y-4"
        >
          {EXECUTIVE_SEARCH_WORKFLOW_STAGES.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={reduceMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.15 + index * 0.06 }}
              className="relative rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0f5ff] text-[#0050cb] text-[0.75rem] font-bold ring-1 ring-[#d7e3f4]">
                  {stage.stage}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#141b2b]">{stage.title}</h3>
                  <p className="mt-1 text-base text-[#434654]">{stage.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-10 p-6 rounded-2xl bg-white border border-[#d7e3f4]"
        >
          <p className="text-sm text-[#5b6478]">
            <strong className="text-[#141b2b]">Note:</strong> This is an illustrative
            operating model. Specific Huntlo capabilities and integrations must
            be verified.
          </p>
        </motion.div>
      </div>
    </section>
  );
}