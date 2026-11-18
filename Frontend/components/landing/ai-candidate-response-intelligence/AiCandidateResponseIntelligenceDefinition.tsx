"use client";

import { motion } from "motion/react";

import { RESPONSE_SIGNALS } from "@/lib/aiCandidateResponseIntelligence";

type AiCandidateResponseIntelligenceDefinitionProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceDefinition({
  reduceMotion,
}: AiCandidateResponseIntelligenceDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is candidate response intelligence?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Turning unstructured replies into operational context.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Candidate response intelligence refers to analyzing recruitment
            communications to identify meaningful information about candidate
            intent, questions, availability, and workflow needs.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            AI-assisted systems may be designed to interpret text or
            conversation data and organize it into categories for review.
            Potential categories include interest, information requests,
            scheduling needs, unavailability, and contact preferences. The
            objective is not to assign an unquestioned score to a person. It is
            to help recruiters understand what a candidate communicated and
            what operational action may be appropriate. Interpretations can be
            imperfect, so human review and correction mechanisms matter.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]">
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr_0.9fr]">
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-3 md:border-b-0 md:border-r">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                Candidate reply
              </p>
            </div>
            <div className="border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-3 md:border-b-0 md:border-r">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Interpretation
              </p>
            </div>
            <div className="bg-[#fafbfd] px-5 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                Permitted next step
              </p>
            </div>
          </div>
          {RESPONSE_SIGNALS.map((signal, index) => (
            <motion.div
              key={signal.category}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="grid grid-cols-1 border-t border-[#e8eef7] md:grid-cols-[1.15fr_1fr_0.9fr]"
            >
              <div className="px-5 py-5 md:border-r md:border-[#e8eef7]">
                <p className="text-sm leading-relaxed text-[#141b2b]">
                  {signal.reply}
                </p>
              </div>
              <div className="px-5 pb-5 md:border-r md:border-[#e8eef7] md:py-5">
                <p className="text-sm font-semibold text-[#141b2b]">
                  {signal.category}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#434654]">
                  {signal.detail}
                </p>
              </div>
              <div className="px-5 pb-5 md:py-5">
                <p className="text-sm font-medium leading-relaxed text-[#0050cb]">
                  {signal.nextStep}
                </p>
              </div>
            </motion.div>
          ))}
          <p className="border-t border-[#e8eef7] bg-[#fafbfd] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
            Illustrative categories — product capabilities must be verified
          </p>
        </div>
      </div>
    </section>
  );
}