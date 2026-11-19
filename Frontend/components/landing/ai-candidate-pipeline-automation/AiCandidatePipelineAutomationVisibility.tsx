"use client";

import { motion } from "motion/react";

import { VISIBILITY_GAPS } from "@/lib/aiCandidatePipelineAutomation";

type AiCandidatePipelineAutomationVisibilityProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationVisibility({
  reduceMotion,
}: AiCandidatePipelineAutomationVisibilityProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="visibility"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why pipeline visibility is not the same as pipeline progress
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Applicant tracking systems and recruiting dashboards help teams
            understand where candidates are recorded. But a stage label does
            not necessarily explain what needs to happen next.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate in screening may be waiting for a recruiter. Another may
            need to provide information. A third may have requested a callback.
            All three candidates could appear in the same stage while requiring
            different actions. A useful pipeline workflow should account for
            these distinctions. It should connect candidate status with the
            actual operational work required.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VISIBILITY_GAPS.map((column, index) => (
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
                {column.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}