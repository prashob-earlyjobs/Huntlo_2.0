"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { AgentSignalVisual } from "./AgentSignalVisual";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiRecruitingAgentHeroProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAgentHero({ reduceMotion }: AiRecruitingAgentHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[34rem] w-[34rem] rounded-full bg-[#0050cb]/30 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[#1a3a8a]/35 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-[#8eb0ff]/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-40">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8eb0ff]">
            AI Hiring Intelligence Agents™
          </p>
          <h1 className="mt-5 max-w-xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.2rem] lg:text-[3.45rem]">
            Hiring Isn&apos;t Becoming Automated.
            <span className="mt-2 block text-white/75">It&apos;s Becoming Agentic.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            The future of hiring will not be defined by AI recruiters replacing human recruiters. It
            will be defined by Human Intelligence and Artificial Intelligence continuously working
            together to create exceptional hiring outcomes.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Future organizations won&apos;t simply hire faster. They&apos;ll continuously understand
            talent better, create meaningful candidate conversations, intelligently orchestrate
            hiring workflows, improve hiring confidence, and accelerate business outcomes.
          </p>
          <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
            Welcome To AI Hiring Intelligence Agents™.
            <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
              Built for the future of Human + AI Hiring.
            </span>
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
            <Link href="#ai-hiring-intelligence-agents" className={secondaryCtaClass}>
              Meet AI Hiring Intelligence Agents™
            </Link>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.12 }}
        >
          <AgentSignalVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
