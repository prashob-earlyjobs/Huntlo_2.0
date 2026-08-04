"use client";

import { motion } from "motion/react";
import { useState } from "react";

import {
  KEYWORD_VS_INTENT,
  MODERN_FLOW,
  TRADITIONAL_FLOW,
  VIBE_COMBINES,
  VIBE_PROMPTS,
} from "@/lib/vibeSourcing";

type VibeSourcingStoryProps = {
  reduceMotion: boolean;
};

export function VibeSourcingStory({ reduceMotion }: VibeSourcingStoryProps) {
  const [activePrompt, setActivePrompt] = useState(0);

  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Beyond keywords
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Keywords don&apos;t describe great talent.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Great hiring has never been keyword driven. It&apos;s always been intent driven.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {KEYWORD_VS_INTENT.map((item, index) => (
              <motion.div
                key={item.keyword}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="grid gap-3 rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5 md:grid-cols-[0.35fr_1fr] md:items-center"
              >
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#434654]">
                    They don&apos;t think
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#434654] line-through decoration-[#c3c6d6]">
                    {item.keyword}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                    They think
                  </p>
                  <p className="mt-1 text-base font-semibold text-[#141b2b]">{item.intent}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Intent creates discovery
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Hiring intent creates better talent discovery.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              The future belongs to Intent Driven Talent Discovery.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
                Traditional sourcing
              </h3>
              <ol className="mt-4 space-y-2">
                {TRADITIONAL_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="text-[0.65rem] tabular-nums text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/40 bg-[#0050cb]/15 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Modern hiring
              </h3>
              <ol className="mt-4 space-y-2">
                {MODERN_FLOW.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-white">
                    <span className="text-[0.65rem] tabular-nums text-[#8eb0ff]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section
        id="vibe-sourcing"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Meet Vibe Sourcing
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Simply describe who would succeed in this role.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Or tell us about the kind of talent you&apos;re looking for — before you ever search
              candidates.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-[#c3c6d6]/35 bg-[#070d1a] p-6 text-white md:p-8">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Intent prompt
            </p>
            <p className="mt-3 text-lg font-semibold leading-snug md:text-xl">
              {VIBE_PROMPTS[activePrompt]}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {VIBE_PROMPTS.map((prompt, index) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setActivePrompt(index)}
                  className={`rounded-full border px-3.5 py-2 text-left text-xs font-medium transition-colors sm:text-sm ${
                    activePrompt === index
                      ? "border-[#0050cb] bg-[#0050cb] text-white"
                      : "border-white/15 bg-white/5 text-white/70 hover:border-white/30"
                  }`}
                >
                  Example {index + 1}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Vibe Sourcing continuously understands
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
            {VIBE_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < VIBE_COMBINES.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
