"use client";

import { motion } from "motion/react";

import {
  MULTI_STORE_POINTS,
  TRUST_POINTS,
} from "@/lib/aiVoiceRetailFrontlineHiring";

type AiVoiceRetailFrontlineHiringMultiStoreProps = {
  reduceMotion: boolean;
};

export function AiVoiceRetailFrontlineHiringMultiStore({
  reduceMotion,
}: AiVoiceRetailFrontlineHiringMultiStoreProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="multi-store"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Support hiring across multiple stores
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Retail chains may manage hiring requirements across many locations.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A structured voice process can help maintain consistent initial
            communication while using store-specific information. But automation
            should not assume that all locations have the same requirements.
            Candidates need accurate details about the opportunity being
            discussed. The process should also avoid duplicate or contradictory
            communication when someone has applied to multiple stores.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {MULTI_STORE_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{point.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {point.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Candidate trust is part of recruitment quality
          </p>
          <h3 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
            Automated calls should identify the recruiting organization and
            explain the purpose of contact.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Candidates should be able to request clarification or human
            assistance. Organizations must consider applicable Indian telecom,
            privacy, consent, and recording requirements. Repeated unwanted calls
            should be avoided. Candidate communication preferences must be
            respected.
          </p>

          <ul className="mt-6 space-y-3">
            {TRUST_POINTS.map((point, index) => (
              <motion.li
                key={point.title}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                className="flex items-start gap-3 text-sm text-[#434654]"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0050cb]/30 bg-[#f0f5ff] text-[#0050cb]">
                  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <span className="font-semibold text-[#141b2b]">{point.title}: </span>
                  {point.detail}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}