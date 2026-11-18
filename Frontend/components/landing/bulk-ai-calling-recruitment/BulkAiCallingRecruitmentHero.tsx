"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { CallingConsoleVisual } from "./CallingConsoleVisual";
import { lightPrimaryCtaClass, lightSecondaryCtaClass } from "./ctaClasses";

type BulkAiCallingRecruitmentHeroProps = {
  reduceMotion: boolean;
};

export function BulkAiCallingRecruitmentHero({
  reduceMotion,
}: BulkAiCallingRecruitmentHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white text-[#141b2b]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-10 h-[22rem] w-[22rem] rounded-full bg-[#0050cb]/10 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-[20rem] w-[20rem] rounded-full bg-[#0050cb]/08 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0050cb]">
            Bulk AI calling · India
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.35rem] md:text-[2.9rem] lg:text-[3.05rem]">
            When you have hundreds of candidates to call, the first conversation matters.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Explore how AI voice calling can support high-volume outreach and first-round screening
            in India - with recruiter review and responsible calling controls.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={lightPrimaryCtaClass}>
              Request a Huntlo AI voice demonstration
            </BookDemoLink>
            <Link href="/contact" className={lightSecondaryCtaClass}>
              Discuss your calling workflow
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <CallingConsoleVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
