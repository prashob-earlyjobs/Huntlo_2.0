"use client";

import { motion } from "motion/react";

import { HERO_COLLABORATION_FLOW } from "@/lib/agenticHiring";

type CollaborationVisualProps = {
  reduceMotion: boolean;
};

export function CollaborationVisual({ reduceMotion }: CollaborationVisualProps) {
  const centerIndex = 0;
  const ring = HERO_COLLABORATION_FLOW.slice(1, -1);
  const outcome = HERO_COLLABORATION_FLOW[HERO_COLLABORATION_FLOW.length - 1];

  return (
    <div
      className="relative aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md sm:p-8"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,80,203,0.25),_transparent_62%)]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {ring.map((_, index) => {
          const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 32;
          const y = 50 + Math.sin(angle) * 32;
          return (
            <line
              key={index}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="rgba(142,176,255,0.28)"
              strokeWidth="0.35"
            />
          );
        })}
      </svg>

      <motion.div
        className="absolute left-1/2 top-1/2 z-10 w-[7.5rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#0050cb]/50 bg-[#0050cb]/25 px-3 py-4 text-center shadow-[0_0_36px_rgba(0,80,203,0.4)] sm:w-36"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
          Center
        </p>
        <p className="mt-1 text-sm font-bold text-white sm:text-base">
          {HERO_COLLABORATION_FLOW[centerIndex]}
        </p>
      </motion.div>

      {ring.map((label, index) => {
        const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2;
        const left = 50 + Math.cos(angle) * 36;
        const top = 50 + Math.sin(angle) * 36;
        return (
          <motion.div
            key={label}
            className="absolute max-w-[7.5rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/12 bg-[#0b1528]/85 px-2.5 py-2 text-center text-[0.65rem] font-medium leading-snug text-white/85 sm:max-w-[8.5rem] sm:text-xs"
            style={{ left: `${left}%`, top: `${top}%` }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.1 + index * 0.06, duration: 0.35 }}
          >
            {label}
          </motion.div>
        );
      })}

      <motion.p
        className="absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2 text-center text-xs font-semibold text-[#8eb0ff] sm:text-sm"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : 0.55 }}
      >
        Continuously working together → {outcome}
      </motion.p>
    </div>
  );
}
