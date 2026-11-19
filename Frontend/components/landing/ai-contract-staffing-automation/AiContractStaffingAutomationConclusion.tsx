"use client";

import { motion } from "motion/react";

type AiContractStaffingAutomationConclusionProps = {
  reduceMotion: boolean;
};

export function AiContractStaffingAutomationConclusion({
  reduceMotion,
}: AiContractStaffingAutomationConclusionProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="conclusion"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Build a more responsive contract staffing operation
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Start with one recurring assignment category.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s agentic recruiting direction provides a framework for
            examining the coordination work involved in contract recruitment.
            Identify the information recruiters repeatedly need to refresh. Define
            the follow-ups and handoffs that can be supported through automation.
            Keep contractual, qualification, and candidate relationship decisions
            under appropriate human control. Then evaluate how connected workflows
            can make the process more responsive.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Start specific",
              description:
                "Begin with one recurring assignment category. Relevance is easier to establish when the requirement is clear and consistent.",
            },
            {
              title: "Identify what changes",
              description:
                "Identify the information recruiters repeatedly need to refresh — availability, timing, assignment preferences, and contact details.",
            },
            {
              title: "Define handoffs",
              description:
                "Define the follow-ups and handoffs that can be supported through automation while keeping consequential decisions under human control.",
            },
          ].map((column, index) => (
            <motion.div
              key={column.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">{column.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {column.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.2 }}
          className="mt-10 rounded-2xl border border-[#0050cb]/20 bg-[#f0f5ff] p-8 text-center md:p-10"
        >
          <p className="text-lg font-semibold text-[#141b2b] md:text-xl">
            Keep contractual, qualification, and candidate relationship decisions
            under appropriate human control.
          </p>
          <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
            The goal is to make contract recruitment more coordinated without
            replacing professional judgment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}