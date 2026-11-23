"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  EVALUATION_POINTS,
  HUNTLO_ENTRY,
  ILLUSTRATIVE_WORKFLOW_LABEL,
  RESPECTFUL_PRACTICES,
  WORKFLOW_STAGES,
} from "@/lib/aiVoiceScreeningHighVolumeHiring";

import { TranscriptVisual } from "./TranscriptVisual";

type AiVoiceScreeningHighVolumeHiringSystemsProps = {
  reduceMotion: boolean;
};

export function AiVoiceScreeningHighVolumeHiringSystems({
  reduceMotion,
}: AiVoiceScreeningHighVolumeHiringSystemsProps) {
  return (
    <>
      <section
        id="workflow"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Workflow
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              From first contact to recruiter review
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              {ILLUSTRATIVE_WORKFLOW_LABEL}
            </p>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STAGES.map((stage, index) => (
              <motion.li
                key={stage.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className={`rounded-2xl border p-5 ${
                  stage.highlight
                    ? "border-[#0050cb]/45 bg-[#0050cb] text-white shadow-lg shadow-[#0050cb]/20"
                    : "border-[#c3c6d6]/35 bg-white"
                }`}
              >
                <p
                  className={`text-[0.65rem] font-semibold tabular-nums ${
                    stage.highlight ? "text-white/70" : "text-[#0050cb]"
                  }`}
                >
                  {stage.stage}
                </p>
                <h3
                  className={`mt-3 text-base font-bold ${
                    stage.highlight ? "text-white" : "text-[#141b2b]"
                  }`}
                >
                  {stage.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    stage.highlight ? "text-white/80" : "text-[#434654]"
                  }`}
                >
                  {stage.detail}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                Candidate experience
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
                Make the experience respectful
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
                Candidates should know what kind of conversation they are joining, why questions
                are asked, and how to reach a person.
              </p>
              <ul className="mt-8 space-y-3">
                {RESPECTFUL_PRACTICES.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <TranscriptVisual />
          </div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Outcomes
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Evaluate outcomes carefully
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Treat early pilots as learning systems. Prefer careful review over fabricated
              performance metrics.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {EVALUATION_POINTS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#0050cb]/15 bg-white p-6"
              >
                <h3 className="text-base font-bold text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Where Huntlo fits
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Where Huntlo enters the picture
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Validate capabilities in a demo. Do not rely on unverified language coverage or
              scoring claims.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {HUNTLO_ENTRY.map((card, index) => (
              <motion.div
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
              >
                <Link
                  href={card.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 transition-colors hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]"
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
