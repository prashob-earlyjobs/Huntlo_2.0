"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { AGENT_CARDS, HUMAN_AI_EQUATION } from "@/lib/aiRecruitingAgent";

type AiRecruitingAgentStoryProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAgentStory({ reduceMotion }: AiRecruitingAgentStoryProps) {
  return (
    <>
      <section
        id="ai-hiring-intelligence-agents"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet the agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Meet AI Hiring Intelligence Agents™
            </h2>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {AGENT_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.03 }}
                className={card.span}
              >
                <Link
                  href={card.href}
                  className="group flex h-full flex-col justify-between rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 transition-colors hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]"
                >
                  <div>
                    <p className="text-base font-bold text-[#141b2b] group-hover:text-[#0050cb]">
                      {card.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#434654]">
                      {card.description}
                    </p>
                  </div>
                  <span className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                    Explore
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Human + AI Hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Human + AI Hiring.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Future organizations won&apos;t choose humans or artificial intelligence. They&apos;ll
              choose Human + AI Hiring™.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {HUMAN_AI_EQUATION.map((item, index) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 md:gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.4 }}
              >
                <span className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  {item}
                </span>
                {index < HUMAN_AI_EQUATION.length - 1 ? (
                  <span className="text-[#8eb0ff]/55" aria-hidden>
                    +
                  </span>
                ) : null}
              </motion.div>
            ))}
            <span className="text-[#8eb0ff]/55" aria-hidden>
              →
            </span>
            <motion.span
              className="rounded-2xl border border-[#0050cb]/50 bg-[#0050cb]/25 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,80,203,0.35)]"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.4 }}
            >
              Hiring Outcomes
            </motion.span>
          </div>
        </div>
      </section>
    </>
  );
}
