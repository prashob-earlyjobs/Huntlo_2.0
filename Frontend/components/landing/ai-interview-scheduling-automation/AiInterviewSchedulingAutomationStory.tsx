"use client";

import { motion } from "motion/react";

import {
  CANDIDATE_CLARITY,
  FRICTION_THREAD,
} from "@/lib/aiInterviewSchedulingAutomation";

type AiInterviewSchedulingAutomationStoryProps = {
  reduceMotion: boolean;
};

export function AiInterviewSchedulingAutomationStory({
  reduceMotion,
}: AiInterviewSchedulingAutomationStoryProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Scheduling friction
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Why Interview Scheduling Becomes a Recruiting Bottleneck
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              A candidate is interested. The hiring manager wants to meet them. Then scheduling
              begins - two available times, a conflict, a new slot, a next-morning reply, another
              calendar change. No one has made a serious mistake. Yet a simple interview becomes a
              chain of emails, calendar checks, reminders and manual updates.
            </p>
            <p>
              Scheduling is often treated as administrative. Its consequences are operational. A
              delayed interview can slow hiring. An unclear confirmation can leave a candidate
              uncertain. Without a clear coordination process, recruiters become the communication
              layer holding the entire schedule together.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {FRICTION_THREAD.map((msg, index) => (
              <motion.li
                key={msg.label + msg.body}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className={`rounded-2xl border px-4 py-4 ${
                  msg.from === "system"
                    ? "border-[#0050cb]/30 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-[#f8fafc]"
                }`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                  {msg.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{msg.body}</p>
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
            What Is AI Interview Scheduling Automation?
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              AI interview scheduling automation refers to the use of software and AI-assisted
              workflows to coordinate interview availability, communication, confirmations and
              schedule changes. A typical workflow may involve collecting availability, identifying
              suitable times, communicating options, recording confirmations and managing reminders.
            </p>
            <p>
              More advanced orchestration concepts can also distinguish between routine scheduling
              events and exceptions requiring a recruiter. A candidate asking for a different time
              is not the same as a candidate withdrawing from the process. The goal is to reduce
              unnecessary coordination without making candidate communication feel impersonal.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Candidate experience
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Design the Scheduling Journey Around the Candidate
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A useful scheduling experience begins with clarity. When expectations are clear,
              automation becomes more effective. Without them, even a sophisticated system can
              reproduce a confusing process at greater speed.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {CANDIDATE_CLARITY.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <h3 className="text-sm font-bold text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mt-8 mx-auto max-w-sm rounded-[1.75rem] border border-[#d7e3f4] bg-white p-4 shadow-[0_20px_50px_-36px_rgba(0,80,203,0.4)]"
          >
            <div className="rounded-2xl border border-[#e8eef7] bg-[#f8fafc] px-4 py-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Confirmation
              </p>
              <p className="mt-3 text-base font-bold text-[#141b2b]">Product screen · 45 min</p>
              <p className="mt-2 text-sm text-[#5b6478]">Thu · 2:30 PM · Video · Prep notes attached</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-[#0050cb] px-3 py-1.5 text-[0.7rem] font-semibold text-white">
                  Confirmed
                </span>
                <span className="rounded-full border border-[#d7e3f4] px-3 py-1.5 text-[0.7rem] font-semibold text-[#5b6478]">
                  Request change
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
