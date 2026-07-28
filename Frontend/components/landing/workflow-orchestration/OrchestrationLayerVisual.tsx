"use client";

import { motion } from "motion/react";

import { HERO_ORCHESTRATION_NODES } from "@/lib/workflowOrchestration";

type OrchestrationLayerVisualProps = {
  reduceMotion: boolean;
};

const POSITIONS = [
  { x: 18, y: 16 },
  { x: 72, y: 12 },
  { x: 10, y: 38 },
  { x: 78, y: 36 },
  { x: 22, y: 58 },
  { x: 70, y: 56 },
  { x: 14, y: 78 },
  { x: 52, y: 82 },
  { x: 82, y: 76 },
  { x: 48, y: 28 },
] as const;

export function OrchestrationLayerVisual({ reduceMotion }: OrchestrationLayerVisualProps) {
  const floating = HERO_ORCHESTRATION_NODES.slice(0, -1);
  const core = HERO_ORCHESTRATION_NODES[HERO_ORCHESTRATION_NODES.length - 1];

  return (
    <div
      className="relative aspect-[5/4] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,80,203,0.28),_transparent_58%)]" />

      {!reduceMotion ? (
        <motion.div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0050cb]/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.15, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      {floating.map((label, index) => {
        const pos = POSITIONS[index % POSITIONS.length];
        const floatY = reduceMotion ? 0 : index % 2 === 0 ? 6 : -6;
        return (
          <motion.div
            key={label}
            className="absolute max-w-[8.5rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-[#0b1528]/85 px-3 py-2.5 text-center text-[0.65rem] font-medium leading-snug text-white/85 shadow-lg backdrop-blur-sm sm:text-xs"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, floatY, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0.3 }
                : {
                    opacity: { delay: index * 0.05, duration: 0.35 },
                    scale: { delay: index * 0.05, duration: 0.35 },
                    y: { delay: 0.6 + index * 0.08, duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" },
                  }
            }
          >
            {label}
          </motion.div>
        );
      })}

      <motion.div
        className="absolute left-1/2 top-1/2 z-10 w-[8.5rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#0050cb]/55 bg-[#0050cb]/25 px-4 py-5 text-center shadow-[0_0_40px_rgba(0,80,203,0.4)] sm:w-40"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.4 }}
      >
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
          Orchestration layer
        </p>
        <p className="mt-2 text-base font-bold text-white sm:text-lg">{core}</p>
      </motion.div>
    </div>
  );
}
