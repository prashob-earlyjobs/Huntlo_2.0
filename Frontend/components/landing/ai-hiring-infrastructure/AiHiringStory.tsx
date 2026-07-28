"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  AGENTIC_FLOW,
  AGENTIC_MANAGES,
  FEELS_LIKE_INTELLIGENCE,
  FEELS_LIKE_SOFTWARE,
  HUMAN_AI_EQUATION,
  OPERATIONAL_STACK,
} from "@/lib/aiHiringInfrastructure";

type AiHiringStoryProps = {
  reduceMotion: boolean;
};

export function AiHiringStory({ reduceMotion }: AiHiringStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Modern work, outdated design
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring was never designed for modern work.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Hiring became increasingly operational. It&apos;s becoming increasingly intelligent.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {OPERATIONAL_STACK.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-[#c3c6d6]/30 bg-[#f7f8fc] px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-[#141b2b] sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="intelligence-infrastructure"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Category creation
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Introducing AI Hiring Intelligence Infrastructure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              We believe hiring shouldn&apos;t feel like more software. Modern hiring should feel
              intelligently connected.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">
                Shouldn&apos;t feel like
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {FEELS_LIKE_SOFTWARE.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 px-3.5 py-2 text-sm text-white/40 line-through decoration-white/25"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/40 bg-[#0050cb]/15 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Should feel like
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {FEELS_LIKE_INTELLIGENCE.map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white">
                      {item}
                    </span>
                    {index < FEELS_LIKE_INTELLIGENCE.length - 1 ? (
                      <span className="text-[#8eb0ff]/50" aria-hidden>
                        +
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-8 text-lg font-semibold text-white">Everything intelligently connected.</p>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Human + AI Hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              AI doesn&apos;t replace recruiters. AI amplifies hiring teams.
            </h2>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {HUMAN_AI_EQUATION.map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 md:gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.35 }}
              >
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < HUMAN_AI_EQUATION.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </motion.div>
            ))}
            <span className="text-[#0050cb]/50" aria-hidden>
              →
            </span>
            <span className="rounded-2xl border border-[#0050cb] bg-[#0050cb] px-4 py-3 text-sm font-semibold text-white">
              Hiring Outcomes
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Agentic Hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Without recruiters becoming workflow managers.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern hiring shouldn&apos;t require recruiters to continuously manage workflows,
              follow-ups, interviews, candidate experiences, and hiring coordination.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {AGENTIC_MANAGES.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#c3c6d6]/40 bg-white px-4 py-2 text-sm text-[#434654]"
              >
                {item}
              </span>
            ))}
          </div>

          <ol className="mt-10 space-y-3">
            {AGENTIC_FLOW.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-[#141b2b] sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ol>

          <div className="mt-8">
            <Link
              href="/agentic-hiring"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore Agentic Hiring
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
