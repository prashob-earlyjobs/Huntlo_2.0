"use client";

import { motion } from "motion/react";

type OverviewSectionProps = {
  reduceMotion?: boolean;
};

export function OverviewSection({ reduceMotion = false }: OverviewSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is automated candidate outreach?
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Personalized multi-channel sequences that keep conversations moving
          </h2>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          className="space-y-5 text-base leading-relaxed text-[#434654] md:text-lg"
        >
          <p>
            <span className="font-medium text-[#141b2b]">Automated candidate outreach</span> is
            the practice of running personalized, multi-touch recruiting campaigns across channels
            - with timing rules, stop conditions, and reply tracking - so teams engage at scale
            without sending generic blasts.
          </p>
          <p>
            With Huntlo, you set up a campaign once: Email and WhatsApp steps, personalization from
            candidate context, and follow-ups that run until a reply, opt-out, or recruiter stop.
            Recruiters stay in control of messaging and can step into high-priority conversations
            personally.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
