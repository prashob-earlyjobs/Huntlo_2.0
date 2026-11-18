"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiVoiceFieldSalesHiringBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiVoiceFieldSalesHiringBuildSection({
  reduceMotion,
}: AiVoiceFieldSalesHiringBuildSectionProps) {
  return (
    <section
      id="make-first-contact-recruitment-more-organized"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Make First-Contact Recruitment More Organized
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s AI voice recruitment direction offers a framework for
            improving repetitive candidate engagement in field sales hiring. Start
            with one territory or role category. Identify the questions recruiters
            repeatedly ask. Define which responses require human review. Then
            evaluate how voice automation can support those conversations.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            The goal is a clearer, more dependable first-contact process that
            helps recruiters spend more time on meaningful candidate evaluation.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#field-sales-voice-workflow" className={primaryCtaClass}>
              Explore AI Voice for Field Sales Hiring
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Workflow Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}