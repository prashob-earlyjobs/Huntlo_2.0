"use client";

import { motion } from "motion/react";

import { FRAGMENTED_SYSTEMS } from "@/lib/aiRecruitingWorkflowIntegration";

type AiRecruitingWorkflowIntegrationProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowIntegrationProblem({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationProblemProps) {
  return (
    <section
      id="why-recruiting-technology-becomes-fragmented"
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
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Recruiting Technology Becomes Fragmented
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiting technology is often adopted one problem at a time. A
            company introduces a sourcing platform to improve candidate
            discovery. It adds a communication tool to support outreach. It adopts
            scheduling software to simplify interview coordination.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Each decision may be reasonable. Over time, however, recruiters may
            need to switch between multiple interfaces to complete one process.
            The problem is not necessarily the number of tools. It is the absence
            of reliable coordination between them.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FRAGMENTED_SYSTEMS.map((system, index) => {
            const isGap = index === FRAGMENTED_SYSTEMS.length - 1;
            return (
              <div
                key={system.name}
                className={
                  isGap
                    ? "rounded-2xl border border-[#0050cb]/30 bg-[#f0f5ff] p-6"
                    : "rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className={
                      isGap
                        ? "text-base font-semibold text-[#0050cb]"
                        : "text-base font-semibold text-[#141b2b]"
                    }
                  >
                    {system.name}
                  </h3>
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0050cb]/60" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                  {system.detail}
                </p>
                <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  {system.note}
                </p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-14 max-w-3xl"
        >
          <p className="text-base leading-relaxed text-[#434654] md:text-lg">
            When systems do not exchange the information required for a workflow,
            recruiters become the connection layer. That creates repetitive
            administrative work and opportunities for inconsistent information —
            a reply checked in one tool, a record updated in another, a decision
            remembered rather than documented.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
