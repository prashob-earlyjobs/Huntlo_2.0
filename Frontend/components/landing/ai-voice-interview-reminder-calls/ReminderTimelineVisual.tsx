"use client";

import { motion } from "motion/react";

type ReminderTimelineVisualProps = {
  reduceMotion: boolean;
};

const TIMELINE = [
  { label: "Interview confirmed", detail: "Details recorded", state: "done" },
  { label: "Reminder call", detail: "Attendance check", state: "active" },
  { label: "Recruiter review", detail: "Exceptions routed", state: "pending" },
  { label: "Interview day", detail: "Coordinator prepared", state: "pending" },
] as const;

export function ReminderTimelineVisual({ reduceMotion }: ReminderTimelineVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Interview coordination
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">
              Reminder → response → review
            </p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <ol className="mt-5 space-y-2.5">
          {TIMELINE.map((item, index) => (
            <motion.li
              key={item.label}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
              className="relative flex items-start gap-3 pl-1"
            >
              <span className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    item.state === "active"
                      ? "bg-[#0050cb] ring-4 ring-[#0050cb]/15"
                      : item.state === "done"
                        ? "bg-[#2f7a3d]"
                        : "bg-[#d7dce8]"
                  }`}
                />
              </span>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#141b2b]">{item.label}</p>
                  <p className="text-[0.68rem] text-[#8a93a8]">{item.detail}</p>
                </div>
                {item.state === "active" && (
                  <span className="shrink-0 rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-[#0050cb]">
                    Now
                  </span>
                )}
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl border border-[#e8eef7] bg-[#fbfcfe] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Candidate response
            </p>
            <span className="rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-[#0050cb]">
              To review
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#434654]">
            &ldquo;I can attend, but I will need the exact location and reporting
            time.&rdquo;
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#e8eef7]" />
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
            Recruiter decides next step
          </span>
          <span className="h-px flex-1 bg-[#e8eef7]" />
        </div>
      </div>
    </div>
  );
}
