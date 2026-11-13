"use client";

import { motion } from "motion/react";

import {
  DISCOVERY_UNDERSTANDS,
  FUTURE_DOES,
  TODAY_MANAGES,
} from "@/lib/aiSourcingAgent";

type AiSourcingAgentStoryProps = {
  reduceMotion: boolean;
};

export function AiSourcingAgentStory({ reduceMotion }: AiSourcingAgentStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Becoming intelligence
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Talent Discovery Is Becoming Intelligence.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything intelligently connected.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Today&apos;s recruiters continuously manage
              </h3>
              <ol className="mt-5 space-y-2">
                {TODAY_MANAGES.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#434654] line-through decoration-[#c3c6d6]"
                  >
                    <span className="text-[0.6rem] tabular-nums text-[#c3c6d6]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Future recruiters will simply
              </h3>
              <ol className="mt-5 space-y-2">
                {FUTURE_DOES.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[#141b2b]">
                    <span className="text-[0.6rem] tabular-nums text-[#0050cb]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section
        id="ai-talent-discovery-agents"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Meet the agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Meet AI Talent Discovery Agents™
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Continuously understanding intent, signals, priorities, momentum, and outcomes —
              before recruiters ever begin sourcing.
            </p>
          </div>

          <ul className="mt-10 space-y-3">
            {DISCOVERY_UNDERSTANDS.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-white sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ul>

          <p className="mt-10 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Future organizations won&apos;t ask which candidates they should search for. They&apos;ll
            ask which exceptional talent they should continuously understand better.
          </p>
        </div>
      </section>
    </>
  );
}
