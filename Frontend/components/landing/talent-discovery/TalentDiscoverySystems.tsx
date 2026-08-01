"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  BENTO_CARDS,
  HUNTLO_DELIVERS,
  OUTCOME_IMPROVES,
  STACK_TODAY,
  STACK_TOMORROW,
  TRADITIONAL_PROVIDES,
  WORKFLOW_HELPS,
} from "@/lib/talentDiscovery";

type TalentDiscoverySystemsProps = {
  reduceMotion: boolean;
};

export function TalentDiscoverySystems({ reduceMotion }: TalentDiscoverySystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Continuously learning
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Talent discovery never stops learning.
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

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Across every workflow
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Discover talent across every hiring workflow.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Everything intelligently connected.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_HELPS.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.03 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Why Huntlo?
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              From talent databases to discovery intelligence.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Traditional platforms provide
              </h3>
              <ul className="mt-4 space-y-2">
                {TRADITIONAL_PROVIDES.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#434654] line-through decoration-[#c3c6d6]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Huntlo delivers
              </h3>
              <ul className="mt-4 space-y-2">
                {HUNTLO_DELIVERS.map((item) => (
                  <li key={item} className="text-sm font-semibold text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Better hiring outcomes
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Talent discovery creates better hiring outcomes.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Modern organizations don&apos;t optimize candidate searches. They optimize hiring
              confidence.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OUTCOME_IMPROVES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-base font-semibold text-[#141b2b] md:text-lg">
            Everything begins with Talent Discovery Intelligence™.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(0,80,203,0.3),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Discovery as infrastructure
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Talent discovery is becoming infrastructure.
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
    </>
  );
}
