"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { CollaborationVisual } from "./CollaborationVisual";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AgenticHiringHeroProps = {
  reduceMotion: boolean;
};

export function AgenticHiringHero({ reduceMotion }: AgenticHiringHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#02050c] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/3 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
        {!reduceMotion ? (
          <motion.div
            className="absolute left-1/2 top-1/4 h-px w-[150%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0050cb]/5 to-transparent"
            animate={{ opacity: [0.15, 0.8, 0.15], x: ["-7%", "7%", "-7%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-40">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8eb0ff]">
            Manifesto · Agentic Hiring™
          </p>
          <h1 className="mt-5 max-w-xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.2rem] lg:text-[3.45rem]">
            Hiring isn&apos;t becoming automated.
            <span className="mt-2 block text-[#8eb0ff]">It&apos;s becoming Agentic.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            The next generation of hiring won&apos;t be defined by better recruiting software. It
            won&apos;t be defined by larger candidate databases or faster automation.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            It will be defined by systems that continuously understand talent, intelligently
            coordinate hiring workflows, improve candidate experiences, and accelerate hiring
            outcomes.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            We call this: Agentic Hiring™.
            <span className="mt-2 block text-base font-medium text-white/70 md:text-lg">
              Where Human Intelligence and Artificial Intelligence work together to continuously
              move hiring forward.
            </span>
          </p>
          <p className="mt-6 text-lg font-semibold text-white md:text-xl">
            Welcome to the future of hiring.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for Human + AI Hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#agentic-hiring" className={primaryCtaClass}>
              Explore Agentic Hiring™
            </Link>
            <Link href="/demo" className={secondaryCtaClass}>
              See Huntlo In Action
            </Link>
            <BookDemoLink className={ghostCtaClass}>Book Enterprise Demo</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12 }}
        >
          <CollaborationVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
