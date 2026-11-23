"use client";

import { motion } from "motion/react";

type CustomerStoryProps = {
  reduceMotion?: boolean;
};

export function CustomerStory({ reduceMotion = false }: CustomerStoryProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-[#c3c6d6]/35 bg-white"
        >
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-between gap-8 bg-[#050914] px-8 py-10 text-white sm:px-10 md:py-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                  How this helps
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.55rem] font-bold leading-tight tracking-tight md:text-[1.9rem]">
                  From days of sourcing to a ranked pipeline in minutes
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0050cb] text-sm font-bold">
                  RT
                </div>
                <div>
                  <div className="text-sm font-semibold">Recruitment team</div>
                  <div className="text-xs text-white/60">U.S. multi-city design hire</div>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-8 py-10 text-base leading-relaxed text-[#434654] sm:px-10 md:py-12 md:text-lg">
              <p>
                A recruitment team needed{" "}
                <span className="font-medium text-[#141b2b]">10 UX designers</span> across
                different U.S. cities. In seconds, they got a ranked list of designers in New York
                and San Francisco - complete with full profiles.
              </p>
              <p>
                They saved the best candidates into a pool and launched an outreach campaign in
                minutes - a process that used to take days.
              </p>
              <p className="rounded-xl border border-[#e1e4ef] bg-[#f7f8fc] px-4 py-3 text-sm md:text-[0.95rem]">
                In another case, an enterprise HR lead uploaded a job description PDF, and Huntlo
                parsed it to create the search query automatically.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
