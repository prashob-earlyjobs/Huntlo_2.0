"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { FacilitySitesHeroVisual } from "./FacilitySitesHeroVisual";

type AiVoiceSecurityFacilityStaffingHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceSecurityFacilityStaffingHero({
  reduceMotion,
}: AiVoiceSecurityFacilityStaffingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_5%,_rgba(0,80,203,0.1),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.07fr_0.93fr] lg:items-center lg:gap-16 lg:px-12 lg:py-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            India · Security &amp; facility staffing
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.4rem] md:text-[3rem]">
            Facility Staffing Needs People at the Right Site, on the Right Shift,
            at the Right Time.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A facility management company receives a new staffing requirement. A
            commercial property needs additional housekeeping personnel. Another
            location requires security staff. A third facility is expanding its
            operations team.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            Candidates need to understand where the work is located, what the role
            involves, and which shifts are expected. Some may be interested but
            unable to travel to the site. Others may prefer a different schedule.
            These conversations are repeated across multiple sites and roles.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#141b2b]">
              AI voice recruitment for security and facility staffing focuses on
              structured automated calling to support initial candidate
              engagement, location checks, shift availability questions, and
              routine recruitment coordination.
            </strong>{" "}
            The goal is to organize first-contact communication while preserving
            human responsibility for candidate assessment and required
            verification.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#facility-voice-workflow" className={primaryCtaClass}>
              Explore Facility Staffing Voice Recruitment
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
          <FacilitySitesHeroVisual reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
