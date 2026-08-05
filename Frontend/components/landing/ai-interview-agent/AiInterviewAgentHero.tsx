"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { InterviewAgentVisual } from "./InterviewAgentVisual";

type AiInterviewAgentHeroProps = {
  reduceMotion: boolean;
};

export function AiInterviewAgentHero({ reduceMotion }: AiInterviewAgentHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#070d1a] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-[#0050cb]/20 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#1a3a8a]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            Hiring Conversation Intelligence
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.35rem] md:text-[3rem] lg:text-[3.25rem]">
            Great hiring decisions begin with better conversations.
            <span className="mt-2 block text-white/75">
              Interviews are conversations. Not checkpoints.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Modern hiring isn&apos;t limited by the number of interviews organizations conduct.
            It&apos;s limited by the quality of the conversations that happen during them.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Great interviews shouldn&apos;t feel transactional. They should create confidence,
            context, and clarity for everyone involved.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome to Hiring Conversation Intelligence.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for the future of Human + AI Hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/interview-orchestration" className={primaryCtaClass}>
              Explore Interview Intelligence
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
        >
          <InterviewAgentVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
