"use client";

import { motion } from "motion/react";

import { HERO_FLOW } from "@/lib/talentPipeline";

type TalentNetworkVisualProps = {
  reduceMotion: boolean;
};

const NODES = [
  { label: "Discovery", x: 18, y: 18 },
  { label: "Context", x: 72, y: 14 },
  { label: "Relationships", x: 48, y: 38 },
  { label: "Conversations", x: 16, y: 58 },
  { label: "Momentum", x: 78, y: 56 },
  { label: "Confidence", x: 34, y: 78 },
  { label: "Outcomes", x: 68, y: 82 },
] as const;

const EDGES: Array<[number, number]> = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 6],
  [2, 5],
  [2, 6],
];

export function TalentNetworkVisual({ reduceMotion }: TalentNetworkVisualProps) {
  const steps = HERO_FLOW.slice(0, -1);
  const core = HERO_FLOW[HERO_FLOW.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/[0.08] via-[#0a1426]/90 to-[#050914] p-5 shadow-[0_40px_100px_-36px_rgba(0,80,203,0.65)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(0,80,203,0.35),_transparent_55%)]" />

        {!reduceMotion
          ? Array.from({ length: 16 }).map((_, i) => (
              <motion.span
                key={`signal-${i}`}
                className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/70"
                style={{
                  left: `${8 + ((i * 37) % 84)}%`,
                  top: `${5 + ((i * 43) % 88)}%`,
                }}
                animate={{ opacity: [0.12, 0.85, 0.12], scale: [1, 1.4, 1] }}
                transition={{
                  duration: 2.6 + (i % 5) * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.08,
                }}
              />
            ))
          : null}

        <div className="relative mb-4 aspect-[5/4] w-full">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
            {EDGES.map(([a, b], index) => {
              const from = NODES[a];
              const to = NODES[b];
              return (
                <motion.line
                  key={`edge-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="rgba(142,176,255,0.35)"
                  strokeWidth="0.5"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: reduceMotion ? 0 : index * 0.05 }}
                />
              );
            })}
          </svg>

          {NODES.map((node, index) => (
            <motion.div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, index % 2 === 0 ? -3 : 3, 0], scale: [1, 1.04, 1] }
              }
              transition={{
                duration: 3.2 + (index % 3) * 0.25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1,
              }}
            >
              <div
                className={`rounded-full border px-2 py-1 text-[0.5rem] font-semibold tracking-wide sm:text-[0.55rem] ${
                  node.label === "Relationships"
                    ? "border-[#0050cb]/60 bg-[#0050cb]/30 text-white shadow-[0_0_20px_rgba(0,80,203,0.45)]"
                    : "border-white/15 bg-[#0b1528]/85 text-white/80"
                }`}
              >
                {node.label}
              </div>
            </motion.div>
          ))}

          <motion.div
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0050cb]/55 bg-[#0050cb]/30 px-3 py-2 text-center shadow-[0_0_36px_rgba(0,80,203,0.5)]"
            animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-[0.5rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Network
            </p>
            <p className="text-xs font-bold text-white">{core}</p>
          </motion.div>
        </div>

        <ol className="relative space-y-1.5">
          {steps.map((step, index) => (
            <motion.li
              key={step}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                step === "Talent Relationships"
                  ? "border-[#0050cb]/50 bg-[#0050cb]/20"
                  : "border-white/10 bg-[#0b1528]/80"
              }`}
              initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.3 }}
            >
              <span className="text-[0.5rem] font-semibold tabular-nums text-[#8eb0ff]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.7rem] font-semibold text-white/90 sm:text-xs">{step}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
