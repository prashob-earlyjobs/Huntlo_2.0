"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/hiringOs";

type HiringOsFlowVisualProps = {
  reduceMotion: boolean;
};

export function HiringOsFlowVisual({ reduceMotion }: HiringOsFlowVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const finale = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md sm:p-6"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(0,80,203,0.28),_transparent_55%)]" />

      <div className="relative grid gap-2">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.08 * index, duration: 0.35 }}
            className={`flex items-center gap-3 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div className="max-w-[85%] rounded-xl border border-white/12 bg-[#0b1528]/85 px-3.5 py-2.5 text-xs font-medium text-white/85 sm:text-sm">
              {step}
            </div>
          </motion.div>
        ))}

        <div className="my-1 flex justify-center" aria-hidden>
          <div className="h-8 w-px bg-gradient-to-b from-white/25 to-[#0050cb]" />
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.4 }}
          className="mx-auto w-full max-w-xs rounded-2xl border border-[#0050cb]/50 bg-[#0050cb]/20 px-5 py-5 text-center shadow-[0_0_40px_rgba(0,80,203,0.35)]"
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
            Converges into
          </p>
          <p className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">{finale}</p>
        </motion.div>
      </div>
    </div>
  );
}
