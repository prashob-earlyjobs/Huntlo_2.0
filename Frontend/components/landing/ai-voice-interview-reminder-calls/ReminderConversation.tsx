"use client";

import { motion } from "motion/react";

type ReminderConversationProps = {
  reduceMotion: boolean;
};

const TURNS = [
  {
    speaker: "Voice agent",
    text: "Hello, this is an automated call from the recruiting team about your interview scheduled for Friday at 11 AM at the site office. Is this still convenient?",
  },
  {
    speaker: "Candidate",
    text: "Yes, but I don't have the reporting details. Do I need to bring any documents?",
  },
  {
    speaker: "Voice agent",
    text: "Thank you for confirming. I will note your question about reporting details and documents for the recruiter to answer before the interview.",
  },
] as const;

export function ReminderConversation({ reduceMotion }: ReminderConversationProps) {
  return (
    <section
      id="reminder-conversation-example"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Illustrative conversation
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem]">
              Confirmation Is One Outcome, Not the Only One.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              A structured reminder conversation can confirm attendance and still
              surface something the recruiter needs to handle. The point is to
              capture the candidate&apos;s actual response instead of assuming it.
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-relaxed text-[#5b6478]">
              <li>Identify the recruiting organization and the purpose of the call.</li>
              <li>State only approved interview details.</li>
              <li>Note questions or requests for a human to resolve.</li>
            </ul>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_24px_60px_-40px_rgba(0,80,203,0.25)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                  Sample reminder call
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">
                  Attendance confirmed, question captured
                </p>
              </div>
              <span className="rounded-full border border-[#d7e3f4] bg-white px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#8a93a8]">
                Not a recording
              </span>
            </div>
            <div className="space-y-4 p-5">
              {TURNS.map((turn, index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.08,
                  }}
                  className={
                    turn.speaker === "Candidate"
                      ? "ml-4 rounded-xl bg-[#f7f8fc] p-3.5 sm:ml-8"
                      : "rounded-xl border border-[#e8eef7] p-3.5"
                  }
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                    {turn.speaker}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#434654]">
                    {turn.text}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="border-t border-[#e8eef7] px-5 py-3">
              <p className="text-[0.7rem] text-[#8a93a8]">
                Illustrative transcript. Actual call design, consent, and
                recording practices require verification before publication.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
