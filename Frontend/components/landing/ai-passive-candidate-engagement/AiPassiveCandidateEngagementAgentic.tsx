"use client";

import { motion } from "motion/react";

import { AGENTIC_SITUATIONS } from "@/lib/aiPassiveCandidateEngagement";

type AiPassiveCandidateEngagementAgenticProps = {
  reduceMotion: boolean;
};

export function AiPassiveCandidateEngagementAgentic({
  reduceMotion,
}: AiPassiveCandidateEngagementAgenticProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="agentic"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Where agentic recruiting can help
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Passive candidate conversations rarely follow a predictable script.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate may ask whether the role offers remote work. Another may
            request a conversation after completing a major project. A third may
            be interested but need clarification about the seniority of the
            position.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Agentic workflow concepts can help coordinate these different
            situations. But automation should not invent answers, misrepresent an
            opportunity, or continue contacting someone who has declined. Human
            recruiters should remain available when nuance or relationship-building
            is required.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {AGENTIC_SITUATIONS.map((situation, index) => (
            <motion.div
              key={situation.situation}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{situation.situation}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {situation.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}