"use client";

import { motion } from "motion/react";

import { HERO_THREAD, SEQUENCE_TIMELINE } from "@/lib/automatedCandidateFollowUp";

type FollowUpThreadVisualProps = {
  reduceMotion: boolean;
};

export function FollowUpThreadVisual({ reduceMotion }: FollowUpThreadVisualProps) {
  return (
    <div className="relative w-full" aria-hidden>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-4 lg:gap-5">
        <motion.div
          className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-4 text-left shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-5"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Candidate thread
            </p>
            <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
              Illustrative
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#141b2b]">Alex Rivera · Product Eng</p>

          <ul className="mt-4 space-y-2.5">
            {HERO_THREAD.map((msg, index) => (
              <motion.li
                key={`${msg.label}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`rounded-xl border px-3 py-2.5 ${
                  msg.from === "candidate"
                    ? "border-[#0050cb]/25 bg-[#f0f5ff]"
                    : msg.from === "system"
                      ? "border-dashed border-[#d7e3f4] bg-[#fafbfd]"
                      : "border-[#e8eef7] bg-[#f8fafc]"
                }`}
              >
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                  {msg.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#141b2b]">{msg.body}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="h-fit overflow-hidden rounded-2xl border border-[#d7e3f4] bg-[#fafbfd] p-4 text-left sm:p-5"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08 }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
            Sequence timeline
          </p>
          <ol className="mt-4 space-y-3">
            {SEQUENCE_TIMELINE.map((item) => (
              <li key={item.day} className="relative pl-4">
                <span
                  className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${
                    item.branch === "stop" ? "bg-[#0050cb]" : "bg-[#a8c0e8]"
                  }`}
                />
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#8a93a8]">
                  {item.day}
                </p>
                <p
                  className={`mt-0.5 text-xs font-semibold ${
                    item.branch === "stop" ? "text-[#0050cb]" : "text-[#141b2b]"
                  }`}
                >
                  {item.action}
                </p>
                {item.branch === "stop" ? (
                  <p className="mt-1 rounded-md bg-[#f0f5ff] px-2 py-1 text-[0.6rem] font-medium leading-snug text-[#0050cb]">
                    Branch: reply → pause automation
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
