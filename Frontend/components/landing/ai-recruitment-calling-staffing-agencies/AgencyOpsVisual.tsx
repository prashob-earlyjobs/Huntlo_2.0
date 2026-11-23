"use client";

import { motion } from "motion/react";

type AgencyOpsVisualProps = {
  reduceMotion: boolean;
};

export function AgencyOpsVisual({ reduceMotion }: AgencyOpsVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="space-y-3">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-[#d7e3f4] bg-white p-4 shadow-[0_20px_50px_-40px_rgba(0,80,203,0.35)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Client requirement
            </p>
            <span className="rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
              Urgent
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#141b2b]">Warehouse associates · Hyderabad</p>
          <p className="mt-1 text-xs text-[#5b6478]">Night shift · Start this week · 24 openings</p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.06 }}
          className="rounded-2xl border border-[#d7e3f4] bg-white p-4 shadow-[0_20px_50px_-40px_rgba(0,80,203,0.35)]"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Candidate call
          </p>
          <p className="mt-2 text-sm font-semibold text-[#141b2b]">Ravi M. · Illustrative</p>
          <p className="mt-2 rounded-xl bg-[#f0f5ff] px-3 py-2 text-xs leading-relaxed text-[#5b6478]">
            Interested in night shift. Requests recruiter callback after 6pm.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.12 }}
          className="rounded-2xl border border-[#0050cb]/30 bg-[#f0f5ff] p-4"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Recruiter review
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#141b2b]">Next step ready</p>
            <span className="rounded-full bg-[#0050cb] px-2.5 py-1 text-[0.6rem] font-semibold text-white">
              Callback queued
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
