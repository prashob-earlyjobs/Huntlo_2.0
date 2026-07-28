"use client";

import { motion } from "motion/react";

import {
  AI_DISCOVERY_ANIMATION,
  DISCOVERY_IMPROVES,
  INTELLIGENCE_LEARNS,
} from "@/lib/candidateSourcing";

type CandidateSourcingSystemsProps = {
  reduceMotion: boolean;
};

export function CandidateSourcingSystems({ reduceMotion }: CandidateSourcingSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Better outcomes
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                Discovery creates better hiring decisions.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
                The future recruiter won&apos;t spend hours searching. They&apos;ll spend hours
                hiring.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {DISCOVERY_IMPROVES.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="ai-discovery-agents"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              AI Discovery Agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Continuous discovery in motion.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              From signals to outcomes, discovery agents help recruiters move with intelligence —
              not keyword loops.
            </p>
          </div>

          <ol className="mt-12 space-y-3">
            {AI_DISCOVERY_ANIMATION.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.35 }}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex max-w-md items-center gap-4 rounded-full border px-5 py-3.5 ${
                    index === 0 || index === AI_DISCOVERY_ANIMATION.length - 1
                      ? "border-[#0050cb]/50 bg-[#0050cb]/20"
                      : "border-white/12 bg-white/[0.05]"
                  }`}
                >
                  <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-white sm:text-base">{item}</span>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Intelligence driven
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                Talent intelligence powers discovery.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
                Modern recruiting isn&apos;t becoming search driven. It&apos;s becoming intelligence
                driven.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
                Candidate Discovery continuously learns context before recruiters begin making
                hiring decisions.
              </p>
            </div>
            <ul className="space-y-3">
              {INTELLIGENCE_LEARNS.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[#c3c6d6]/40 bg-white px-5 py-4 text-base font-semibold text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 max-w-3xl rounded-3xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Infrastructure shift
            </p>
            <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
              Candidate Discovery is becoming infrastructure.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              The future recruiter won&apos;t ask: where can I search? They&apos;ll ask: what talent
              should I be discovering next?
            </p>
            <p className="mt-4 text-base font-semibold text-[#141b2b]">
              That shift represents one of the largest changes happening across modern recruiting.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
