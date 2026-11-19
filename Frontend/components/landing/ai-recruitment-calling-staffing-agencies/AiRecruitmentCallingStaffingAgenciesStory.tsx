"use client";

import { motion } from "motion/react";

import {
  AGENCY_TRANSCRIPT,
  REPEAT_QUESTIONS,
} from "@/lib/aiRecruitmentCallingStaffingAgencies";

type AiRecruitmentCallingStaffingAgenciesStoryProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentCallingStaffingAgenciesStory({
  reduceMotion,
}: AiRecruitmentCallingStaffingAgenciesStoryProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Operational challenge
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Why Staffing Agencies Face a Different Calling Challenge
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              A staffing agency receives an urgent client requirement. Candidates exist in the
              database. The immediate challenge is determining who is available and interested
              today. Recruiters begin calling - some have joined another company, some changed
              cities, some need more information. Collecting that context takes time, especially
              across several client requirements at once.
            </p>
            <p>
              Internal recruitment teams usually hire for their own organization. Staffing agencies
              manage hiring across multiple clients, job categories, locations and timelines. When
              delivery depends entirely on manual calls, capacity becomes tied to how many
              conversations recruiters can complete.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Definition
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            What Is AI Recruitment Calling for Staffing Agencies?
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              AI recruitment calling refers to the use of automated voice conversations within
              recruitment workflows. For staffing agencies, potential applications include candidate
              interest checks, availability confirmation, basic screening, callback coordination and
              follow-up activity. The exact scope depends on the platform&apos;s verified
              capabilities and the agency&apos;s approved process.
            </p>
            <p>
              The objective is to support repetitive communication without removing recruiters from
              relationship-building and hiring decisions. A good calling workflow should make it
              clear when a candidate needs a person, when additional information is required and
              when further contact is not appropriate.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Start here
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Start With the Conversations Recruiters Repeat Most
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Not every candidate conversation should be automated. Complex salary negotiations and
              sensitive career decisions often need a consultant. But some questions follow a
              predictable structure - and those responses help recruiters decide where to focus
              next.
            </p>
            <ul className="mt-8 space-y-3">
              {REPEAT_QUESTIONS.map((question, index) => (
                <motion.li
                  key={question}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: reduceMotion ? 0 : index * 0.04 }}
                  className="flex gap-3 text-sm leading-relaxed text-[#5b6478]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0050cb]" />
                  {question}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-[#f8fafc] shadow-[0_20px_50px_-40px_rgba(0,80,203,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-[#e8eef7] bg-white px-4 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Sample conversation
              </p>
              <span className="text-[0.6rem] font-semibold text-[#8a93a8]">Illustrative</span>
            </div>
            <ul className="space-y-3 p-4">
              {AGENCY_TRANSCRIPT.map((turn) => (
                <li
                  key={turn.speaker + turn.line}
                  className={`rounded-xl px-3 py-3 text-sm leading-relaxed ${
                    turn.speaker === "AI"
                      ? "bg-[#f0f5ff] text-[#141b2b]"
                      : "border border-[#e8eef7] bg-white text-[#5b6478]"
                  }`}
                >
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                    {turn.speaker}
                  </span>
                  <p className="mt-1">{turn.line}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </>
  );
}
