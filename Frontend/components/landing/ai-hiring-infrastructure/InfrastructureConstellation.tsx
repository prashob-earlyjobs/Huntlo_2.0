"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/aiHiringInfrastructure";

type InfrastructureConstellationProps = {
  reduceMotion: boolean;
};

export function InfrastructureConstellation({ reduceMotion }: InfrastructureConstellationProps) {
  const people = HERO_FLOW[0];
  const ai = HERO_FLOW[1];
  const mid = HERO_FLOW.slice(2, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[480px] [perspective:1600px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.09] via-[#0a1426]/92 to-[#03060f] p-6 shadow-[0_50px_120px_-40px_rgba(0,80,203,0.75)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,80,203,0.45),_transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(26,58,138,0.35),_transparent_45%)]" />

        {!reduceMotion ? (
          <>
            {Array.from({ length: 22 }).map((_, i) => (
              <motion.span
                key={`p-${i}`}
                className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/80"
                style={{
                  left: `${8 + ((i * 37) % 84)}%`,
                  top: `${5 + ((i * 53) % 90)}%`,
                }}
                animate={{
                  opacity: [0.1, 0.95, 0.1],
                  scale: [1, 1.6, 1],
                  y: [0, i % 2 === 0 ? -8 : 8, 0],
                }}
                transition={{
                  duration: 2.8 + (i % 5) * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0050cb]/20"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[48%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
            />
          </>
        ) : null}

        <div className="relative flex items-center justify-center gap-2">
          <motion.span
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
            animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {people}
          </motion.span>
          <span className="text-[#8eb0ff]" aria-hidden>
            +
          </span>
          <motion.span
            className="rounded-full border border-[#0050cb]/50 bg-[#0050cb]/25 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_24px_rgba(0,80,203,0.45)]"
            animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            {ai}
          </motion.span>
        </div>

        <div className="relative mt-5 flex flex-col items-center gap-2">
          {mid.map((step, index) => (
            <motion.div
              key={step}
              className={`w-full rounded-2xl border px-3.5 py-2 text-center ${
                step === "Hiring Intelligence"
                  ? "border-[#0050cb]/55 bg-[#0050cb]/25 shadow-[0_0_28px_rgba(0,80,203,0.35)]"
                  : "border-white/10 bg-[#0b1528]/80"
              }`}
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
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
                      opacity: { delay: 0.15 + index * 0.05, duration: 0.35 },
                      scale: { delay: 0.15 + index * 0.05, duration: 0.35 },
                      y: {
                        delay: 0.7 + index * 0.04,
                        duration: 3.2 + (index % 3) * 0.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <p className="text-[0.7rem] font-semibold text-white/90 sm:text-xs">{step}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative mt-5 rounded-2xl border border-[#0050cb]/60 bg-[#0050cb]/35 px-5 py-4 text-center shadow-[0_0_40px_rgba(0,80,203,0.55)]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.7, duration: 0.45 }}
        >
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            AI Hiring Intelligence Infrastructure
          </p>
          <p className="mt-1 text-base font-bold text-white sm:text-lg">{core}</p>
        </motion.div>
      </div>
    </div>
  );
}
