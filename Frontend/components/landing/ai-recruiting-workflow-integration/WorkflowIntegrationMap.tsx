"use client";

import { motion } from "motion/react";

type WorkflowIntegrationMapProps = {
  reduceMotion: boolean;
};

const HUNTLO_LAYERS = [
  { name: "SOURCE", detail: "Candidate discovery" },
  { name: "ENGAGE", detail: "Candidate communication" },
  { name: "ANALYZE", detail: "Recruiting signals" },
] as const;

const EXTERNAL_SYSTEMS = [
  { name: "ATS", detail: "Candidate records" },
  { name: "Calendar", detail: "Interview coordination" },
  { name: "Email / chat", detail: "Conversations" },
] as const;

export function WorkflowIntegrationMap({ reduceMotion }: WorkflowIntegrationMapProps) {
  return (
    <div className="relative mx-auto w-full max-w-[470px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Recruiting integration map
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">
              Event → context → permitted action
            </p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
          <div className="space-y-2">
            {HUNTLO_LAYERS.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.06 }}
                className="rounded-xl border border-[#0050cb]/25 bg-[#f0f5ff] px-3 py-2.5"
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#0050cb]">
                  {layer.name}
                </p>
                <p className="mt-0.5 text-[0.68rem] leading-snug text-[#5b6478]">
                  {layer.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5">
            {HUNTLO_LAYERS.map((layer) => (
              <span
                key={layer.name}
                className="h-px w-6 border-t border-dashed border-[#9db6e3] sm:w-8"
              />
            ))}
            <span className="rounded-full border border-[#d7e3f4] bg-white px-2 py-1 text-center text-[0.55rem] font-semibold uppercase leading-tight tracking-[0.08em] text-[#8a93a8]">
              Rules
            </span>
          </div>

          <div className="space-y-2">
            {EXTERNAL_SYSTEMS.map((system, index) => (
              <motion.div
                key={system.name}
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.1 + index * 0.06 }}
                className="rounded-xl border border-dashed border-[#c3c6d6] bg-[#fafbfd] px-3 py-2.5"
              >
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#434654]">
                  {system.name}
                </p>
                <p className="mt-0.5 text-[0.68rem] leading-snug text-[#8a93a8]">
                  {system.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#e8eef7]" />
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
            Human review retained
          </span>
          <span className="h-px flex-1 bg-[#e8eef7]" />
        </div>
      </div>
    </div>
  );
}
