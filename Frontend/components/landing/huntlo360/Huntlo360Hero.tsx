"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { Huntlo360OrbitVisual } from "./Huntlo360OrbitVisual";

type Huntlo360HeroProps = {
  reduceMotion: boolean;
};

export function Huntlo360Hero({ reduceMotion }: Huntlo360HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-0 h-[30rem] w-[30rem] rounded-full bg-[#0050cb]/25 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-[#1a3a8a]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8eb0ff]">
            Huntlo360 · Hiring Operating System
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-[2.5rem] md:text-[3.15rem] lg:text-[3.35rem]">
            Hiring doesn&apos;t need another tool.
            <span className="mt-2 block text-white/75">It needs an operating system.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Modern hiring teams don&apos;t suffer from a talent shortage. They suffer from
            fragmented hiring workflows spread across multiple platforms, disconnected
            conversations, and operational complexity.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Hiring isn&apos;t becoming more operational. It&apos;s becoming more intelligent.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome to Huntlo360.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for the future of Human + AI Hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
            <Link href="#huntlo360" className={secondaryCtaClass}>
              Explore Huntlo360
            </Link>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <Huntlo360OrbitVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
