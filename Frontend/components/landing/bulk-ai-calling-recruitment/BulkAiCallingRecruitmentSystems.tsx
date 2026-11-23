"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  CONVERSATION_SAMPLE,
  DESIGN_FOR_INDIA,
  OPERATIONAL_CONTROLS,
  PILOT_POINTS,
  PRE_DEPLOYMENT_QUESTIONS,
  VOICE_JOURNEY,
} from "@/lib/bulkAiCallingRecruitment";

type BulkAiCallingRecruitmentSystemsProps = {
  reduceMotion: boolean;
};

export function BulkAiCallingRecruitmentSystems({
  reduceMotion,
}: BulkAiCallingRecruitmentSystemsProps) {
  return (
    <>
      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              India context
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Design conversations for Indian candidates
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Scripts should respect consent, language choice, mobile conditions, and a clear path
              to a human recruiter. Language coverage must be confirmed for your specific
              deployment.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {DESIGN_FOR_INDIA.map((card, index) => (
              <motion.div
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6"
              >
                <p className="text-base font-bold text-[#141b2b]">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Before deployment
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The questions to ask before deployment
            </h2>
          </div>

          <ol className="mt-10 space-y-3">
            {PRE_DEPLOYMENT_QUESTIONS.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-[#141b2b] sm:text-base">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Start small
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              A pilot is better than a promise
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Validate scripts, language fit, and review quality on a limited list before expanding
              volume. Avoid fabricating uplift targets - measure what your pilot actually produces.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {PILOT_POINTS.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Voice journey
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              List preparation → approved call → candidate response → human review
            </h2>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-4">
            {VOICE_JOURNEY.map((step, index) => (
              <motion.li
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold text-white">{step}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Conversation sample
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Consent and handoff cues in a short first call
            </h2>
            <p className="mt-4 text-sm text-[#434654]">
              Illustrative transcript - not a live recording or guaranteed script.
            </p>
          </div>

          <div className="mt-8 max-w-3xl space-y-3 rounded-3xl border border-[#c3c6d6]/35 bg-white p-5 md:p-8">
            {CONVERSATION_SAMPLE.map((turn, index) => (
              <div
                key={`${turn.speaker}-${index}`}
                className={`rounded-2xl px-4 py-3 ${
                  turn.speaker === "AI"
                    ? "border border-[#0050cb]/20 bg-[#0050cb]/8"
                    : "border border-[#c3c6d6]/35 bg-[#f7f8fc]"
                }`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                  {turn.speaker}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#141b2b]">{turn.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Operational controls
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Permissions, language, retries, and escalation
            </h2>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-[#c3c6d6]/35">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f8fc] text-[#434654]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Control</th>
                  <th className="px-5 py-3 font-semibold">What to define</th>
                </tr>
              </thead>
              <tbody>
                {OPERATIONAL_CONTROLS.map((row) => (
                  <tr key={row.control} className="border-t border-[#c3c6d6]/30">
                    <td className="px-5 py-4 font-semibold text-[#141b2b]">{row.control}</td>
                    <td className="px-5 py-4 text-[#434654]">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/ai-voice-recruiter"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI Voice Recruiter
            </Link>
            <Link
              href="/agentic-ai-platform"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Platform overview
            </Link>
            <Link
              href="/whatsapp-recruiting"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              WhatsApp recruiting
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
