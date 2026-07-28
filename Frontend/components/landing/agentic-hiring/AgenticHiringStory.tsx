"use client";

import { motion } from "motion/react";

import {
  AI_STRENGTHS,
  HIRING_GENERATIONS,
  RECRUITER_STRENGTHS,
} from "@/lib/agenticHiring";

type AgenticHiringStoryProps = {
  reduceMotion: boolean;
};

export function AgenticHiringStory({ reduceMotion }: AgenticHiringStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Four generations
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Hiring changed again.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The fourth generation is beginning now: Agentic Hiring — where intelligent systems
              continuously collaborate with recruiters across every hiring workflow.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HIRING_GENERATIONS.map((gen, index) => (
              <motion.article
                key={gen.generation}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.35 }}
                className={`rounded-2xl border p-5 ${
                  gen.highlight
                    ? "border-[#0050cb]/40 bg-[#070d1a] text-white"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc]"
                }`}
              >
                <p
                  className={`text-[0.65rem] font-semibold uppercase tracking-[0.16em] ${
                    gen.highlight ? "text-[#8eb0ff]" : "text-[#0050cb]"
                  }`}
                >
                  {gen.generation}
                </p>
                <h3
                  className={`mt-3 text-lg font-semibold tracking-tight ${
                    gen.highlight ? "text-white" : "text-[#141b2b]"
                  }`}
                >
                  {gen.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {gen.items.map((item) => (
                    <li
                      key={item}
                      className={`text-sm ${gen.highlight ? "text-white/70" : "text-[#434654]"}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              The right question
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              The problem isn&apos;t AI. It&apos;s how we think about AI.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Many discussions about AI recruiting ask: will AI replace recruiters? We believe
              that&apos;s the wrong question.
            </p>
            <p className="mt-4 text-lg font-semibold text-white md:text-xl">
              A better question is: how can recruiters become exponentially more productive
              alongside AI?
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Recruiters understand
              </h3>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {RECRUITER_STRENGTHS.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white/85"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#0050cb]/35 bg-[#0050cb]/15 p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                AI understands
              </h3>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {AI_STRENGTHS.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white/85"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-10 max-w-3xl text-lg font-semibold text-white md:text-xl">
            Together they become significantly more powerful than either operating independently.
          </p>
        </div>
      </section>
    </>
  );
}
