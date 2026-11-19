"use client";

import { motion } from "motion/react";

import { PREFERENCE_PATTERNS } from "@/lib/aiTalentPoolEngagement";

type AiTalentPoolEngagementDefinitionProps = {
  reduceMotion: boolean;
};

export function AiTalentPoolEngagementDefinition({
  reduceMotion,
}: AiTalentPoolEngagementDefinitionProps) {
  return (
    <section
      id="what-is-ai-talent-pool-engagement"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              What Is Talent Pool Engagement?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              Talent pool engagement is the process of maintaining appropriate
              relationships with candidates who may be relevant to future hiring
              requirements. It can involve sharing relevant opportunities,
              updating candidate preferences, and maintaining communication
              context.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              The approach differs from immediate vacancy-based recruitment. Not
              every candidate in a talent pool is actively seeking a new
              position. Some may want occasional updates. Others may prefer to be
              contacted only when a specific opportunity becomes available. A
              useful engagement strategy respects these differences.
            </p>

            <h3 className="mt-10 text-lg font-semibold text-[#141b2b]">
              What Is AI Talent Pool Engagement Automation?
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
              AI talent pool engagement automation refers to using AI-assisted
              workflows to support selected communication and coordination
              activities involving existing candidate groups. Potential
              applications include organizing candidate preferences, preparing
              relevant outreach, managing responses, and coordinating appropriate
              follow-ups. Agentic workflow concepts may help identify permitted
              next actions based on candidate responses and recruiting context.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Actual capabilities depend on verified product functionality.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8"
          >
            <h3 className="text-sm font-semibold text-[#141b2b]">
              Preferences change the next action
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
              For example, someone interested in future leadership opportunities
              may require different communication from someone seeking
              entry-level roles. A candidate requesting no further contact should
              not remain in an active engagement workflow.
            </p>
            <div className="mt-6 space-y-3">
              {PREFERENCE_PATTERNS.map((pattern, index) => (
                <motion.div
                  key={pattern.signal}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.07,
                  }}
                  className="rounded-xl border border-[#e8eef7] bg-[#fbfcfe] p-4"
                >
                  <p className="text-sm font-medium text-[#141b2b]">
                    {pattern.signal}
                  </p>
                  <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-[#0050cb]">
                    <span aria-hidden className="mt-0.5">
                      →
                    </span>
                    {pattern.implication}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
