"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { lightPrimaryCtaClass, lightSecondaryCtaClass } from "./ctaClasses";
import { ScreeningJourneyVisual } from "./ScreeningJourneyVisual";

type AiVoiceScreeningHighVolumeHiringHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceScreeningHighVolumeHiringHero({
  reduceMotion,
}: AiVoiceScreeningHighVolumeHiringHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#c3c6d6]/30 bg-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-16 top-0 h-[22rem] w-[22rem] rounded-full bg-[#0050cb]/8 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[18rem] w-[18rem] rounded-full bg-[#c1cfff]/35 blur-[90px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0050cb]">
            Huntlo India · High-volume hiring
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            A long applicant list is not the same as a ready hiring pipeline.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Structured AI voice screening can help high-volume teams run consistent first-contact
            conversations - with candidate-first disclosure and human review before decisions.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/ai-voice-recruiter" className={lightPrimaryCtaClass}>
              See Huntlo voice screening
            </Link>
            <BookDemoLink className={lightSecondaryCtaClass}>Plan a pilot</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <ScreeningJourneyVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
