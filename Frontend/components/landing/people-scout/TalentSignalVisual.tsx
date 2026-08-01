"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/peopleScout";

type TalentSignalVisualProps = {
  reduceMotion: boolean;
};

export function TalentSignalVisual({ reduceMotion }: TalentSignalVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/[0.08] via-[#0a1426]/90 to-[#050914] p-6 shadow-[0_40px_100px_-36px_rgba(0,80,203,0.65)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,_rgba(0,80,203,0.38),_transparent_58%)]" />

        {!reduceMotion
          ? Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={`sig-${i}`}
                className="absolute h-1.5 w-1.5 rounded-full bg-[#8eb0ff]/70"
                style={{
                  left: `${12 + ((i * 43) % 76)}%`,
                  top: `${8 + ((i * 31) % 84)}%`,
                }}
                animate={{ opacity: [0.2, 0.95, 0.2], scale: [1, 1.35, 1] }}
                transition={{
                  duration: 2.8 + (i % 4) * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }}
              />
            ))
          : null}

        <motion.div
          className="relative mb-6 rounded-full border border-[#0050cb]/50 bg-[#0050cb]/25 px-4 py-3 text-center shadow-[0_0_32px_rgba(0,80,203,0.45)]"
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Talent Discovery Intelligence
          </p>
          <p className="mt-1 text-sm font-bold text-white sm:text-base">{core}</p>
        </motion.div>

        <div className="relative flex flex-col items-center gap-2.5">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              className="w-full rounded-2xl border border-white/10 bg-[#0b1528]/80 px-4 py-2.5 text-center backdrop-blur-sm"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={
                reduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: [0, index % 2 === 0 ? -3 : 3, 0] }
              }
              transition={
                reduceMotion
                  ? { delay: index * 0.05, duration: 0.3 }
                  : {
                      opacity: { delay: index * 0.06, duration: 0.35 },
                      y: {
                        delay: 0.45 + index * 0.05,
                        duration: 3.1 + (index % 3) * 0.25,
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
