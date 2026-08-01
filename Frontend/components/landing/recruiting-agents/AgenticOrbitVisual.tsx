"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/recruitingAgents";

type AgenticOrbitVisualProps = {
  reduceMotion: boolean;
};

export function AgenticOrbitVisual({ reduceMotion }: AgenticOrbitVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[480px] [perspective:1200px]"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] via-[#0b1528]/80 to-[#050914] shadow-[0_40px_100px_-40px_rgba(0,80,203,0.65)]" />
      <div className="absolute inset-[8%] rounded-full border border-white/5 bg-[radial-gradient(circle_at_50%_35%,_rgba(0,80,203,0.35),_transparent_60%)]" />

      {!reduceMotion
        ? Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={`particle-${i}`}
              className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/70"
              style={{
                left: `${12 + ((i * 37) % 76)}%`,
                top: `${8 + ((i * 53) % 84)}%`,
              }}
              animate={{
                opacity: [0.15, 0.85, 0.15],
                y: [0, i % 2 === 0 ? -10 : 10, 0],
              }}
              transition={{
                duration: 3.2 + (i % 5) * 0.45,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.12,
              }}
            />
          ))
        : null}

      <motion.div
        className="absolute inset-[12%] rounded-full border border-[#0050cb]/25"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          reduceMotion
            ? undefined
            : { rotateX: [12, 18, 12], rotateY: [-8, 8, -8], rotateZ: [0, 4, 0] }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[22%] rounded-full border border-white/10"
        animate={reduceMotion ? undefined : { rotate: [0, 360] }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[34%] rounded-full border border-[#0050cb]/20"
        animate={reduceMotion ? undefined : { rotate: [360, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            className={`rounded-full border px-3.5 py-1.5 text-center text-[0.65rem] font-semibold tracking-wide sm:px-4 sm:text-xs ${
              step === "Agentic Hiring" || step === "Human + AI"
                ? "border-[#0050cb]/55 bg-[#0050cb]/30 text-white shadow-[0_0_28px_rgba(0,80,203,0.45)]"
                : "border-white/12 bg-[#0b1528]/85 text-white/85 backdrop-blur-sm"
            }`}
            style={{ zIndex: steps.length - index }}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={
              reduceMotion
                ? { opacity: 1, y: 0 }
                : {
                    opacity: 1,
                    y: [0, index % 2 === 0 ? -4 : 4, 0],
                    scale: 1,
                  }
            }
            transition={
              reduceMotion
                ? { delay: index * 0.04, duration: 0.3 }
                : {
                    opacity: { delay: index * 0.06, duration: 0.4 },
                    scale: { delay: index * 0.06, duration: 0.4 },
                    y: {
                      delay: 0.6 + index * 0.05,
                      duration: 3.4 + (index % 3) * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
            }
          >
            {step}
          </motion.div>
        ))}

        <motion.div
          className="mt-3 rounded-2xl border border-[#0050cb]/60 bg-[#0050cb]/35 px-5 py-3 text-center shadow-[0_0_40px_rgba(0,80,203,0.5)]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.45 }}
        >
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
            Intelligence infrastructure
          </p>
          <p className="mt-1 text-sm font-bold text-white sm:text-base">{core}</p>
        </motion.div>
      </div>
    </div>
  );
}
