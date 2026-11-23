"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { FACILITY_INTERNAL_LINKS } from "@/lib/aiVoiceSecurityFacilityStaffing";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiVoiceSecurityFacilityStaffingBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiVoiceSecurityFacilityStaffingBuildSection({
  reduceMotion,
}: AiVoiceSecurityFacilityStaffingBuildSectionProps) {
  return (
    <section
      id="make-facility-staffing-recruitment-organized"
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
              Make Facility Staffing Recruitment More Organized
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo&apos;s AI voice recruitment direction provides a framework
              for improving repetitive first-contact work in security and
              facility staffing. Start with one role category or client site.
              Identify the questions recruiters repeatedly ask. Define which
              responses require human review. Then evaluate how voice automation
              can support the process.
            </p>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[#141b2b] md:text-lg">
              The objective is not simply to increase the number of candidates
              contacted. It is to make recruitment communication clearer, more
              relevant, and easier to coordinate.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#facility-voice-workflow" className={primaryCtaClass}>
                Explore AI Voice for Facility Staffing
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
            className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
              Pilot scope
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#434654]">
              <li>One site or role category with a recurring staffing need.</li>
              <li>The handful of questions recruiters ask every candidate.</li>
              <li>A named reviewer for location, shift, and eligibility exceptions.</li>
            </ul>

            <div className="mt-6 rounded-xl bg-[#fdf8f1] p-4">
              <p className="text-xs leading-relaxed text-[#8a5b18]">
                Responsible calling: automated calls should identify the
                recruiting organization and explain the purpose of contact.
                Organizations must consider applicable Indian telecom, privacy,
                consent, and recording requirements.
              </p>
            </div>

            <div className="mt-6 border-t border-[#e8eef7] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                Related reading
              </p>
              <ul className="mt-3 space-y-1">
                {FACILITY_INTERNAL_LINKS.map((link) => (
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
