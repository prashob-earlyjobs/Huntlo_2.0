"use client";

import { motion } from "motion/react";

type VoiceScreeningVisualProps = {
  reduceMotion: boolean;
};

const BARS = [6, 14, 9, 18, 11, 16, 8, 20, 12, 15, 7, 13];

export function VoiceScreeningVisual({ reduceMotion }: VoiceScreeningVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)]">
        <div className="flex items-center justify-between border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Voice screening
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">Customer support · Pune</p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Live · Illustrative
          </span>
        </div>

        <div className="px-4 py-5">
          <div className="flex h-12 items-end justify-center gap-1">
            {BARS.map((h, i) =>
              reduceMotion ? (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-[#0050cb]/55"
                  style={{ height: h }}
                />
              ) : (
                <motion.span
                  key={i}
                  className="w-1.5 origin-bottom rounded-full bg-[#0050cb]/75"
                  style={{ height: h }}
                  animate={{ scaleY: [0.45, 1, 0.6, 1] }}
                  transition={{
                    duration: 1.1 + (i % 4) * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.04,
                  }}
                />
              ),
            )}
          </div>

          <div className="mt-5 space-y-2">
            {[
              { label: "Interest", value: "Yes" },
              { label: "Shift", value: "Evenings OK" },
              { label: "Location", value: "Pune" },
              { label: "Status", value: "Ready for review" },
            ].map((row, index) => (
              <motion.div
                key={row.label}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.08 + index * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-[#e8eef7] bg-[#fafbfd] px-3 py-2.5"
              >
                <span className="text-xs text-[#5b6478]">{row.label}</span>
                <span className="text-sm font-semibold text-[#141b2b]">{row.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
