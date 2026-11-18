"use client";

import { motion } from "motion/react";

import {
  INDUSTRY_PAINS,
  JOURNEY_MAP,
  RECRUITER_DAY,
} from "@/lib/aiRecruitingStaffingAgencies";

type AiRecruitingStaffingAgenciesStoryProps = {
  reduceMotion: boolean;
};

export function AiRecruitingStaffingAgenciesStory({
  reduceMotion,
}: AiRecruitingStaffingAgenciesStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Industry reality
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The staffing desk is a coordination challenge
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Agency recruiters rarely struggle with a single task. They struggle with keeping
              many moving pieces connected while clients wait for clarity.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {INDUSTRY_PAINS.map((pain, index) => (
              <motion.article
                key={pain.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]/55">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-base font-bold text-[#141b2b]">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{pain.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Recruiter day
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Start with the recruiter&apos;s actual day
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Useful workflows begin where the work already happens - not with an abstract
              automation diagram.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {RECRUITER_DAY.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-start gap-4 rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4"
              >
                <span className="mt-0.5 text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-[#141b2b] sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="journey"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Illustrative scenario
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              One requisition, one visible path
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Consider customer success specialists across two cities for the same client. This is
              an illustrative journey map - not a customer case study.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {JOURNEY_MAP.map((step, index) => (
              <motion.li
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="grid gap-2 rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-4 sm:grid-cols-[4.5rem_1fr]"
              >
                <span className="text-[0.7rem] font-semibold tabular-nums text-[#0050cb]">
                  {step.stage}
                </span>
                <div>
                  <p className="text-sm font-bold text-[#141b2b] sm:text-base">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#434654]">{step.detail}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
