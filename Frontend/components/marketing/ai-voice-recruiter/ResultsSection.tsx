"use client";

import { motion } from "motion/react";

type ResultsSectionProps = {
  reduceMotion?: boolean;
};

export function ResultsSection({ reduceMotion = false }: ResultsSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc]"
        >
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col justify-between gap-8 bg-[#050914] px-8 py-10 text-white sm:px-10 md:py-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                  Results
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.55rem] font-bold leading-tight tracking-tight md:text-[1.9rem]">
                  Wake up to interview-ready shortlists
                </h2>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-[#8eb0ff]">Example outcome</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">
                  300 applicants → overnight Huntlo Voice AI → 28 qualified candidates with skills,
                  availability, and interest captured.
                </p>
              </div>
            </div>

            <div className="space-y-5 px-8 py-10 text-base leading-relaxed text-[#434654] sm:px-10 md:py-12 md:text-lg">
              <p>
                Imagine hiring agents already qualified when they reach the recruiter. A staffing
                agency had{" "}
                <span className="font-medium text-[#141b2b]">300 applicants for a field job</span>.
                They used Huntlo Voice AI overnight and woke up to a shortlist of{" "}
                <span className="font-medium text-[#141b2b]">28 candidates</span> with full details.
              </p>
              <blockquote className="rounded-xl border border-[#e1e4ef] bg-white px-4 py-3 text-sm italic text-[#141b2b] md:text-[0.95rem]">
                &ldquo;Huntlo&apos;s AI screened dozens of candidates while we slept,&rdquo; reported
                the agency partner.
              </blockquote>
              <p className="text-sm text-[#5c6070] md:text-[0.95rem]">
                Customer scenario. Results vary by role, market, list quality, and
                screening criteria.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
