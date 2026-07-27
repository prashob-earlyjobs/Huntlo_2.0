"use client";

import { motion } from "motion/react";

import {
  HIRING_OS_LAYER,
  MEET_HUNTLO_CAPABILITIES,
} from "@/lib/hiringOs";

type HiringOsRiseProps = {
  reduceMotion: boolean;
};

export function HiringOsRise({ reduceMotion }: HiringOsRiseProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Category shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The rise of Hiring Operating Systems
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The next generation of hiring platforms won&apos;t simply automate recruiting.
              They&apos;ll orchestrate it.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              The future Hiring OS will understand the full hiring system — from requirements to
              recruiter productivity and enterprise hiring.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {HIRING_OS_LAYER.map((item, index) => (
              <motion.div
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: reduceMotion ? 0 : index * 0.03, duration: 0.3 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-4 py-4"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#141b2b]">{item}</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-lg font-semibold text-[#141b2b] md:text-xl">
            Everything connected. Everything intelligent. Everything continuously improving.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-[#c3c6d6]/30 bg-[#070d1a] px-6 py-12 text-white md:px-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                  Meet Huntlo
                </p>
                <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
                  Huntlo is building a Hiring Operating System for modern recruiting teams.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                  Rather than forcing recruiters to move between disconnected platforms, Huntlo
                  brings hiring capabilities together through one connected infrastructure layer.
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {MEET_HUNTLO_CAPABILITIES.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
