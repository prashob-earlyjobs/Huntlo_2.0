"use client";

import { motion } from "motion/react";

import { RESPONSE_CATEGORIES } from "@/lib/aiCandidateReEngagement";

type AiCandidateReEngagementResponseIntelligenceProps = {
  reduceMotion: boolean;
};

export function AiCandidateReEngagementResponseIntelligence({
  reduceMotion,
}: AiCandidateReEngagementResponseIntelligenceProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="response-intelligence">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Response intelligence
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Not every reply should receive the same follow-up.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Someone asking for a job description needs information. Someone
            requesting a callback needs coordination. Someone declining future
            communication needs their preference respected. These are different
            situations. Treating them identically creates unnecessary friction.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {RESPONSE_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.category}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">{category.category}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {category.detail}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#0050cb]">
                Next step: {category.nextStep}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
