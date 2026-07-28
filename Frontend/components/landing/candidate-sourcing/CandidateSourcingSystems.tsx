"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  BENTO_CARDS,
  HUNTLO_DELIVERS,
  INFRA_CHANGES,
  TRADITIONAL_REQUIRES,
  WORKFLOW_HELPS,
} from "@/lib/candidateSourcing";

type CandidateSourcingSystemsProps = {
  reduceMotion: boolean;
};

export function CandidateSourcingSystems({ reduceMotion }: CandidateSourcingSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Discover faster
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Discover exceptional talent faster.
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
              Across workflows
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Discover candidates across hiring workflows.
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
              From sourcing commodity to discovery intelligence.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Traditional sourcing tools require
              </h3>
              <ul className="mt-4 space-y-2">
                {TRADITIONAL_REQUIRES.map((item) => (
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

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Discovery as intelligence
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Candidate discovery is becoming intelligence.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Future organizations won&apos;t ask which sourcing software to purchase. They&apos;ll
              ask how intelligently they can continuously discover exceptional talent.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INFRA_CHANGES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white"
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
