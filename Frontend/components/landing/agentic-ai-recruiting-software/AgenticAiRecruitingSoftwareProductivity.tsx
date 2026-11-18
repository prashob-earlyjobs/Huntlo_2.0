"use client";

import { motion } from "motion/react";

import { PRODUCTIVITY_QUESTIONS } from "@/lib/agenticAiRecruitingSoftware";

type AgenticAiRecruitingSoftwareProductivityProps = {
  reduceMotion: boolean;
};

export function AgenticAiRecruitingSoftwareProductivity({ reduceMotion }: AgenticAiRecruitingSoftwareProductivityProps) {
  return (
    <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12" id="productivity">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            A different way to think about recruiting productivity
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            How much unnecessary coordination can you remove while maintaining candidate trust?
          </h2>
        </div>

        <ul className="mt-10 space-y-4 max-w-3xl">
          {PRODUCTIVITY_QUESTIONS.map((question, index) => (
            <motion.li
              key={index}
              initial={reduceMotion ? false : { opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/80">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-base leading-relaxed text-white/85">{question}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}