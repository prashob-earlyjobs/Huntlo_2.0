"use client";

import { motion } from "motion/react";

type UseCaseSectionProps = {
  reduceMotion?: boolean;
};

export function UseCaseSection({ reduceMotion = false }: UseCaseSectionProps) {
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
                  Operational use case
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.55rem] font-bold leading-tight tracking-tight md:text-[1.9rem]">
                  Hire a sales pod without drowning in follow-ups
                </h2>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-[#8eb0ff]">What teams gain</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">
                  Consistent multi-touch outreach, live reply visibility, and faster handoff into
                  interviews - without promising fixed reply rates.
                </p>
              </div>
            </div>

            <div className="space-y-5 px-8 py-10 text-base leading-relaxed text-[#434654] sm:px-10 md:py-12 md:text-lg">
              <p>
                Imagine needing to hire{" "}
                <span className="font-medium text-[#141b2b]">five sales reps quickly</span>. Instead
                of blasting a spreadsheet of contacts, you enroll a curated prospect list into a
                Huntlo campaign with tailored Email and WhatsApp steps about the opportunity.
              </p>
              <p>
                Huntlo sends the sequence on your timing rules, follows up when there is no reply,
                and surfaces interested responses so recruiters can jump straight into conversation
                - not inbox archaeology.
              </p>
              <p className="rounded-xl border border-[#e1e4ef] bg-white px-4 py-3 text-sm md:text-[0.95rem]">
                Response levels vary by role, market, message quality, and candidate availability.
                Huntlo does not guarantee reply rates; recruiters should review messaging and step
                into high-priority conversations personally.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
