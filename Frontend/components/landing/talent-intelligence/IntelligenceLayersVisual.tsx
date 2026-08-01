"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/talentIntelligence";

type IntelligenceLayersVisualProps = {
  reduceMotion: boolean;
};

export function IntelligenceLayersVisual({ reduceMotion }: IntelligenceLayersVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/[0.08] via-[#0a1426]/90 to-[#050914] p-6 shadow-[0_40px_100px_-36px_rgba(0,80,203,0.65)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,_rgba(0,80,203,0.42),_transparent_52%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,9,20,0.2)_40%,rgba(5,9,20,0.55)_100%)]" />

        {!reduceMotion
          ? Array.from({ length: 18 }).map((_, i) => (
              <motion.span
                key={`ti-${i}`}
                className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/75"
                style={{
                  left: `${8 + ((i * 41) % 84)}%`,
                  top: `${5 + ((i * 37) % 88)}%`,
                }}
                animate={{ opacity: [0.12, 0.95, 0.12], scale: [1, 1.35, 1] }}
                transition={{
                  duration: 2.6 + (i % 5) * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))
          : null}

        <motion.div
          className="relative mb-5 rounded-full border border-[#0050cb]/55 bg-[#0050cb]/28 px-4 py-3 text-center shadow-[0_0_40px_rgba(0,80,203,0.55)]"
          animate={reduceMotion ? undefined : { y: [0, -4, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Talent Intelligence™
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-white sm:text-base">
            {core}
          </p>
        </motion.div>

        <ol className="relative space-y-2">
          {steps.map((step, index) => (
            <motion.li
              key={step}
              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 ${
                step === "Talent Signals" || step === "Global Talent"
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
                        duration: 3.1 + (index % 3) * 0.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <span className="text-[0.55rem] font-semibold tabular-nums text-[#8eb0ff]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold text-white/90 sm:text-sm">{step}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
