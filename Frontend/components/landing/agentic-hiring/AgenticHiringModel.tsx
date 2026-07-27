"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  AGENTIC_CAPABILITIES,
  AI_HANDLES,
  AI_RECRUITING_TEAM,
  HUMAN_KEEPS,
  RECRUITER_RESPONSIBILITIES,
} from "@/lib/agenticHiring";

type AgenticHiringModelProps = {
  reduceMotion: boolean;
};

export function AgenticHiringModel({ reduceMotion }: AgenticHiringModelProps) {
  const [active, setActive] = useState<string | null>(AI_RECRUITING_TEAM[0]?.name ?? null);

  return (
    <>
      <section
        id="what-is-agentic-hiring"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Definition
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                Meet Agentic Hiring
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
                Agentic Hiring represents a new model of recruiting where AI systems collaborate
                continuously with recruiters across hiring workflows.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
                Rather than automating isolated tasks, intelligent agents work together across the
                hiring journey.
              </p>
              <p className="mt-6 text-xl font-semibold text-[#141b2b]">
                This isn&apos;t automation.
                <span className="mt-1 block text-[#0050cb]">It&apos;s intelligent collaboration.</span>
              </p>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
              {AGENTIC_CAPABILITIES.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/40 bg-white px-4 py-3.5 text-sm font-medium text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="ai-recruiting-team"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              OpenAI Operators for recruiting
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Meet your AI recruiting team
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Specialized agents purpose-built for hiring workflows — collaborating with recruiters,
              not replacing them.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {AI_RECRUITING_TEAM.map((agent, index) => {
              const isOpen = reduceMotion || active === agent.name;
              return (
                <motion.article
                  key={agent.name}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.3 }}
                  onMouseEnter={() => setActive(agent.name)}
                  onFocus={() => setActive(agent.name)}
                  onClick={() => setActive(agent.name)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isOpen}
                  className={`rounded-2xl border p-5 text-left outline-none transition-[border-color,background-color] focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 ${
                    isOpen
                      ? "border-[#0050cb]/50 bg-white/[0.09]"
                      : "border-white/12 bg-white/[0.05] hover:border-white/25"
                  }`}
                >
                  <p className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
                    {agent.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{agent.summary}</p>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="detail"
                        initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm leading-relaxed text-white/80">{agent.detail}</p>
                        <Link
                          href={agent.href}
                          className="mt-4 inline-flex text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          Learn more
                        </Link>
                      </motion.div>
                    ) : (
                      <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-white/35">
                        Tap or hover to expand
                      </p>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Human at the center
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Human recruiters stay at the center of hiring
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              AI should never replace judgment, relationships, candidate experience, negotiations,
              leadership, or business understanding.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                AI should never replace
              </h3>
              <ul className="mt-4 space-y-2">
                {HUMAN_KEEPS.map((item) => (
                  <li key={item} className="text-sm font-medium text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#0050cb]/20 bg-[#f1f3ff] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Recruiters remain responsible for
              </h3>
              <ul className="mt-4 space-y-2">
                {RECRUITER_RESPONSIBILITIES.map((item) => (
                  <li key={item} className="text-sm font-medium text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#c3c6d6]/35 bg-[#070d1a] p-6 text-white">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                AI handles
              </h3>
              <ul className="mt-4 space-y-2">
                {AI_HANDLES.map((item) => (
                  <li key={item} className="text-sm font-medium text-white/85">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-10 text-xl font-semibold text-[#141b2b] md:text-2xl">
            Human + AI creates better hiring outcomes.
          </p>
        </div>
      </section>
    </>
  );
}
