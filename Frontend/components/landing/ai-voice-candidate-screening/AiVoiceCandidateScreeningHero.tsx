"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { VoiceScreeningVisual } from "./VoiceScreeningVisual";

type AiVoiceCandidateScreeningHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateScreeningHero({
  reduceMotion,
}: AiVoiceCandidateScreeningHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-[#f8fafc]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[#dbe8ff]/70 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[#eef3ff] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            AI voice candidate screening · India
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.35rem] md:text-[2.9rem]">
            Thousands of Applications. Hundreds of Calls. Too Little Time to Speak to Everyone.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            AI voice candidate screening offers a way to structure these initial conversations,
            collect relevant information and help recruiters focus their attention where it is
            needed most.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/ai-voice-recruiter" className={primaryCtaClass}>
              Explore AI Voice Screening
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Request a voice screening walkthrough
            </BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <VoiceScreeningVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
