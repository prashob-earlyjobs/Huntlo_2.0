"use client";

import { motion } from "motion/react";

import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiRecruitingAutomationMultiLocationBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationMultiLocationBuildSection({
  reduceMotion,
}: AiRecruitingAutomationMultiLocationBuildSectionProps) {
  return (
    <section className="bg-[#0050cb] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white/5 p-8 md:p-12 border border-white/10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <h2 className="text-[1.75rem] font-bold tracking-tight text-white sm:text-[2.25rem]">
            Make Distributed Hiring More Coordinated
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#c1cfff] md:text-lg">
            Huntlo&apos;s agentic recruiting direction offers a framework for
            thinking about how recruiting workflows can operate across
            locations. Start by identifying the handoffs that cause the most
            delays. Determine which actions should follow shared rules and
            which require local decisions. Then evaluate how automation can
            support a more connected process. The goal is not simply to
            centralize recruiting. It is to make distributed hiring easier to
            coordinate.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link href="#distributed-workflow" className={primaryCtaClass}>
              Explore Multi-Location Recruiting Workflows
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
