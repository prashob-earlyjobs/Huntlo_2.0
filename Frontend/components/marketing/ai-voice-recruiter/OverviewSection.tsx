"use client";

import { motion } from "motion/react";

type OverviewSectionProps = {
  reduceMotion?: boolean;
};

export function OverviewSection({ reduceMotion = false }: OverviewSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Turn screening calls into conversations
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Personal phone screening - without tying up your team
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
            Upload your candidate list (or sync from partner networks), and Huntlo&apos;s AI Voice
            Recruiter calls each prospect around the clock. It speaks naturally in the
            candidate&apos;s language, asks your job-specific questions - notice period, salary
            expectations, skills - and understands spoken answers.
          </p>
          <p>
            The AI greets candidates by name, explains the role, and follows your script or JD
            guidelines. If someone is interested, it probes further; if not, it ends politely. After
            each call you get a structured summary so recruiters see interview-ready profiles
            instead of making first-contact calls.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
