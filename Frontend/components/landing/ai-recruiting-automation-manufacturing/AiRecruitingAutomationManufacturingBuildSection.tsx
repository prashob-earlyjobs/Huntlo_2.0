"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiRecruitingAutomationManufacturingBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationManufacturingBuildSection({
  reduceMotion,
}: AiRecruitingAutomationManufacturingBuildSectionProps) {
  return (
    <section
      id="make-plant-level-hiring-easier"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Make Plant-Level Hiring Easier to Coordinate
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s agentic recruiting direction provides a framework for
            examining the repetitive coordination work surrounding manufacturing
            recruitment. Start with a single facility or recurring hiring category.
            Identify the handoffs that delay candidate progress.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Separate routine communication from qualification decisions requiring
            human review. Then evaluate how connected workflows can support the
            process. The objective is a recruiting operation that responds to
            manufacturing needs without sacrificing accuracy or candidate trust.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#manufacturing-hiring-workflow" className={primaryCtaClass}>
              Explore Manufacturing Recruiting Workflows
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