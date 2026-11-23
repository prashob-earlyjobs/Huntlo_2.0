"use client";

import { motion } from "motion/react";

type SchedulingCalendarVisualProps = {
  reduceMotion: boolean;
};

const SLOTS = [
  { day: "Tue", time: "2:00 PM", state: "candidate" as const },
  { day: "Tue", time: "3:30 PM", state: "busy" as const },
  { day: "Wed", time: "10:00 AM", state: "candidate" as const },
  { day: "Thu", time: "2:30 PM", state: "match" as const },
];

export function SchedulingCalendarVisual({ reduceMotion }: SchedulingCalendarVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)]">
        <div className="flex items-center justify-between border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Interview coordination
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">Availability · confirm</p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-2 rounded-xl border border-[#e8eef7] bg-[#fafbfd] p-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Candidate thread
            </p>
            {[
              { who: "Candidate", text: "Tue 2–4 or Wed morning" },
              { who: "System", text: "Checking manager calendar…" },
              { who: "Match", text: "Thu 2:30 confirmed" },
            ].map((msg, index) => (
              <motion.div
                key={msg.who + msg.text}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.08 }}
                className={`rounded-lg px-2.5 py-2 text-xs leading-relaxed ${
                  msg.who === "Match"
                    ? "bg-[#f0f5ff] text-[#141b2b]"
                    : "bg-white text-[#5b6478] ring-1 ring-[#e8eef7]"
                }`}
              >
                <span className="font-semibold text-[#0050cb]">{msg.who}</span>
                <span className="mt-0.5 block">{msg.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] p-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
              Calendar
            </p>
            <ul className="mt-2 space-y-2">
              {SLOTS.map((slot, index) => (
                <motion.li
                  key={`${slot.day}-${slot.time}`}
                  initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.1 + index * 0.05 }}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs ${
                    slot.state === "match"
                      ? "border border-[#0050cb]/30 bg-[#f0f5ff]"
                      : slot.state === "busy"
                        ? "border border-[#e8eef7] bg-white text-[#8a93a8] line-through"
                        : "border border-[#e8eef7] bg-white"
                  }`}
                >
                  <span className="font-semibold text-[#141b2b]">
                    {slot.day} · {slot.time}
                  </span>
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                    {slot.state === "match"
                      ? "Booked"
                      : slot.state === "busy"
                        ? "Busy"
                        : "Offered"}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
