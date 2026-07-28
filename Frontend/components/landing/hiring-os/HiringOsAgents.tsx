"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  AI_RECRUITING_TEAM,
  BEYOND_SOURCING,
} from "@/lib/hiringOs";

type HiringOsAgentsProps = {
  reduceMotion: boolean;
};

export function HiringOsAgents({ reduceMotion }: HiringOsAgentsProps) {
  const [active, setActive] = useState<string | null>(AI_RECRUITING_TEAM[0]?.name ?? null);

  return (
    <>
      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Beyond sourcing
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                Candidate discovery is only the beginning.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
                Most hiring platforms stop after sourcing candidates. Hiring doesn&apos;t.
              </p>
              <p className="mt-6 text-lg font-semibold text-[#141b2b]">
                Candidate discovery is where hiring begins.
                <span className="mt-1 block text-[#0050cb]">Not where it ends.</span>
              </p>
              <Link
                href="/sourcing"
                className="mt-5 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Explore sourcing
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {BEYOND_SOURCING.map((item, index) => (
                <div key={item} className="flex items-center gap-2 md:gap-3">
                  <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                    {item}
                  </span>
                  {index < BEYOND_SOURCING.length - 1 ? (
                    <span className="text-[#0050cb]/50" aria-hidden>
                      +
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              AI recruiting team
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Meet your AI recruiting team
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Specialized agents that support the Hiring OS — so recruiters spend less time on
              repetitive coordination and more time on hiring judgment.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {AI_RECRUITING_TEAM.map((agent) => {
              const isOpen = reduceMotion || active === agent.name;
              return (
                <motion.article
                  key={agent.name}
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
                  layout={!reduceMotion}
                >
                  <h3 className="text-lg font-semibold tracking-tight text-white">{agent.name}</h3>
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
    </>
  );
}
