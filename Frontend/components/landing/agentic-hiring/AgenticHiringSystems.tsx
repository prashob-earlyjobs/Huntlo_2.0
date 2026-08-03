"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  BENTO_CARDS,
  INFRA_CHANGES,
  LEARNING_FLOW,
  STACK_TODAY,
  STACK_TOMORROW,
  WHY_NOT,
  WHY_YES,
} from "@/lib/agenticHiring";

type AgenticHiringSystemsProps = {
  reduceMotion: boolean;
};

export function AgenticHiringSystems({ reduceMotion }: AgenticHiringSystemsProps) {
  return (
    <>
      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Continuous motion
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Agentic Hiring never stops learning.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything intelligently connected.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {LEARNING_FLOW.map((item, index) => (
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
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet AI Recruiting Agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Intelligence that continuously moves hiring forward.
            </h2>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {BENTO_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.03 }}
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
              Infrastructure shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Hiring intelligence is becoming infrastructure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Future enterprises won&apos;t ask which recruiting software to buy. They&apos;ll ask
              how intelligently hiring can continuously improve itself.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INFRA_CHANGES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              href="/ai-hiring-infrastructure"
              className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
            >
              Explore AI Hiring Intelligence Infrastructure
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#02050c] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,_rgba(0,80,203,0.35),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Future hiring stack
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              From recruiting software to Agentic Hiring™.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2" style={{ perspective: "1400px" }}>
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
              initial={reduceMotion ? false : { opacity: 0, rotateY: 6 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                Today
              </h3>
              <ol className="mt-6 space-y-3">
                {STACK_TODAY.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/55">
                    <span className="text-[0.6rem] tabular-nums text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div
              className="rounded-3xl border border-[#0050cb]/45 bg-[#0050cb]/15 p-6 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.75)] md:p-8"
              initial={reduceMotion ? false : { opacity: 0, rotateY: -6 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
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
                      reduceMotion ? undefined : { y: [0, index % 2 === 0 ? -3 : 3, 0] }
                    }
                    transition={{
                      duration: 3 + index * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.08,
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

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Why Agentic Hiring matters
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Everything begins with Hiring Intelligence.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Organizations that define the next decade won&apos;t win because they hire more people,
              send more outreach, or automate more workflows.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {WHY_NOT.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-2 text-sm text-[#434654] line-through decoration-[#c3c6d6]"
              >
                {item}
              </span>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_YES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 px-5 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
