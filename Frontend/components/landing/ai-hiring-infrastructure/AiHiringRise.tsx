"use client";

import { motion, type Variants } from "motion/react";

import {
  AI_CAPABILITIES,
  CONNECTED_LAYER,
} from "@/lib/aiHiringInfrastructure";

type AiHiringRiseProps = {
  fadeUp: Variants;
  reduceMotion: boolean;
};

export function AiHiringRise({ fadeUp, reduceMotion }: AiHiringRiseProps) {
  return (
    <>
      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                What changed
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                AI changed what&apos;s possible
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
                Artificial intelligence didn&apos;t simply automate recruiting. It fundamentally
                changed what&apos;s possible.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
                AI isn&apos;t replacing recruiters. It&apos;s changing how recruiting works.
              </p>
              <p className="mt-6 max-w-xl text-lg font-semibold text-[#141b2b]">
                The future recruiter won&apos;t work alone. They&apos;ll work alongside intelligent
                systems purpose-built for hiring.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {AI_CAPABILITIES.map((item, index) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  initial={reduceMotion ? false : "hidden"}
                  whileInView="visible"
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.35 }}
                  className="rounded-xl border border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-3.5 text-sm leading-snug text-[#434654]"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Category shift
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The rise of AI Hiring Infrastructure
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              We believe the next generation of recruiting platforms won&apos;t be defined by better
              sourcing or better automation alone. They&apos;ll be defined by their ability to
              connect the full hiring system.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto pb-2">
            <ol className="flex min-w-max items-stretch gap-0">
              {CONNECTED_LAYER.map((item, index) => {
                const isLast = index === CONNECTED_LAYER.length - 1;
                return (
                  <li key={item} className="flex items-center">
                    <div
                      className={`min-w-[9.5rem] rounded-2xl border px-4 py-5 text-center ${
                        isLast
                          ? "border-[#0050cb] bg-[#0050cb] text-white shadow-lg shadow-[#0050cb]/25"
                          : "border-[#c3c6d6]/40 bg-white text-[#141b2b]"
                      }`}
                    >
                      <span className="text-sm font-semibold leading-snug">{item}</span>
                    </div>
                    {!isLast ? (
                      <span className="mx-1.5 text-[#0050cb]/50" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-10 max-w-2xl">
            <p className="text-xl font-bold tracking-tight text-[#141b2b] md:text-2xl">
              This is AI Hiring Infrastructure.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
              Not another recruiting tool. An intelligent infrastructure layer powering every hiring
              workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-[#c3c6d6]/30 bg-[#070d1a] px-6 py-12 text-white md:px-12 md:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Meet Huntlo
            </p>
            <h2 className="mt-4 max-w-3xl text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Huntlo is building the AI Hiring Infrastructure powering modern recruiting teams.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                "Candidate discovery",
                "Talent intelligence",
                "Workflow orchestration",
                "AI recruiting agents",
                "Enterprise hiring infrastructure",
              ].map((item) => (
                <p
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              All working together through one intelligent layer. Designed to help recruiters spend
              less time managing processes and more time making hiring decisions.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
