"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiRecruitingOperationsAutomationBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingOperationsAutomationBuildSection({
  reduceMotion,
}: AiRecruitingOperationsAutomationBuildSectionProps) {
  return (
    <section
      id="build-a-more-connected-recruiting-operation"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Build a More Connected Recruiting Operation
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s agentic recruiting direction is centered on the
            opportunity to coordinate recruiting work more effectively. The right
            starting point is a real operational problem. Identify a workflow
            where recruiters repeatedly switch between systems or manually manage
            the same handoffs.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Define what should happen after each event. Establish which decisions
            remain with people. Then evaluate how automation can support the
            process. The aim is not to create a recruitment operation with no
            human involvement. It is to make the work surrounding human decisions
            more reliable.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#recruiting-operations-workflow" className={primaryCtaClass}>
              Explore Recruiting Operations Automation
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