"use client";

import { motion } from "motion/react";

import { COMPARISON_ROWS } from "@/lib/aiPassiveCandidateEngagement";

type AiPassiveCandidateEngagementComparisonProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementComparison({
  reduceMotion,
}: AiPassiveCandidateEngagementComparisonProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="comparison"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why passive candidate engagement is different
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Active applicants have already raised their hand. Passive candidates
            have not.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Active applicants have already demonstrated some level of interest by
            applying for a position. Passive candidates have not. That
            distinction changes the recruiting conversation. A recruiter must
            first establish relevance before expecting engagement.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The message needs to explain why the opportunity may be worth
            considering. The candidate may have questions about the organization,
            responsibilities, career progression, or working arrangement. They
            may also have no interest in changing roles.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            A good engagement process respects all these possibilities.
            Automated outreach should never assume that a professional wants to
            receive repeated recruiting messages.
          </p>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.2)]"
        >
          <div className="grid grid-cols-3 gap-0 border-b border-[#e8eef7] bg-[#fafbfd]">
            <div className="px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8] md:px-6 md:py-4">
              Dimension
            </div>
            <div className="px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb] md:px-6 md:py-4">
              Active applicants
            </div>
            <div className="px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb] md:px-6 md:py-4">
              Passive candidates
            </div>
          </div>
          <div className="divide-y divide-[#e8eef7]">
            {COMPARISON_ROWS.map((row, index) => (
              <motion.div
                key={row.label}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                className="grid grid-cols-3 gap-0"
              >
                <div className="px-4 py-4 text-sm font-semibold text-[#141b2b] md:px-6 md:py-5 md:text-base">
                  {row.label}
                </div>
                <div className="px-4 py-4 text-sm leading-relaxed text-[#434654] md:px-6 md:py-5 md:text-base">
                  {row.active}
                </div>
                <div className="px-4 py-4 text-sm leading-relaxed text-[#434654] md:px-6 md:py-5 md:text-base">
                  {row.passive}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}