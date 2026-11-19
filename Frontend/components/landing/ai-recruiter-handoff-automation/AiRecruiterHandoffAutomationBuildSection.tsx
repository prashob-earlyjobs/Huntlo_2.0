"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { HANDOFF_INTERNAL_LINKS } from "@/lib/aiRecruiterHandoffAutomation";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiRecruiterHandoffAutomationBuildSectionProps = {
  reduceMotion: boolean;
};

const ADMINISTRATION_SIGNALS = [
  "Every handoff needs the same minimum context",
  "Routine transfers do not require a new form per step",
  "Complex cases still reach a recruiter who can judge them",
] as const;

export function AiRecruiterHandoffAutomationBuildSection({
  reduceMotion,
}: AiRecruiterHandoffAutomationBuildSectionProps) {
  return (
    <section
      id="collaboration-without-extra-administration"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              Improve Collaboration Without Adding More Administration
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              A handoff process should not create excessive documentation
              requirements. If recruiters must complete several forms every time
              responsibility changes, the workflow may become another source of
              friction. The objective is to preserve essential context with
              minimal unnecessary effort.
            </p>
            <ul className="mt-6 space-y-2">
              {ADMINISTRATION_SIGNALS.map((signal) => (
                <li key={signal} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0050cb]" />
                  <p className="text-base leading-relaxed text-[#434654]">
                    {signal}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              Automation can be evaluated for routine coordination while leaving
              complex judgment with recruiters.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#handoff-workflow" className={primaryCtaClass}>
                Explore Recruiter Handoff Workflows
              </Link>
              <BookDemoLink className={secondaryCtaClass}>
                Book a Huntlo Demo
              </BookDemoLink>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
          >
            <div className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8">
              <h3 className="text-lg font-semibold leading-snug text-[#141b2b]">
                Build a More Connected Recruiting Team
              </h3>
              <p className="mt-4 text-base leading-relaxed text-[#434654]">
                Huntlo&apos;s agentic recruiting direction provides a framework
                for improving the transitions between recruiting activities.
                Begin with a handoff that repeatedly causes delays or confusion.
                Identify the information required by the next person. Define
                ownership and exception rules. Then evaluate how software
                workflows can support continuity.
              </p>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#141b2b]">
                A successful handoff is one where the next recruiter understands
                the situation without forcing the candidate to start over.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#d7e3f4] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                Related reading
              </p>
              <ul className="mt-4 space-y-2">
                {HANDOFF_INTERNAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-[#141b2b] transition-colors hover:bg-[#f0f5ff] hover:text-[#0050cb]"
                    >
                      {link.label}
                      <span
                        className="text-[#8a93a8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0050cb]"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
