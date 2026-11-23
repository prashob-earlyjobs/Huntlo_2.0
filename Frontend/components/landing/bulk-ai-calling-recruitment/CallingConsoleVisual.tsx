"use client";

import { motion } from "motion/react";

type CallingConsoleVisualProps = {
  reduceMotion: boolean;
};

const QUEUE = [
  { name: "Priya N.", status: "In review", tone: "review" },
  { name: "Amit K.", status: "Answered", tone: "ok" },
  { name: "Sana R.", status: "Retry later", tone: "wait" },
  { name: "Vikram D.", status: "Queued", tone: "queue" },
] as const;

export function CallingConsoleVisual({ reduceMotion }: CallingConsoleVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <p className="mb-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]/75">
        Illustrative calling console
      </p>

      <motion.div
        className="overflow-hidden rounded-[1.5rem] border border-[#c3c6d6]/45 bg-white shadow-[0_32px_80px_-40px_rgba(0,80,203,0.45)]"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between border-b border-[#e8eaf2] bg-[#f7f8fc] px-4 py-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
              Campaign
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
              Multi-location store hiring
            </p>
          </div>
          <span className="rounded-full bg-[#0050cb]/10 px-2.5 py-1 text-[0.6rem] font-semibold text-[#0050cb]">
            Live · Illustrative
          </span>
        </div>

        <div className="grid gap-3 border-b border-[#e8eaf2] px-4 py-4 sm:grid-cols-3">
          {[
            { label: "Approved list", value: "842" },
            { label: "In progress", value: "36" },
            { label: "Review queue", value: "18" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#e8eaf2] bg-[#f7f8fc] px-3 py-2.5">
              <p className="text-[0.55rem] uppercase tracking-[0.12em] text-[#434654]">{stat.label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-[#141b2b]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#141b2b]">Call status &amp; review</p>
            <div className="flex h-5 items-end gap-0.5">
              {(reduceMotion
                ? [4, 8, 6, 10, 5, 9, 7]
                : [4, 8, 6, 10, 5, 9, 7, 11, 6, 8]
              ).map((h, i) =>
                reduceMotion ? (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-[#0050cb]/55"
                    style={{ height: h }}
                  />
                ) : (
                  <motion.span
                    key={i}
                    className="w-1 origin-bottom rounded-full bg-[#0050cb]/70"
                    style={{ height: h }}
                    animate={{ scaleY: [0.4, 1, 0.55, 1] }}
                    transition={{
                      duration: 1.15 + (i % 4) * 0.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.05,
                    }}
                  />
                ),
              )}
            </div>
          </div>

          <ul className="space-y-2">
            {QUEUE.map((row, index) => (
              <motion.li
                key={row.name}
                className="flex items-center justify-between rounded-xl border border-[#e8eaf2] px-3 py-2.5"
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.05, duration: 0.3 }}
              >
                <span className="text-sm font-medium text-[#141b2b]">{row.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${
                    row.tone === "review"
                      ? "bg-[#0050cb]/12 text-[#0050cb]"
                      : row.tone === "ok"
                        ? "bg-emerald-50 text-emerald-700"
                        : row.tone === "wait"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-[#f1f3ff] text-[#434654]"
                  }`}
                >
                  {row.status}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
