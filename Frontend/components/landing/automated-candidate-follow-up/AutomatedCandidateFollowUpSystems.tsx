"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  CONTROL_CARDS,
  QUALITY_MEASURES,
  START_MOTION,
} from "@/lib/automatedCandidateFollowUp";

type AutomatedCandidateFollowUpSystemsProps = {
  reduceMotion: boolean;
};

export function AutomatedCandidateFollowUpSystems({
  reduceMotion,
}: AutomatedCandidateFollowUpSystemsProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Controls
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Keep recruiters in control
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Confirm channels and triggers in a demo. Automation should prepare reminders -
              recruiters should decide what happens after engagement.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CONTROL_CARDS.map((card, index) => (
              <motion.article
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex h-full flex-col rounded-2xl border border-[#e8eef7] bg-white p-6"
              >
                <h3 className="text-base font-bold text-[#141b2b]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{card.description}</p>
                <ul className="mt-4 space-y-2 border-t border-[#e8eef7] pt-4">
                  {card.points.map((point) => (
                    <li key={point} className="text-xs font-medium text-[#5b6478]">
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Measurement
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Measure quality, not just activity
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A qualitative framework for evaluating follow-up - without fabricated uplift or
              unsupported response-rate claims.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {QUALITY_MEASURES.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f0f5ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Getting started
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            {START_MOTION.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
            {START_MOTION.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link
              href="/follow-up-automation"
              className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Hiring Momentum · follow-up automation
            </Link>
            <Link
              href="/ai-voice-recruiter"
              className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI voice recruiter
            </Link>
            <Link
              href="/demo"
              className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              See Huntlo demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
