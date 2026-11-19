"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { ReminderTimelineVisual } from "./ReminderTimelineVisual";

type AiVoiceInterviewReminderCallsHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewReminderCallsHero({
  reduceMotion,
}: AiVoiceInterviewReminderCallsHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(0,80,203,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            India · Interview reminders
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            An Interview Is Scheduled. The Coordination Work Isn&apos;t Finished.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A recruiter schedules interviews for several candidates. Calendar
            invitations have been shared. The hiring managers are prepared. But
            the recruiting team still needs to confirm whether candidates
            understand the interview details and intend to attend.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            Some candidates may need directions. Others may have scheduling
            conflicts. A few may have questions about the interview format. Some
            may be unable to attend and need to inform the recruiter. When a team
            manages many interviews, reminders and confirmations become
            repetitive administrative work.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              AI voice interview reminder calls use structured automated
              conversations to support appropriate interview reminders, attendance
              confirmations, and scheduling-related communication.
            </strong>{" "}
            The goal is to help recruiters coordinate interviews while respecting
            candidate preferences and maintaining human oversight.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#reminder-workflow" className={primaryCtaClass}>
              Explore Interview Reminder Workflows
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
          <ReminderTimelineVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
