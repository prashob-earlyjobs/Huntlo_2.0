"use client";

import { motion } from "motion/react";

import { DEFINITION_POINTS } from "@/lib/aiVoiceCandidateDatabaseReactivation";

type AiVoiceCandidateDatabaseReactivationDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateDatabaseReactivationDefinition({
  reduceMotion,
}: AiVoiceCandidateDatabaseReactivationDefinitionProps) {
  return (
    <section
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="definition"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI voice candidate reactivation?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI voice candidate reactivation uses automated voice conversations
            to support renewed contact with previous candidates.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Potential applications include interest checks, availability
            confirmation, location preference questions, and callback
            coordination. Depending on verified product capabilities, responses
            may be organized for recruiter review. The process should begin with
            appropriate contact eligibility checks.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            A historical candidate record does not automatically authorize
            unlimited future communication. The opportunity being discussed
            should be relevant, and candidates should have a clear way to decline
            further contact.
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