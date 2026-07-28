"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

import {
  HUNTLO360_COMBINES,
  INFRASTRUCTURE_FLOW,
  OS_WORKFLOWS,
  TOOL_RESULTS,
  TOOL_STACK,
} from "@/lib/huntlo360";

type Huntlo360StoryProps = {
  reduceMotion: boolean;
};

export function Huntlo360Story({ reduceMotion }: Huntlo360StoryProps) {
  const [activeWorkflow, setActiveWorkflow] = useState(0);

  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Fragmentation tax
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring was never designed for 15 different tools.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Hiring has become software heavy. It needs to become intelligence driven.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {TOOL_STACK.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]">
                  {item}
                </span>
                {index < TOOL_STACK.length - 1 ? (
                  <span className="text-[#0050cb]/40" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Resulting in
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_RESULTS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="huntlo360"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Introducing Huntlo360
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              One intelligent hiring infrastructure layer.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Huntlo360 intelligently combines discovery, context, conversations, confidence,
              interviews, workflows, momentum, AI Recruiting Agents, and hiring outcomes — through
              one layer.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {HUNTLO360_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  {item}
                </span>
                {index < HUNTLO360_COMBINES.length - 1 ? (
                  <span className="text-[#8eb0ff]/55" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {["No switching tabs.", "No fragmented workflows.", "No disconnected hiring experiences."].map(
              (item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-[#0050cb]/35 bg-[#0050cb]/15 px-5 py-4 text-sm font-semibold text-white"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              One operating system
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Every hiring workflow. Intelligently connected.
            </h2>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OS_WORKFLOWS.map((item, index) => (
              <motion.button
                key={item.title}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                onMouseEnter={() => setActiveWorkflow(index)}
                onFocus={() => setActiveWorkflow(index)}
                className={`rounded-2xl border px-5 py-5 text-left transition-all ${
                  activeWorkflow === index
                    ? "border-[#0050cb] bg-[#0050cb] text-white shadow-lg shadow-[#0050cb]/20"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc] text-[#141b2b] hover:border-[#0050cb]/35"
                }`}
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] opacity-70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-lg font-bold">{item.title}</p>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    activeWorkflow === index ? "text-white/85" : "text-[#434654]"
                  }`}
                >
                  {item.description}
                </p>
              </motion.button>
            ))}
          </div>
          <p className="mt-8 text-base font-semibold text-[#141b2b]">
            Everything intelligently connected.
          </p>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              AI Hiring Intelligence Infrastructure
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Meet AI Hiring Intelligence Infrastructure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything intelligently connected — without recruiters becoming workflow managers.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {INFRASTRUCTURE_FLOW.map((item, index) => (
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
              href="/ai-hiring-infrastructure"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore AI Hiring Intelligence Infrastructure
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
