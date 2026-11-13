"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

import {
  AGENTIC_UNDERSTANDS,
  AI_AGENTS,
  ENTERPRISES_DONT_NEED,
  HIRING_CONTINUOUSLY,
  NOT_THE_FUTURE,
  OPERATIONAL_STACK,
  ORG_STRUGGLES,
} from "@/lib/recruitingAgents";

type RecruitingAgentsStoryProps = {
  reduceMotion: boolean;
};

export function RecruitingAgentsStory({ reduceMotion }: RecruitingAgentsStoryProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              The stalled decade
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Recruiting hasn&apos;t changed in decades.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Hiring has become increasingly operational. It needs to become increasingly
              intelligent.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ORG_STRUGGLES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-4 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Modern hiring teams manage
            </p>
            <ol className="mt-5 space-y-3">
              {OPERATIONAL_STACK.map((item, index) => (
                <motion.li
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                  className="flex items-center gap-4 rounded-2xl border border-[#c3c6d6]/30 bg-white px-5 py-4 shadow-sm"
                >
                  <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-[#141b2b] sm:text-base">{item}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="agentic-hiring"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Category creation
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Introducing Agentic Hiring.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              We believe the future isn&apos;t AI Recruiting, Recruitment Automation, or ATS
              Platforms. The future is Agentic Hiring.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {NOT_THE_FUTURE.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/45 line-through decoration-white/30"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            Where intelligent systems continuously understand
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
            {AGENTIC_UNDERSTANDS.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  {item}
                </span>
                {index < AGENTIC_UNDERSTANDS.length - 1 ? (
                  <span className="text-[#8eb0ff]/60" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-white">Everything intelligently connected.</p>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet AI Recruiting Agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Intelligent agents. Continuous hiring motion.
            </h2>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {AI_AGENTS.map((agent, index) => (
              <motion.button
                key={agent.name}
                type="button"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                onMouseEnter={() => setHoveredAgent(agent.name)}
                onMouseLeave={() => setHoveredAgent(null)}
                onFocus={() => setHoveredAgent(agent.name)}
                onBlur={() => setHoveredAgent(null)}
                className={`rounded-2xl border px-5 py-5 text-left transition-all ${
                  hoveredAgent === agent.name
                    ? "border-[#0050cb] bg-[#0050cb] text-white shadow-lg shadow-[#0050cb]/25"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc] text-[#141b2b] hover:border-[#0050cb]/40"
                }`}
              >
                <span className="text-[0.65rem] font-semibold tabular-nums opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-base font-semibold">{agent.name}</p>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    hoveredAgent === agent.name ? "text-white/85" : "text-[#434654]"
                  }`}
                >
                  {agent.blurb}
                </p>
              </motion.button>
            ))}
            <div className="rounded-2xl border border-[#0050cb]/30 bg-[#0050cb]/8 px-5 py-5 md:col-span-2 lg:col-span-3">
              <p className="text-sm font-semibold text-[#0050cb]">Hiring Outcomes</p>
              <p className="mt-2 text-base leading-relaxed text-[#141b2b]">
                What happens when every hiring workflow continuously learns?{" "}
                <Link href="#agentic-hiring" className="font-semibold text-[#0050cb] underline-offset-4 hover:underline">
                  Agentic Hiring.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Beyond automation
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great hiring doesn&apos;t need more automation.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern enterprises don&apos;t need another ATS, sourcing tool, or scheduling
              platform. They need Hiring Intelligence Infrastructure.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {ENTERPRISES_DONT_NEED.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#c3c6d6]/40 bg-white px-4 py-2 text-sm text-[#434654] line-through decoration-[#c3c6d6]"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Imagine hiring that continuously
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HIRING_CONTINUOUSLY.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-base leading-relaxed text-[#434654] md:text-lg">
            Before recruiters ever need to intervene.{" "}
            <Link
              href="/ai-hiring-infrastructure"
              className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore AI Hiring Intelligence Infrastructure
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
