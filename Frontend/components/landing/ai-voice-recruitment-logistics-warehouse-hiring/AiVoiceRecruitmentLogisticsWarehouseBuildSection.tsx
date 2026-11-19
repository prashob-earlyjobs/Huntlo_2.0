"use client";

import { motion } from "motion/react";

import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiVoiceRecruitmentLogisticsWarehouseBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiVoiceRecruitmentLogisticsWarehouseBuildSection({
  reduceMotion,
}: AiVoiceRecruitmentLogisticsWarehouseBuildSectionProps) {
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
            Build a Better First-Contact Process
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s AI voice recruitment direction provides a framework
            for improving repetitive candidate communication in logistics
            hiring. Begin with a single role category. Identify the questions
            recruiters repeatedly ask. Determine which responses require human
            attention and how candidate information should be reviewed. Then
            assess where voice automation can support the process. The goal is
            a more dependable recruitment workflow that helps recruiters focus
            on candidates who are ready for a meaningful next conversation.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link href="#voice-workflow" className={primaryCtaClass}>
              Explore AI Voice for Logistics Hiring
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
