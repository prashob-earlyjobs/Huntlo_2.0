"use client";

import { motion } from "motion/react";

import { DESK_REQUISITIONS, REVIEW_QUEUE } from "@/lib/aiRecruitingStaffingAgencies";

type DeskWorkflowVisualProps = {
  reduceMotion: boolean;
};

export function DeskWorkflowVisual({ reduceMotion }: DeskWorkflowVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[480px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.09] via-[#0a1426]/95 to-[#050914] p-5 shadow-[0_40px_100px_-36px_rgba(0,80,203,0.55)] sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,_rgba(0,80,203,0.32),_transparent_55%)]" />

        <div className="relative grid gap-4 sm:grid-cols-2">
          <motion.div
            className="rounded-2xl border border-white/10 bg-[#0b1528]/85 p-4"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
              Client requisitions
            </p>
            <ul className="mt-3 space-y-2">
              {DESK_REQUISITIONS.map((item, index) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
                >
                  <p className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]/70">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-snug text-white/90">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-[#0050cb]/40 bg-[#0050cb]/15 p-4"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08 }}
          >
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
              Recruiter review queue
            </p>
            <ul className="mt-3 space-y-2">
              {REVIEW_QUEUE.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0b1528]/70 px-3 py-2.5"
                >
                  <span className="text-xs font-semibold text-white">{item.name}</span>
                  <span className="text-[0.65rem] text-white/55">{item.status}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.65rem] leading-relaxed text-white/45">
              Illustrative desk view - not a live product screenshot.
            </p>
          </motion.div>
        </div>

        <div className="relative mt-4 flex items-center justify-center gap-2">
          <span className="h-px flex-1 bg-white/10" />
          <span className="rounded-full border border-[#0050cb]/35 bg-[#0050cb]/20 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
            One visible path
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
