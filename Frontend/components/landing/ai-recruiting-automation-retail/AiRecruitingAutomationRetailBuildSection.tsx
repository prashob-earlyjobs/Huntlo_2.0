"use client";

import { motion } from "motion/react";

import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiRecruitingAutomationRetailBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationRetailBuildSection({
  reduceMotion,
}: AiRecruitingAutomationRetailBuildSectionProps) {
  return (
    <section className="bg-[#f0f5ff] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white p-8 md:p-12 border border-[#d7e3f4] shadow-sm">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Make Store-Level Hiring Easier to Coordinate
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s agentic recruiting direction offers a framework for
            evaluating retail hiring workflows. Begin with one recurring
            hiring process. Identify where candidate communication becomes
            repetitive, where store-level handoffs are delayed and where
            recruiters lack visibility. Define the actions that can be
            automated and those that require a person. Then evaluate how a
            connected workflow can support hiring across locations. The
            objective is a process that works for candidates, recruiters and
            store managers.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link href="#retail-hiring-workflow" className={primaryCtaClass}>
              Explore Retail Recruiting Automation
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Workflow Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
