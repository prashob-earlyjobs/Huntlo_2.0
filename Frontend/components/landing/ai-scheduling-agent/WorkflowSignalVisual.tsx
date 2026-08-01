"use client";

import { motion } from "motion/react";

import { HERO_WORKFLOW_FLOW } from "@/lib/aiSchedulingAgent";

type WorkflowSignalVisualProps = {
  reduceMotion: boolean;
};

export function WorkflowSignalVisual({ reduceMotion }: WorkflowSignalVisualProps) {
  const steps = HERO_WORKFLOW_FLOW.slice(0, -1);
  const core = HERO_WORKFLOW_FLOW[HERO_WORKFLOW_FLOW.length - 1];

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md sm:p-7"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_18%,_rgba(0,80,203,0.32),_transparent_55%)]" />
      {!reduceMotion ? (
        <motion.div
          className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-[#0050cb]/50 to-transparent"
          animate={{ x: ["-20%", "20%", "-20%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <motion.div
          className="mb-6 w-full rounded-full border border-white/15 bg-[#0b1528]/90 px-5 py-3 text-center shadow-[0_0_36px_rgba(0,80,203,0.35)]"
          initial={reduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
            AI Workflow Intelligence
          </p>
          <p className="mt-1 text-sm font-semibold text-white sm:text-base">
            Hiring that keeps moving forward
          </p>
        </motion.div>

        <div className="flex w-full flex-wrap justify-center gap-2.5">
          {steps.map((step, index) => (
            <motion.span
              key={step}
              className={`rounded-full border px-3.5 py-2 text-[0.7rem] font-medium sm:text-xs ${
                step === "Workflow Intelligence"
                  ? "border-[#0050cb]/50 bg-[#0050cb]/25 text-white"
                  : "border-white/12 bg-[#0b1528]/80 text-white/85"
              }`}
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
                        delay: 0.5 + index * 0.05,
                        duration: 3.1 + (index % 3) * 0.35,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              {step}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="mt-8 w-[70%] rounded-2xl border border-[#0050cb]/55 bg-[#0050cb]/25 px-4 py-4 text-center shadow-[0_0_36px_rgba(0,80,203,0.4)]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.4, duration: 0.4 }}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            Connected layer
          </p>
          <p className="mt-1 text-base font-bold text-white sm:text-lg">{core}</p>
        </motion.div>
      </div>
    </div>
  );
}
