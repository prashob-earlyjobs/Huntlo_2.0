"use client";

import { motion } from "motion/react";

import { REMINDER_DISCIPLINE } from "@/lib/aiVoiceInterviewReminderCalls";

type AiVoiceInterviewReminderCallsDisciplineProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewReminderCallsDiscipline({
  reduceMotion,
}: AiVoiceInterviewReminderCallsDisciplineProps) {
  return (
    <section
      id="responsible-reminder-practice"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              Avoid Excessive Reminder Calls
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Repeated calls can create frustration. A candidate who has already
              confirmed attendance may not need further voice reminders. Someone
              who has declined the interview should not continue receiving
              attendance requests.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              The recruitment team should define sensible contact limits and
              respect communication preferences. A reminder strategy should be
              designed around usefulness, not maximum calling activity.
            </p>

            <div className="mt-8 rounded-2xl border border-[#d7e3f4] bg-white p-6">
              <h3 className="text-base font-semibold text-[#141b2b]">
                Voice and Other Communication Channels
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                Voice may be appropriate for some candidates and situations.
                Others may prefer email, messaging, or direct recruiter contact.
                The team should consider the candidate&apos;s preferences and the
                importance of the information being communicated. The
                availability of particular channels or automated coordination
                features must be verified before publication.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d7e3f4] bg-white p-6">
              <h3 className="text-base font-semibold text-[#141b2b]">
                Responsible Calling and Privacy
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                Automated calls should clearly identify the organization.
                Candidates should understand when they are interacting with an
                automated system. Organizations must consider applicable Indian
                telecom, privacy, consent, and recording requirements. Candidates
                should have a way to request human assistance or decline further
                contact.
              </p>
            </div>
          </motion.div>

          <div className="space-y-3">
            {REMINDER_DISCIPLINE.map((item, index) => (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="flex items-start gap-4 rounded-2xl border border-[#e8eef7] bg-white p-5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[0.62rem] font-bold text-[#0050cb]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#141b2b]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#5b6478]">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
