"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/aiRecruitingAgent";

type AgentSignalVisualProps = {
  reduceMotion: boolean;
};

export function AgentSignalVisual({ reduceMotion }: AgentSignalVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/12 bg-gradient-to-b from-white/[0.1] via-[#0a1426]/92 to-[#050914] p-6 shadow-[0_50px_120px_-40px_rgba(0,80,203,0.75)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,80,203,0.45),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(142,176,255,0.12),_transparent_45%)]" />

        {!reduceMotion
          ? Array.from({ length: 22 }).map((_, i) => (
              <motion.span
                key={`ag-${i}`}
                className="absolute rounded-full bg-[#8eb0ff]"
                style={{
                  left: `${8 + ((i * 37) % 84)}%`,
                  top: `${4 + ((i * 43) % 90)}%`,
                  height: i % 3 === 0 ? 3 : 4,
                  width: i % 3 === 0 ? 3 : 4,
                  opacity: 0.55,
                }}
                animate={{
                  opacity: [0.12, 0.95, 0.12],
                  y: [0, i % 2 ? 10 : -10, 0],
                  scale: [1, 1.35, 1],
                }}
                transition={{
                  duration: 2.6 + (i % 5) * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))
          : null}

        <div className="relative mb-5 flex items-center justify-center gap-3">
          <motion.div
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Human
            </p>
            <p className="mt-0.5 text-xs font-bold text-white">Intelligence</p>
          </motion.div>
          <motion.span
            className="text-lg font-light text-[#8eb0ff]"
            animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            +
          </motion.span>
          <motion.div
            className="rounded-2xl border border-[#0050cb]/50 bg-[#0050cb]/20 px-4 py-3 text-center shadow-[0_0_28px_rgba(0,80,203,0.4)]"
            animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              AI
            </p>
            <p className="mt-0.5 text-xs font-bold text-white">Intelligence</p>
          </motion.div>
        </div>

        <motion.div
          className="relative mb-5 rounded-full border border-[#0050cb]/55 bg-[#0050cb]/28 px-4 py-3.5 text-center shadow-[0_0_40px_rgba(0,80,203,0.55)]"
          animate={reduceMotion ? undefined : { y: [0, -3, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
            AI Hiring Intelligence Agents™
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-white sm:text-base">
            {core}
          </p>
          <p className="mt-1 text-[0.65rem] text-white/55">Everything continuously moving.</p>
        </motion.div>

        <ol className="relative space-y-1.5">
          {steps.map((step, index) => (
            <motion.li
              key={step}
              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2 ${
                step === "Hiring Intelligence"
                  ? "border-[#0050cb]/55 bg-[#0050cb]/22"
                  : "border-white/10 bg-[#0b1528]/75"
              }`}
              initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -12 : 12 }}
              animate={
                reduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 1, x: 0, y: [0, index % 2 === 0 ? -2.5 : 2.5, 0] }
              }
              transition={
                reduceMotion
                  ? { delay: index * 0.04, duration: 0.3 }
                  : {
                      opacity: { delay: index * 0.05, duration: 0.35 },
                      x: { delay: index * 0.05, duration: 0.35 },
                      y: {
                        delay: 0.55 + index * 0.04,
                        duration: 3 + (index % 3) * 0.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <span className="text-[0.55rem] font-semibold tabular-nums text-[#8eb0ff]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold text-white/90 sm:text-[0.8125rem]">
                {step}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
