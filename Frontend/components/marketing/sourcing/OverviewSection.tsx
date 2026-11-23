"use client";

import { motion } from "motion/react";

type OverviewSectionProps = {
  reduceMotion?: boolean;
};

export function OverviewSection({ reduceMotion = false }: OverviewSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            AI-Powered Candidate Sourcing
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Ranked matches. Enriched profiles. No Boolean grind.
          </h2>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          className="space-y-5 text-base leading-relaxed text-[#434654] md:text-lg"
        >
          <p>
            Hiring managers describe the role once and instantly see a ranked list of best-fit
            candidates. Simply enter what you need - e.g.{" "}
            <span className="font-medium text-[#141b2b]">
              &ldquo;Senior React developers in New York with FinTech experience&rdquo;
            </span>
            . Huntlo&apos;s agentic AI scours 50+ platforms and databases (LinkedIn, GitHub, job
            boards, internal pools, and more) to uncover top talent.
          </p>
          <p>
            Huntlo doesn&apos;t just give you names - it scores and enriches each match. Candidates
            are ranked by relevance based on skills, experience, location, and more. Refine with
            smart filters, save search sessions, and move straight into outreach without the
            legwork.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
