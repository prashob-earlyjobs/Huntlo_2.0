"use client";

import { motion } from "motion/react";

import {
  CONTINUITY_PRINCIPLES,
  HANDOFF_TRIGGERS,
} from "@/lib/aiRecruiterHandoffAutomation";

type AiRecruiterHandoffAutomationContinuityProps = {
  reduceMotion: boolean;
};

export function AiRecruiterHandoffAutomationContinuity({
  reduceMotion,
}: AiRecruiterHandoffAutomationContinuityProps) {
  return (
    <section
      id="agentic-handoffs-and-candidate-experience"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Where Agentic Automation Can Help
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiter handoffs are often triggered by events. An agentic workflow
            can be designed to recognize these situations and coordinate
            permitted handoffs. However, the system should not invent missing
            candidate information or assign consequential decisions without
            appropriate authorization. Human review remains important.
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {HANDOFF_TRIGGERS.map((item, index) => (
            <motion.div
              key={item.trigger}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.35,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="grid gap-2 rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-5 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-6"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#0050cb]" />
                <p className="text-sm font-semibold text-[#141b2b]">
                  {item.trigger}
                </p>
              </div>
              <p className="pl-5 text-sm leading-relaxed text-[#5b6478] md:pl-0">
                {item.handoff}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.06 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold tracking-tight text-[#141b2b] md:text-2xl">
            Candidate Experience Depends on Continuity
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Candidates do not want to repeat the same information to every new
            person. They expect recruiters to understand the conversation so far.
            A coordinated handoff can support that experience, but continuity
            also requires appropriate privacy practices. Only relevant
            information should be shared with authorized participants, and
            candidates should have a clear way to ask questions or correct
            inaccurate information.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {CONTINUITY_PRINCIPLES.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className="rounded-2xl border border-[#e8eef7] bg-[#f7f8fc] p-6"
            >
              <h4 className="text-sm font-semibold text-[#141b2b]">
                {principle.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                {principle.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
