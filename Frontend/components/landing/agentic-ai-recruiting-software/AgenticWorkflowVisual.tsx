"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/agenticAiRecruitingSoftware";

type AgenticWorkflowVisualProps = {
  reduceMotion: boolean;
};

export function AgenticWorkflowVisual({ reduceMotion }: AgenticWorkflowVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Agentic workflow
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">Response → action → review</p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <ol className="mt-5 space-y-0">
          {HERO_FLOW.map((step, index) => (
            <li key={step.label} className="relative">
              {index < HERO_FLOW.length - 1 ? (
                <span className="absolute left-[1.15rem] top-10 h-[calc(100%-0.5rem)] w-px bg-[#d7e3f4]" />
              ) : null}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                className={`relative flex items-start gap-3 rounded-xl border px-3.5 py-3 ${
                  step.kind === "human"
                    ? "border-[#0050cb]/35 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-[#fafbfd]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                    step.kind === "human"
                      ? "bg-[#0050cb] text-white"
                      : "bg-white text-[#0050cb] ring-1 ring-[#d7e3f4]"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#141b2b]">{step.label}</p>
                  <p className="text-xs text-[#5b6478]">{step.detail}</p>
                </div>
                {step.kind === "human" ? (
                  <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb] ring-1 ring-[#0050cb]/20">
                    Approve
                  </span>
                ) : null}
              </motion.div>
              {index < HERO_FLOW.length - 1 ? <div className="h-2" /> : null}
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#e8eef7]" />
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
            Recruiter stays in control
          </span>
          <span className="h-px flex-1 bg-[#e8eef7]" />
        </div>
      </div>
    </div>
  );
}
