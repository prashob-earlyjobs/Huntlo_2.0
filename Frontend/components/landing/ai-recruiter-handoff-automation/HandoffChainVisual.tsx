"use client";

import { motion } from "motion/react";

type HandoffChainVisualProps = {
  reduceMotion: boolean;
};

const CHAIN = [
  { role: "Sourcer", detail: "Opens the conversation", state: "done" },
  { role: "Recruiter", detail: "Screens and sets expectations", state: "active" },
  { role: "Coordinator", detail: "Confirms the interview", state: "pending" },
  { role: "Hiring manager", detail: "Evaluates the candidate", state: "pending" },
] as const;

const HANDOFF_BRIEF = [
  { label: "Opportunity", value: "Named role and stage" },
  { label: "Confirmed", value: "Availability, preferences" },
  { label: "Pending", value: "Callback at agreed time" },
  { label: "Owner", value: "Delivery recruiter" },
] as const;

export function HandoffChainVisual({ reduceMotion }: HandoffChainVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[470px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Handoff checkpoint
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">
              One candidate · four owners
            </p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <ol className="mt-5 space-y-2">
          {CHAIN.map((item, index) => (
            <motion.li
              key={item.role}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.07 }}
              className="relative flex items-center gap-3"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold ${
                  item.state === "active"
                    ? "bg-[#0050cb] text-white"
                    : item.state === "done"
                      ? "bg-[#eef7ef] text-[#2f7a3d] ring-1 ring-[#cde5d2]"
                      : "bg-[#f5f7fb] text-[#9aa3b5] ring-1 ring-[#e8eef7]"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-lg border border-[#f0f3f9] bg-[#fbfcfe] px-3 py-2">
                <p className="text-xs font-semibold text-[#141b2b]">{item.role}</p>
                <p className="text-[0.68rem] text-[#8a93a8]">{item.detail}</p>
              </div>
              {item.state === "active" && (
                <span className="rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                  Owner
                </span>
              )}
            </motion.li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl border border-[#0050cb]/20 bg-[#f7faff] p-3.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
            Handoff context
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {HANDOFF_BRIEF.map((item) => (
              <div key={item.label}>
                <dt className="text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-[#8a93a8]">
                  {item.label}
                </dt>
                <dd className="text-[0.72rem] font-medium leading-snug text-[#434654]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
