"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type RecruitmentAgencyAutomationBuildSectionProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationBuildSection({
  reduceMotion,
}: RecruitmentAgencyAutomationBuildSectionProps) {
  return (
    <section
      id="build-agency-operations"
      className="bg-[#0050cb] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <h2 className="text-[1.75rem] font-bold tracking-tight text-white sm:text-[2.25rem]">
            Build Around the Work Your Recruiters Repeat
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#c1cfff] md:text-lg">
            Huntlo&apos;s agentic recruiting direction is a way to examine the
            coordination work inside an agency. Begin with the operational step
            that most often delays a submission. Define what information must
            travel with it. Decide which decisions stay with recruiters. Then
            evaluate how connected workflows can improve consistency without
            changing the relationships your agency depends on.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link href="#agency-workflow" className={primaryCtaClass}>
              Explore Agency Recruitment Automation
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Huntlo Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
