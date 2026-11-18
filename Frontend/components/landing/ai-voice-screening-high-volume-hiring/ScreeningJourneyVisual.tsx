"use client";

import { motion } from "motion/react";

import { SCREENING_JOURNEY_PREVIEW } from "@/lib/aiVoiceScreeningHighVolumeHiring";

type ScreeningJourneyVisualProps = {
  reduceMotion: boolean;
};

export function ScreeningJourneyVisual({ reduceMotion }: ScreeningJourneyVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[420px]" aria-hidden>
      <div className="overflow-hidden rounded-[1.75rem] border border-[#c3c6d6]/40 bg-white p-5 shadow-[0_28px_70px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
          Screening journey
        </p>
        <p className="mt-1 text-sm font-semibold text-[#141b2b]">From invite to human review</p>

        <ol className="mt-5 space-y-3">
          {SCREENING_JOURNEY_PREVIEW.map((step, index) => {
            const isReview = step === "Human review";
            return (
              <motion.li
                key={step}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  isReview
                    ? "border-[#0050cb]/40 bg-[#0050cb]/10"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc]"
                }`}
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold tabular-nums ${
                    isReview ? "bg-[#0050cb] text-white" : "bg-white text-[#0050cb]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isReview ? "text-[#0050cb]" : "text-[#141b2b]"
                  }`}
                >
                  {step}
                </span>
              </motion.li>
            );
          })}
        </ol>

        <p className="mt-4 text-[0.65rem] leading-relaxed text-[#434654]/80">
          Illustrative preview - not a talking avatar or live call UI.
        </p>
      </div>
    </div>
  );
}
