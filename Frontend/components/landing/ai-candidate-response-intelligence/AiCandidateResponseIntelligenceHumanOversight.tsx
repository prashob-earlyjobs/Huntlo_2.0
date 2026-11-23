"use client";

import { motion } from "motion/react";

import {
  DESIGN_PILLARS,
  RESPONSIBLE_USE,
} from "@/lib/aiCandidateResponseIntelligence";

type AiCandidateResponseIntelligenceHumanOversightProps = {
  reduceMotion: boolean;
};

export function AiCandidateResponseIntelligenceHumanOversight({
  reduceMotion,
}: AiCandidateResponseIntelligenceHumanOversightProps) {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="trust">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Responsible use of candidate conversation data
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Support recruiting operations, not opaque assessments.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Candidate communications may contain personal information.
            Organizations should use appropriate access controls, retention
            practices, and privacy safeguards. Candidates&apos; contact
            preferences must be respected. Automated interpretations should not
            become unsupported judgments about personality, protected
            characteristics, or employability. The system should support
            recruiting operations, not create opaque candidate assessments.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.ul
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            {RESPONSIBLE_USE.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5 md:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0050cb]/30 bg-[#f0f5ff] text-[#0050cb]">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-base font-semibold text-[#141b2b]">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#434654] md:text-base">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-[#fafbfd] shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]"
            aria-label="Conceptual transparency and review interface"
          >
            <div className="border-b border-[#e8eef7] bg-white px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                Interpretation review panel
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                Transparency, reviewability, and candidate privacy
              </p>
            </div>
            <div className="divide-y divide-[#e8eef7]">
              {DESIGN_PILLARS.map((pillar, index) => (
                <motion.div
                  key={pillar.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                  className="px-5 py-4"
                >
                  <p className="text-sm font-semibold text-[#141b2b]">
                    {pillar.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#434654]">
                    {pillar.detail}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="border-t border-[#e8eef7] bg-white px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Conceptual interface — not a live product screenshot
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}