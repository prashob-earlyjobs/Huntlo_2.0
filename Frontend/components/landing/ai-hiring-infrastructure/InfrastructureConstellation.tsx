"use client";

import { motion } from "motion/react";

type InfrastructureConstellationProps = {
  reduceMotion: boolean;
};

const NODES = [
  { label: "Candidate Discovery", x: "8%", y: "18%" },
  { label: "Talent Intelligence", x: "72%", y: "12%" },
  { label: "AI Recruiting Agents", x: "4%", y: "58%" },
  { label: "Workflow Orchestration", x: "70%", y: "48%" },
  { label: "Candidate Engagement", x: "18%", y: "84%" },
  { label: "Enterprise Hiring", x: "68%", y: "82%" },
] as const;

export function InfrastructureConstellation({
  reduceMotion,
}: InfrastructureConstellationProps) {
  return (
    <div
      className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.55)] backdrop-blur-md sm:p-6"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,80,203,0.2),_transparent_60%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {NODES.map((node) => (
          <line
            key={node.label}
            x1={parseFloat(node.x)}
            y1={parseFloat(node.y)}
            x2="50"
            y2="50"
            stroke="rgba(142,176,255,0.28)"
            strokeWidth="0.35"
          />
        ))}
      </svg>

      {NODES.map((node, index) => (
        <motion.div
          key={node.label}
          className="absolute max-w-[9.5rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-[#0c1528]/80 px-2.5 py-2 text-[0.65rem] font-medium leading-snug text-white/85 shadow-lg backdrop-blur-sm sm:text-xs"
          style={{ left: node.x, top: node.y }}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.2 + index * 0.08, duration: 0.4 }}
        >
          {node.label}
        </motion.div>
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 z-10 w-[min(11rem,42%)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#0050cb]/50 bg-[#0050cb]/20 px-4 py-5 text-center shadow-[0_0_40px_rgba(0,80,203,0.35)] backdrop-blur-md"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.45 }}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
          Intelligent layer
        </p>
        <p className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">Huntlo</p>
      </motion.div>
    </div>
  );
}
