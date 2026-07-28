"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  CONTINUOUS_FORWARD,
  HUMAN_AI_EQUATION,
  INFRA_CHANGES,
  STACK_TODAY,
  STACK_TOMORROW,
} from "@/lib/recruitingAgents";

type RecruitingAgentsSystemsProps = {
  reduceMotion: boolean;
};

export function RecruitingAgentsSystems({ reduceMotion }: RecruitingAgentsSystemsProps) {
  return (
    <>
      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Human + AI Hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              AI doesn&apos;t replace recruiters. It amplifies hiring teams.
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
                <span className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  {item}
                </span>
                {index < HUMAN_AI_EQUATION.length - 1 ? (
                  <span className="text-[#8eb0ff]/60" aria-hidden>
                    +
                  </span>
                ) : null}
              </motion.div>
            ))}
            <span className="text-[#8eb0ff]/60" aria-hidden>
              →
            </span>
            <span className="rounded-2xl border border-[#0050cb]/50 bg-[#0050cb]/25 px-4 py-3 text-sm font-semibold text-white">
              Hiring Outcomes
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Continuous motion
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring should continuously move forward.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything happens intelligently — without recruiters becoming workflow managers.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {CONTINUOUS_FORWARD.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-4"
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

      <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(0,80,203,0.28),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Future enterprise stack
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              The future enterprise hiring stack.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12" style={{ perspective: "1400px" }}>
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
              initial={reduceMotion ? false : { opacity: 0, rotateY: 8 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                Today
              </h3>
              <ul className="mt-6 space-y-2.5">
                {STACK_TODAY.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/55">
                    <span className="text-[0.6rem] tabular-nums text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                    {index < STACK_TODAY.length - 1 ? (
                      <span className="ml-auto text-white/25" aria-hidden>
                        +
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="rounded-3xl border border-[#0050cb]/45 bg-[#0050cb]/15 p-6 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.7)] md:p-8"
              initial={reduceMotion ? false : { opacity: 0, rotateY: -8 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
                Tomorrow
              </h3>
              <ol className="mt-6 space-y-3">
                {STACK_TOMORROW.map((item, index) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1528]/50 px-4 py-3 text-sm font-semibold text-white"
                    animate={
                      reduceMotion
                        ? undefined
                        : { y: [0, index % 2 === 0 ? -3 : 3, 0] }
                    }
                    transition={{
                      duration: 3.2 + index * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.1,
                    }}
                  >
                    <span className="text-[0.6rem] tabular-nums text-[#8eb0ff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Infrastructure shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring intelligence is becoming infrastructure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Future enterprises won&apos;t ask which recruiting software to purchase. They&apos;ll
              ask how intelligently hiring can continuously move itself forward.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {INFRA_CHANGES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-4 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-base font-semibold text-[#141b2b]">
            Everything intelligently connected.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/agentic-hiring"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Agentic Hiring
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/ai-recruiting-agent"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI Recruiting Agents
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/ai-hiring-infrastructure"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI Hiring Infrastructure
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
