"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";

import { AI_VOICE_SCORE_ROWS } from "@/lib/aiVoiceRecruiter";

type SummaryMockSectionProps = {
  reduceMotion?: boolean;
};

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? "fill-[#f5a524] text-[#f5a524]" : "text-[#d0d5dd]"}`}
        />
      ))}
    </span>
  );
}

export function SummaryMockSection({ reduceMotion = false }: SummaryMockSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Structured summaries
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Interview-ready profiles after every call
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            Candidates are scored and tagged - for example Node.js: ★★★★★; Notice Period: 30 days;
            Interested: Yes. Your recruiters review responses or refine questions anytime from
            logged audio and transcripts.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          className="relative mx-auto w-full max-w-sm"
          aria-label="Conceptual phone mockup of a Huntlo call summary"
        >
          <div className="overflow-hidden rounded-[2rem] border border-[#c3c6d6]/40 bg-white shadow-[0_24px_60px_-28px_rgba(20,27,43,0.28)]">
            <div className="border-b border-[#e8eaf2] bg-[#fafbfe] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8fa3]">
                Call summary
              </p>
              <p className="mt-1 text-base font-semibold text-[#141b2b]">Priya Sharma</p>
              <p className="text-xs text-[#5c6070]">MERN Developer · 4:12 call · Hindi / English</p>
            </div>
            <div className="space-y-3 p-5">
              <div className="rounded-xl border border-[#eef0f6] bg-[#f7f8fc] px-3.5 py-3 text-xs leading-relaxed text-[#434654]">
                &ldquo;Yes, I&apos;m open to the role. Notice period is 30 days. Current stack is
                Node and React - about five years in production.&rdquo;
              </div>
              <div className="space-y-2.5">
                {AI_VOICE_SCORE_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#eef0f6] px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-[#141b2b]">{row.label}</span>
                    {typeof row.stars === "number" ? (
                      <Stars count={row.stars} />
                    ) : (
                      <span className="text-sm font-semibold text-[#0f7a45]">{row.detail}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-[#e8f8ef] bg-[#e8f8ef] px-3 py-2 text-xs font-semibold text-[#0f7a45]">
                Shortlisted · ready for recruiter interview
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-[#8a8fa3]">
            Conceptual mobile UI mockup - not a live product screenshot
          </p>
        </motion.div>
      </div>
    </section>
  );
}
