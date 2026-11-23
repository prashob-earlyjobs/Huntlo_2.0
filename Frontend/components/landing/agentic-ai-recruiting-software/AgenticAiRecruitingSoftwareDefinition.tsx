"use client";

import { motion } from "motion/react";

type AgenticAiRecruitingSoftwareDefinitionProps = {
  reduceMotion: boolean;
};

export function AgenticAiRecruitingSoftwareDefinition({ reduceMotion }: AgenticAiRecruitingSoftwareDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is agentic AI recruiting?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI-driven agents that coordinate connected recruitment tasks within defined boundaries.
          </h2>
        </div>

        <div className="mt-10 space-y-6 max-w-3xl">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Beyond rule-based automation</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Traditional recruiting automation follows predefined rules. An agentic workflow interprets relevant information, determines an appropriate next step within configured boundaries, and coordinates multiple actions — not just triggering isolated tasks.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">A concrete example</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              A candidate replies to outreach with interest but requests a different interview time. Basic automation records the reply or notifies a recruiter. An agentic workflow interprets the request, checks approved next steps, initiates scheduling where systems permit, and escalates exceptions requiring human judgment.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">The difference is coordination</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Not simply intelligence. It is the continuity between stages — discovery, engagement, response handling, interview coordination, and recruiter oversight — that makes agentic recruiting distinct from adding another isolated dashboard.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}