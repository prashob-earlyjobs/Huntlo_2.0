"use client";

import { motion } from "motion/react";

import { PERSONALIZATION_PRINCIPLES } from "@/lib/aiPassiveCandidateEngagement";

type AiPassiveCandidateEngagementPersonalizationProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementPersonalization({
  reduceMotion,
}: AiPassiveCandidateEngagementPersonalizationProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="personalization"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Personalization begins before the message
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Adding a candidate&apos;s first name to a template is not
            personalization.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A relevant message should be grounded in the role and the
            candidate&apos;s professional background. Recruiters should
            understand which aspects of the opportunity may be relevant and
            avoid making unsupported assumptions about career interests.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            AI-assisted workflows can help organize outreach preparation, but
            recruiters should remain responsible for reviewing sensitive or
            high-value communications. The quality of the candidate experience
            depends on relevance, accuracy, and respect.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PERSONALIZATION_PRINCIPLES.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{principle.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {principle.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}