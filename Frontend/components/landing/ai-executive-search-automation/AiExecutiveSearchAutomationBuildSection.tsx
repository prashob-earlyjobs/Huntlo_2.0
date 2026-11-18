"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiExecutiveSearchAutomationBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiExecutiveSearchAutomationBuildSection({
  reduceMotion,
}: AiExecutiveSearchAutomationBuildSectionProps) {
  return (
    <section
      id="give-consultants-more-time"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Give Consultants More Time for the Work That Matters
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s agentic recruiting direction offers a framework for
            evaluating executive search operations. Begin with the tasks that
            create unnecessary administrative friction. Identify where follow-ups,
            research handoffs, and scheduling activities interrupt deeper search
            work.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Define the actions that can be supported by automation. Keep sensitive
            conversations and consequential decisions with the consultant. The
            result should be a more coordinated executive search process that
            preserves the quality of human relationships.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#executive-search-workflow" className={primaryCtaClass}>
              Explore Executive Search Automation
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