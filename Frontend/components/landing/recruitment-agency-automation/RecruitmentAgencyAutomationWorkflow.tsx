"use client";

import { motion } from "motion/react";

import { AGENCY_WORKFLOW_STAGES } from "@/lib/recruitmentAgencyAutomation";

type RecruitmentAgencyAutomationWorkflowProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationWorkflow({
  reduceMotion,
}: RecruitmentAgencyAutomationWorkflowProps) {
  return (
    <section
      id="agency-workflow"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Agency workflow model
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            From Client Mandate to Placement Decision
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            The specific automation capabilities must be confirmed before
            representing this workflow as a Huntlo product feature.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-3">
          {AGENCY_WORKFLOW_STAGES.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className="grid gap-3 rounded-2xl border border-[#d7e3f4] bg-white p-5 md:grid-cols-[48px_220px_1fr] md:items-start md:gap-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f5ff] text-[0.68rem] font-bold text-[#0050cb]">
                {stage.stage}
              </span>
              <h3 className="text-sm font-semibold text-[#141b2b] md:pt-2">
                {stage.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5b6478] md:pt-2">
                {stage.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
