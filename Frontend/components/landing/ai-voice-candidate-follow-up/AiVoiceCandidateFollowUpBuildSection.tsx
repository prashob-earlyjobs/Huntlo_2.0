"use client";

import { motion } from "motion/react";

import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiVoiceCandidateFollowUpBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateFollowUpBuildSection({
  reduceMotion,
}: AiVoiceCandidateFollowUpBuildSectionProps) {
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
            Keep Recruiters Focused on Meaningful Conversations
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s AI voice recruitment direction provides an
            opportunity to think about candidate follow-up as a coordinated
            process rather than a collection of reminders. Start by identifying
            the follow-ups that consume the most recruiter time. Separate
            routine confirmations from situations requiring judgment. Define
            the candidate experience and the rules for contact. Then evaluate
            whether voice automation can support those activities. The
            objective is not to automate every conversation. It is to make
            sure the right conversations receive the right attention.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
            <Link href="#voice-follow-up-workflow" className={primaryCtaClass}>
              Explore Voice Follow-Up Automation
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
