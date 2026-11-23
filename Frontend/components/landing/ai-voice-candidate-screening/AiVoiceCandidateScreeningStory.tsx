"use client";

import { motion } from "motion/react";

import {
  CALL_TRANSCRIPT,
  PROBLEM_STEPS,
} from "@/lib/aiVoiceCandidateScreening";

type AiVoiceCandidateScreeningStoryProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateScreeningStory({
  reduceMotion,
}: AiVoiceCandidateScreeningStoryProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              The first challenge
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Reaching candidates before interviews can begin
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              For many recruitment teams in India, the first challenge is not finding applicants. It
              is reaching them - establishing whether candidates are interested, available and
              broadly aligned with the role before recruiters invest deeper time.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {PROBLEM_STEPS.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {item.step}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Definition
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            What Is AI Voice Candidate Screening?
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              AI voice candidate screening uses automated voice conversations to ask job-related
              questions, capture candidate responses and support the initial stages of recruitment.
              Depending on the system&apos;s actual capabilities, a screening workflow may include
              questions about interest, location preferences, availability, experience and other
              relevant requirements.
            </p>
            <p>
              It should not be treated as a substitute for fair evaluation or a final hiring
              decision. For candidates, the interaction should be clear about the automated nature
              of the call and provide an appropriate way to seek human assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why voice matters
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Why Voice Matters in Indian Recruitment
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              India&apos;s hiring market includes candidates with different communication
              preferences, work schedules and levels of comfort with digital application processes.
              For some roles, a phone conversation can be more practical than expecting another form
              or a long email.
            </p>
            <p>
              A delivery applicant may be traveling between assignments. A warehouse worker may not
              regularly check email. A customer support candidate may want to clarify shift
              requirements before committing to an interview. Support for specific Indian languages
              must be verified before it is advertised.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Call experience
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              The First Conversation Should Answer the Right Questions
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A useful screening call does not need to become a lengthy interview. It should focus
              on the information that determines the appropriate next step - built around relevant,
              approved questions rather than a generic script for every role.
            </p>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_20px_50px_-40px_rgba(0,80,203,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Illustrative transcript
              </p>
              <span className="text-[0.6rem] font-semibold text-[#8a93a8]">Not a live call</span>
            </div>
            <ul className="space-y-3 p-4">
              {CALL_TRANSCRIPT.map((turn) => (
                <li
                  key={turn.speaker + turn.line}
                  className={`rounded-xl px-3 py-3 text-sm leading-relaxed ${
                    turn.speaker === "AI"
                      ? "bg-[#f0f5ff] text-[#141b2b]"
                      : "border border-[#e8eef7] bg-[#fafbfd] text-[#5b6478]"
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
