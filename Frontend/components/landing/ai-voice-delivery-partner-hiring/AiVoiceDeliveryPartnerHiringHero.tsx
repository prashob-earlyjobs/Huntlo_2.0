"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiVoiceDeliveryPartnerHiringHeroProps = {
  reduceMotion: boolean;
};

const SERVICE_AREAS = [
  { area: "North zone", tag: "Peak hours", need: "More partners for evening demand" },
  { area: "Central zone", tag: "Fast start", need: "Candidates ready to onboard soon" },
  { area: "South zone", tag: "Unconfirmed", need: "Applicants awaiting availability" },
] as const;

export function AiVoiceDeliveryPartnerHiringHero({
  reduceMotion,
}: AiVoiceDeliveryPartnerHiringHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(37,99,235,0.10),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
            India · Delivery Partner Hiring
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#0b1220] sm:text-[2.4rem] md:text-[3rem]">
            Delivery Partner Hiring Happens at the Speed of Local Demand.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A logistics or delivery business needs additional delivery partners
            in several service areas. The requirement may vary by location. One
            area needs more workers during peak hours. Another needs candidates
            who can begin the onboarding process soon. A third has interested
            applicants who have not yet confirmed their availability. The
            recruitment team has candidate contacts, but it still needs to
            establish who is interested and ready for the next step. That often
            means repeated phone calls. Some candidates want information about
            the work area. Others ask about the nature of the opportunity. Some
            are interested but need a callback.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#0b1220]">
              AI voice recruitment for delivery partner hiring
            </strong>{" "}
            focuses on structured automated conversations that support candidate
            interest checks, location-related questions, and routine recruitment
            coordination. The purpose is to make initial communication more
            manageable while keeping recruiters responsible for candidate
            review and onboarding decisions.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#voice-workflow" className={primaryCtaClass}>
              Explore Delivery Hiring Voice Workflows
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Discuss a Voice Workflow
            </BookDemoLink>
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
          <div
            className="relative mx-auto w-full max-w-[480px]"
            aria-label="Conceptual local delivery hiring voice workflow with service-area cards"
          >
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_24px_60px_-40px_rgba(37,99,235,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                    Hyperlocal hiring
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0b1220]">
                    Three service areas, three different needs
                  </p>
                </div>
                <span className="rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                  Illustrative
                </span>
              </div>

              <div className="space-y-3 px-5 py-5">
                {SERVICE_AREAS.map((area, index) => (
                  <motion.div
                    key={area.area}
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: reduceMotion ? 0 : index * 0.08,
                    }}
                    className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#0b1220]">
                        {area.area}
                      </p>
                      <span className="shrink-0 rounded-full bg-[#eff4ff] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#2563eb]">
                        {area.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#5b6478]">
                      {area.need}
                    </p>
                  </motion.div>
                ))}

                <div className="rounded-xl border border-[#2563eb]/25 bg-[#eff4ff] px-4 py-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#2563eb]">
                    AI voice conversation
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#1e3a8a]">
                    &ldquo;Hi, this is an automated call about delivery partner
                    opportunities in your area. Are you still interested and
                    available?&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="h-px flex-1 bg-[#e8eef7]" />
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                    Recruiter reviews & decides next steps
                  </span>
                  <span className="h-px flex-1 bg-[#e8eef7]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}