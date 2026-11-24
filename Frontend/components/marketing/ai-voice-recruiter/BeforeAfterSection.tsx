"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";

import { AI_VOICE_AFTER, AI_VOICE_BEFORE } from "@/lib/aiVoiceRecruiter";

type BeforeAfterSectionProps = {
  reduceMotion?: boolean;
};

export function BeforeAfterSection({ reduceMotion = false }: BeforeAfterSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Before vs after
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Manual screening vs Huntlo Voice AI
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            In India&apos;s hiring context, screening hundreds of applicants by hand is common.
            Voice AI takes on that load so recruiters review shortlists - not dial lists.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-7 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a8fa3]">
              Traditional
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-epilogue)] text-xl font-bold text-[#141b2b]">
              Recruiter on the phone all day
            </h3>
            <p className="mt-2 text-sm text-[#5c6070]">
              Exhausting first-contact loops. Pipelines wait on human dial time.
            </p>
            <ul className="mt-8 space-y-3">
              {AI_VOICE_BEFORE.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#434654]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f4e8e8] text-[#b42318]">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-[#e1e4ef] pt-4 text-sm font-medium text-[#5c6070]">
              Hours spent repeating the same questions
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.08 }}
            className="flex h-full flex-col rounded-2xl border border-[#0050cb]/20 bg-white p-7 shadow-[0_18px_50px_rgba(0,80,203,0.08)] md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Huntlo
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-epilogue)] text-xl font-bold text-[#141b2b]">
              AI screens. You interview the shortlist.
            </h3>
            <p className="mt-2 text-sm text-[#5c6070]">
              Round-the-clock calling with structured summaries waiting in the morning.
            </p>
            <ul className="mt-8 space-y-3">
              {AI_VOICE_AFTER.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-[#434654]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f8ef] text-[#0f7a45]">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-[#e1e4ef] pt-4 text-sm font-medium text-[#0f7a45]">
              Up to 80% less manual screening time · pipelines move ~5× faster
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
