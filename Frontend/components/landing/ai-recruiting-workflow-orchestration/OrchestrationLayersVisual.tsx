"use client";

import { motion } from "motion/react";

import { HERO_LAYERS } from "@/lib/aiRecruitingWorkflowOrchestration";

type OrchestrationLayersVisualProps = {
  reduceMotion: boolean;
};

export function OrchestrationLayersVisual({ reduceMotion }: OrchestrationLayersVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Event-driven flow
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">Trigger → review</p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <div className="mt-5 space-y-2">
          {HERO_LAYERS.map((layer, index) => (
            <motion.div
              key={layer.label}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
              className={`rounded-xl border px-3.5 py-3 ${
                layer.label === "Review" || layer.label === "Exception"
                  ? "border-[#0050cb]/30 bg-[#f0f5ff]"
                  : "border-[#e8eef7] bg-[#fafbfd]"
              }`}
              style={{ marginLeft: `${8}px`, marginRight: `${(HERO_LAYERS.length - 1 - index) * 8}px` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">{layer.label}</p>
                </div>
                <p className="text-right text-xs text-[#5b6478]">{layer.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
