"use client";

import { motion } from "motion/react";

import {
  VOICE_CHANNEL_POINTS,
  ACTIONABLE_DATA_POINTS,
  PRIVACY_POINTS,
} from "@/lib/aiVoiceCandidateDatabaseReactivation";

type AiVoiceCandidateDatabaseReactivationTrustProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateDatabaseReactivationTrust({
  reduceMotion,
}: AiVoiceCandidateDatabaseReactivationTrustProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="trust"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why voice can be useful for candidate reactivation
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Some candidates may respond more readily to a short phone
            conversation than to an email. Others may prefer messaging or direct
            recruiter contact.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A responsible reactivation strategy should consider these
            preferences. Voice can be one communication option, not an assumption
            that every candidate wants to be called. The process should also
            avoid repeated outreach to candidates who have declined contact.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VOICE_CHANNEL_POINTS.map((point, index) => (
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
            Make historical candidate data more actionable
          </p>
          <h3 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
            A candidate database is valuable when recruiters can understand
            which information remains relevant.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Reactivation conversations can help establish whether candidates are
            interested in current opportunities. But automated responses should
            not become unquestioned assessments of suitability. Recruiters should
            review relevant information before progressing candidates. Any
            required qualification or eligibility checks must follow approved
            processes.
          </p>

          <ul className="mt-6 space-y-3">
            {ACTIONABLE_DATA_POINTS.map((point, index) => (
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

        <div className="mt-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Respect privacy and communication preferences
          </p>
          <h3 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
            Candidate databases contain personal information.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Organizations must consider applicable Indian privacy, telecom,
            consent, and recording requirements. Contact should be relevant and
            appropriately authorized. Candidates should know who is calling and
            why. They should have a clear way to request no further communication.
            A reactivation strategy that ignores these principles can damage
            candidate trust.
          </p>

          <ul className="mt-6 space-y-3">
            {PRIVACY_POINTS.map((point, index) => (
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