"use client";

import { motion } from "motion/react";

type AiVoiceInterviewReminderCallsDefinitionProps = {
  reduceMotion: boolean;
};

const SCOPE = [
  {
    title: "What the call supports",
    detail:
      "Reminding candidates of approved interview details, gathering attendance confirmations, and identifying requests for rescheduling.",
  },
  {
    title: "What happens to responses",
    detail:
      "Depending on verified platform capabilities, responses may be organized for recruiter review.",
  },
  {
    title: "What the system must not do",
    detail:
      "It should not invent interview details or independently change schedules without appropriate authorization.",
  },
  {
    title: "What the candidate should know",
    detail:
      "Candidates should know who is calling and why before the conversation continues.",
  },
] as const;

export function AiVoiceInterviewReminderCallsDefinition({
  reduceMotion,
}: AiVoiceInterviewReminderCallsDefinitionProps) {
  return (
    <section
      id="what-are-ai-voice-interview-reminder-calls"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              What Are AI Voice Interview Reminder Calls?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              AI voice interview reminder calls are automated voice conversations
              designed to support selected interview-related communication tasks.
            </p>
            <h3 className="mt-8 text-lg font-semibold text-[#141b2b]">
              A Reminder Should Be More Than a Repeated Message
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
              A useful interview reminder should provide relevant information. The
              candidate may need to know the interview date, time, format, and
              approved joining instructions. If the candidate confirms attendance,
              the workflow may require no further contact. If the candidate
              requests a change, the recruiter may need to coordinate a new
              arrangement. If the candidate asks a question outside the approved
              scope, human assistance should be available.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              These distinctions matter more than the number of reminders sent.
            </p>
          </motion.div>

          <div className="grid gap-3">
            {SCOPE.map((item, index) => (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className={`rounded-2xl border p-5 md:p-6 ${
                  index === 2
                    ? "border-[#f0dcc1] bg-[#fdf8f1]"
                    : "border-[#d7e3f4] bg-[#fbfcfe]"
                }`}
              >
                <h3
                  className={`text-sm font-semibold ${
                    index === 2 ? "text-[#8a5b18]" : "text-[#141b2b]"
                  }`}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
