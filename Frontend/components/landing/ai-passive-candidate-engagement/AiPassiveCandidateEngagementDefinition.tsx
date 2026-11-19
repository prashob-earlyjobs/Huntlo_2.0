"use client";

import { motion } from "motion/react";

import { DEFINITION_POINTS } from "@/lib/aiPassiveCandidateEngagement";

type AiPassiveCandidateEngagementDefinitionProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementDefinition({
  reduceMotion,
}: AiPassiveCandidateEngagementDefinitionProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="definition"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI passive candidate engagement?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI-assisted workflows that support reaching and communicating with
            potential candidates.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI passive candidate engagement involves using AI-assisted software
            to support selected activities involved in reaching and
            communicating with potential candidates. These activities may
            include outreach preparation, communication coordination, response
            organization, and follow-up management.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            An agentic workflow may be designed to interpret candidate responses
            and identify the next permitted action. For example, a candidate
            asking for additional information requires a different response from
            someone requesting contact at a later date. A candidate declining the
            opportunity should not remain in an active follow-up sequence.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The value lies in treating these conversations as meaningful
            interactions rather than simple campaign events.
          </p>
        </div>

        <div className="mt-10 space-y-5 max-w-3xl">
          {DEFINITION_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{point.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#434654]">
                {point.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}