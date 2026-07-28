"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/vibeSourcing";

type IntentSignalVisualProps = {
  reduceMotion: boolean;
};

export function IntentSignalVisual({ reduceMotion }: IntentSignalVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/[0.08] via-[#0a1426]/90 to-[#050914] p-6 shadow-[0_40px_100px_-36px_rgba(0,80,203,0.65)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(0,80,203,0.4),_transparent_55%)]" />

        {!reduceMotion
          ? Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={`dot-${i}`}
                className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/75"
                style={{
                  left: `${10 + ((i * 39) % 78)}%`,
                  top: `${6 + ((i * 47) % 86)}%`,
                }}
                animate={{ opacity: [0.15, 0.9, 0.15], y: [0, i % 2 ? 7 : -7, 0] }}
                transition={{
                  duration: 2.6 + (i % 4) * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))
          : null}

        <div className="relative mb-5 rounded-2xl border border-white/10 bg-[#0b1528]/70 px-3 py-2.5">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/35 line-through">
            Java · 5 years · Remote · Bangalore
          </p>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
            Intent → Intelligence
          </p>
        </div>

        <motion.div
          className="relative mb-5 rounded-full border border-[#0050cb]/50 bg-[#0050cb]/25 px-4 py-3 text-center shadow-[0_0_32px_rgba(0,80,203,0.45)]"
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Intent Driven Discovery
          </p>
          <p className="mt-1 text-sm font-bold text-white sm:text-base">{core}</p>
        </motion.div>

        <div className="relative flex flex-col gap-2">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              className={`rounded-2xl border px-3.5 py-2.5 text-center ${
                step === "Hiring Intent"
                  ? "border-[#0050cb]/50 bg-[#0050cb]/20"
                  : "border-white/10 bg-[#0b1528]/80"
              }`}
              initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
              animate={
                reduceMotion
                  ? { opacity: 1, x: 0 }
                  : { opacity: 1, x: 0, y: [0, index % 2 === 0 ? -3 : 3, 0] }
              }
              transition={
                reduceMotion
                  ? { delay: index * 0.04, duration: 0.3 }
                  : {
                      opacity: { delay: index * 0.05, duration: 0.35 },
                      x: { delay: index * 0.05, duration: 0.35 },
                      y: {
                        delay: 0.5 + index * 0.04,
                        duration: 3 + (index % 3) * 0.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <p className="text-xs font-semibold text-white/90 sm:text-sm">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
