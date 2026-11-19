"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { WorkflowIntegrationMap } from "./WorkflowIntegrationMap";

type AiRecruitingWorkflowIntegrationHeroProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowIntegrationHero({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[26rem] w-[26rem] rounded-full bg-[#dbe8ff]/60 blur-[120px]" />
        <div className="absolute -right-10 bottom-0 h-[22rem] w-[22rem] rounded-full bg-[#eef3ff] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            United States · Workflow integration
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            Your Recruiting Tools Should Work Together. Your Recruiters Shouldn&apos;t
            Have to Connect Everything Manually.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A recruiting team uses several software platforms. An applicant
            tracking system manages candidate records. A sourcing tool helps
            recruiters discover candidates. Communication tools support outreach.
            Calendars coordinate interviews. Each platform serves a purpose — but
            the work connecting them often remains manual.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              AI recruiting workflow integration focuses on connecting recruitment
              activities across systems
            </strong>{" "}
            so information, events, and approved actions can move through a
            coordinated process.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            The objective is not simply to connect software applications. It is to
            make the recruiting workflow itself more consistent.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#integration-framework" className={primaryCtaClass}>
              Explore Connected Recruiting Workflows
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Huntlo Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <WorkflowIntegrationMap reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
