"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/agenticHiring";

type CollaborationVisualProps = {
  reduceMotion: boolean;
};

export function CollaborationVisual({ reduceMotion }: CollaborationVisualProps) {
  const human = HERO_FLOW[0];
  const ai = HERO_FLOW[1];
  const mid = HERO_FLOW.slice(2, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[480px] [perspective:1700px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-gradient-to-b from-white/[0.1] via-[#0a1426]/92 to-[#02050c] p-6 shadow-[0_55px_130px_-42px_rgba(0,80,203,0.8)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-5%,_rgba(0,80,203,0.5),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,_rgba(26,58,138,0.4),_transparent_42%)]" />

        {!reduceMotion ? (
          <>
            {Array.from({ length: 26 }).map((_, i) => (
              <motion.span
                key={`ag-${i}`}
                className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/85"
                style={{
                  left: `${6 + ((i * 33) % 88)}%`,
                  top: `${4 + ((i * 49) % 92)}%`,
                }}
                animate={{
                  opacity: [0.08, 1, 0.08],
                  scale: [1, 1.7, 1],
                  y: [0, i % 2 === 0 ? -9 : 9, 0],
                }}
                transition={{
                  duration: 2.5 + (i % 6) * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              />
            ))}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0050cb]/22"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 58, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
          </>
        ) : null}

        <div className="relative flex items-center justify-center gap-2">
          <motion.span
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
          >
            {human}
          </motion.span>
          <span className="text-[#8eb0ff]" aria-hidden>
            +
          </span>
          <motion.span
            className="rounded-full border border-[#0050cb]/55 bg-[#0050cb]/28 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_28px_rgba(0,80,203,0.5)]"
            animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          >
            {ai}
          </motion.span>
        </div>

        <div className="relative mt-5 flex flex-col items-center gap-2">
          {mid.map((step, index) => (
            <motion.div
              key={step}
              className={`w-full rounded-2xl border px-3.5 py-2 text-center ${
                step === "Agentic Hiring"
                  ? "border-[#0050cb]/60 bg-[#0050cb]/28 shadow-[0_0_32px_rgba(0,80,203,0.45)]"
                  : "border-white/10 bg-[#0b1528]/82"
              }`}
              initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
              animate={
                reduceMotion
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: 1,
                      y: [0, index % 2 === 0 ? -3 : 3, 0],
                      scale: 1,
                    }
              }
              transition={
                reduceMotion
                  ? { delay: index * 0.04, duration: 0.3 }
                  : {
                      opacity: { delay: 0.12 + index * 0.05, duration: 0.35 },
                      scale: { delay: 0.12 + index * 0.05, duration: 0.35 },
                      y: {
                        delay: 0.7 + index * 0.04,
                        duration: 3.1 + (index % 3) * 0.28,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <p className="text-[0.7rem] font-semibold text-white/90 sm:text-xs">
                {step === "Agentic Hiring" ? "Agentic Hiring™" : step}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative mt-5 rounded-2xl border border-[#0050cb]/65 bg-[#0050cb]/38 px-5 py-4 text-center shadow-[0_0_44px_rgba(0,80,203,0.6)]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.7, duration: 0.45 }}
        >
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Thought leadership
          </p>
          <p className="mt-1 text-base font-bold text-white sm:text-lg">{core}</p>
        </motion.div>
      </div>
    </div>
  );
}
