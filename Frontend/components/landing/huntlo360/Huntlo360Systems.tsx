"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  BENTO_CARDS,
  ENTERPRISE_BUILT_FOR,
  ENTERPRISES_DONT_NEED,
  HUMAN_AI_EQUATION,
  LEARNING_LOOP,
  STACK_TODAY,
  STACK_TOMORROW,
} from "@/lib/huntlo360";

type Huntlo360SystemsProps = {
  reduceMotion: boolean;
};

export function Huntlo360Systems({ reduceMotion }: Huntlo360SystemsProps) {
  return (
    <>
      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Human + AI Hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Built around Human + AI Hiring.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Huntlo doesn&apos;t replace recruiters. It amplifies hiring teams.
            </p>
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
                  <span className="text-[#8eb0ff]/55" aria-hidden>
                    +
                  </span>
                ) : null}
              </motion.div>
            ))}
            <span className="text-[#8eb0ff]/55" aria-hidden>
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
              Continuous learning
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring intelligence never stops learning.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo360 continuously understands signals, intent, priorities, workflows,
              experiences, confidence, outcomes, and productivity — everything continuously
              improving.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_LOOP.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.03 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-5"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold text-[#141b2b]">{item}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Enterprise infrastructure
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Enterprise hiring requires infrastructure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern enterprises don&apos;t need another ATS, sourcing tool, automation platform,
              or scheduling tool. They need AI Hiring Intelligence Infrastructure.
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

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ENTERPRISE_BUILT_FOR.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex min-h-12 items-center rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4 text-sm font-semibold text-[#141b2b] transition-colors hover:border-[#0050cb]/40"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_10%,_rgba(0,80,203,0.3),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Future of hiring operations
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              From tool sprawl to one intelligence layer.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2" style={{ perspective: "1400px" }}>
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
              initial={reduceMotion ? false : { opacity: 0, rotateY: 6 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
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
              className="rounded-3xl border border-[#0050cb]/45 bg-[#0050cb]/15 p-6 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.7)] md:p-8"
              initial={reduceMotion ? false : { opacity: 0, rotateY: -6 }}
              whileInView={{ opacity: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
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
              Why Huntlo360
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Intelligence that ladders into outcomes.
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
    </>
  );
}
