"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { TALENT_POOL_INTERNAL_LINKS } from "@/lib/aiTalentPoolEngagement";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiTalentPoolEngagementBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiTalentPoolEngagementBuildSection({
  reduceMotion,
}: AiTalentPoolEngagementBuildSectionProps) {
  return (
    <section
      id="build-a-talent-pool-for-future-hiring"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
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
              Build a Talent Pool That Supports Future Hiring
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo&apos;s SOURCE and ENGAGE positioning provides a framework for
              thinking about candidate discovery and relationship continuity.
              Begin with one relevant talent segment. Review the quality of
              existing candidate information. Define an appropriate engagement
              strategy. Then evaluate how AI-assisted workflows can support
              meaningful communication over time.
            </p>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[#141b2b] md:text-lg">
              A talent pool should not simply preserve candidate records. It
              should preserve the possibility of relevant future conversations.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#talent-pool-workflow" className={primaryCtaClass}>
                Explore Talent Pool Engagement
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
            className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-6 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
              Start here
            </p>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[#434654]">
              <li className="flex gap-3">
                <span className="font-semibold text-[#0050cb]">1.</span>
                Choose one talent segment with a real future hiring need.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#0050cb]">2.</span>
                Review record accuracy, preferences, and contact permissions.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[#0050cb]">3.</span>
                Define what counts as a relevant reason to make contact.
              </li>
            </ol>

            <div className="mt-6 border-t border-[#e8eef7] pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                Related reading
              </p>
              <ul className="mt-3 space-y-1">
                {TALENT_POOL_INTERNAL_LINKS.map((link) => (
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
