"use client";

import { motion } from "motion/react";

import { HANDOFF_WORKFLOW } from "@/lib/aiRecruiterHandoffAutomation";

type AiRecruiterHandoffAutomationWorkflowProps = {
  reduceMotion: boolean;
};

export function AiRecruiterHandoffAutomationWorkflow({
  reduceMotion,
}: AiRecruiterHandoffAutomationWorkflowProps) {
  return (
    <section
      id="handoff-workflow"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Operating model
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              A Practical Recruiter Handoff Workflow
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The sequence below describes how a handoff could be structured so
              context, ownership, and next actions travel together.
            </p>
            <div className="mt-6 rounded-xl border border-[#e8eef7] bg-white p-4">
              <p className="text-xs leading-relaxed text-[#8a93a8]">
                This is a conceptual workflow and should not be described as a
                verified Huntlo feature without confirmation.
              </p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {HANDOFF_WORKFLOW.map((item, index) => (
              <motion.div
                key={item.step}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                }}
                className="relative flex gap-5 rounded-2xl border border-[#d7e3f4] bg-white p-5 md:p-6"
              >
                <div className="relative shrink-0">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f5ff] text-sm font-bold text-[#0050cb]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < HANDOFF_WORKFLOW.length - 1 && (
                    <span className="absolute left-1/2 top-11 h-[calc(100%+1rem)] w-px -translate-x-1/2 bg-[#d7e3f4]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-base font-semibold text-[#141b2b]">
                    {item.step}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#434654]">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
