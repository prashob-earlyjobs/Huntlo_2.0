"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { lightPrimaryCtaClass, lightSecondaryCtaClass } from "./ctaClasses";
import { PhoneOutreachVisual } from "./PhoneOutreachVisual";

type MultilingualRecruitmentHeroProps = {
  reduceMotion: boolean;
};

export function MultilingualRecruitmentHero({
  reduceMotion,
}: MultilingualRecruitmentHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#c3c6d6]/30 bg-white text-[#141b2b]">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute -left-20 top-8 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/12 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[#0050cb]/08 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0050cb]">
            Multilingual recruitment · India
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.2rem]">
            Hire Across India – Voice &amp; Chat AI
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Use AI voice calls and WhatsApp to engage candidates in their native language - Hindi,
            English, and local languages across rural and urban hiring.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={lightPrimaryCtaClass}>See a Demo</BookDemoLink>
            <Link href="/contact" className={lightSecondaryCtaClass}>
              Contact Sales
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="w-full min-w-0"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <PhoneOutreachVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
