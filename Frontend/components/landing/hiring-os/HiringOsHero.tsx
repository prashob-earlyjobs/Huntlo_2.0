"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { PlatformBreadcrumb } from "@/components/landing/platform-category/PlatformBreadcrumb";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { HiringOsFlowVisual } from "./HiringOsFlowVisual";

type HiringOsHeroProps = {
  reduceMotion: boolean;
};

export function HiringOsHero({ reduceMotion }: HiringOsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#03060f] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[32rem] w-[32rem] rounded-full bg-[#0050cb]/26 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-[#1a3a8a]/32 blur-[130px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:pt-14 lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PlatformBreadcrumb current="Huntlo360" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8eb0ff]">
            Hiring OS · AI Native Operating System
          </p>
          <h1 className="mt-5 max-w-xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.1rem] lg:text-[3.3rem]">
            Hiring doesn&apos;t need another platform.
            <span className="mt-2 block text-[#8eb0ff]">It needs an operating system.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Hiring lives across fragmented tools and disconnected workflows. Huntlo360 brings
            intelligence, conversations, workflows and outcomes into one operating system.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
            <Link href="#hiring-os" className={secondaryCtaClass}>
              Explore Hiring OS
            </Link>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12 }}
        >
          <HiringOsFlowVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
