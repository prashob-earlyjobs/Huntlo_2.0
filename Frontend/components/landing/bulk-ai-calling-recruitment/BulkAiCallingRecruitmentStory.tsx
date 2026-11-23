"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { WHAT_BULK_MEANS } from "@/lib/bulkAiCallingRecruitment";

type BulkAiCallingRecruitmentStoryProps = {
  reduceMotion: boolean;
};

export function BulkAiCallingRecruitmentStory({
  reduceMotion,
}: BulkAiCallingRecruitmentStoryProps) {
  return (
    <>
      <section className="border-y border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              The bottleneck
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The bottleneck is often the first call.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              High-volume hiring stalls when recruiters must personally dial every lead before
              anyone knows who is interested, available, or ready for a deeper conversation. The
              first call is necessary - but it should not consume the entire team&apos;s day.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Teams evaluating{" "}
              <Link
                href="/ai-voice-recruiter"
                className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                AI Voice Recruiter
              </Link>{" "}
              and{" "}
              <Link
                href="/candidate-sourcing"
                className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Candidate Sourcing
              </Link>{" "}
              usually want the same outcome: consistent first conversations, then human judgment
              where it matters.{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Contact Sales
              </Link>{" "}
              if you want to map this to your workflow.
            </p>
          </div>
        </div>
      </section>

      <section
        id="what-bulk-ai-calling-means"
        className="scroll-mt-24 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              What bulk AI calling means in hiring
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Bulk AI calling is not a promise that every interview becomes automated. It is a way
              to contact an approved candidate group with structured first-stage conversations -
              then bring recruiters in for review and decisions.
            </p>
          </div>

          <ul className="mt-10 space-y-3">
            {WHAT_BULK_MEANS.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-start gap-4 rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-4"
              >
                <span className="mt-0.5 text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium leading-relaxed text-[#141b2b] sm:text-base">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-[#0050cb]/20 bg-white p-6 md:p-10">
            <p className="inline-flex rounded-full border border-[#0050cb]/25 bg-[#f1f3ff] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Illustrative workflow - not a customer result
            </p>
            <h2 className="mt-5 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
              A practical example: a multi-location hiring drive
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
              A team hiring store associates across several cities prepares an approved candidate
              list, confirms calling windows and language settings, and launches a structured
              first-round voice sequence. Interested candidates land in a review queue with short
              summaries; recruiters decide who moves to the next human conversation. Treat this as
              an illustrative workflow for planning - not a verified outcome claim.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
