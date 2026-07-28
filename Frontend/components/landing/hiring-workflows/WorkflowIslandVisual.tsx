"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/hiringWorkflows";

type WorkflowIslandVisualProps = {
  reduceMotion: boolean;
};

export function WorkflowIslandVisual({ reduceMotion }: WorkflowIslandVisualProps) {
  const active = HERO_FLOW[Math.floor(HERO_FLOW.length / 2)];

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md sm:p-7"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(0,80,203,0.28),_transparent_55%)]" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        <motion.div
          className="w-full rounded-full border border-white/15 bg-[#0b1528]/90 px-5 py-3 text-center shadow-[0_0_40px_rgba(0,80,203,0.35)]"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
            Live hiring workflow
          </p>
          <p className="mt-1 text-sm font-semibold text-white sm:text-base">{active}</p>
        </motion.div>

        <div className="relative mt-8 w-full">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-[#0050cb]/80 via-white/20 to-[#0050cb]/20" />
          <ul className="relative space-y-3">
            {HERO_FLOW.map((step, index) => {
              const isMid = index === Math.floor(HERO_FLOW.length / 2);
              return (
                <motion.li
                  key={step}
                  initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.35 }}
                  className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-full border px-4 py-2.5 text-xs font-medium sm:text-sm ${
                      isMid
                        ? "border-[#0050cb]/60 bg-[#0050cb]/25 text-white shadow-[0_0_24px_rgba(0,80,203,0.35)]"
                        : "border-white/12 bg-[#0b1528]/75 text-white/80"
                    }`}
                  >
                    {step}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {!reduceMotion ? (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-24 h-3 w-3 -translate-x-1/2 rounded-full bg-[#8eb0ff] shadow-[0_0_20px_rgba(142,176,255,0.8)]"
            animate={{ top: ["6rem", "88%", "6rem"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </div>
    </div>
  );
}
