"use client";

import { motion } from "motion/react";

import { HERO_DISCOVERY_FLOW } from "@/lib/candidateSourcing";

type DiscoveryIslandVisualProps = {
  reduceMotion: boolean;
};

export function DiscoveryIslandVisual({ reduceMotion }: DiscoveryIslandVisualProps) {
  const coreIndex = HERO_DISCOVERY_FLOW.indexOf("Candidate Discovery");
  const core = HERO_DISCOVERY_FLOW[coreIndex] ?? "Candidate Discovery";
  const signals = HERO_DISCOVERY_FLOW.filter((_, i) => i !== coreIndex);

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md sm:p-7"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(0,80,203,0.28),_transparent_58%)]" />

      <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
        <motion.div
          className="w-full rounded-full border border-white/15 bg-[#0b1528]/90 px-5 py-3.5 text-center shadow-[0_0_40px_rgba(0,80,203,0.35)]"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
            Live discovery
          </p>
          <p className="mt-1 text-sm font-semibold text-white sm:text-base">{core}</p>
        </motion.div>

        <div className="mt-8 flex w-full flex-wrap justify-center gap-2.5">
          {signals.map((signal, index) => (
            <motion.span
              key={signal}
              className="rounded-full border border-white/12 bg-[#0b1528]/80 px-3.5 py-2 text-[0.7rem] font-medium text-white/85 sm:text-xs"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={
                reduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: [0, index % 2 === 0 ? -5 : 5, 0] }
              }
              transition={
                reduceMotion
                  ? { delay: index * 0.04, duration: 0.3 }
                  : {
                      opacity: { delay: index * 0.05, duration: 0.35 },
                      y: {
                        delay: 0.5 + index * 0.06,
                        duration: 3.5 + (index % 3),
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              {signal}
            </motion.span>
          ))}
        </div>

        {!reduceMotion ? (
          <motion.div
            className="mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-[#8eb0ff] to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        <p className="mt-6 text-center text-xs font-medium text-[#8eb0ff]">
          Continuously moving signals → Huntlo
        </p>
      </div>
    </div>
  );
}
