"use client";

import { motion } from "motion/react";

import { CONTEXT_EXAMPLES } from "@/lib/aiCandidateResponseIntelligence";

type AiCandidateResponseIntelligenceContextProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceContext({
  reduceMotion,
}: AiCandidateResponseIntelligenceContextProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="context">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why context matters more than keywords
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Candidate language is rarely perfectly standardized.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Someone may say &ldquo;I can talk after Thursday,&rdquo; rather than
            explicitly requesting a callback. Another may express interest while
            asking whether the position requires relocation. A simple keyword
            rule may miss the nuance. AI-assisted interpretation can potentially
            help identify the intended meaning. However, the system must be
            designed to acknowledge uncertainty. When the meaning is unclear,
            asking a person to review the message is better than taking an
            inappropriate action.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {CONTEXT_EXAMPLES.map((example, index) => (
            <motion.div
              key={example.reply}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="flex flex-col rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">
                {example.reply}
              </p>
              <div className="mt-5 space-y-4 text-sm leading-relaxed">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                    A keyword rule may
                  </p>
                  <p className="mt-1.5 text-[#434654] md:text-base">
                    {example.keywordRule}
                  </p>
                </div>
                <div className="border-t border-[#e8eef7] pt-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                    Context-aware interpretation
                  </p>
                  <p className="mt-1.5 text-[#434654] md:text-base">
                    {example.interpretation}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm font-medium leading-relaxed text-[#0050cb]">
          A system that acknowledges uncertainty and routes ambiguity to a
          recruiter is more trustworthy than one that always looks confident.
        </p>
      </div>
    </section>
  );
}