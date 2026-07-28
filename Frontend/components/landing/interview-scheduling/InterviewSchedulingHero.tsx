"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { POSITIONING_JOURNEY } from "@/lib/interviewScheduling";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { SchedulingSignalVisual } from "./SchedulingSignalVisual";

type InterviewSchedulingHeroProps = {
  reduceMotion: boolean;
};

export function InterviewSchedulingHero({ reduceMotion }: InterviewSchedulingHeroProps) {
  return (
    <>
      <section className="relative overflow-hidden bg-[#070d1a] text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-[#0050cb]/20 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#1a3a8a]/30 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-12 lg:py-32">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
              Scheduling Intelligence
            </p>
            <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.35rem] md:text-[3rem] lg:text-[3.25rem]">
              Candidates shouldn&apos;t experience scheduling.
              <span className="mt-2 block text-white/75">They should experience great hiring.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              Modern recruiting teams don&apos;t struggle because calendars are difficult to manage.
              They struggle because hiring workflows become fragmented between conversations,
              interviews, follow-ups, and candidate experiences.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              Great hiring doesn&apos;t begin when interviews are scheduled. It begins when
              candidates feel every interaction is seamless.
            </p>
            <p className="mt-8 text-lg font-semibold tracking-tight md:text-xl">
              Welcome to Scheduling Intelligence.
              <span className="mt-1 block text-base font-medium text-[#8eb0ff] md:text-lg">
                Built for the future of hiring.
              </span>
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#scheduling-intelligence" className={primaryCtaClass}>
                Explore Scheduling Intelligence
              </Link>
              <BookDemoLink className={secondaryCtaClass}>Book Demo</BookDemoLink>
              <Link href="/demo" className={ghostCtaClass}>
                See Huntlo In Action
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
          >
            <SchedulingSignalVisual reduceMotion={reduceMotion} />
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-14 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Category shift
          </p>
          <h2 className="mt-3 max-w-3xl text-[1.35rem] font-bold tracking-tight text-[#141b2b] md:text-[1.75rem]">
            Calendly sells scheduling. Huntlo sells Hiring Intelligence.
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {POSITIONING_JOURNEY.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-3.5 py-2 text-sm font-medium ${
                    item === "Scheduling Intelligence"
                      ? "border-[#0050cb]/40 bg-[#0050cb]/10 text-[#0050cb]"
                      : "border-[#c3c6d6]/40 bg-[#f7f8fc] text-[#141b2b]"
                  }`}
                >
                  {item}
                </span>
                {index < POSITIONING_JOURNEY.length - 1 ? (
                  <span className="text-[#0050cb]/40" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
