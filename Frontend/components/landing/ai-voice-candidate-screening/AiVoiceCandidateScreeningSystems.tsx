"use client";

import { motion } from "motion/react";

import {
  SCREENING_WORKFLOW,
  TRUST_CONTROLS,
  USE_CASES,
} from "@/lib/aiVoiceCandidateScreening";

type AiVoiceCandidateScreeningSystemsProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateScreeningSystems({
  reduceMotion,
}: AiVoiceCandidateScreeningSystemsProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Screening flow
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A Practical AI Voice Screening Workflow
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              This is a proposed workflow pattern. Each automated step must be matched to verified
              product functionality before publication.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SCREENING_WORKFLOW.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {item.step}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.detail}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Use cases
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              High-volume roles where first contact matters
            </h2>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-white px-5 py-5"
              >
                <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Trust
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Screening at Scale Without Losing Candidate Trust
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Automated calls should never become an excuse for intrusive outreach. These details
              determine whether automation improves the recruiting experience or simply creates more
              noise.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {TRUST_CONTROLS.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#0050cb]/25 bg-[#f0f5ff] px-5 py-5"
              >
                <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
